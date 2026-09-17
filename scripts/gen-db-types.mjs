#!/usr/bin/env node
/**
 * NUMBER OVER — Génération de src/types/database.ts depuis une base PostgreSQL.
 * Équivalent local de `supabase gen types typescript` (utilisable sans Docker).
 * Usage : DATABASE_URL=postgresql://... node scripts/gen-db-types.mjs
 * En production, préférer : supabase gen types typescript --project-id <ref> > src/types/database.ts
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(process.env.PG_MODULE_DIR ? process.env.PG_MODULE_DIR + "/" : import.meta.url);
const pg = require("pg");
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL manquante"); process.exit(1); }
const c = new pg.Client({ connectionString: url });
await c.connect();

const map = (t, udt) => {
  if (udt.startsWith("_")) return map(t, udt.slice(1)) + "[]";
  switch (udt) {
    case "uuid": case "text": case "citext": case "bpchar": case "varchar": case "inet": case "bytea": case "timestamptz": case "timestamp": case "date": case "time": case "interval": case "numeric": return udt === "numeric" ? "number" : "string";
    case "int2": case "int4": case "int8": case "float4": case "float8": return "number";
    case "bool": return "boolean";
    case "json": case "jsonb": return "Json";
    default: return enums.has(udt) ? `Database["public"]["Enums"]["${udt}"]` : "unknown";
  }
};

const enumsRows = (await c.query(`select t.typname, json_agg(e.enumlabel order by e.enumsortorder) labels from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' group by 1 order by 1`)).rows;
const enums = new Map(enumsRows.map(r => [r.typname, r.labels]));

const cols = (await c.query(`select c.table_name, c.column_name, c.udt_name, c.data_type, c.is_nullable, c.column_default, c.is_generated, c.is_identity, t.table_type
  from information_schema.columns c join information_schema.tables t on t.table_name=c.table_name and t.table_schema=c.table_schema
  where c.table_schema='public' order by c.table_name, c.ordinal_position`)).rows;
const byTable = {};
for (const r of cols) (byTable[r.table_name] ??= { type: r.table_type, cols: [] }).cols.push(r);

const fks = (await c.query(`select tc.table_name, kcu.column_name, ccu.table_name ftable, ccu.column_name fcol, tc.constraint_name
  from information_schema.table_constraints tc join information_schema.key_column_usage kcu on kcu.constraint_name=tc.constraint_name
  join information_schema.constraint_column_usage ccu on ccu.constraint_name=tc.constraint_name
  where tc.constraint_type='FOREIGN KEY' and tc.table_schema='public'`)).rows;

const fns = (await c.query(`select p.proname, pg_get_function_arguments(p.oid) args, pg_get_function_result(p.oid) ret from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f' order by 1`)).rows;

const ind = (s, n = 1) => s.split("\n").map(l => l ? "  ".repeat(n) + l : l).join("\n");
let out = `/**\n * NUMBER OVER — Types de base de données (GÉNÉRÉ — ne pas éditer à la main)\n * Généré par scripts/gen-db-types.mjs le ${new Date().toISOString()}\n */\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\n\nexport type Database = {\n  public: {\n    Tables: {\n`;
const views = [];
for (const [name, t] of Object.entries(byTable)) {
  if (t.type === "VIEW") { views.push([name, t]); continue; }
  const row = t.cols.map(cn => `${cn.column_name}: ${map(cn.data_type, cn.udt_name)}${cn.is_nullable === "YES" ? " | null" : ""};`).join("\n");
  const insert = t.cols.filter(cn => cn.is_generated === "NEVER").map(cn => `${cn.column_name}${cn.is_nullable === "YES" || cn.column_default !== null || cn.is_identity === "YES" ? "?" : ""}: ${map(cn.data_type, cn.udt_name)}${cn.is_nullable === "YES" ? " | null" : ""};`).join("\n");
  const update = t.cols.filter(cn => cn.is_generated === "NEVER").map(cn => `${cn.column_name}?: ${map(cn.data_type, cn.udt_name)}${cn.is_nullable === "YES" ? " | null" : ""};`).join("\n");
  const rels = fks.filter(f => f.table_name === name).map(f => `{ foreignKeyName: "${f.constraint_name}"; columns: ["${f.column_name}"]; isOneToOne: false; referencedRelation: "${f.ftable}"; referencedColumns: ["${f.fcol}"]; }`).join(",\n");
  out += ind(`${name}: {\n  Row: {\n${ind(row, 2)}\n  };\n  Insert: {\n${ind(insert, 2)}\n  };\n  Update: {\n${ind(update, 2)}\n  };\n  Relationships: [\n${ind(rels, 2)}\n  ];\n};`, 3) + "\n";
}
out += `    };\n    Views: {\n`;
for (const [name, t] of views) {
  const row = t.cols.map(cn => `${cn.column_name}: ${map(cn.data_type, cn.udt_name)} | null;`).join("\n");
  out += ind(`${name}: {\n  Row: {\n${ind(row, 2)}\n  };\n  Relationships: [];\n};`, 3) + "\n";
}
out += `    };\n    Functions: {\n`;
for (const f of fns) out += ind(`${f.proname}: { Args: Record<string, unknown>; Returns: unknown; }; // (${f.args}) → ${f.ret}`, 3) + "\n";
out += `    };\n    Enums: {\n`;
for (const [n, labels] of enums) out += ind(`${n}: ${labels.map(l => `"${l}"`).join(" | ")};`, 3) + "\n";
out += `    };\n    CompositeTypes: Record<string, never>;\n  };\n};\n\nexport type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];\nexport type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];\n`;
writeFileSync(process.argv[2] ?? "src/types/database.ts", out);
console.log(`Types générés : ${Object.keys(byTable).length - views.length} tables, ${views.length} vues, ${enums.size} enums, ${fns.length} fonctions`);
await c.end();
