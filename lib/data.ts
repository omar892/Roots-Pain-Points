import { type PainPoint } from "@/lib/types";

export const MOCK_PAIN_POINTS: PainPoint[] = [
  {
    id: 1,
    title: "Drafting grant applications",
    person: "Zuha",
    department: "Development",
    frequency: "Weekly",
    timeSpent: "4–8 hrs",
    tags: ["Writing-heavy", "Hard to start"],
    description:
      "Each application takes a full day. Hard to start, harder to maintain consistent voice across them.",
  },
  {
    id: 2,
    title: "Personalized donor thank-yous",
    person: "Khadija",
    department: "Development",
    frequency: "Weekly",
    timeSpent: "2–3 hrs",
    tags: ["Repetitive", "Writing-heavy"],
    description:
      "Want each donor to feel seen but writing 30+ personalized notes weekly takes hours.",
  },
  {
    id: 3,
    title: "Pulling cross-system data for board reports",
    person: "Data Lead",
    department: "Operations",
    frequency: "Monthly",
    timeSpent: "6+ hrs",
    tags: ["Finding info", "Synthesis"],
    description:
      "Donor CRM, attendance sheets, finance — manually consolidating every month for the board.",
  },
  {
    id: 4,
    title: "Social media captions",
    person: "Sereen",
    department: "Community Engagement",
    frequency: "Daily",
    timeSpent: "30–60 min",
    tags: ["Writing-heavy", "Repetitive"],
    description:
      "Fresh captions while maintaining brand voice gets stale by week three.",
  },
  {
    id: 5,
    title: "Program recap reports",
    person: "Anisha",
    department: "Programs",
    frequency: "Weekly",
    timeSpent: "2 hrs",
    tags: ["Synthesis", "Repetitive"],
    description:
      "Synthesize what happened, attendance, photos, lessons learned — every single week.",
  },
  {
    id: 6,
    title: "Newsletter drafting",
    person: "Khadija",
    department: "Community Engagement",
    frequency: "Monthly",
    timeSpent: "3–4 hrs",
    tags: ["Writing-heavy", "Synthesis"],
    description:
      "Gathering updates from each team, writing intros, formatting — takes most of a day.",
  },
  {
    id: 7,
    title: "Volunteer onboarding emails",
    person: "Anisha",
    department: "Programs",
    frequency: "Weekly",
    timeSpent: "45 min",
    tags: ["Repetitive", "Writing-heavy"],
    description:
      "Same info to each new volunteer, but want it to feel personal — not a form letter.",
  },
  {
    id: 8,
    title: "Researching potential funders",
    person: "Zuha",
    department: "Development",
    frequency: "Monthly",
    timeSpent: "4+ hrs",
    tags: ["Finding info", "Synthesis"],
    description:
      "Sifting foundation databases, matching to programs, tracking deadlines.",
  },
];
