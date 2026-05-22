export enum Quadrant {
  StartHere = "high-freq-high-ai",
  FrequentTricky = "high-freq-low-ai",
  QuickWins = "low-freq-high-ai",
  ParkForLater = "low-freq-low-ai",
}

export type Frequency = "Daily" | "Weekly" | "Monthly" | "Occasionally";

/** The concrete first move for a pattern: an open-ended question to explore,
 *  a copyable starter prompt, and what to notice while doing the work. */
export interface FirstStep {
  /** Open-ended invitation to explore the task — the default render. */
  question: string;
  /** A first-person prompt the person can copy and paste to Claude. */
  starter_prompt: string;
  /** What to notice while working — surfaces the gap to close next. */
  watch_for: string;
}

/** An AI-adoption pattern — either rule-derived or written by Claude during curation. */
export interface Pattern {
  name: string;
  description: string;
  features: string[];
  firstStep: FirstStep;
}

export interface PainPoint {
  id: number;
  title: string;
  person: string;
  /** Free-text team / role label — sourced from the form, not a fixed set. */
  department: string;
  frequency: Frequency;
  timeSpent?: string;
  tags: string[];
  description?: string;
  /** Set by Claude curation; absent on raw/uncurated data. */
  pattern?: Pattern;
}

/** Maps a pain point id to the quadrant it has been placed in. */
export type Placements = Record<number, Quadrant>;

/** Pain point ids the group has committed to trying before next session. */
export type Commitments = Record<number, boolean>;
