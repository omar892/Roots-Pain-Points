import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS, DEPT_COLORS } from "@/lib/constants";
import type { PainPoint } from "@/lib/types";

interface BoardViewProps {
  painPoints: PainPoint[];
  filter: string;
  setFilter: (filter: string) => void;
}

export function BoardView({ painPoints, filter, setFilter }: BoardViewProps) {
  const filters = ["All", ...DEPARTMENTS];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">
          What&apos;s slowing the team down
        </h2>
        <p className="text-stone-600 text-sm">
          From the pre-session intake. Walk through each as a group — is the
          framing right? Anything missing?
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
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
      </div>

      {painPoints.length === 0 ? (
        <p className="text-sm text-stone-500 italic">
          No pain points in this department.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {painPoints.map((p) => (
            <PainPointCard key={p.id} point={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PainPointCard({ point }: { point: PainPoint }) {
  const c = DEPT_COLORS[point.department];
  return (
    <div
      className={`${c.bg} border ${c.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-xs font-medium ${c.text}`}>
          {point.department}
        </span>
        <span className="text-xs text-stone-500 ml-auto">
          {point.frequency}
        </span>
      </div>
      <h3 className="font-semibold text-stone-900 mb-1.5">{point.title}</h3>
      <p className="text-sm text-stone-600 mb-3">{point.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {point.tags.map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="bg-white/70 text-stone-700 font-normal rounded"
          >
            {t}
          </Badge>
        ))}
      </div>
      <div className="text-xs text-stone-500 flex justify-between items-center pt-2 border-t border-stone-200/50">
        <span className="font-medium">{point.person}</span>
        <span>{point.timeSpent} each time</span>
      </div>
    </div>
  );
}
