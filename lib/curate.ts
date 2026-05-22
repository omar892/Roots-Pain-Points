import type { PainPoint, Pattern } from "@/lib/types";

/*
 * Curation calls the Anthropic API directly with `fetch` rather than the
 * official SDK: this module runs in the Cloudflare edge runtime (the route is
 * `runtime = "edge"`), and @anthropic-ai/sdk imports `node:path`, which the
 * edge runtime does not provide.
 */

const MODEL = "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You help run an internal AI-adoption workshop at Roots, a nonprofit. Staff submitted "pain points" — recurring or frustrating tasks — through an intake form. Submissions are raw: often a rambling sentence or two, sometimes with typos, sometimes terse.

For each submission, produce a curated version for the workshop board:

- title: a short, plain title for the task (aim for 3-8 words), derived from what they wrote. Do not pad it — a simple task gets a simple title.
- description: 1-2 sentences capturing the pain point in the submitter's own voice. Lightly clean up — fix typos, trim rambling, make it readable — but keep their meaning and tone, and do NOT add detail they didn't give. If the submission is already short and clear, keep the description short.
- tags: 1-3 short tags naming the nature of the work (e.g. "Writing-heavy", "Repetitive", "Scheduling", "Data gathering", "Synthesis", "Stakeholder-heavy"). Invent a fitting tag if needed.
- pattern: a concrete, practical way Claude could help with THIS specific task — name (short label for the approach), description (1-2 sentences on how it works here), features (2-4 short capability tags), and firstStep, an object with three fields:
  - question: an open-ended question (max 2 sentences) that gets the person thinking about THEIR specific context, not the generic problem. Lead with discovery, not an action item. Use phrasing like "talk this through with Claude" or "let Claude help you think about…" — never "ask Claude to…".
  - starter_prompt: a prompt written in the first person, as if the person will paste it to Claude. Include bracketed placeholders like [paste your notes] where their context goes, and include "ask me clarifying questions before suggesting anything" when it fits.
  - watch_for: one sentence on what to notice while doing the work.

Be specific to each submission — a grant-writing pain point and an inventory-tracking pain point should get different patterns. Keep everything concise and grounded in what the person actually wrote.`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    painPoints: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          pattern: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              features: { type: "array", items: { type: "string" } },
              firstStep: {
                type: "object",
                additionalProperties: false,
                properties: {
                  question: { type: "string" },
                  starter_prompt: { type: "string" },
                  watch_for: { type: "string" },
                },
                required: ["question", "starter_prompt", "watch_for"],
              },
            },
            required: ["name", "description", "features", "firstStep"],
          },
        },
        required: ["id", "title", "description", "tags", "pattern"],
      },
    },
  },
  required: ["painPoints"],
};

interface CuratedItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  pattern: Pattern;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

/**
 * Sends the raw pain points to Claude for light-touch curation — a short title,
 * a tidied description in the submitter's voice, inferred tags, and a tailored
 * AI-adoption pattern per card. Throws on failure so the caller can fall back
 * to the raw data.
 */
export async function curatePainPoints(
  raw: PainPoint[],
  apiKey: string
): Promise<PainPoint[]> {
  if (raw.length === 0) return raw;

  const input = raw.map((p) => ({
    id: p.id,
    person: p.person,
    department: p.department,
    frequency: p.frequency,
    timeSpent: p.timeSpent ?? "",
    submission: p.title,
    extraDetails: p.description ?? "",
  }));

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      messages: [{ role: "user", content: JSON.stringify(input) }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API responded ${res.status}`);
  }

  const body = (await res.json()) as { content?: AnthropicContentBlock[] };
  const text = body.content?.find(
    (b) => b.type === "text" && typeof b.text === "string"
  )?.text;
  if (!text) throw new Error("No text block in curation response");

  const parsed = JSON.parse(text) as { painPoints?: CuratedItem[] };
  if (!Array.isArray(parsed.painPoints)) {
    throw new Error("Curation response missing painPoints array");
  }

  const byId = new Map(parsed.painPoints.map((c) => [c.id, c]));
  return raw.map((p) => {
    const c = byId.get(p.id);
    if (!c) return p;
    return {
      ...p,
      title: c.title?.trim() || p.title,
      description: c.description?.trim() || p.description,
      tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : p.tags,
      pattern: c.pattern,
    };
  });
}
