-- NUMBER OVER — 0016 Correctif : fonctions utilisées par des DEFAULT de colonnes accessibles aux clients
-- (support_tickets.public_reference, orders.public_reference). Sans ce grant, un client ne peut pas créer de ticket.
grant execute on function public.generate_public_reference(text) to authenticated;
-- set_updated_at est appelé par trigger : le trigger s'exécute avec les droits du propriétaire de la table,
-- mais on l'accorde explicitement pour éviter toute surprise selon la configuration.
grant execute on function public.set_updated_at() to authenticated;
