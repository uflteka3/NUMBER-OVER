# Installation de la CI GitHub Actions

Le fichier `ci.yml` de ce dossier doit être placé à l'emplacement `.github/workflows/ci.yml` du dépôt.
Il n'a pas pu être poussé automatiquement (permission « workflows » absente pour l'application GitHub).

## Étapes (interface GitHub)
1. Ouvrir le dépôt sur GitHub, branche `arena/01a0adf0-number-over`.
2. « Add file » → « Create new file ».
3. Nom du fichier : `.github/workflows/ci.yml`
4. Coller le contenu intégral de `docs/ci/ci.yml`.
5. « Commit changes » sur la même branche.

La CI exécute : lint, typecheck, scan de secrets, `npm audit --audit-level=high`, build.
Aucun secret n'est nécessaire.
