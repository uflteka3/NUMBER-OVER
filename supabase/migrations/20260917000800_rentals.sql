-- NUMBER OVER — 0008 Locations et abonnements

create table public.rentals (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete restrict,
  phone_number_id   uuid not null references public.phone_numbers(id) on delete restrict,
  order_id          uuid not null references public.orders(id) on delete restrict,
  order_item_id     uuid references public.order_items(id) on delete set null,
  kind              public.rental_kind not null,
  status            public.rental_status not null default 'pending',
  period_months     int not null check (period_months between 1 and 36),
  starts_at         timestamptz,
  ends_at           timestamptz,
  grace_until       timestamptz,
  next_billing_at   timestamptz,
  auto_renew        boolean not null default false,
  cancelled_at      timestamptz,
  cancellation_reason text,
  released_at       timestamptz,
  failure_reason    text,
  -- Réglages client (le numéro de redirection est une donnée personnelle : chiffré côté application avant insertion)
  forward_to_encrypted bytea,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint rentals_dates check (starts_at is null or ends_at is null or ends_at > starts_at),
  constraint rentals_grace check (grace_until is null or ends_at is null or grace_until >= ends_at),
  constraint rentals_active_has_dates check (status not in ('active','grace_period','expiring') or (starts_at is not null and ends_at is not null)),
  constraint rentals_cancel_consistency check ((cancelled_at is null) or status in ('cancelled','releasing','released'))
);
-- ANTI-DOUBLE ATTRIBUTION : au plus une location "vivante" par numéro.
create unique index rentals_one_live_per_number on public.rentals(phone_number_id)
  where status in ('pending','active','grace_period','expiring','releasing');
create index rentals_user_status_idx on public.rentals(user_id, status);
create index rentals_status_idx on public.rentals(status);
create index rentals_ends_at_idx on public.rentals(ends_at) where status in ('active','expiring');
create index rentals_grace_idx on public.rentals(grace_until) where status = 'grace_period';
create index rentals_next_billing_idx on public.rentals(next_billing_at) where auto_renew;
create index rentals_order_idx on public.rentals(order_id);
create trigger rentals_set_updated_at before update on public.rentals for each row execute function public.set_updated_at();

create table public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete restrict,
  rental_id                uuid not null unique references public.rentals(id) on delete cascade,
  provider                 public.provider_name not null check (provider <> 'internal'),
  provider_subscription_id text,
  status                   public.subscription_status not null default 'incomplete',
  auto_renew               boolean not null default true,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  cancelled_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint subscriptions_period check (current_period_start is null or current_period_end is null or current_period_end > current_period_start)
);
create unique index subscriptions_provider_uidx on public.subscriptions(provider, provider_subscription_id) where provider_subscription_id is not null;
create index subscriptions_user_idx on public.subscriptions(user_id, status);
create index subscriptions_period_end_idx on public.subscriptions(current_period_end) where status = 'active';
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
