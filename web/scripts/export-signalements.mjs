import { mkdir, writeFile } from "node:fs/promises";
import pg from "pg";

// Libellés français repris de src/lib/messenger-messages.ts.
const KINDS = { report: "Information douteuse", check: "Rumeur à vérifier" };
const THEMES = { education: "Éducation", agriculture: "Agriculture", sante: "Santé", economie: "Économie", politique: "Politique", securite: "Sécurité", autre: "Autre" };
const SEEN_ON = { facebook: "Facebook", whatsapp: "WhatsApp", radio_tv: "Radio ou télé", bouche_a_oreille: "Bouche-à-oreille", autre: "Autre" };
const STATUSES = { new: "Nouveau", in_review: "En vérification", forwarded: "Transmis à un organisme", verified: "Vérifié", closed: "Clos" };
const LANGUAGES = { fr: "Français", mg: "Malgache", en: "Anglais" };
// Format AAAA-MM-JJ HH:MM : Excel le lit sans confondre jour et mois, quelle que soit sa langue.
const dateFormat = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short", timeZone: "Indian/Antananarivo" });

function cell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // Un tableur exécuterait une cellule commençant par =, +, - ou @ comme une formule.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL manque dans .env.local.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
let rows;
try {
  // L’identifiant Messenger du signaleur n’est volontairement pas exporté.
  const result = await client.query(
    "SELECT code, created_at, kind, theme, content, seen_on, region, attachment_count, language, status FROM signalement ORDER BY created_at DESC",
  );
  rows = result.rows;
} finally {
  await client.end();
}

const header = ["Code", "Date (heure de Madagascar)", "Type", "Thème", "Contenu", "Vu sur", "Lieu", "Fichiers non conservés", "Langue", "Statut"];
const lines = rows.map((row) => [
  row.code,
  dateFormat.format(row.created_at),
  KINDS[row.kind] ?? row.kind,
  THEMES[row.theme] ?? row.theme,
  row.content,
  SEEN_ON[row.seen_on] ?? row.seen_on,
  row.region,
  row.attachment_count,
  LANGUAGES[row.language] ?? row.language,
  STATUSES[row.status] ?? row.status,
]);

// Séparateur « ; » et BOM UTF-8 pour une ouverture directe dans Excel en français.
const csv = `﻿${[header, ...lines].map((line) => line.map(cell).join(";")).join("\r\n")}\r\n`;
const fileName = `signalements-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
await mkdir(new URL("../exports/", import.meta.url), { recursive: true });
await writeFile(new URL(`../exports/${fileName}`, import.meta.url), csv, "utf8");
console.log(`${lines.length} signalement(s) exporté(s) dans web/exports/${fileName}`);
