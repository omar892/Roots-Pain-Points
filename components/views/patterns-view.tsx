import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { deptColor } from "@/lib/constants";
import { getPattern } from "@/lib/patterns";
import type { Commitments, FirstStep, PainPoint, Pattern } from "@/lib/types";

interface PatternsViewProps {
  points: PainPoint[];
  isDefault: boolean;
  commitments: Commitments;
  toggleCommitment: (id: number) => void;
}

const georgia = { fontFamily: "Georgia, serif" };

/** A pattern and the pain points that map to it. */
interface PatternGroup {
  pattern: Pattern;
  points: PainPoint[];
}

function resolvePattern(p: PainPoint): Pattern {
  return p.pattern ?? getPattern(p);
}

function groupByPattern(points: PainPoint[]): PatternGroup[] {
  const groups = new Map<string, PatternGroup>();
  for (const p of points) {
    const pattern = resolvePattern(p);
    const existing = groups.get(pattern.name);
    if (existing) existing.points.push(p);
    else groups.set(pattern.name, { pattern, points: [p] });
  }
  // Most leverage first — the pattern that clears the most pain points.
  return [...groups.values()].sort((a, b) => b.points.length - a.points.length);
}

export function PatternsView({
  points,
  isDefault,
  commitments,
  toggleCommitment,
}: PatternsViewProps) {
  const [filter, setFilter] = useState("All");

  const departments = Array.from(new Set(points.map((p) => p.department))).sort();
  const filters = ["All", ...departments];
  const visible =
    filter === "All" ? points : points.filter((p) => p.department === filter);
  const groups = groupByPattern(visible);

  const committedCount = visible.filter((p) => commitments[p.id]).length;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">
          {isDefault
            ? "AI patterns for every pain point"
            : "AI patterns for our top opportunities"}
        </h2>
        <p className="text-stone-600 text-sm">
          Pain points are grouped by the Claude pattern that solves them — one
          setup can clear several. Check the box on each to commit to trying it.
        </p>
      </div>

      {isDefault && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-900">
          Showing <strong>all</strong> pain points. Place items in the{" "}
          <strong>Start Here</strong> quadrant on the Prioritize tab to focus
          this view on the group&apos;s real priorities.
        </div>
      )}

      {/* Filters — same control as The Board */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {filters.map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              filter === d
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
            }`}
          >
            {d}
          </button>
        ))}
        <span className="ml-auto text-xs font-medium text-stone-500">
          {committedCount} of {visible.length} committed
        </span>
      </div>

      <div className="space-y-4">
        {groups.map(({ pattern, points: groupPoints }) => {
          const committedInGroup = groupPoints.filter(
            (p) => commitments[p.id]
          ).length;
          return (
            <div
              key={pattern.name}
              className="bg-white border border-stone-200 rounded-lg overflow-hidden"
            >
              <div className="px-5 pt-4 pb-3 border-b border-stone-100">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                    Pattern
                  </span>
                  <span className="text-xs font-medium text-stone-500">
                    {committedInGroup}/{groupPoints.length} committed
                  </span>
                </div>
                <div
                  className="font-bold text-amber-900 text-lg mb-1"
                  style={georgia}
                >
                  {pattern.name}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-3">
                  {pattern.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pattern.features.map((f) => (
                    <Badge
                      key={f}
                      variant="secondary"
                      className="bg-stone-100 text-stone-700 font-medium rounded"
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>

              <FirstStepBlock firstStep={pattern.firstStep} />

              <div className="p-3">
                <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold px-1 mb-1.5">
                  Clears {groupPoints.length}{" "}
                  {groupPoints.length === 1 ? "pain point" : "pain points"}
                </div>
                <div className="space-y-1.5">
                  {groupPoints.map((p) => (
                    <CommitRow
                      key={p.id}
                      point={p}
                      committed={!!commitments[p.id]}
                      onToggle={() => toggleCommitment(p.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommitRow({
  point,
  committed,
  onToggle,
}: {
  point: PainPoint;
  committed: boolean;
  onToggle: () => void;
}) {
  const c = deptColor(point.department);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={committed}
      onClick={onToggle}
      className={`w-full flex items-center gap-2.5 text-left rounded-lg border px-3 py-2 transition-colors ${
        committed
          ? "bg-emerald-50 border-emerald-300"
          : "bg-white border-stone-200 hover:border-stone-400"
      }`}
    >
      <span
        className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-[11px] font-bold border ${
          committed
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "bg-white border-stone-300 text-transparent"
        }`}
      >
        ✓
      </span>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
      <span
        className={`text-sm font-medium ${
          committed ? "text-emerald-900" : "text-stone-900"
        }`}
      >
        {point.title}
      </span>
      <span className="ml-auto text-xs text-stone-500 whitespace-nowrap">
        {point.person} · {point.department}
      </span>
    </button>
  );
}

function FirstStepBlock({ firstStep }: { firstStep: FirstStep }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(firstStep.starter_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the prompt is already visible to copy by hand.
    }
  };

  return (
    <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-100">
      <div className="text-xs uppercase tracking-wider text-amber-900 mb-1 font-semibold">
        First step this week
      </div>
      <p className="text-sm text-stone-800 leading-relaxed">
        {firstStep.question}
      </p>

      <button
        type="button"
        onClick={() => setShowPrompt((v) => !v)}
        className="mt-2 text-xs font-medium text-amber-800 hover:text-amber-900"
      >
        {showPrompt ? "Hide starter prompt ▴" : "Stuck? See a starter prompt ▾"}
      </button>

      {showPrompt && (
        <div className="mt-2 rounded-md border border-stone-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1 bg-stone-50 border-b border-stone-100">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Starter prompt
            </span>
            <button
              type="button"
              onClick={copyPrompt}
              className="text-[11px] font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded px-2 py-0.5 bg-white"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre className="text-xs font-mono text-stone-800 whitespace-pre-wrap p-3 leading-relaxed">
            {firstStep.starter_prompt}
          </pre>
        </div>
      )}

      <p className="text-xs italic text-stone-500 mt-2">
        What to watch for: {firstStep.watch_for}
      </p>
    </div>
  );
}
