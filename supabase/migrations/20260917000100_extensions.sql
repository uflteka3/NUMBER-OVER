-- NUMBER OVER — 0001 Extensions
-- pgcrypto : gen_random_uuid(), chiffrement symétrique (pgp_sym_*) pour contenus sensibles.
-- citext   : e-mails / clés insensibles à la casse.
-- btree_gist : contraintes d'exclusion (anti-chevauchement de locations).
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists btree_gist with schema extensions;
