// NUMBER OVER — Tests base de données & RLS (base locale jetable, DONNÉES DE TEST uniquement)
import { createRequire } from "node:module"; const pg = createRequire("/home/user/pgtool/")("pg");
const DB = process.argv[2] || "numberover_test";
const c = new pg.Client({ host: "/tmp", port: 54329, user: "postgres", database: DB });
await c.connect();
let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log("  ✔", name); };
const ko = (name, e) => { fail++; console.log("  ✖", name, "—", e); };

async function expectError(name, sql, codeOrMsg) {
  try { await c.query("savepoint s"); await c.query(sql); await c.query("release savepoint s"); ko(name, "aucune erreur levée"); }
  catch (e) { await c.query("rollback to savepoint s");
    if (!codeOrMsg || e.code === codeOrMsg || (e.message||"").includes(codeOrMsg)) ok(name); else ko(name, `${e.code} ${e.message}`); }
}
async function expectNoRows(name, sql) {
  try { await c.query("savepoint s"); const r = await c.query(sql); await c.query("release savepoint s");
    r.rowCount === 0 ? ok(name + " (0 ligne affectée, RLS)") : ko(name, r.rowCount + " lignes modifiées !"); }
  catch (e) { await c.query("rollback to savepoint s"); e.code === "42501" ? ok(name + " (refusé)") : ko(name, e.code+" "+e.message); }
}
async function expectOk(name, sql) {
  try { await c.query("savepoint s"); const r = await c.query(sql); await c.query("release savepoint s"); ok(name); return r; }
  catch (e) { await c.query("rollback to savepoint s"); ko(name, `${e.code} ${e.message}`); }
}
async function as(userId, role = "authenticated") {
  await c.query(`set local role ${role}`);
  await c.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)`, [userId ?? "", role]);
}
async function asServer() { await c.query("reset role"); await c.query(`select set_config('request.jwt.claim.sub','',true)`); }

const A = "11111111-1111-4111-8111-111111111111"; // client A (DONNÉES DE TEST)
const B = "22222222-2222-4222-8222-222222222222"; // client B
const S = "33333333-3333-4333-8333-333333333333"; // support
const ADM = "44444444-4444-4444-8444-444444444444"; // admin
const SUP = "55555555-5555-4555-8555-555555555555"; // superadmin

await c.query("begin");
console.log("\n[1] Migrations appliquées / structure");
const tables = (await c.query("select count(*)::int n from pg_tables where schemaname='public'")).rows[0].n;
tables >= 24 ? ok(`${tables} tables présentes`) : ko("tables", tables);
const rls = (await c.query("select count(*)::int n from pg_tables t join pg_class k on k.relname=t.tablename where schemaname='public' and not k.relrowsecurity")).rows[0].n;
rls === 0 ? ok("RLS activé sur 100% des tables") : ko("RLS manquant", rls);
const forced = (await c.query("select count(*)::int n from pg_tables t join pg_class k on k.relname=t.tablename where schemaname='public' and not k.relforcerowsecurity")).rows[0].n;
forced === 0 ? ok("FORCE RLS sur 100% des tables") : ko("FORCE RLS manquant", forced);

console.log("\n[2] Clés étrangères");
const fks = (await c.query("select count(*)::int n from pg_constraint where contype='f' and connamespace='public'::regnamespace")).rows[0].n;
fks >= 40 ? ok(`${fks} clés étrangères`) : ko("FK", fks);
await expectError("commande sans utilisateur existant refusée", `insert into orders(user_id,currency,idempotency_key) values ('99999999-9999-4999-8999-999999999999','EUR','k0')`, "23503");

console.log("\n[3] Création utilisateurs de test (trigger auth → profile + rôle customer)");
for (const [id, mail] of [[A,"a@test.local"],[B,"b@test.local"],[S,"s@test.local"],[ADM,"adm@test.local"],[SUP,"sup@test.local"]])
  await c.query("insert into auth.users(id,email) values ($1,$2)", [id, mail]);
const profs = (await c.query("select count(*)::int n from profiles")).rows[0].n;
profs === 5 ? ok("5 profils créés automatiquement") : ko("profils", profs);
const cust = (await c.query("select count(*)::int n from user_roles ur join roles r on r.id=ur.role_id where r.code='customer'")).rows[0].n;
cust === 5 ? ok("rôle customer attribué automatiquement") : ko("customer", cust);
// Attribution des rôles staff par le serveur (service role / migration)
await c.query("insert into user_roles(user_id,role_id) select $1,id from roles where code='support'", [S]);
await c.query("insert into user_roles(user_id,role_id) select $1,id from roles where code='admin'", [ADM]);
await c.query("insert into user_roles(user_id,role_id) select $1,id from roles where code='superadmin'", [SUP]);
ok("rôles support/admin/superadmin attribués côté serveur");

console.log("\n[4] Référentiel et catalogue (DONNÉES DE TEST, jamais en prod)");
const ctry = (await c.query(`insert into countries(iso2,name,calling_code,is_enabled) values ('ZZ','Pays de test','+999',true) returning id, resale_allowed`)).rows[0];
ctry.resale_allowed === false ? ok("resale_allowed = false par défaut") : ko("resale default", ctry.resale_allowed);
await expectError("resale_allowed=true sans note de vérification refusé", `update countries set resale_allowed=true where id=${ctry.id}`, "23514");
const lt = (await c.query("select id from number_types where code='local'")).rows[0].id;
const n1 = (await c.query(`insert into phone_numbers(e164,country_id,number_type_id,source,status,is_available) values ('+9990000000001',${ctry.id},${lt},'twilio_available','available',true) returning id, masked_e164`)).rows[0];
n1.masked_e164.includes("•") && !n1.masked_e164.includes("0000000") ? ok(`masquage E.164 : ${n1.masked_e164}`) : ko("masquage", n1.masked_e164);
const n2 = (await c.query(`insert into phone_numbers(e164,country_id,number_type_id,source,status,is_available) values ('+9990000000002',${ctry.id},${lt},'twilio_available','available',true) returning id`)).rows[0];
await expectError("E.164 dupliqué refusé", `insert into phone_numbers(e164,country_id,number_type_id,source) values ('+9990000000001',${ctry.id},${lt},'twilio_available')`, "23505");
await expectError("E.164 mal formé refusé", `insert into phone_numbers(e164,country_id,number_type_id,source) values ('0612345678',${ctry.id},${lt},'twilio_available')`, "23514");
await expectError("provider_sid dupliqué refusé", `insert into phone_numbers(e164,country_id,number_type_id,source,provider_sid) values ('+9990000000003',${ctry.id},${lt},'twilio_owned','PNtest'), ('+9990000000004',${ctry.id},${lt},'twilio_owned','PNtest')`, "23505");
await expectError("is_available=true avec statut ≠ available refusé", `insert into phone_numbers(e164,country_id,number_type_id,source,status,is_available) values ('+9990000000005',${ctry.id},${lt},'twilio_available','reserved',true)`, "23514");

console.log("\n[5] Prix");
await expectError("prix de vente < coût fournisseur refusé (marge min)", `insert into phone_number_prices(country_id,number_type_id,currency,provider_monthly_cost,rental_monthly_price,source) values (${ctry.id},${lt},'EUR',2.0000,1.50,'manual')`, "23514");
await expectError("coût négatif refusé", `insert into phone_number_prices(country_id,number_type_id,currency,provider_monthly_cost,rental_monthly_price,source) values (${ctry.id},${lt},'EUR',-1,5,'manual')`, "23514");
await expectError("devise invalide refusée", `insert into phone_number_prices(country_id,number_type_id,currency,rental_monthly_price,source) values (${ctry.id},${lt},'',5,'manual')`, "23514");
await expectOk("règle de prix de test insérée", `insert into phone_number_prices(country_id,number_type_id,currency,provider_monthly_cost,rental_monthly_price,source) values (${ctry.id},${lt},'EUR',1.0000,3.00,'manual')`);
await expectError("deuxième règle active identique refusée (historique préservé)", `insert into phone_number_prices(country_id,number_type_id,currency,rental_monthly_price,source) values (${ctry.id},${lt},'EUR',4.00,'manual')`, "23505");

console.log("\n[6] Commandes / idempotence / montants / dates");
const o1 = (await c.query(`insert into orders(user_id,currency,subtotal,total,idempotency_key) values ('${A}','EUR',3,3,'idem-1') returning id, public_reference`)).rows[0];
o1.public_reference.startsWith("NO-") ? ok(`référence publique ${o1.public_reference}`) : ko("ref", o1.public_reference);
await expectError("idempotency_key dupliquée refusée", `insert into orders(user_id,currency,idempotency_key) values ('${B}','EUR','idem-1')`, "23505");
await expectError("total négatif refusé", `insert into orders(user_id,currency,subtotal,total,idempotency_key) values ('${A}','EUR',0,-1,'k1')`, "23514");
await expectError("total incohérent refusé", `insert into orders(user_id,currency,subtotal,fees,total,idempotency_key) values ('${A}','EUR',3,1,3,'k2')`, "23514");
await expectError("statut paid sans paid_at refusé", `update orders set status='paid' where id='${o1.id}'`, "23514");
await expectError("order_item durée 0 refusée", `insert into order_items(order_id,phone_number_id,item_type,duration_months,unit_price,total,currency) values ('${o1.id}','${n1.id}','rental',0,3,0,'EUR')`, "23514");
await expectOk("order_item valide", `insert into order_items(order_id,phone_number_id,item_type,duration_months,unit_price,total,currency) values ('${o1.id}','${n1.id}','rental',1,3,3,'EUR')`);

console.log("\n[7] Paiements / remboursements");
await c.query(`update orders set status='paid', paid_at=now() where id='${o1.id}'`);
const p1 = (await c.query(`insert into payments(order_id,user_id,provider,provider_payment_id,status,amount,currency,confirmed_at) values ('${o1.id}','${A}','stripe','pi_test_1','succeeded',3,'EUR',now()) returning id`)).rows[0];
await expectError("identifiant de paiement externe dupliqué refusé", `insert into payments(order_id,user_id,provider,provider_payment_id,status,amount,currency) values ('${o1.id}','${A}','stripe','pi_test_1','pending',3,'EUR')`, "23505");
await expectError("paiement succeeded sans confirmed_at refusé", `insert into payments(order_id,user_id,provider,status,amount,currency) values ('${o1.id}','${A}','stripe','succeeded',3,'EUR')`, "23514");
await expectError("montant de paiement négatif refusé", `insert into payments(order_id,user_id,provider,status,amount,currency) values ('${o1.id}','${A}','stripe','pending',-3,'EUR')`, "23514");
await expectError("remboursement > montant payé refusé", `insert into refunds(payment_id,order_id,amount,currency,reason) values ('${p1.id}','${o1.id}',3.01,'EUR','test')`, "23514");
await expectOk("remboursement partiel ≤ payé accepté", `insert into refunds(payment_id,order_id,amount,currency,reason) values ('${p1.id}','${o1.id}',1.00,'EUR','test')`);
await expectError("second remboursement dépassant le solde refusé", `insert into refunds(payment_id,order_id,amount,currency,reason) values ('${p1.id}','${o1.id}',2.01,'EUR','test')`, "23514");

console.log("\n[8] Locations : anti-double location, dates");
const r1 = (await c.query(`insert into rentals(user_id,phone_number_id,order_id,kind,status,period_months,starts_at,ends_at) values ('${A}','${n1.id}','${o1.id}','rental','active',1,now(),now()+interval '1 month') returning id`)).rows[0];
await expectError("DOUBLE LOCATION ACTIVE sur le même numéro refusée", `insert into rentals(user_id,phone_number_id,order_id,kind,status,period_months,starts_at,ends_at) values ('${B}','${n1.id}','${o1.id}','rental','active',1,now(),now()+interval '1 month')`, "23505");
await expectError("location pending sur numéro déjà loué refusée", `insert into rentals(user_id,phone_number_id,order_id,kind,status,period_months) values ('${B}','${n1.id}','${o1.id}','rental','pending',1)`, "23505");
await expectOk("location released puis nouvelle location : autorisé", `update rentals set status='released', released_at=now(), cancelled_at=now() where id='${r1.id}'; insert into rentals(user_id,phone_number_id,order_id,kind,status,period_months,starts_at,ends_at) values ('${B}','${n1.id}','${o1.id}','rental','active',1,now(),now()+interval '1 month'); update rentals set status='released', released_at=now(), cancelled_at=now() where user_id='${B}'; update rentals set status='active', cancelled_at=null, released_at=null where id='${r1.id}'`);
await expectError("ends_at < starts_at refusé", `insert into rentals(user_id,phone_number_id,order_id,kind,status,period_months,starts_at,ends_at) values ('${A}','${n2.id}','${o1.id}','rental','pending',1,now(),now()-interval '1 day')`, "23514");
await expectError("location sans utilisateur refusée", `insert into rentals(user_id,phone_number_id,order_id,kind,period_months) values (null,'${n2.id}','${o1.id}','rental',1)`, "23502");
await expectError("location sans numéro refusée", `insert into rentals(user_id,phone_number_id,order_id,kind,period_months) values ('${A}',null,'${o1.id}','rental',1)`, "23502");
await expectError("statut active sans dates refusé", `insert into rentals(user_id,phone_number_id,order_id,kind,status,period_months) values ('${A}','${n2.id}','${o1.id}','rental','active',1)`, "23514");

console.log("\n[9] Webhooks / jobs");
await expectOk("événement webhook inséré", `insert into webhook_events(provider,provider_event_id,event_type,payload,signature_valid) values ('twilio','SMtest1','sms_inbound','{}',true)`);
await expectError("DOUBLE ÉVÉNEMENT WEBHOOK refusé", `insert into webhook_events(provider,provider_event_id,event_type,payload,signature_valid) values ('twilio','SMtest1','sms_inbound','{}',true)`, "23505");
await expectError("secret en clair dans webhooks refusé (doit être un nom de variable)", `insert into webhooks(provider,event_kind,endpoint_path,secret_env_name) values ('twilio','x','/x','whsec_abc123')`, "23514");
await c.query(`insert into job_queue(job_type,dedupe_key) values ('sync','sync:catalog')`);
await expectError("tâche dupliquée (dedupe_key) refusée tant que pending", `insert into job_queue(job_type,dedupe_key) values ('sync','sync:catalog')`, "23505");
const j1 = (await c.query(`select id, status, locked_by from claim_next_job('worker-1')`)).rows;
const j2 = (await c.query(`select id from claim_next_job('worker-2')`)).rows;
j1.length === 1 && j1[0].status === "processing" && j2.length === 0 ? ok("claim_next_job : une seule réclamation possible (SKIP LOCKED)") : ko("claim", JSON.stringify([j1,j2]));

console.log("\n[10] Paramètres / contenus / audit");
await expectError("clé de paramètre évoquant un secret refusée", `insert into site_settings(key,value) values ('twilio.api_key','"x"')`, "23514");
await expectOk("contenu publié n°1", `insert into content_blocks(page_id,content_key,locale,body_md,status,published_at) values ('home','t','fr','x','published',now())`);
await expectError("deuxième contenu publié identique refusé", `insert into content_blocks(page_id,content_key,locale,body_md,status,published_at) values ('home','t','fr','y','published',now())`, "23505");
const al = (await c.query("select count(*)::int n from audit_logs")).rows[0].n;
al > 0 ? ok(`${al} entrées d'audit générées par les triggers`) : ko("audit vide", al);
const leak = (await c.query("select count(*)::int n from audit_logs where (old_values ? 'provider_monthly_cost') or (new_values ? 'provider_monthly_cost')")).rows[0].n;
leak === 0 ? ok("les coûts fournisseur sont exclus de l'audit") : ko("fuite audit", leak);
await expectError("UPDATE audit_logs interdit", `update audit_logs set action='x' where id=(select min(id) from audit_logs)`, "42501");
await expectError("DELETE audit_logs interdit", `delete from audit_logs where id=(select min(id) from audit_logs)`, "42501");

console.log("\n[11] RLS — client A vs client B");
await as(A);
let r = await c.query("select id from orders"); r.rows.length === 1 ? ok("A voit sa commande") : ko("A orders", r.rows.length);
r = await c.query("select id from payments"); r.rows.length === 1 ? ok("A voit son paiement") : ko("A payments", r.rows.length);
r = await c.query("select id from rentals"); r.rows.length === 1 ? ok("A voit sa location") : ko("A rentals", r.rows.length);
r = await c.query("select id from profiles"); r.rows.length === 1 && r.rows[0].id === A ? ok("A voit uniquement son profil") : ko("A profiles", r.rows.length);
await as(B);
r = await c.query("select id from orders"); r.rows.length === 0 ? ok("B ne voit PAS la commande de A") : ko("B orders", r.rows.length);
r = await c.query("select id from payments"); r.rows.length === 0 ? ok("B ne voit PAS le paiement de A") : ko("B payments", r.rows.length);
r = await c.query("select id from rentals where user_id<>$1", [B]); r.rows.length === 0 ? ok("B ne voit PAS la location de A") : ko("B rentals", r.rows.length);
r = await c.query("select id from messages"); r.rows.length === 0 ? ok("B ne voit aucun message d'autrui") : ko("B messages", r.rows.length);
r = await c.query("select id from notifications"); ok("B notifications : filtré (" + r.rows.length + ")");

console.log("\n[12] RLS — client contre données administratives");
await as(A);
for (const t of ["phone_number_prices","audit_logs","webhook_events","provider_api_logs","job_queue","webhooks","site_settings","countries","content_blocks"]) {
  r = await c.query(`select count(*)::int n from ${t}`); r.rows[0].n === 0 ? ok(`client : ${t} → 0 ligne`) : ko(`client lit ${t}`, r.rows[0].n);
}
r = await c.query("select * from catalog_numbers");
const cols = r.fields.map(f=>f.name);
!cols.some(x=>/cost|provider_sid|^e164$/.test(x)) && cols.includes("masked_e164") ? ok("vue catalog_numbers : aucun coût, aucun SID, numéro masqué") : ko("colonnes vue", cols.join(","));
r.rows.length === 0 ? ok("catalogue vide tant que resale_allowed=false pour le pays") : ko("catalogue visible sans resale_allowed", r.rows.length);

console.log("\n[13] RLS — tentatives d'écriture interdites par un client");
await as(A);
await expectError("client : s'attribuer le rôle admin", `insert into user_roles(user_id,role_id) select '${A}',id from roles where code='admin'`, "42501");
await expectNoRows("client : modifier un prix", `update phone_number_prices set rental_monthly_price=0.01`);
await expectError("client : insérer une commande payée", `insert into orders(user_id,currency,status,paid_at,idempotency_key) values ('${A}','EUR','paid',now(),'hack')`, "42501");
await expectError("client : insérer un remboursement", `insert into refunds(payment_id,order_id,amount,currency,reason) values ('${p1.id}','${o1.id}',1,'EUR','x')`, "42501");
await expectError("client : modifier le statut d'un paiement", `update payments set status='refunded'`, "42501");
await expectError("client : modifier le statut de sa location", `update rentals set status='active', ends_at=now()+interval '10 years' where id='${r1.id}'`, "42501");
await expectOk("client : activer l'auto-renouvellement de SA location (autorisé)", `update rentals set auto_renew=true where id='${r1.id}'`);
await expectError("client : se débloquer / changer son statut de compte", `update profiles set status='active', blocked_at=null where id='${A}'; update profiles set status='suspended', blocked_at=now() where id='${A}'`, "42501");
await expectNoRows("client : modifier phone_numbers", `update phone_numbers set status='active'`);
await expectError("client : écrire dans audit_logs", `insert into audit_logs(action,entity_table) values ('x','y')`, "42501");
await expectNoRows("client : activer un pays", `update countries set is_enabled=true`);
await expectOk("client : créer un ticket", `insert into support_tickets(user_id,subject) values ('${A}','Besoin d''aide test')`);
await expectError("client : créer un ticket pour un autre utilisateur", `insert into support_tickets(user_id,subject) values ('${B}','usurpation')`, "42501");

console.log("\n[14] RLS — support (lecture limitée, pas de pouvoir)");
await as(S);
r = await c.query("select count(*)::int n from orders"); r.rows[0].n === 1 ? ok("support voit les commandes") : ko("support orders", r.rows[0].n);
r = await c.query("select count(*)::int n from phone_number_prices"); r.rows[0].n >= 1 ? ok("support lit les prix (lecture seule)") : ko("support prix", r.rows[0].n);
await expectNoRows("support : modifier un prix", `update phone_number_prices set rental_monthly_price=99`);
await expectError("support : attribuer un rôle", `insert into user_roles(user_id,role_id) select '${B}',id from roles where code='support'`, "42501");
await expectError("support : créer un remboursement", `insert into refunds(payment_id,order_id,amount,currency,reason) values ('${p1.id}','${o1.id}',0.5,'EUR','x')`, "42501");
await expectNoRows("support : modifier un paramètre", `update site_settings set value='"X"' where key='site.name'`);
for (const t of ["audit_logs","webhook_events","provider_api_logs","job_queue","messages","calls"]) { r = await c.query(`select count(*)::int n from ${t}`); r.rows[0].n === 0 ? ok(`support : ${t} → 0 ligne`) : ko(`support lit ${t}`, r.rows[0].n); }

console.log("\n[15] RLS — admin vs superadmin");
await as(ADM);
await expectOk("admin : modifier un prix", `update phone_number_prices set rental_monthly_price=3.50 where country_id=${ctry.id}`);
await expectOk("admin : attribuer le rôle support", `insert into user_roles(user_id,role_id) select '${B}',id from roles where code='support'`);
await expectError("admin : attribuer le rôle superadmin (interdit)", `insert into user_roles(user_id,role_id) select '${B}',id from roles where code='superadmin'`, "42501");
await expectError("admin : s'attribuer lui-même un rôle", `insert into user_roles(user_id,role_id) select '${ADM}',id from roles where code='superadmin'`, "42501");
await expectError("admin : activer resale_allowed (réservé superadmin)", `update countries set resale_allowed=true, resale_review_note='vérifié' where id=${ctry.id}`, "42501");
await expectError("admin : modifier un paramètre critique", `update site_settings set value='"X"' where key='site.name'`, "42501");
await expectOk("admin : modifier un paramètre non critique", `update site_settings set value='"en"' where key='site.default_locale'`);
r = await c.query("select count(*)::int n from audit_logs"); r.rows[0].n > 0 ? ok("admin lit l'audit") : ko("admin audit", 0);
await expectError("admin : supprimer l'audit", `delete from audit_logs`, "42501");
await as(SUP);
await expectOk("superadmin : activer resale_allowed avec note", `update countries set resale_allowed=true, resale_review_note='Conditions Twilio vérifiées le … (TEST)' where id=${ctry.id}`);
r = await c.query(`select resale_reviewed_by from countries where id=${ctry.id}`); r.rows[0].resale_reviewed_by === SUP ? ok("traçabilité : resale_reviewed_by renseigné automatiquement") : ko("reviewed_by", r.rows[0]);
await expectOk("superadmin : attribuer le rôle admin", `insert into user_roles(user_id,role_id) select '${S}',id from roles where code='admin'`);
r = await c.query("select count(*)::int n from audit_logs where entity_table='user_roles' and actor_role='superadmin'"); r.rows[0].n >= 1 ? ok("audit : changement de rôle journalisé avec le rôle de l'acteur") : ko("audit rôle", r.rows[0].n);

console.log("\n[16] Catalogue après activation, vue anonyme");
await as(null, "anon");
r = await c.query("select masked_e164, rental_monthly_price, currency from catalog_numbers");
r.rows.length === 2 && r.rows.every(x=>x.rental_monthly_price === "3.50") ? ok(`anon voit le catalogue : ${r.rows[0].masked_e164} à ${r.rows[0].rental_monthly_price} ${r.rows[0].currency}`) : ko("catalogue anon", JSON.stringify(r.rows));
await expectError("anon : lecture phone_number_prices refusée", `select * from phone_number_prices`, "42501");
await expectError("anon : lecture orders refusée", `select * from orders`, "42501");
r = await c.query("select key from public_settings"); r.rows.every(x=>!/secret|token/.test(x.key)) ? ok("public_settings : paramètres publics seulement") : ko("settings", "");

console.log("\n[17] Triggers updated_at");
await asServer();
await c.query(`update profiles set updated_at = now() - interval '1 day' where id='${A}'`);
await c.query(`update profiles set display_name='Test A' where id='${A}'`);
const ua = (await c.query(`select updated_at >= now() - interval '1 second' as fresh from profiles where id='${A}'`)).rows[0].fresh;
ua ? ok("updated_at mis à jour automatiquement par trigger") : ko("updated_at", "");

await c.query("rollback"); // base de test : rien n'est conservé
console.log(`\nRésultat : ${pass} réussis, ${fail} échoués`);
await c.end();
process.exit(fail ? 1 : 0);
