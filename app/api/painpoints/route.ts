import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

import { curatePainPoints } from "@/lib/curate";
import { parseCsv, SHEET_CSV_URL, transformRows } from "@/lib/sheet";
import type { PainPoint } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** ANTHROPIC_API_KEY from the Cloudflare Pages environment (or local .dev.vars). */
function getApiKey(): string | undefined {
  const env = getOptionalRequestContext()?.env as
    | Record<string, string | undefined>
    | undefined;
  return env?.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
}

/** FNV-1a string hash — used to detect when the sheet contents have changed. */
function hashString(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/*
 * Curation calls Claude and is slow/costly, so the curated result is held in
 * Cloudflare's edge cache, keyed by the sheet contents. Unlike a module-level
 * variable (per-isolate), the edge cache is shared across requests — so
 * curation only re-runs when a new form response actually changes the sheet.
 */
function edgeCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

function cacheKeyFor(key: string): Request {
  return new Request(`https://roots-pain-studio.internal/painpoints/${key}`);
}

async function readCache(key: string): Promise<PainPoint[] | null> {
  try {
    const hit = await edgeCache().match(cacheKeyFor(key));
    return hit ? ((await hit.json()) as PainPoint[]) : null;
  } catch {
    return null;
  }
}

async function writeCache(key: string, data: PainPoint[]): Promise<void> {
  try {
    await edgeCache().put(
      cacheKeyFor(key),
      new Response(JSON.stringify(data), {
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=86400",
        },
      })
    );
  } catch {
    /* edge cache unavailable — proceed without it */
  }
}

/** Client responses are never cached — the function must run each load to check the sheet. */
function freshJson(data: PainPoint[]): Response {
  return Response.json(data, { headers: { "cache-control": "no-store" } });
}

/**
 * Same-origin proxy for the Google Sheet. Fetches the CSV server-side,
 * transforms it into pain points, and (when an API key is configured) has
 * Claude curate them. Curation results are edge-cached by sheet contents.
 * Falls back to raw data on any curation failure so the studio always renders.
 */
export async function GET() {
  try {
    const upstream = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!upstream.ok) {
      return Response.json(
        { error: `Sheet responded ${upstream.status}` },
        { status: 502, headers: { "cache-control": "no-store" } }
      );
    }

    const csv = await upstream.text();
    const raw = transformRows(parseCsv(csv));
    const apiKey = getApiKey();
    const key = `${hashString(csv)}-${apiKey ? "c" : "r"}`;

    const cached = await readCache(key);
    if (cached) return freshJson(cached);

    let data = raw;
    if (apiKey && raw.length > 0) {
      try {
        data = await curatePainPoints(raw, apiKey);
      } catch {
        data = raw; // curation failed — serve raw rather than erroring
      }
    }

    await writeCache(key, data);
    return freshJson(data);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 502, headers: { "cache-control": "no-store" } }
    );
  }
}
