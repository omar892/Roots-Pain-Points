import type { PainPoint, Pattern } from "@/lib/types";

export function getPattern(point: PainPoint): Pattern {
  if (
    point.tags.includes("Stakeholder-heavy") &&
    point.tags.includes("Writing-heavy")
  ) {
    return {
      name: "Stakeholder Project + Tailored Messaging",
      description:
        "A Project that holds each audience's context — what they care about and what they've already heard — so updates are tailored per group instead of sent as one broad message.",
      features: ["Projects", "Custom instructions", "Audience profiles"],
      firstStep: {
        question:
          "For the donors and board members you're writing to, what does each group already know, and what would genuinely be news to them? Let Claude help you think about where a single message is trying to do too many jobs at once.",
        starter_prompt:
          "I need to share an update about [topic] with [audience — e.g. major donors / the board]. Here's the raw information I'm working from: [paste your notes]. Before drafting anything, ask me clarifying questions about what this audience already knows and what they care about most.",
        watch_for:
          "Notice any sentence that could be sent to literally anyone — if it isn't specific to that group, it won't land as real engagement.",
      },
    };
  }

  if (
    point.tags.includes("Finding info") &&
    point.tags.includes("Synthesis")
  ) {
    return {
      name: "Connectors + Cross-Source Synthesis",
      description:
        "Connect Claude to your data sources (Drive, Gmail, exports from CRM and finance). Ask synthesis questions that cut across them.",
      features: ["Drive connector", "Gmail connector", "Web search", "Artifacts"],
      firstStep: {
        question:
          "Which sources do you currently open side by side to answer one question, and what makes stitching them together feel slow? Talk this through with Claude before you connect anything.",
        starter_prompt:
          "I regularly pull information from several places to answer one question — [list your sources, e.g. donor CRM, attendance sheets, finance exports]. Help me think through how to bring these together, and ask me clarifying questions about how each source is structured before suggesting anything.",
        watch_for:
          "Watch for moments where Claude guesses instead of asking — that usually means a source still isn't connected or described clearly enough.",
      },
    };
  }

  if (
    point.tags.includes("Data gathering") &&
    point.tags.includes("Synthesis")
  ) {
    return {
      name: "Decision-Support Project + Options Analysis",
      description:
        "A Project where you gather what's known, then think through options out loud — what the evidence supports, what it doesn't, and what you'd still need to decide with confidence.",
      features: ["Projects", "Web search", "Artifacts"],
      firstStep: {
        question:
          "What decision are you actually trying to make here, and what would have to be true for you to feel confident going either way? Talk this through with Claude before gathering any more data.",
        starter_prompt:
          "I'm trying to decide [the decision]. Here's what I know so far: [paste your data, survey responses, or notes]. Ask me clarifying questions about the decision and what I might be missing before you lay out any options.",
        watch_for:
          "Notice when the analysis concludes 'we need more data' — name exactly which data, or the next round stalls in the same spot.",
      },
    };
  }

  if (
    point.tags.includes("Scheduling") &&
    point.tags.includes("Repetitive")
  ) {
    return {
      name: "Recurring-Message Project + Templates",
      description:
        "A Project that holds the template and cadence for messages that go out on a schedule, so each round is fast — you change only what's actually new.",
      features: ["Projects", "Custom instructions", "Templates"],
      firstStep: {
        question:
          "From one send to the next, what genuinely changes versus what's the same wrapper every time? Let Claude help you think about how little you'd actually need to write each round.",
        starter_prompt:
          "I send [type of message] every [cadence — e.g. week]. Here's a recent one: [paste a past message]. Help me turn this into a reusable template, and ask me clarifying questions about what changes each time before you draft it.",
        watch_for:
          "Watch for the round where you skip the template 'just this once' — that's usually a real case the template doesn't cover yet.",
      },
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
      firstStep: {
        question:
          "What part of these messages is genuinely identical every time, and what has to change for each person? Let Claude help you think about where the real line between the two sits.",
        starter_prompt:
          "I write [type of message] over and over. Here's one that worked well: [paste a strong past example]. Help me figure out what should stay constant and what varies per recipient — ask me clarifying questions before drafting a template.",
        watch_for:
          "Watch for variants that read as generic — if a recipient couldn't tell it was written for them, the 'what varies' list is still too thin.",
      },
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
      firstStep: {
        question:
          "When something sounds like you versus when it sounds off, what specifically tips you off? Talk that through with Claude so it can start to hear the difference.",
        starter_prompt:
          "Here's a draft I'm working on: [paste your draft]. Before revising it, ask me clarifying questions about the audience, the tone I'm going for, and the things I would never say.",
        watch_for:
          "Notice the first revision that makes you wince — naming exactly why it's wrong is how the voice guide gets sharper.",
      },
    };
  }

  if (point.tags.includes("Synthesis")) {
    return {
      name: "Inputs → Project → Structured Output",
      description:
        "Capture raw inputs (notes, transcripts, photos, attendance), drop them into a Project, ask for a structured artifact back.",
      features: ["Projects", "File uploads", "Structured artifacts"],
      firstStep: {
        question:
          "If someone read only the finished version, what are the few things they'd absolutely need to take away? Let Claude help you think about the structure before you hand it any inputs.",
        starter_prompt:
          "I need to turn raw inputs into a [type of report]. Here's what I'm starting with: [paste your notes, attendance, or a description of the photos]. Ask me clarifying questions about who reads this and what it's for before proposing a structure.",
        watch_for:
          "Watch for sections that always come out thin — that usually means the input for them isn't being captured during the week.",
      },
    };
  }

  return {
    name: "Project + Iterative Drafting",
    description:
      "A Project with the context Claude needs. Use artifacts to iterate in place.",
    features: ["Projects", "Artifacts", "Custom instructions"],
    firstStep: {
      question:
        "What context do you carry in your head that a brand-new teammate would need before they could take this on? Talk that through with Claude — that's exactly what the Project needs to hold.",
      starter_prompt:
        "I'd like help with [describe the task]. Here's the background that matters: [paste the relevant context]. Ask me clarifying questions before suggesting anything so we get the framing right.",
      watch_for:
        "Notice every time you have to re-explain something — each one is a gap in the Project's context worth filling in.",
    },
  };
}
