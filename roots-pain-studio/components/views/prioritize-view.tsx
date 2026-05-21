import { useState } from "react";

import { DEPT_COLORS, QUADRANT_GRID, QUADRANT_META } from "@/lib/constants";
import { Quadrant, type PainPoint, type Placements } from "@/lib/types";

interface PrioritizeViewProps {
  painPoints: PainPoint[];
  placements: Placements;
  placePoint: (id: number, quadrant: Quadrant) => void;
}

export function PrioritizeView({
  painPoints,
  placements,
  placePoint,
}: PrioritizeViewProps) {
  const unplaced = painPoints.filter((p) => !placements[p.id]);
  const placed = Object.keys(placements).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">
          Where should AI help first?
        </h2>
        <p className="text-stone-600 text-sm">
          Talk through each pain point. As a group, place it.{" "}
          {placed > 0 && (
            <span className="text-stone-900 font-medium">
              {placed}/{painPoints.length} placed.
            </span>
          )}
        </p>
      </div>

      {unplaced.length > 0 && (
        <div className="mb-6 bg-white border border-stone-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
            To place ({unplaced.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((p) => (
              <UnplacedChip
                key={p.id}
                point={p}
                onPlace={(q) => placePoint(p.id, q)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs text-stone-500 text-center mb-2 font-medium">
          ↑ High Frequency / Impact
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUADRANT_GRID.map((qKey) => (
            <QuadrantCell
              key={qKey}
              qKey={qKey}
              painPoints={painPoints}
              placements={placements}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-stone-500 mt-2 font-medium">
          <span>← Lower AI fit</span>
          <span>Stronger AI fit →</span>
        </div>
      </div>
    </div>
  );
}

function UnplacedChip({
  point,
  onPlace,
}: {
  point: PainPoint;
  onPlace: (quadrant: Quadrant) => void;
}) {
  const c = DEPT_COLORS[point.department];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${c.bg} ${c.text} border ${c.border} px-3 py-1.5 rounded-lg text-sm font-medium hover:shadow-sm transition-shadow flex items-center gap-1.5`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {point.title}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 bg-white border border-stone-300 rounded-lg shadow-lg p-1.5 min-w-[220px]">
          <div className="text-xs text-stone-500 mb-1 px-2 pt-1">Place in:</div>
          {QUADRANT_GRID.map((k) => (
            <button
              key={k}
              onClick={() => {
                onPlace(k);
                setOpen(false);
              }}
              className="w-full text-left text-sm px-2 py-1.5 hover:bg-stone-100 rounded"
            >
              {QUADRANT_META[k].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuadrantCell({
  qKey,
  painPoints,
  placements,
}: {
  qKey: Quadrant;
  painPoints: PainPoint[];
  placements: Placements;
}) {
  const meta = QUADRANT_META[qKey];
  const points = painPoints.filter((p) => placements[p.id] === qKey);

  return (
    <div className={`${meta.color} border-2 rounded-lg p-4 min-h-[200px]`}>
      <div className="font-semibold text-stone-900 mb-0.5">{meta.label}</div>
      <div className="text-xs text-stone-600 mb-3">{meta.sublabel}</div>
      <div className="space-y-1.5">
        {points.length === 0 && (
          <div className="text-xs text-stone-400 italic mt-2">
            No items placed yet
          </div>
        )}
        {points.map((p) => {
          const c = DEPT_COLORS[p.department];
          return (
            <div
              key={p.id}
              className="bg-white/80 rounded px-2.5 py-1.5 text-sm flex items-center gap-2"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              <span className="text-stone-800">{p.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
