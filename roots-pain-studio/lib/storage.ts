import {
  Department,
  Quadrant,
  type Frequency,
  type PainPoint,
  type Placements,
} from "@/lib/types";

export const STORAGE_KEYS = {
  placements: "roots-studio-placements-v1",
  data: "roots-studio-data-v1",
} as const;

const QUADRANT_VALUES = Object.values(Quadrant) as string[];
const DEPARTMENT_VALUES = Object.values(Department) as string[];
const FREQUENCY_VALUES: Frequency[] = ["Daily", "Weekly", "Monthly"];

/** localStorage is unavailable during SSR / Cloudflare's edge runtime. */
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/* -------------------------------- placements ------------------------------ */

export function loadPlacements(): Placements {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEYS.placements);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: Placements = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const id = Number(key);
      if (Number.isInteger(id) && QUADRANT_VALUES.includes(value as string)) {
        result[id] = value as Quadrant;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function savePlacements(placements: Placements): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.placements, JSON.stringify(placements));
  } catch {
    /* quota exceeded or storage disabled — placements stay in memory only */
  }
}

export function clearPlacements(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.placements);
  } catch {
    /* ignore */
  }
}

/* ----------------------------- pain point data ---------------------------- */

export type ValidationResult =
  | { ok: true; data: PainPoint[] }
  | { ok: false; error: string };

/** Validates that an unknown value matches the PainPoint[] schema. */
export function validatePainPoints(value: unknown): ValidationResult {
  if (!Array.isArray(value)) {
    return { ok: false, error: "Top-level value must be a JSON array." };
  }
  if (value.length === 0) {
    return { ok: false, error: "Array is empty — add at least one pain point." };
  }
  const seenIds = new Set<number>();
  for (let i = 0; i < value.length; i++) {
    const item = value[i] as Record<string, unknown>;
    const where = `Item ${i + 1}`;
    if (!item || typeof item !== "object") {
      return { ok: false, error: `${where}: must be an object.` };
    }
    if (typeof item.id !== "number" || !Number.isInteger(item.id)) {
      return { ok: false, error: `${where}: "id" must be an integer.` };
    }
    if (seenIds.has(item.id)) {
      return { ok: false, error: `${where}: duplicate id ${item.id}.` };
    }
    seenIds.add(item.id);
    for (const field of ["title", "person", "timeSpent", "description"]) {
      if (typeof item[field] !== "string" || (item[field] as string).trim() === "") {
        return { ok: false, error: `${where}: "${field}" must be a non-empty string.` };
      }
    }
    if (!DEPARTMENT_VALUES.includes(item.department as string)) {
      return {
        ok: false,
        error: `${where}: "department" must be one of ${DEPARTMENT_VALUES.join(", ")}.`,
      };
    }
    if (!FREQUENCY_VALUES.includes(item.frequency as Frequency)) {
      return {
        ok: false,
        error: `${where}: "frequency" must be one of ${FREQUENCY_VALUES.join(", ")}.`,
      };
    }
    if (
      !Array.isArray(item.tags) ||
      !item.tags.every((t) => typeof t === "string")
    ) {
      return { ok: false, error: `${where}: "tags" must be an array of strings.` };
    }
  }
  return { ok: true, data: value as PainPoint[] };
}

export function loadData(): PainPoint[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEYS.data);
    if (!raw) return null;
    const result = validatePainPoints(JSON.parse(raw));
    return result.ok ? result.data : null;
  } catch {
    return null;
  }
}

export function saveData(data: PainPoint[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.data, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearData(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.data);
  } catch {
    /* ignore */
  }
}
