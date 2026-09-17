-- NUMBER OVER — 0011 Notifications et support

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link_path  text,
  channel    public.notification_channel not null default 'in_app',
  read_at    timestamptz,
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
create index notifications_user_idx on public.notifications(user_id, created_at desc);

create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  public_reference text not null unique default public.generate_public_reference('TK'),
  subject     text not null check (length(subject) between 3 and 200),
  category    text,
  status      public.ticket_status not null default 'open',
  priority    public.ticket_priority not null default 'normal',
  assigned_to uuid references auth.users(id) on delete set null,
  closed_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint tickets_closed_consistency check ((status = 'closed') = (closed_at is not null))
);
create index support_tickets_user_idx on public.support_tickets(user_id, created_at desc);
create index support_tickets_status_idx on public.support_tickets(status, priority);
create index support_tickets_assigned_idx on public.support_tickets(assigned_to) where status not in ('resolved','closed');
create trigger support_tickets_set_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();

create table public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete set null,
  author_kind public.ticket_author_kind not null,
  body        text not null check (length(body) between 1 and 10000),
  is_internal boolean not null default false,     -- note interne : invisible du client
  -- Pièces jointes : chemins dans un bucket Storage privé, jamais d'URL publique.
  attachments jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  constraint support_messages_internal_staff_only check (not is_internal or author_kind <> 'customer')
);
create index support_messages_ticket_idx on public.support_messages(ticket_id, created_at);
