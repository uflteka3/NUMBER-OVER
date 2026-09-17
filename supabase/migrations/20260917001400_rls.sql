-- NUMBER OVER — 0014 Row Level Security
-- Principe : RLS activé sur TOUTES les tables. Par défaut tout est refusé.
-- Écritures commerciales (orders, payments, rentals, refunds, phone_numbers…) : réservées au service_role
-- (serveur) — les clients ne peuvent pas insérer/modifier directement.
-- service_role contourne RLS nativement (BYPASSRLS) : pas de politique nécessaire pour lui.

-- ---------- Révocation des privilèges par défaut, puis octroi minimal ----------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated, public;

-- Vues publiques (catalogue, paramètres, contenus)
grant select on public.catalog_countries, public.catalog_number_prices, public.catalog_numbers,
                public.public_settings, public.published_content to anon, authenticated;
grant select on public.number_types to anon, authenticated;

-- Tables lisibles/écrivables par les utilisateurs authentifiés (filtrées par RLS ci-dessous)
grant select, update on public.profiles to authenticated;
grant select on public.roles, public.user_roles to authenticated;
grant select on public.countries, public.phone_numbers, public.phone_number_capabilities, public.phone_number_prices to authenticated;
grant select on public.orders, public.order_items, public.payments, public.refunds, public.rentals, public.subscriptions to authenticated;
grant update on public.rentals to authenticated;               -- limité par politique (auto_renew uniquement)
grant select on public.messages, public.calls to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert, update on public.support_tickets to authenticated;
grant select, insert on public.support_messages to authenticated;
grant select on public.site_settings, public.content_blocks to authenticated;
grant select on public.webhooks, public.webhook_events, public.provider_api_logs, public.job_queue, public.audit_logs to authenticated;
-- Écritures admin (les politiques restreignent au rôle)
grant insert, update on public.countries, public.phone_number_prices, public.site_settings, public.content_blocks, public.webhooks to authenticated;
grant insert, update, delete on public.user_roles to authenticated;
grant update on public.support_tickets, public.support_messages, public.webhook_events to authenticated;
grant insert on public.refunds to authenticated;
grant update on public.phone_numbers to authenticated;

-- Fonctions exposées
grant execute on function public.has_role(public.app_role), public.is_admin(), public.is_staff(), public.is_superadmin(), public.current_role_code(), public.mask_e164(text) to authenticated, anon;

-- ---------- Activation RLS ----------
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;
-- NB : FORCE RLS s'applique aussi au propriétaire ; service_role a BYPASSRLS, donc le serveur reste opérationnel.

-- ---------- Profils ----------
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Le client ne peut pas changer son statut/blocage : trigger de protection
create or replace function public.protect_profile_admin_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.status is distinct from old.status or new.blocked_at is distinct from old.blocked_at or new.blocked_reason is distinct from old.blocked_reason then
      raise exception 'Modification du statut de compte non autorisée' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_protect_admin_columns before update on public.profiles for each row execute function public.protect_profile_admin_columns();
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Rôles ----------
create policy roles_select on public.roles for select to authenticated using (true);
create policy user_roles_select_own on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy user_roles_admin_write on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- (le trigger guard_user_roles affine : support par admin, admin/superadmin par superadmin uniquement, jamais soi-même)

-- ---------- Référentiels ----------
create policy countries_staff_select on public.countries for select to authenticated using (public.is_staff());
create policy countries_admin_write on public.countries for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- resale_allowed : seul superadmin (trigger)
create or replace function public.protect_country_resale()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.resale_allowed is distinct from old.resale_allowed and not public.is_superadmin() then
    raise exception 'Seul un super administrateur peut activer la revente pour un pays' using errcode = '42501';
  end if;
  if new.resale_allowed and not old.resale_allowed then
    new.resale_reviewed_at := now();
    new.resale_reviewed_by := auth.uid();
  end if;
  return new;
end $$;
create trigger countries_protect_resale before update on public.countries for each row execute function public.protect_country_resale();

-- number_types : lecture publique par grant ; écriture admin
create policy number_types_select on public.number_types for select to anon, authenticated using (true);

-- ---------- Numéros ----------
-- Les clients voient : le catalogue (vue) + les numéros de LEURS locations. Staff voit tout.
create policy phone_numbers_select on public.phone_numbers for select to authenticated using (
  public.is_staff()
  or exists (select 1 from public.rentals r where r.phone_number_id = phone_numbers.id and r.user_id = auth.uid())
);
create policy phone_numbers_admin_update on public.phone_numbers for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy pnc_select on public.phone_number_capabilities for select to authenticated using (
  public.is_staff()
  or exists (select 1 from public.rentals r where r.phone_number_id = phone_number_capabilities.phone_number_id and r.user_id = auth.uid())
);

-- Prix : table brute (avec coûts) réservée au staff ; admin écrit ; support lit sans pouvoir écrire.
create policy pnp_staff_select on public.phone_number_prices for select to authenticated using (public.is_staff());
create policy pnp_admin_write on public.phone_number_prices for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Commandes ----------
create policy orders_select_own on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy order_items_select_own on public.order_items for select to authenticated using (
  public.is_staff() or exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);
-- Aucune politique INSERT/UPDATE pour authenticated : création uniquement côté serveur (service_role).

-- ---------- Paiements / remboursements ----------
create policy payments_select_own on public.payments for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy refunds_select_own on public.refunds for select to authenticated using (
  public.is_staff() or exists (select 1 from public.orders o where o.id = refunds.order_id and o.user_id = auth.uid())
);
create policy refunds_admin_insert on public.refunds for insert to authenticated with check (public.is_admin());
-- Support ne peut pas créer de remboursement (pas de politique) ; exécution réelle côté serveur.

-- ---------- Locations / abonnements ----------
create policy rentals_select_own on public.rentals for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy rentals_update_own on public.rentals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Le client ne peut modifier QUE auto_renew et forward_to_encrypted
create or replace function public.protect_rental_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.status is distinct from old.status or new.user_id is distinct from old.user_id
       or new.phone_number_id is distinct from old.phone_number_id or new.order_id is distinct from old.order_id
       or new.starts_at is distinct from old.starts_at or new.ends_at is distinct from old.ends_at
       or new.grace_until is distinct from old.grace_until or new.next_billing_at is distinct from old.next_billing_at
       or new.period_months is distinct from old.period_months or new.kind is distinct from old.kind
       or new.released_at is distinct from old.released_at then
      raise exception 'Modification de location non autorisée' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger rentals_protect_columns before update on public.rentals for each row execute function public.protect_rental_columns();
create policy rentals_admin_update on public.rentals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy subscriptions_select_own on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.is_staff());

-- ---------- Messages / appels : propriétaire de la location liée uniquement ----------
create policy messages_select_own on public.messages for select to authenticated using (
  public.is_admin()
  or (rental_id is not null and exists (select 1 from public.rentals r where r.id = messages.rental_id and r.user_id = auth.uid()))
);
create policy calls_select_own on public.calls for select to authenticated using (
  public.is_admin()
  or (rental_id is not null and exists (select 1 from public.rentals r where r.id = calls.rental_id and r.user_id = auth.uid()))
);
-- Support : pas d'accès au contenu des communications (pas de politique).

-- ---------- Notifications ----------
create policy notifications_select_own on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Support ----------
create policy tickets_select_own on public.support_tickets for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy tickets_insert_own on public.support_tickets for insert to authenticated with check (user_id = auth.uid() and status = 'open' and assigned_to is null);
create policy tickets_update_own on public.support_tickets for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tickets_staff_update on public.support_tickets for update to authenticated using (public.is_staff()) with check (public.is_staff());
create or replace function public.protect_ticket_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    if new.priority is distinct from old.priority or new.assigned_to is distinct from old.assigned_to or new.user_id is distinct from old.user_id then
      raise exception 'Modification de ticket non autorisée' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger tickets_protect_columns before update on public.support_tickets for each row execute function public.protect_ticket_columns();

create policy support_messages_select on public.support_messages for select to authenticated using (
  public.is_staff()
  or (not is_internal and exists (select 1 from public.support_tickets t where t.id = support_messages.ticket_id and t.user_id = auth.uid()))
);
create policy support_messages_insert_customer on public.support_messages for insert to authenticated with check (
  author_id = auth.uid() and author_kind = 'customer' and not is_internal
  and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid() and t.status <> 'closed')
);
create policy support_messages_insert_staff on public.support_messages for insert to authenticated with check (
  public.is_staff() and author_id = auth.uid() and author_kind = 'staff'
);

-- ---------- Paramètres / contenus ----------
create policy site_settings_staff_select on public.site_settings for select to authenticated using (public.is_staff());
create policy site_settings_admin_write on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create or replace function public.protect_critical_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(new.is_critical, old.is_critical) and not public.is_superadmin() then
    raise exception 'Paramètre critique : réservé au super administrateur' using errcode = '42501';
  end if;
  if tg_op <> 'DELETE' then new.updated_by := coalesce(auth.uid(), new.updated_by); return new; end if;
  return old;
end $$;
create trigger site_settings_protect_critical before insert or update or delete on public.site_settings for each row execute function public.protect_critical_settings();

create policy content_staff_select on public.content_blocks for select to authenticated using (public.is_staff());
create policy content_admin_write on public.content_blocks for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Webhooks / logs / jobs / audit : admin lecture ; support aucun accès ----------
create policy webhooks_admin on public.webhooks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy webhook_events_admin_select on public.webhook_events for select to authenticated using (public.is_admin());
create policy webhook_events_admin_replay on public.webhook_events for update to authenticated using (public.is_admin()) with check (public.is_admin() and processing_status = 'received');
create policy provider_api_logs_admin_select on public.provider_api_logs for select to authenticated using (public.is_admin());
create policy job_queue_admin_select on public.job_queue for select to authenticated using (public.is_admin());
create policy audit_logs_admin_select on public.audit_logs for select to authenticated using (public.is_admin());
-- audit_logs : aucune politique INSERT/UPDATE/DELETE pour authenticated ; insertion via fonction SECURITY DEFINER ; trigger anti-mutation.
