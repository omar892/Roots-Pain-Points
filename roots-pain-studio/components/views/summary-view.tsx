import { Quadrant, type PainPoint, type Placements } from "@/lib/types";

interface SummaryViewProps {
  painPoints: PainPoint[];
  placements: Placements;
}

const georgia = { fontFamily: "Georgia, serif" };

export function SummaryView({ painPoints, placements }: SummaryViewProps) {
  const placed = Object.keys(placements).length;
  const total = painPoints.length;
  const startHere = painPoints.filter(
    (p) => placements[p.id] === Quadrant.StartHere
  ).length;
  const quickWins = painPoints.filter(
    (p) => placements[p.id] === Quadrant.QuickWins
  ).length;
  const byDept: Record<string, number> = {};
  painPoints.forEach((p) => {
    byDept[p.department] = (byDept[p.department] || 0) + 1;
  });

  const nextSteps = [
    <span key="1">
      Each person picks <strong>one &quot;Start Here&quot; pain point</strong>{" "}
      from their department and sets up a Project for it.
    </span>,
    <span key="2">
      Try it on <strong>at least three real tasks</strong> before next session.
      Note what worked, what didn&apos;t.
    </span>,
    <span key="3">
      Bring <strong>one win and one stuck point</strong> to share in our next
      working session.
    </span>,
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Session takeaways</h2>
        <p className="text-stone-600 text-sm">
          What we mapped today and where we go next.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Pain points mapped" value={`${placed}/${total}`} />
        <Stat
          label="Start Here items"
          value={startHere}
          accent="text-emerald-700"
        />
        <Stat label="Quick Wins" value={quickWins} accent="text-sky-700" />
        <Stat
          label="Departments engaged"
          value={Object.keys(byDept).length}
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4 text-lg" style={georgia}>
          Before next session (2 weeks)
        </h3>
        <ol className="space-y-3 text-sm">
          {nextSteps.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="bg-amber-100 text-amber-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-lg p-5 text-sm text-stone-800">
        <div className="font-semibold mb-1 text-violet-900">
          Data leader thread
        </div>
        The cross-system synthesis pain points point to a bigger consolidation
        opportunity. Let&apos;s schedule a separate 30-min before session 3 to
        map source systems and define what a Roots data layer looks like.
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-stone-900",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <div className={`text-3xl font-bold ${accent}`} style={georgia}>
        {value}
      </div>
      <div className="text-xs text-stone-600 mt-1">{label}</div>
    </div>
  );
}
