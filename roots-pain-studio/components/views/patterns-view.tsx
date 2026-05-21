import { Badge } from "@/components/ui/badge";
import { DEPT_COLORS } from "@/lib/constants";
import { getPattern } from "@/lib/patterns";
import type { PainPoint } from "@/lib/types";

interface PatternsViewProps {
  highPriority: PainPoint[];
  isDefault: boolean;
}

const georgia = { fontFamily: "Georgia, serif" };

export function PatternsView({ highPriority, isDefault }: PatternsViewProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">
          AI patterns for our top opportunities
        </h2>
        <p className="text-stone-600 text-sm">
          {isDefault
            ? 'Sample patterns shown — place items in the "Start Here" quadrant to populate this view with your real priorities.'
            : "For each priority pain point, here's the specific Claude pattern that addresses it."}
        </p>
      </div>

      <div className="space-y-4">
        {highPriority.map((p) => {
          const pattern = getPattern(p);
          const c = DEPT_COLORS[p.department];
          return (
            <div
              key={p.id}
              className="bg-white border border-stone-200 rounded-lg overflow-hidden"
            >
              <div className={`${c.bg} px-5 py-3 border-b ${c.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className={`text-xs font-medium ${c.text}`}>
                    {p.department} · {p.person}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{p.title}</h3>
              </div>
              <div className="p-5">
                <div className="text-xs uppercase tracking-wider text-stone-500 mb-1 font-semibold">
                  Pattern
                </div>
                <div
                  className="font-bold text-amber-900 mb-2 text-lg"
                  style={georgia}
                >
                  {pattern.name}
                </div>
                <p className="text-sm text-stone-700 mb-4 leading-relaxed">
                  {pattern.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
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

                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="text-xs uppercase tracking-wider text-amber-900 mb-1 font-semibold">
                    First step this week
                  </div>
                  <p className="text-sm text-stone-800">{pattern.firstStep}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
