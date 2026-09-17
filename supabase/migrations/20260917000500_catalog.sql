-- NUMBER OVER — 0005 Référentiels et catalogue

create table public.countries (
  id                 smallserial primary key,
  iso2               char(2) not null unique check (iso2 ~ '^[A-Z]{2}$'),
  name               text not null,
  calling_code       text not null check (calling_code ~ '^\+[0-9]{1,4}$'),
  is_enabled         boolean not null default false,
  -- Revente à des clients finaux : DÉSACTIVÉE par défaut. Activation manuelle par un admin après
  -- vérification des conditions de numérotation Twilio pour ce pays (voir resale_review_note).
  resale_allowed     boolean not null default false,
  resale_reviewed_at timestamptz,
  resale_reviewed_by uuid references auth.users(id) on delete set null,
  resale_review_note text,
  compliance_warning text,
  requires_bundle    boolean,
  requires_address   boolean,
  available_types    public.number_type_code[] not null default '{}',
  provider_beta      boolean not null default false,
  last_synced_at     timestamptz,
  display_order      int not null default 1000,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint countries_resale_requires_review check (
    resale_allowed = false or (resale_reviewed_at is not null and resale_review_note is not null)
  )
);
comment on column public.countries.resale_allowed is 'Doit rester false tant qu''un admin n''a pas vérifié les conditions Twilio du pays. Aucune liste codée en dur.';
create index countries_enabled_idx on public.countries(is_enabled, resale_allowed) where is_enabled;
create trigger countries_set_updated_at before update on public.countries for each row execute function public.set_updated_at();

create table public.number_types (
  id          smallserial primary key,
  code        public.number_type_code not null unique,
  label       text not null,
  description text,
  is_enabled  boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.phone_numbers (
  id               uuid primary key default gen_random_uuid(),
  e164             text not null unique check (e164 ~ '^\+[1-9][0-9]{6,14}$'),
  masked_e164      text generated always as (public.mask_e164(e164)) stored,
  country_id       smallint not null references public.countries(id) on delete restrict,
  number_type_id   smallint not null references public.number_types(id) on delete restrict,
  provider         public.provider_name not null default 'twilio' check (provider = 'twilio'),
  provider_sid     text unique,
  status           public.phone_number_status not null default 'synchronizing',
  source           public.phone_number_source not null,
  is_available     boolean not null default false,
  is_featured      boolean not null default false,
  reserved_until   timestamptz,
  reserved_by_order_id uuid,           -- FK ajoutée après création de orders
  locality         text,
  region           text,
  friendly_name    text,
  requires_address boolean,
  requires_bundle  boolean,
  metadata         jsonb not null default '{}'::jsonb,   -- non sensible uniquement
  last_synced_at   timestamptz,
  acquired_at      timestamptz,
  released_at      timestamptz,
  last_error       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint phone_numbers_release_after_acquire check (released_at is null or acquired_at is null or released_at >= acquired_at),
  constraint phone_numbers_reserved_consistency check (
    (status = 'reserved' and reserved_until is not null) or status <> 'reserved'
  ),
  constraint phone_numbers_available_consistency check (not is_available or status = 'available')
);
create index phone_numbers_country_type_status_idx on public.phone_numbers(country_id, number_type_id, status);
create index phone_numbers_status_idx on public.phone_numbers(status);
create index phone_numbers_available_idx on public.phone_numbers(country_id) where is_available;
create index phone_numbers_featured_idx on public.phone_numbers(is_featured) where is_featured;
create index phone_numbers_reserved_until_idx on public.phone_numbers(reserved_until) where status = 'reserved';
create trigger phone_numbers_set_updated_at before update on public.phone_numbers for each row execute function public.set_updated_at();

create table public.phone_number_capabilities (
  phone_number_id uuid primary key references public.phone_numbers(id) on delete cascade,
  -- Valeurs NULL = inconnu (non encore synchronisé). Jamais de valeur par défaut "true".
  sms_inbound     boolean,
  sms_outbound    boolean,
  mms_inbound     boolean,
  mms_outbound    boolean,
  voice_inbound   boolean,
  voice_outbound  boolean,
  fax             boolean,
  raw_capabilities jsonb,           -- tel que retourné par le fournisseur
  source          public.price_source not null default 'twilio_pricing_api',
  verified_at     timestamptz,
  updated_at      timestamptz not null default now()
);
create index pnc_sms_voice_idx on public.phone_number_capabilities(sms_inbound, voice_inbound);
create trigger pnc_set_updated_at before update on public.phone_number_capabilities for each row execute function public.set_updated_at();

-- Historique des prix : chaque changement = nouvelle ligne ; l'ancienne reçoit valid_to.
create table public.phone_number_prices (
  id                    uuid primary key default gen_random_uuid(),
  -- Portée : un numéro précis, OU une règle pays/type (phone_number_id null).
  phone_number_id       uuid references public.phone_numbers(id) on delete cascade,
  country_id            smallint references public.countries(id) on delete cascade,
  number_type_id        smallint references public.number_types(id) on delete cascade,
  period                public.price_period not null default 'monthly',
  currency              char(3) not null check (currency ~ '^[A-Z]{3}$'),
  provider_monthly_cost numeric(12,4) check (provider_monthly_cost >= 0),   -- INTERNE, jamais exposé
  provider_setup_cost   numeric(12,4) check (provider_setup_cost >= 0),      -- INTERNE
  margin_type           public.margin_type,
  margin_value          numeric(12,4) check (margin_value >= 0),
  rental_monthly_price  numeric(12,2) check (rental_monthly_price >= 0),
  purchase_price        numeric(12,2) check (purchase_price >= 0),
  enforce_min_margin    boolean not null default true,
  source                public.price_source not null,
  is_active             boolean not null default true,
  valid_from            timestamptz not null default now(),
  valid_to              timestamptz,
  synced_at             timestamptz,
  created_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  constraint pnp_scope check (
    (phone_number_id is not null) or (country_id is not null and number_type_id is not null)
  ),
  constraint pnp_valid_range check (valid_to is null or valid_to > valid_from),
  constraint pnp_min_margin check (
    not enforce_min_margin
    or provider_monthly_cost is null
    or rental_monthly_price is null
    or rental_monthly_price >= provider_monthly_cost
  )
);
create index pnp_number_active_idx on public.phone_number_prices(phone_number_id) where is_active and valid_to is null;
create index pnp_rule_active_idx on public.phone_number_prices(country_id, number_type_id) where is_active and valid_to is null;
-- Une seule règle active par portée
create unique index pnp_one_active_per_number on public.phone_number_prices(phone_number_id, period)
  where is_active and valid_to is null and phone_number_id is not null;
create unique index pnp_one_active_per_rule on public.phone_number_prices(country_id, number_type_id, period)
  where is_active and valid_to is null and phone_number_id is null;
