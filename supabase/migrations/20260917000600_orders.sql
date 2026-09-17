-- NUMBER OVER — 0006 Commandes

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete restrict,
  public_reference    text not null unique default public.generate_public_reference('NO'),
  status              public.order_status not null default 'draft',
  currency            char(3) not null check (currency ~ '^[A-Z]{3}$'),
  subtotal            numeric(12,2) not null default 0 check (subtotal >= 0),
  fees                numeric(12,2) not null default 0 check (fees >= 0),
  discount            numeric(12,2) not null default 0 check (discount >= 0),
  tax                 numeric(12,2) not null default 0 check (tax >= 0),
  total               numeric(12,2) not null default 0 check (total >= 0),
  provider_cost_estimate numeric(12,4) check (provider_cost_estimate >= 0),  -- INTERNE
  idempotency_key     text not null unique,
  expires_at          timestamptz,
  paid_at             timestamptz,
  completed_at        timestamptz,
  cancelled_at        timestamptz,
  cancellation_reason text,
  failure_reason      text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint orders_total_consistency check (total = subtotal + fees + tax - discount),
  constraint orders_cancel_consistency check ((status = 'cancelled') = (cancelled_at is not null)),
  constraint orders_paid_consistency check (status not in ('paid','provisioning','completed','refunded','partially_refunded') or paid_at is not null)
);
create index orders_user_status_idx on public.orders(user_id, status);
create index orders_status_idx on public.orders(status);
create index orders_expires_idx on public.orders(expires_at) where status in ('pending_payment','payment_processing');
create index orders_created_idx on public.orders(created_at desc);
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  phone_number_id uuid not null references public.phone_numbers(id) on delete restrict,
  item_type       public.order_item_type not null,
  duration_months int not null check (duration_months between 1 and 36),
  quantity        int not null default 1 check (quantity = 1),
  unit_price      numeric(12,2) not null check (unit_price >= 0),
  total           numeric(12,2) not null check (total >= 0),
  currency        char(3) not null check (currency ~ '^[A-Z]{3}$'),
  provider_cost   numeric(12,4) check (provider_cost >= 0),   -- INTERNE
  -- Snapshot non sensible : e164 masqué, pays, type, capacités, prix affiché au moment T.
  snapshot        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  constraint order_items_total check (total = unit_price * duration_months * quantity)
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_number_idx on public.order_items(phone_number_id);

alter table public.phone_numbers
  add constraint phone_numbers_reserved_by_order_fk
  foreign key (reserved_by_order_id) references public.orders(id) on delete set null;
