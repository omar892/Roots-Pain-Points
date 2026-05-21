"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { MOCK_PAIN_POINTS } from "@/lib/data";
import { fetchPainPoints } from "@/lib/sheet";
import { Quadrant, type PainPoint, type Placements } from "@/lib/types";
import {
  clearPlacements,
  loadData,
  loadPlacements,
  savePlacements,
} from "@/lib/storage";
import { BoardView } from "@/components/views/board-view";
import { PrioritizeView } from "@/components/views/prioritize-view";
import { PatternsView } from "@/components/views/patterns-view";
import { SummaryView } from "@/components/views/summary-view";

type ViewId = "board" | "prioritize" | "patterns" | "summary";

const NAV_TABS: { id: ViewId; label: string }[] = [
  { id: "board", label: "1 · The Board" },
  { id: "prioritize", label: "2 · Prioritize" },
  { id: "patterns", label: "3 · AI Patterns" },
  { id: "summary", label: "4 · Takeaways" },
];

const georgia = { fontFamily: "Georgia, serif" };

export function PainPointStudio() {
  const [view, setView] = useState<ViewId>("board");
  const [filter, setFilter] = useState<string>("All");
  const [painPoints, setPainPoints] = useState<PainPoint[]>(MOCK_PAIN_POINTS);
  const [placements, setPlacements] = useState<Placements>({});
  const [hydrated, setHydrated] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "live" | "offline">(
    "loading"
  );

  // Pull the latest form responses; fall back to saved/sample data if unreachable.
  const loadFromSheet = useCallback(async () => {
    setLoadState("loading");
    try {
      setPainPoints(await fetchPainPoints());
      setLoadState("live");
    } catch {
      setPainPoints(loadData() ?? MOCK_PAIN_POINTS);
      setLoadState("offline");
    }
  }, []);

  // localStorage is client-only — read it after mount, never during SSR.
  useEffect(() => {
    setPlacements(loadPlacements());
    setHydrated(true);
    loadFromSheet();
  }, [loadFromSheet]);

  // Persist quadrant placements once the initial read has completed.
  useEffect(() => {
    if (!hydrated) return;
    savePlacements(placements);
  }, [placements, hydrated]);

  const placePoint = (id: number, quadrant: Quadrant) => {
    setPlacements((prev) => ({ ...prev, [id]: quadrant }));
  };

  const resetSession = () => {
    const confirmed = window.confirm(
      "Reset this session? All quadrant placements will be cleared. This cannot be undone."
    );
    if (!confirmed) return;
    setPlacements({});
    clearPlacements();
  };

  const departments = Array.from(
    new Set(painPoints.map((p) => p.department))
  ).sort();

  const filtered =
    filter === "All"
      ? painPoints
      : painPoints.filter((p) => p.department === filter);

  const startHere = painPoints.filter(
    (p) => placements[p.id] === Quadrant.StartHere
  );
  const patternsShown =
    startHere.length > 0 ? startHere : painPoints.slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-7">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-bold tracking-tight" style={georgia}>
              Roots Pain Point Studio
            </h1>
            <span className="text-sm text-stone-500">
              Working Session · Friday 11:30am CDT
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadFromSheet}
                disabled={loadState === "loading"}
                className="border-stone-300 bg-white/70 text-stone-700 hover:bg-white"
              >
                {loadState === "loading" ? "Refreshing…" : "Refresh data"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSession}
                className="border-stone-300 bg-white/70 text-stone-700 hover:bg-white"
              >
                Reset session
              </Button>
            </div>
          </div>
          <p className="text-stone-600 mt-2">
            Mapping where AI can ease the work — together, out loud.
          </p>
          {loadState === "offline" && (
            <p className="text-xs text-amber-800 mt-1">
              Couldn&apos;t reach the response sheet — showing saved or sample
              data. Try Refresh.
            </p>
          )}
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                view === t.id
                  ? "border-amber-600 text-amber-900"
                  : "border-transparent text-stone-600 hover:text-stone-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === "board" && (
          <BoardView
            painPoints={filtered}
            departments={departments}
            filter={filter}
            setFilter={setFilter}
          />
        )}
        {view === "prioritize" && (
          <PrioritizeView
            painPoints={painPoints}
            placements={placements}
            placePoint={placePoint}
          />
        )}
        {view === "patterns" && (
          <PatternsView
            highPriority={patternsShown}
            isDefault={startHere.length === 0}
          />
        )}
        {view === "summary" && (
          <SummaryView painPoints={painPoints} placements={placements} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-stone-500 text-center">
        Prototype · v0.1 · For Friday&apos;s working session
      </footer>
    </div>
  );
}
