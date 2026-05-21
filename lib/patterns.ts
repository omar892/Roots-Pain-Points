import type { PainPoint, Pattern } from "@/lib/types";

export function getPattern(point: PainPoint): Pattern {
  if (
    point.tags.includes("Finding info") &&
    point.tags.includes("Synthesis")
  ) {
    return {
      name: "Connectors + Cross-Source Synthesis",
      description:
        "Connect Claude to your data sources (Drive, Gmail, exports from CRM and finance). Ask synthesis questions that cut across them.",
      features: ["Drive connector", "Gmail connector", "Web search", "Artifacts"],
      firstStep:
        'Enable the Drive and Gmail connectors. Ask one cross-system question this week: "Pull X from Drive, summarize against Y from Gmail."',
    };
  }
  if (
    point.tags.includes("Repetitive") &&
    point.tags.includes("Writing-heavy")
  ) {
    return {
      name: "Template Project + Batch Generation",
      description:
        "A Project with strong instructions and templates. Generate multiple personalized variants in one pass.",
      features: ["Projects", "Custom instructions", "Batch artifacts"],
      firstStep:
        "Create a Project. Define what stays constant vs. what varies per recipient. Try generating 5 variants at once.",
    };
  }
  if (
    point.tags.includes("Writing-heavy") &&
    (point.frequency === "Weekly" || point.frequency === "Daily")
  ) {
    return {
      name: "Project + Critique-Revise Loop",
      description:
        "A dedicated Project with voice guide and past examples. Use draft → critique → revise to polish.",
      features: ["Projects", "Custom instructions", "Artifact iteration"],
      firstStep:
        "Create a Project. Load 2–3 past examples that worked. Write instructions defining voice, audience, and what to avoid.",
    };
  }
  if (point.tags.includes("Synthesis")) {
    return {
      name: "Inputs → Project → Structured Output",
      description:
        "Capture raw inputs (notes, transcripts, photos, attendance), drop them into a Project, ask for a structured artifact back.",
      features: ["Projects", "File uploads", "Structured artifacts"],
      firstStep:
        "Set up a Project. Define the output structure (sections, headers). Try it on this week's actual inputs.",
    };
  }
  return {
    name: "Project + Iterative Drafting",
    description:
      "A Project with the context Claude needs. Use artifacts to iterate in place.",
    features: ["Projects", "Artifacts", "Custom instructions"],
    firstStep:
      "Create a Project. Add reference files. Run your first real task and iterate.",
  };
}
