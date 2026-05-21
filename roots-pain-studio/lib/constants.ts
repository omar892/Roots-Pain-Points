import { Department, Quadrant } from "@/lib/types";

export interface DeptColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const DEPT_COLORS: Record<Department, DeptColor> = {
  [Department.Development]: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  [Department.Programs]: {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
  },
  [Department.CommunityEngagement]: {
    bg: "bg-sky-50",
    text: "text-sky-900",
    border: "border-sky-300",
    dot: "bg-sky-500",
  },
  [Department.Operations]: {
    bg: "bg-violet-50",
    text: "text-violet-900",
    border: "border-violet-300",
    dot: "bg-violet-500",
  },
};

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

export const DEPARTMENTS: Department[] = [
  Department.Development,
  Department.Programs,
  Department.CommunityEngagement,
  Department.Operations,
];
