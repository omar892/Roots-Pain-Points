import type { Frequency, PainPoint } from "@/lib/types";

const SHEET_ID = "14XoMnu6Lp9GhwN5BjsfleO_22F2r68YIM3X5kgxkMzo";
const SHEET_GID = "1282854144";

/** Live CSV export of the "Pain Point Discovery" form responses. */
export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

/**
 * Parses RFC-4180 CSV text into rows of string cells.
 * Handles quoted fields containing commas, newlines, and escaped quotes.
 */
export function parseCsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/*
 * Sheet column layout (one row = one person, up to 3 pain-point blocks):
 *   0 Timestamp · 1 Name · 2 Role/Department · 3 Typical Week
 *   4–8, 9–13, 14–18  →  [Task, Frequency, Duration, What makes this painful?, Details]
 *   19 Prior AI work · 20 Ideal Outcome
 */
const BLOCK_STARTS = [4, 9, 14];

const VALID_FREQUENCIES: Frequency[] = ["Daily", "Weekly", "Monthly", "Occasionally"];

/** Maps the form's "What makes this painful?" options onto the studio's tag vocabulary. */
const TAG_NORMALIZE: Record<string, string> = {
  "Writing heavy": "Writing-heavy",
  "Finding/gathering information or data": "Finding info",
  "Hard to Start": "Hard to start",
};

function normalizeTag(raw: string): string {
  const t = raw.trim();
  return TAG_NORMALIZE[t] ?? t;
}

function normalizeFrequency(raw: string): Frequency {
  const f = raw.trim();
  return (VALID_FREQUENCIES as string[]).includes(f) ? (f as Frequency) : "Occasionally";
}

/** FNV-1a string hash → non-negative integer, for stable PainPoint ids across reloads. */
function hashId(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash | 0);
}

/** Turns parsed CSV rows into PainPoint cards — one per non-empty task block. */
export function transformRows(rows: string[][]): PainPoint[] {
  if (rows.length < 2) return [];
  const points: PainPoint[] = [];
  for (const row of rows.slice(1)) {
    const timestamp = (row[0] ?? "").trim();
    const name = (row[1] ?? "").trim();
    const department = (row[2] ?? "").trim() || "Unassigned";
    if (!name) continue;
    BLOCK_STARTS.forEach((start, blockIndex) => {
      const task = (row[start] ?? "").trim();
      if (!task) return;
      const duration = (row[start + 2] ?? "").trim();
      const reason = (row[start + 3] ?? "").trim();
      const details = (row[start + 4] ?? "").trim();
      points.push({
        id: hashId(`${timestamp}|${name}|${blockIndex}`),
        title: task,
        person: name,
        department,
        frequency: normalizeFrequency(row[start + 1] ?? ""),
        timeSpent: duration || undefined,
        tags: reason ? [normalizeTag(reason)] : [],
        description: details || undefined,
      });
    });
  }
  return points;
}

/**
 * Fetches the live form responses via the same-origin /api/painpoints proxy.
 * Throws on network/HTTP failure so callers can fall back to saved/sample data.
 */
export async function fetchPainPoints(): Promise<PainPoint[]> {
  const res = await fetch("/api/painpoints", { cache: "no-store" });
  if (!res.ok) throw new Error(`Response API failed: ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected response shape from /api/painpoints");
  }
  return data as PainPoint[];
}
