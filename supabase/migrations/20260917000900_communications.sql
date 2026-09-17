-- NUMBER OVER — 0009 Messages et appels
-- Minimisation : numéros tiers stockés masqués + empreinte (hash) pour recherche ; contenu SMS chiffré
-- côté application (clé serveur, jamais en base). Rétention gérée par retention_until + job de purge.

create table public.messages (
  id                  uuid primary key default gen_random_uuid(),
  rental_id           uuid references public.rentals(id) on delete set null,
  phone_number_id     uuid not null references public.phone_numbers(id) on delete restrict,
  user_id             uuid references auth.users(id) on delete set null,
  direction           public.comm_direction not null,
  counterparty_masked text not null,            -- ex. +3361•••••23
  counterparty_hash   text not null,            -- sha256(e164 + sel serveur)
  provider_message_sid text not null unique,
  status              public.message_status not null,
  body_encrypted      bytea,                    -- chiffré côté application ; NULL si purgé
  body_purged_at      timestamptz,
  segments            smallint check (segments > 0),
  provider_price      numeric(12,5),            -- INTERNE
  provider_price_unit char(3),
  error_code          text,
  occurred_at         timestamptz not null default now(),
  retention_until     timestamptz not null,
  created_at          timestamptz not null default now()
);
create index messages_rental_idx on public.messages(rental_id, occurred_at desc);
create index messages_user_idx on public.messages(user_id, occurred_at desc);
create index messages_number_idx on public.messages(phone_number_id, occurred_at desc);
create index messages_retention_idx on public.messages(retention_until) where body_encrypted is not null;

create table public.calls (
  id                  uuid primary key default gen_random_uuid(),
  rental_id           uuid references public.rentals(id) on delete set null,
  phone_number_id     uuid not null references public.phone_numbers(id) on delete restrict,
  user_id             uuid references auth.users(id) on delete set null,
  direction           public.comm_direction not null,
  counterparty_masked text not null,
  counterparty_hash   text not null,
  provider_call_sid   text not null unique,
  status              public.call_status not null,
  duration_seconds    int check (duration_seconds >= 0),
  provider_price      numeric(12,5),            -- INTERNE
  provider_price_unit char(3),
  started_at          timestamptz,
  ended_at            timestamptz,
  retention_until     timestamptz not null,
  created_at          timestamptz not null default now(),
  constraint calls_dates check (started_at is null or ended_at is null or ended_at >= started_at)
);
create index calls_rental_idx on public.calls(rental_id, started_at desc);
create index calls_user_idx on public.calls(user_id, started_at desc);
create index calls_number_idx on public.calls(phone_number_id, started_at desc);
create index calls_retention_idx on public.calls(retention_until);
