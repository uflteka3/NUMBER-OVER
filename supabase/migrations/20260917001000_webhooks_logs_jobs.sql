-- NUMBER OVER — 0010 Webhooks, logs API, file de tâches

create table public.webhooks (
  id               uuid primary key default gen_random_uuid(),
  provider         public.provider_name not null,
  event_kind       text not null,                 -- ex. sms_inbound, voice_inbound, payment_event
  endpoint_path    text not null,                 -- chemin relatif, ex. /api/webhooks/twilio/sms
  status           public.webhook_status not null default 'active',
  secret_env_name  text,                          -- NOM de la variable d'environnement, jamais la valeur
  last_received_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (provider, event_kind),
  constraint webhooks_secret_is_env_name check (secret_env_name is null or secret_env_name ~ '^[A-Z][A-Z0-9_]+$')
);
create trigger webhooks_set_updated_at before update on public.webhooks for each row execute function public.set_updated_at();

create table public.webhook_events (
  id                 uuid primary key default gen_random_uuid(),
  provider           public.provider_name not null,
  provider_event_id  text not null,               -- MessageSid, CallSid, evt_…
  event_type         text not null,
  payload            jsonb not null,              -- secrets/PII masqués côté application avant insertion
  signature_valid    boolean not null,
  processing_status  public.webhook_processing_status not null default 'received',
  attempts           int not null default 0 check (attempts >= 0),
  last_error         text,
  related_order_id   uuid references public.orders(id) on delete set null,
  received_at        timestamptz not null default now(),
  processed_at       timestamptz,
  -- ANTI-DOUBLON : un événement fournisseur n'est traité qu'une fois.
  unique (provider, provider_event_id)
);
create index webhook_events_status_idx on public.webhook_events(processing_status, received_at);
create index webhook_events_type_idx on public.webhook_events(provider, event_type, received_at desc);

create table public.provider_api_logs (
  id              bigserial primary key,
  provider        public.provider_name not null,
  service         text not null,                  -- ex. phone_numbers, pricing, messaging
  method          text not null check (method in ('GET','POST','PUT','PATCH','DELETE')),
  endpoint        text not null,                  -- sans identifiants ni query secrets
  http_status     int,
  duration_ms     int check (duration_ms >= 0),
  ok              boolean not null,
  provider_error_code text,
  error_message   text,
  correlation_id  uuid,
  related_order_id uuid,
  created_at      timestamptz not null default now()
);
create index provider_api_logs_created_idx on public.provider_api_logs(provider, created_at desc);
create index provider_api_logs_errors_idx on public.provider_api_logs(created_at desc) where not ok;
create index provider_api_logs_correlation_idx on public.provider_api_logs(correlation_id);

create table public.job_queue (
  id             uuid primary key default gen_random_uuid(),
  job_type       text not null,
  payload        jsonb not null default '{}'::jsonb,
  -- Clé de déduplication : empêche d'enfiler deux fois la même tâche logique tant qu'elle n'est pas terminée.
  dedupe_key     text,
  status         public.job_status not null default 'pending',
  priority       smallint not null default 100,
  attempts       int not null default 0 check (attempts >= 0),
  max_attempts   int not null default 5 check (max_attempts > 0),
  run_after      timestamptz not null default now(),
  locked_at      timestamptz,
  locked_by      text,
  started_at     timestamptz,
  finished_at    timestamptz,
  last_error     text,
  created_at     timestamptz not null default now()
);
create unique index job_queue_dedupe_uidx on public.job_queue(dedupe_key) where dedupe_key is not null and status in ('pending','processing');
create index job_queue_pick_idx on public.job_queue(status, run_after, priority) where status = 'pending';
create index job_queue_type_idx on public.job_queue(job_type, status);

-- Réclamation atomique d'une tâche (FOR UPDATE SKIP LOCKED) : une tâche ne peut être prise que par un seul worker.
create or replace function public.claim_next_job(p_worker text, p_types text[] default null)
returns setof public.job_queue language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Non autorisé' using errcode = '42501';
  end if;
  return query
  with next_job as (
    select id from public.job_queue
    where status = 'pending' and run_after <= now()
      and (p_types is null or job_type = any(p_types))
    order by priority, run_after
    for update skip locked
    limit 1
  )
  update public.job_queue j
     set status = 'processing', locked_at = now(), locked_by = p_worker,
         started_at = now(), attempts = attempts + 1
    from next_job where j.id = next_job.id
  returning j.*;
end $$;
