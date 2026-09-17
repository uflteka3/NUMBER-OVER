#!/usr/bin/env bash
# Applique le shim local puis toutes les migrations sur une base fraîche. Usage : run-migrations.sh <dbname>
set -e
DB=${1:-numberover_test}
Q="node /home/user/pgtool/q.mjs"
echo "drop database if exists $DB;" | $Q postgres >/dev/null; echo "create database $DB;" | $Q postgres >/dev/null
$Q $DB "$(dirname "$0")/00_supabase_shim.sql" >/dev/null && echo "shim OK"
for f in "$(dirname "$0")"/../migrations/*.sql; do
  printf "%-45s " "$(basename "$f")"; $Q $DB "$f" | tail -1
done
