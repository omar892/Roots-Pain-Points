import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { deptColor, QUADRANT_GRID, QUADRANT_META } from "@/lib/constants";
import { Quadrant, type PainPoint, type Placements } from "@/lib/types";

interface PrioritizeViewProps {
  painPoints: PainPoint[];
  placements: Placements;
  placePoint: (id: number, quadrant: Quadrant) => void;
  removePlacement: (id: number) => void;
}

const TRAY_ID = "tray";

export function PrioritizeView({
  painPoints,
  placements,
  placePoint,
  removePlacement,
}: PrioritizeViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const unplaced = painPoints.filter((p) => !placements[p.id]);
  const placed = painPoints.length - unplaced.length;
  const total = painPoints.length;
  const pct = total > 0 ? Math.round((placed / total) * 100) : 0;
  const allPlaced = total > 0 && placed === total;
  const activePoint = painPoints.find((p) => p.id === activeId) ?? null;

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(Number(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = Number(active.id);
    if (over.id === TRAY_ID) {
      removePlacement(id);
    } else {
      placePoint(id, over.id as Quadrant);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1">
          Where should AI help first?
        </h2>
        <p className="text-stone-600 text-sm">
          Talk through each pain point, then drag it into the quadrant that
          fits. Items move freely — drag between quadrants or back to the tray
          as the group debates.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1.5">
          <span>
            {placed} of {total} placed
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

      {/* Tray — also a drop target for unplacing */}
      {allPlaced ? (
        <div className="mb-6 bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 text-center">
          <div className="text-emerald-900 font-semibold">
            ✓ All {total} pain points mapped
          </div>
          <div className="text-emerald-800 text-sm mt-0.5">
            Head to <strong>AI Patterns</strong> to see the play for each one.
          </div>
        </div>
      ) : (
        <TrayZone count={unplaced.length} dragging={activeId !== null}>
          {unplaced.map((p) => (
            <DraggableCard key={p.id} point={p} />
          ))}
        </TrayZone>
      )}

      {/* Matrix */}
      <div>
        <div className="text-xs text-stone-500 text-center mb-2 font-medium">
          ↑ High Frequency / Impact
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUADRANT_GRID.map((qKey) => (
            <QuadrantCell
              key={qKey}
              qKey={qKey}
              points={painPoints.filter((p) => placements[p.id] === qKey)}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-stone-500 mt-2 font-medium">
          <span>← Lower AI fit</span>
          <span>Stronger AI fit →</span>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activePoint && (
          <div className="rotate-2 cursor-grabbing">
            <CardBody point={activePoint} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

/* -------------------------------------------------------------------------- */

function TrayZone({
  count,
  dragging,
  children,
}: {
  count: number;
  dragging: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: TRAY_ID });

  return (
    <div
      ref={setNodeRef}
      className={`mb-6 rounded-lg p-4 border transition-colors ${
        isOver
          ? "border-stone-400 bg-stone-100"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
        To place ({count})
        {dragging && (
          <span className="ml-2 normal-case font-normal text-stone-400">
            — drop here to send a card back
          </span>
        )}
      </div>
      {count === 0 ? (
        <div className="text-xs text-stone-400 italic">
          Everything is placed. Drag a card here to revisit it.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">{children}</div>
      )}
    </div>
  );
}

function QuadrantCell({ qKey, points }: { qKey: Quadrant; points: PainPoint[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: qKey });
  const meta = QUADRANT_META[qKey];

  return (
    <div
      ref={setNodeRef}
      className={`${meta.color} border-2 rounded-lg p-4 min-h-[210px] transition-all ${
        isOver ? "ring-2 ring-stone-400 ring-offset-1" : ""
      }`}
    >
      <div className="flex items-baseline justify-between mb-0.5">
        <div className="font-semibold text-stone-900">{meta.label}</div>
        {points.length > 0 && (
          <span className="text-xs font-medium text-stone-500">
            {points.length}
          </span>
        )}
      </div>
      <div className="text-xs text-stone-600 mb-3">{meta.sublabel}</div>
      <div className="space-y-2">
        {points.length === 0 ? (
          <div
            className={`text-xs italic rounded border border-dashed py-6 text-center transition-colors ${
              isOver
                ? "border-stone-400 text-stone-500"
                : "border-stone-300 text-stone-400"
            }`}
          >
            Drag items here
          </div>
        ) : (
          points.map((p) => <DraggableCard key={p.id} point={p} />)
        )}
      </div>
    </div>
  );
}

function DraggableCard({ point }: { point: PainPoint }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: point.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`touch-none cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-lg ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <CardBody point={point} />
    </div>
  );
}

/** Presentational card — used both in place and inside the drag overlay. */
function CardBody({ point }: { point: PainPoint }) {
  const c = deptColor(point.department);
  return (
    <div
      className={`${c.bg} border ${c.border} rounded-lg px-3 py-2 hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        <span className={`text-[11px] font-medium ${c.text}`}>
          {point.department}
        </span>
        <span className="ml-auto text-[11px] text-stone-500">
          {point.frequency}
        </span>
      </div>
      <div className="text-sm font-medium text-stone-900 leading-snug">
        {point.title}
      </div>
      <div className="text-[11px] text-stone-500 mt-0.5">
        {point.person}
        {point.timeSpent ? ` · ${point.timeSpent}` : ""}
      </div>
    </div>
  );
}
