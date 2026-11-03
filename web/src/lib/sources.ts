import type { ReportSource } from "@/lib/reports";

// Liens HTTP(S) uniquement, sans identifiants, huit au plus.
export function parseSources(value: string): ReportSource[] | null {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 8) return null;
  const sources: ReportSource[] = [];
  for (const line of lines) {
    try {
      const url = new URL(line);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
      if (sources.some((source) => source.url === url.toString())) continue;
      sources.push({ title: url.hostname, url: url.toString() });
    } catch {
      return null;
    }
  }
  return sources;
}
