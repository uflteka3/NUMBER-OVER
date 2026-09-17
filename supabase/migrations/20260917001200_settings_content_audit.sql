-- NUMBER OVER — 0012 Paramètres, contenus, audit

create table public.site_settings (
  key         text primary key check (key ~ '^[a-z][a-z0-9_.]+$'),
  value       jsonb not null,
  description text,
  is_public   boolean not null default false,   -- true = lisible par tous (ex. nom du site)
  is_critical boolean not null default false,   -- true = modifiable uniquement par superadmin
  updated_by  uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now(),
  -- Aucun secret : refuse les clés dont le nom évoque un secret.
  constraint site_settings_no_secret check (key !~ '(secret|token|password|api_key|private)')
);
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create table public.content_blocks (
  id           uuid primary key default gen_random_uuid(),
  page_id      text not null check (page_id ~ '^[a-z0-9-]+$'),
  content_key  text not null check (content_key ~ '^[a-z0-9_.-]+$'),
  locale       text not null default 'fr' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  title        text,
  body_md      text not null default '',
  status       public.content_status not null default 'draft',
  version      int not null default 1 check (version > 0),
  published_at timestamptz,
  updated_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint content_published_dated check ((status = 'published') = (published_at is not null))
);
-- Un seul contenu publié par (page, clé, langue)
create unique index content_blocks_one_published on public.content_blocks(page_id, content_key, locale) where status = 'published';
create index content_blocks_lookup_idx on public.content_blocks(page_id, locale, status);
create trigger content_blocks_set_updated_at before update on public.content_blocks for each row execute function public.set_updated_at();

-- Journal d'audit : APPEND-ONLY (aucun UPDATE/DELETE, même pour admin — voir RLS et trigger).
create table public.audit_logs (
  id           bigserial primary key,
  actor_id     uuid,
  actor_role   public.app_role,
  action       text not null,
  entity_table text not null,
  entity_id    text,
  old_values   jsonb,       -- non sensibles (filtrés par la fonction d'audit)
  new_values   jsonb,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs(entity_table, entity_id);
create index audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs(action, created_at desc);

create or replace function public.prevent_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Table % en ajout seul : % interdit', tg_table_name, tg_op using errcode = '42501';
end $$;
create trigger audit_logs_immutable before update or delete on public.audit_logs
  for each row execute function public.prevent_mutation();

-- Fonction d'audit générique : retire les colonnes sensibles avant journalisation.
create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  sensitive text[] := array['body_encrypted','forward_to_encrypted','payload','provider_monthly_cost','provider_setup_cost','provider_cost','provider_cost_estimate','provider_price','counterparty_hash'];
  o jsonb; n jsonb; k text;
begin
  o := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  n := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;
  foreach k in array sensitive loop
    o := o - k; n := n - k;
  end loop;
  insert into public.audit_logs(actor_id, actor_role, action, entity_table, entity_id, old_values, new_values)
  values (
    auth.uid(),
    case when auth.uid() is null then null else public.current_role_code() end,
    lower(tg_op), tg_table_name,
    coalesce(n->>'id', o->>'id', n->>'key', o->>'key', n->>'user_id', o->>'user_id'),
    o, n
  );
  return coalesce(new, old);
end $$;

-- Tables auditées automatiquement (actions sensibles listées au cahier des charges)
create trigger audit_user_roles after insert or update or delete on public.user_roles for each row execute function public.audit_row_change();
create trigger audit_profiles_status after update of status, blocked_at on public.profiles for each row execute function public.audit_row_change();
create trigger audit_countries after update of is_enabled, resale_allowed on public.countries for each row execute function public.audit_row_change();
create trigger audit_prices after insert or update or delete on public.phone_number_prices for each row execute function public.audit_row_change();
create trigger audit_phone_numbers_status after update of status, provider_sid, acquired_at, released_at on public.phone_numbers for each row execute function public.audit_row_change();
create trigger audit_rentals_status after insert or update of status, user_id on public.rentals for each row execute function public.audit_row_change();
create trigger audit_refunds after insert or update on public.refunds for each row execute function public.audit_row_change();
create trigger audit_payments_status after update of status on public.payments for each row execute function public.audit_row_change();
create trigger audit_site_settings after insert or update or delete on public.site_settings for each row execute function public.audit_row_change();
create trigger audit_webhook_replay after update of processing_status on public.webhook_events for each row when (old.processing_status in ('processed','failed') and new.processing_status = 'received') execute function public.audit_row_change();
