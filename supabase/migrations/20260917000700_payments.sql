-- NUMBER OVER — 0007 Paiements et remboursements

create table public.payments (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders(id) on delete restrict,
  user_id               uuid not null references auth.users(id) on delete restrict,
  provider              public.provider_name not null,
  provider_payment_id   text,
  provider_session_id   text,
  status                public.payment_status not null default 'pending',
  amount                numeric(12,2) not null check (amount >= 0),
  currency              char(3) not null check (currency ~ '^[A-Z]{3}$'),
  fee_amount            numeric(12,2) check (fee_amount >= 0),
  net_amount            numeric(12,2) check (net_amount >= 0),
  payment_method_type   text,                 -- ex. "card", jamais de numéro de carte
  confirmed_at          timestamptz,
  failed_at             timestamptz,
  failure_code          text,
  metadata              jsonb not null default '{}'::jsonb,   -- non sensible
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint payments_provider_not_internal check (provider <> 'internal'),
  constraint payments_succeeded_confirmed check (status <> 'succeeded' or confirmed_at is not null),
  constraint payments_failed_dated check (status <> 'failed' or failed_at is not null)
);
create unique index payments_provider_payment_uidx on public.payments(provider, provider_payment_id) where provider_payment_id is not null;
create unique index payments_provider_session_uidx on public.payments(provider, provider_session_id) where provider_session_id is not null;
create index payments_order_idx on public.payments(order_id);
create index payments_user_idx on public.payments(user_id, created_at desc);
create index payments_status_idx on public.payments(status);
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();

create table public.refunds (
  id                  uuid primary key default gen_random_uuid(),
  payment_id          uuid not null references public.payments(id) on delete restrict,
  order_id            uuid not null references public.orders(id) on delete restrict,
  amount              numeric(12,2) not null check (amount > 0),
  currency            char(3) not null check (currency ~ '^[A-Z]{3}$'),
  reason              text not null,
  status              public.refund_status not null default 'requested',
  provider_refund_id  text,
  requested_by        uuid references auth.users(id) on delete set null,
  approved_by         uuid references auth.users(id) on delete set null,
  notes               text,
  processed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create unique index refunds_provider_uidx on public.refunds(provider_refund_id) where provider_refund_id is not null;
create index refunds_payment_idx on public.refunds(payment_id);
create index refunds_order_idx on public.refunds(order_id);
create index refunds_status_idx on public.refunds(status);
create trigger refunds_set_updated_at before update on public.refunds for each row execute function public.set_updated_at();

-- Somme des remboursements ≤ montant payé
create or replace function public.check_refund_total()
returns trigger language plpgsql as $$
declare paid numeric; refunded numeric;
begin
  select amount into paid from public.payments where id = new.payment_id;
  select coalesce(sum(amount),0) into refunded from public.refunds
    where payment_id = new.payment_id and status not in ('failed','rejected') and id <> new.id;
  if refunded + new.amount > paid then
    raise exception 'Le total remboursé (%) dépasserait le montant payé (%)', refunded + new.amount, paid using errcode = '23514';
  end if;
  return new;
end $$;
create trigger refunds_check_total before insert or update of amount, status on public.refunds
  for each row execute function public.check_refund_total();
