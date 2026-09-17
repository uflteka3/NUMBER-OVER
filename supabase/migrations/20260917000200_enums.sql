-- NUMBER OVER — 0002 Types et enums
-- Tous les statuts sont des enums PostgreSQL : impossible d'insérer une valeur hors liste.

create type public.app_role as enum ('customer', 'support', 'admin', 'superadmin');
create type public.account_status as enum ('active', 'suspended', 'blocked', 'deleted');

create type public.number_type_code as enum ('local', 'mobile', 'toll_free', 'national', 'shared_cost', 'voip');
create type public.phone_number_status as enum (
  'available', 'synchronizing', 'reserved', 'provisioning', 'active',
  'suspended', 'expired', 'releasing', 'released', 'error'
);
create type public.phone_number_source as enum ('twilio_available', 'twilio_owned', 'manual');

create type public.price_period as enum ('one_time', 'monthly', 'yearly');
create type public.price_source as enum ('twilio_pricing_api', 'manual', 'rule');
create type public.margin_type as enum ('percent', 'fixed');

create type public.order_status as enum (
  'draft', 'pending_payment', 'payment_processing', 'paid', 'provisioning',
  'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'
);
create type public.order_item_type as enum ('purchase', 'rental', 'renewal');

create type public.rental_status as enum (
  'pending', 'active', 'grace_period', 'expiring', 'expired',
  'cancelled', 'releasing', 'released', 'failed'
);
create type public.rental_kind as enum ('purchase', 'rental');

create type public.payment_status as enum (
  'pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'
);
create type public.refund_status as enum ('requested', 'approved', 'processing', 'succeeded', 'failed', 'rejected');
create type public.subscription_status as enum ('incomplete', 'active', 'past_due', 'cancelled', 'ended');

create type public.comm_direction as enum ('inbound', 'outbound');
create type public.message_status as enum (
  'queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received', 'blocked'
);
create type public.call_status as enum (
  'queued', 'ringing', 'in_progress', 'completed', 'busy', 'no_answer', 'failed', 'cancelled'
);

create type public.provider_name as enum ('twilio', 'stripe', 'internal');
create type public.webhook_status as enum ('active', 'paused', 'disabled');
create type public.webhook_processing_status as enum ('received', 'processing', 'processed', 'failed', 'ignored');
create type public.job_status as enum ('pending', 'processing', 'completed', 'failed', 'cancelled');

create type public.notification_channel as enum ('in_app', 'email');
create type public.ticket_status as enum ('open', 'pending_customer', 'pending_support', 'resolved', 'closed');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.ticket_author_kind as enum ('customer', 'staff', 'system');
create type public.content_status as enum ('draft', 'published', 'archived');
