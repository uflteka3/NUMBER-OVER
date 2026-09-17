-- NUMBER OVER — 0003 Fonctions utilitaires (avant les tables : utilisées par triggers et RLS)

-- updated_at automatique
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Masquage d'un numéro E.164 pour affichage public : garde indicatif + 3 premiers + 2 derniers chiffres.
create or replace function public.mask_e164(p text)
returns text language sql immutable strict as $$
  select case
    when length(p) <= 6 then repeat('•', length(p))
    else left(p, 5) || repeat('•', greatest(length(p) - 7, 0)) || right(p, 2)
  end
$$;

-- Génération de référence publique lisible (ex. NO-7K3M9Q2A), sans ambiguïté 0/O/1/I.
create or replace function public.generate_public_reference(prefix text default 'NO')
returns text language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_ref text := '';
  i int;
begin
  for i in 1..8 loop
    out_ref := out_ref || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return prefix || '-' || out_ref;
end $$;
