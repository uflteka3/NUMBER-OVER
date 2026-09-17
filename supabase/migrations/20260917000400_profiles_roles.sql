-- NUMBER OVER — 0004 Profils et rôles

create table public.roles (
  id          smallserial primary key,
  code        public.app_role not null unique,
  label       text not null,
  description text,
  -- Permissions déclaratives (lecture par l'application). L'autorité reste les fonctions has_role()/is_admin().
  permissions jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone_contact text,
  locale       text not null default 'fr' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  timezone     text not null default 'UTC',
  status       public.account_status not null default 'active',
  blocked_at   timestamptz,
  blocked_reason text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint profiles_blocked_consistency check (
    (status in ('blocked','suspended') and blocked_at is not null) or
    (status not in ('blocked','suspended') and blocked_at is null)
  )
);
comment on table public.profiles is 'Données applicatives du compte. E-mail et mot de passe restent dans auth.users (jamais dupliqués).';

create table public.user_roles (
  user_id    uuid not null references auth.users(id) on delete cascade,
  role_id    smallint not null references public.roles(id) on delete restrict,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_id)
);
create index user_roles_role_idx on public.user_roles(role_id);

-- Création automatique du profil + rôle customer à l'inscription.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role_id)
  select new.id, r.id from public.roles r where r.code = 'customer'
  on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- Fonctions de vérification de rôle (SECURITY DEFINER, search_path figé) ----------
create or replace function public.has_role(p_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.code = p_role
  )
$$;

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('superadmin')
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('admin') or public.has_role('superadmin')
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('support') or public.is_admin()
$$;

create or replace function public.current_role_code()
returns public.app_role language sql stable security definer set search_path = public as $$
  select case
    when public.is_superadmin() then 'superadmin'::public.app_role
    when public.has_role('admin') then 'admin'
    when public.has_role('support') then 'support'
    else 'customer' end
$$;

-- Anti-élévation : seul un superadmin peut attribuer/retirer admin ou superadmin ;
-- un admin peut gérer support ; personne ne peut se modifier soi-même.
create or replace function public.guard_user_roles()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_role public.app_role;
  actor uuid := auth.uid();
begin
  -- Exécution par service_role (jobs/webhooks serveur) ou sans session (migrations/seeds) : autorisé.
  if actor is null then return coalesce(new, old); end if;

  select code into target_role from public.roles where id = coalesce(new.role_id, old.role_id);
  if coalesce(new.user_id, old.user_id) = actor then
    raise exception 'Un utilisateur ne peut pas modifier ses propres rôles' using errcode = '42501';
  end if;
  if target_role in ('admin','superadmin') and not public.is_superadmin() then
    raise exception 'Seul un super administrateur peut attribuer ce rôle' using errcode = '42501';
  end if;
  if target_role = 'support' and not public.is_admin() then
    raise exception 'Seul un administrateur peut attribuer le rôle support' using errcode = '42501';
  end if;
  if target_role = 'customer' and not public.is_admin() then
    raise exception 'Non autorisé' using errcode = '42501';
  end if;
  return coalesce(new, old);
end $$;
create trigger user_roles_guard
  before insert or update or delete on public.user_roles
  for each row execute function public.guard_user_roles();
