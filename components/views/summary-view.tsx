import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deptColor, QUADRANT_META } from "@/lib/constants";
import { getPattern } from "@/lib/patterns";
import {
  Quadrant,
  type Commitments,
  type PainPoint,
  type Placements,
} from "@/lib/types";

interface SummaryViewProps {
  painPoints: PainPoint[];
  placements: Placements;
  commitments: Commitments;
  toggleCommitment: (id: number) => void;
}

const georgia = { fontFamily: "Georgia, serif" };

/** Display order + accent for the four quadrant stat cards. */
const STAT_ORDER: { q: Quadrant; accent: string; ring: string }[] = [
  { q: Quadrant.StartHere, accent: "text-emerald-700", ring: "ring-emerald-400" },
  { q: Quadrant.QuickWins, accent: "text-sky-700", ring: "ring-sky-400" },
  { q: Quadrant.FrequentTricky, accent: "text-amber-700", ring: "ring-amber-400" },
  { q: Quadrant.ParkForLater, accent: "text-stone-600", ring: "ring-stone-400" },
];

export function SummaryView({
  painPoints,
  placements,
  commitments,
  toggleCommitment,
}: SummaryViewProps) {
  const [openStat, setOpenStat] = useState<Quadrant | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "fallback">(
    "idle"
  );
  const [summaryText, setSummaryText] = useState("");

  const total = painPoints.length;
  const placed = painPoints.filter((p) => placements[p.id]).length;
  const pct = total > 0 ? Math.round((placed / total) * 100) : 0;
  const deptCount = new Set(painPoints.map((p) => p.department)).size;

  const inQuadrant = (q: Quadrant) =>
    painPoints.filter((p) => placements[p.id] === q);
  const startHere = inQuadrant(Quadrant.StartHere);
  const synthesisCount = painPoints.filter((p) =>
    p.tags.includes("Synthesis")
  ).length;

  const buildSummary = () => {
    const lines: string[] = [
      "Roots Pain Point Studio — Session Takeaways",
      "",
      `Mapped: ${placed}/${total} pain points · ${deptCount} departments`,
      "",
    ];
    for (const { q } of STAT_ORDER) {
      const items = inQuadrant(q);
      lines.push(`${QUADRANT_META[q].label} (${items.length})`);
      for (const p of items) lines.push(`  - ${p.title} — ${p.person}`);
    }
    lines.push("", "Action plan (Start Here):");
    if (startHere.length === 0) {
      lines.push("  - None placed yet.");
    } else {
      for (const p of startHere) {
        const pattern = p.pattern ?? getPattern(p);
        const mark = commitments[p.id] ? "[committed]" : "[ ]";
        lines.push(`  ${mark} ${p.person}: ${p.title} → ${pattern.name}`);
      }
    }
    return lines.join("\n");
  };

  const copySummary = async () => {
    const text = buildSummary();
    setSummaryText(text);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Clipboard blocked (permissions / no focus) — surface the text instead.
      setCopyState("fallback");
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Session takeaways</h2>
          <p className="text-stone-600 text-sm">
            What we mapped today and where we go next. Tap any stat to see the
            pain points behind it.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={copySummary}
          className="border-stone-300 bg-white text-stone-700 hover:bg-stone-50 flex-shrink-0"
        >
          {copyState === "copied" ? "Copied ✓" : "Copy summary"}
        </Button>
      </div>

      {copyState === "fallback" && (
        <div className="mb-5 bg-stone-50 border border-stone-200 rounded-lg p-3">
          <div className="text-xs text-stone-600 mb-1.5">
            Couldn&apos;t reach the clipboard — select all and copy this:
          </div>
          <textarea
            readOnly
            value={summaryText}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full h-40 text-xs font-mono bg-white border border-stone-200 rounded p-2 text-stone-800 resize-y"
          />
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1.5">
          <span>
            {placed} of {total} pain points mapped · {deptCount} departments
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Traceable quadrant stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {STAT_ORDER.map(({ q, accent, ring }) => {
          const items = inQuadrant(q);
          const isOpen = openStat === q;
          return (
            <button
              key={q}
              onClick={() => setOpenStat(isOpen ? null : q)}
              className={`text-left bg-white border rounded-lg p-4 transition-all ${
                isOpen
                  ? `border-transparent ring-2 ${ring}`
                  : "border-stone-200 hover:border-stone-400"
              }`}
            >
              <div className={`text-3xl font-bold ${accent}`} style={georgia}>
                {items.length}
              </div>
              <div className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                {QUADRANT_META[q].label}
                <span className="text-stone-400">{isOpen ? "▴" : "▾"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel for the selected stat */}
      {openStat && (
        <div className="mb-8 bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">
            {QUADRANT_META[openStat].label} · {QUADRANT_META[openStat].sublabel}
          </div>
          {inQuadrant(openStat).length === 0 ? (
            <p className="text-sm text-stone-400 italic">
              No pain points placed here yet — map them on the Prioritize tab.
            </p>
          ) : (
            <div className="space-y-1.5">
              {inQuadrant(openStat).map((p) => {
                const c = deptColor(p.department);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 rounded border border-stone-100 bg-stone-50 px-3 py-2"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <span className="text-sm font-medium text-stone-900">
                      {p.title}
                    </span>
                    <span className="ml-auto text-xs text-stone-500 whitespace-nowrap">
                      {p.person} · {p.department} · {p.frequency}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {!openStat && <div className="mb-8" />}

      {/* Action plan from Start Here */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h3 className="font-semibold text-lg" style={georgia}>
            Who&apos;s doing what
          </h3>
          {startHere.length > 0 && (
            <span className="text-xs font-medium text-stone-500">
              {startHere.filter((p) => commitments[p.id]).length}/
              {startHere.length} committed
            </span>
          )}
        </div>
        <p className="text-sm text-stone-600 mb-4">
          Each <strong>Start Here</strong> pain point, its owner, and the
          pattern to run. Tap a row to commit.
        </p>
        {startHere.length === 0 ? (
          <p className="text-sm text-stone-400 italic">
            No Start Here items yet. Place pain points in the Start Here
            quadrant on the Prioritize tab and they&apos;ll appear here as
            assignments.
          </p>
        ) : (
          <div className="space-y-2">
            {startHere.map((p) => {
              const pattern = p.pattern ?? getPattern(p);
              const c = deptColor(p.department);
              const committed = !!commitments[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  role="checkbox"
                  aria-checked={committed}
                  onClick={() => toggleCommitment(p.id)}
                  className={`w-full text-left flex gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    committed
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-[11px] font-bold border ${
                      committed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-stone-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      <span className="text-sm font-medium text-stone-900">
                        {p.person}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-sm text-stone-700">{p.title}</span>
                    </span>
                    <span className="block text-xs text-stone-500 mt-0.5">
                      Pattern: <strong>{pattern.name}</strong> —{" "}
                      {pattern.firstStep.question}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3 text-lg" style={georgia}>
          Before next session (2 weeks)
        </h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <Step n={1} />
            <span className="leading-relaxed pt-0.5">
              Run the committed pattern above on{" "}
              <strong>at least three real tasks</strong>. Note what worked and
              what didn&apos;t.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span className="leading-relaxed pt-0.5">
              Bring <strong>one win and one stuck point</strong> to share in our
              next working session.
            </span>
          </li>
        </ol>
      </div>

      {synthesisCount >= 2 && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-5 text-sm text-stone-800">
          <div className="font-semibold mb-1 text-violet-900">
            Data leader thread
          </div>
          {synthesisCount} pain points involve synthesizing across systems —
          that points to a bigger consolidation opportunity. Let&apos;s schedule
          a separate 30-min before session 3 to map source systems and define
          what a Roots data layer looks like.
        </div>
      )}
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="bg-amber-100 text-amber-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
      {n}
    </span>
  );
}
