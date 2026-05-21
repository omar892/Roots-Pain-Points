import { Quadrant } from "@/lib/types";

export interface DeptColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

/** Tailwind class sets, written as full literals so the Tailwind scanner emits them. */
const DEPT_PALETTE: DeptColor[] = [
  { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-300", dot: "bg-amber-500" },
  { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-300", dot: "bg-emerald-500" },
  { bg: "bg-sky-50", text: "text-sky-900", border: "border-sky-300", dot: "bg-sky-500" },
  { bg: "bg-violet-50", text: "text-violet-900", border: "border-violet-300", dot: "bg-violet-500" },
  { bg: "bg-rose-50", text: "text-rose-900", border: "border-rose-300", dot: "bg-rose-500" },
  { bg: "bg-teal-50", text: "text-teal-900", border: "border-teal-300", dot: "bg-teal-500" },
  { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-300", dot: "bg-orange-500" },
  { bg: "bg-indigo-50", text: "text-indigo-900", border: "border-indigo-300", dot: "bg-indigo-500" },
];

/** Stable color for a department name — the same name always maps to the same palette entry. */
export function deptColor(department: string): DeptColor {
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = (hash * 31 + department.charCodeAt(i)) | 0;
  }
  return DEPT_PALETTE[Math.abs(hash) % DEPT_PALETTE.length];
}

export interface QuadrantMeta {
  label: string;
  sublabel: string;
  color: string;
}

export const QUADRANT_META: Record<Quadrant, QuadrantMeta> = {
  [Quadrant.StartHere]: {
    label: "🎯 Start Here",
    sublabel: "High frequency · Strong AI fit",
    color: "bg-emerald-50 border-emerald-400",
  },
  [Quadrant.FrequentTricky]: {
    label: "Frequent but Tricky",
    sublabel: "High frequency · Lower AI fit",
    color: "bg-amber-50 border-amber-400",
  },
  [Quadrant.QuickWins]: {
    label: "Quick Wins",
    sublabel: "Lower frequency · Strong AI fit",
    color: "bg-sky-50 border-sky-400",
  },
  [Quadrant.ParkForLater]: {
    label: "Park for Later",
    sublabel: "Lower frequency · Lower AI fit",
    color: "bg-stone-100 border-stone-400",
  },
};

/** Visual order of the 2x2 grid: top row, then bottom row. */
export const QUADRANT_GRID: Quadrant[] = [
  Quadrant.FrequentTricky,
  Quadrant.StartHere,
  Quadrant.ParkForLater,
  Quadrant.QuickWins,
];
