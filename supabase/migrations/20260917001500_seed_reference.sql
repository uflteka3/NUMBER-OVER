-- NUMBER OVER — 0015 Seeds de RÉFÉRENTIELS uniquement
-- Contenu : rôles, types de numéros, paramètres techniques, webhooks attendus, textes BROUILLON.
-- AUCUN pays activé, AUCUN numéro, AUCUN prix, AUCUN client, AUCUNE commande.
-- Inclus dans les migrations pour être reproductible en prod (idempotent).

insert into public.roles (code, label, description, permissions) values
  ('customer',   'Client',               'Utilisateur final de NUMBER OVER', '{"catalog.read":true,"own.read":true,"own.support":true}'),
  ('support',    'Support',              'Assistance clients : lecture des comptes/commandes, tickets. Aucun accès prix, rôles, logs, communications.', '{"customers.read":true,"orders.read":true,"tickets.manage":true}'),
  ('admin',      'Administrateur',       'Gestion opérationnelle : catalogue, prix, commandes, remboursements, webhooks, contenus.', '{"catalog.manage":true,"pricing.manage":true,"orders.manage":true,"refunds.create":true,"webhooks.manage":true,"content.manage":true,"logs.read":true,"roles.support":true}'),
  ('superadmin', 'Super administrateur', 'Tous droits : rôles admin, paramètres critiques, activation de la revente par pays.', '{"*":true}')
on conflict (code) do update set label = excluded.label, description = excluded.description, permissions = excluded.permissions;

-- Types que les API Twilio peuvent exposer. Leur existence ici NE signifie PAS qu'ils sont disponibles dans un pays donné :
-- countries.available_types est rempli par la synchronisation (phase 5).
insert into public.number_types (code, label, description) values
  ('local',       'Local',        'Numéro géographique local'),
  ('mobile',      'Mobile',       'Numéro mobile'),
  ('toll_free',   'Numéro vert',  'Appels gratuits pour l''appelant'),
  ('national',    'National',     'Numéro national non géographique'),
  ('shared_cost', 'Coût partagé', 'Coût partagé appelant/appelé'),
  ('voip',        'VoIP',         'Numéro VoIP')
on conflict (code) do nothing;

insert into public.site_settings (key, value, description, is_public, is_critical) values
  ('site.name',                 '"NUMBER OVER"',  'Nom officiel du site', true, true),
  ('site.default_locale',       '"fr"',           'Langue par défaut', true, false),
  ('site.default_currency',     '"EUR"',          'Devise d''affichage par défaut (à confirmer)', true, true),
  ('site.maintenance_mode',     'false',          'Mode maintenance', true, true),
  ('site.logo_path',            'null',           'Chemin du logo officiel fourni (Storage) — à renseigner', true, false),
  ('rental.min_months',         '1',              'Durée minimale de location (mois)', true, false),
  ('rental.max_months',         '12',             'Durée maximale de location (mois)', true, false),
  ('rental.grace_period_days',  '3',              'Jours de grâce après expiration avant libération', false, false),
  ('rental.reservation_minutes','20',             'Durée de réservation d''un numéro pendant le paiement', false, false),
  ('rental.reminder_days',      '[7,3,1]',        'Rappels avant expiration (jours)', false, false),
  ('pricing.default_margin_type','"percent"',     'Type de marge par défaut', false, true),
  ('pricing.default_margin_value','null',         'Valeur de marge par défaut — À DÉFINIR par l''administrateur, aucune valeur présumée', false, true),
  ('pricing.enforce_min_margin','true',           'Interdit un prix de vente < coût fournisseur', false, true),
  ('compliance.otp_disclaimer_required','true',   'Afficher l''avertissement : usage OTP tiers / WhatsApp / Telegram non garanti et interdit par la politique d''utilisation', false, true),
  ('compliance.kyc_required_default','true',      'Exiger la collecte KYC lorsque le pays l''impose', false, true),
  ('communications.retention_days','30',          'Rétention des SMS/appels avant purge', false, true),
  ('notifications.email_enabled','true',          'Envoi des e-mails transactionnels', false, false)
on conflict (key) do nothing;

-- Endpoints webhook attendus (chemins relatifs ; le secret est référencé par NOM de variable d'environnement)
insert into public.webhooks (provider, event_kind, endpoint_path, status, secret_env_name) values
  ('twilio', 'sms_inbound',   '/api/webhooks/twilio/sms',          'disabled', 'TWILIO_AUTH_TOKEN'),
  ('twilio', 'sms_status',    '/api/webhooks/twilio/sms-status',   'disabled', 'TWILIO_AUTH_TOKEN'),
  ('twilio', 'voice_inbound', '/api/webhooks/twilio/voice',        'disabled', 'TWILIO_AUTH_TOKEN'),
  ('twilio', 'voice_status',  '/api/webhooks/twilio/voice-status', 'disabled', 'TWILIO_AUTH_TOKEN'),
  ('stripe', 'payment_event', '/api/webhooks/stripe',              'disabled', 'PAYMENT_WEBHOOK_SECRET')
on conflict (provider, event_kind) do nothing;

-- Textes de base — BROUILLONS (status = draft), à rédiger/valider avant publication.
insert into public.content_blocks (page_id, content_key, locale, title, body_md, status) values
  ('home',   'hero.title',    'fr', 'NUMBER OVER', '[BROUILLON] Plateforme de numéros virtuels.', 'draft'),
  ('legal',  'cgv',           'fr', 'Conditions générales de vente', '[BROUILLON — à rédiger et faire valider juridiquement]', 'draft'),
  ('legal',  'privacy',       'fr', 'Politique de confidentialité', '[BROUILLON — à rédiger et faire valider juridiquement]', 'draft'),
  ('legal',  'refund',        'fr', 'Politique de remboursement', '[BROUILLON — à rédiger et faire valider juridiquement]', 'draft'),
  ('legal',  'acceptable-use','fr', 'Politique d''utilisation acceptable', '[BROUILLON] Interdictions : usage frauduleux, contournement de vérification d''identité de plateformes tierces, spam. La réception de codes de vérification de services tiers n''est pas garantie.', 'draft'),
  ('faq',    'intro',         'fr', 'Questions fréquentes', '[BROUILLON]', 'draft')
on conflict do nothing;
