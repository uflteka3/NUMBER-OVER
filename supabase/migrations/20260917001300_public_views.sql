-- NUMBER OVER — 0013 Vues publiques (catalogue)
-- Les clients n'accèdent JAMAIS directement à phone_number_prices (coûts internes) :
-- ils lisent cette vue qui n'expose que les prix de vente.
-- security_invoker=false + security_barrier : la vue filtre elle-même ; les tables sous-jacentes restent fermées.

create view public.catalog_countries
with (security_barrier = true) as
select c.id, c.iso2, c.name, c.calling_code, c.available_types, c.requires_bundle, c.requires_address,
       c.compliance_warning, c.display_order
from public.countries c
where c.is_enabled and c.resale_allowed;

create view public.catalog_number_prices
with (security_barrier = true) as
select p.id, p.phone_number_id, p.country_id, p.number_type_id, p.period, p.currency,
       p.rental_monthly_price, p.purchase_price, p.valid_from
from public.phone_number_prices p
where p.is_active and p.valid_to is null;

create view public.catalog_numbers
with (security_barrier = true) as
select n.id, n.masked_e164, n.country_id, n.number_type_id, n.is_featured, n.locality, n.region,
       n.requires_address, n.requires_bundle,
       cap.sms_inbound, cap.sms_outbound, cap.mms_inbound, cap.voice_inbound, cap.voice_outbound,
       coalesce(pn.rental_monthly_price, pr.rental_monthly_price) as rental_monthly_price,
       coalesce(pn.purchase_price, pr.purchase_price) as purchase_price,
       coalesce(pn.currency, pr.currency) as currency
from public.phone_numbers n
join public.countries c on c.id = n.country_id and c.is_enabled and c.resale_allowed
join public.number_types t on t.id = n.number_type_id and t.is_enabled
left join public.phone_number_capabilities cap on cap.phone_number_id = n.id
left join public.catalog_number_prices pn on pn.phone_number_id = n.id and pn.period = 'monthly'
left join public.catalog_number_prices pr on pr.phone_number_id is null and pr.country_id = n.country_id and pr.number_type_id = n.number_type_id and pr.period = 'monthly'
where n.status = 'available' and n.is_available;

comment on view public.catalog_numbers is 'Catalogue public : numéro masqué, capacités réelles, prix de vente uniquement. Aucun coût fournisseur, aucun SID.';

-- Paramètres publics uniquement
create view public.public_settings with (security_barrier = true) as
select key, value from public.site_settings where is_public;

-- Contenus publiés uniquement
create view public.published_content with (security_barrier = true) as
select page_id, content_key, locale, title, body_md, published_at from public.content_blocks where status = 'published';
