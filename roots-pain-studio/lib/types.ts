export enum Department {
  Development = "Development",
  Programs = "Programs",
  CommunityEngagement = "Community Engagement",
  Operations = "Operations",
}

export enum Quadrant {
  StartHere = "high-freq-high-ai",
  FrequentTricky = "high-freq-low-ai",
  QuickWins = "low-freq-high-ai",
  ParkForLater = "low-freq-low-ai",
}

export type Frequency = "Daily" | "Weekly" | "Monthly";

export interface PainPoint {
  id: number;
  title: string;
  person: string;
  department: Department;
  frequency: Frequency;
  timeSpent: string;
  tags: string[];
  description: string;
}

/** Maps a pain point id to the quadrant it has been placed in. */
export type Placements = Record<number, Quadrant>;
