"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { MOCK_PAIN_POINTS } from "@/lib/data";
import { clearData, loadData, saveData, validatePainPoints } from "@/lib/storage";

const georgia = { fontFamily: "Georgia, serif" };

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export default function AdminPage() {
  const [json, setJson] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Pre-fill with whatever data the studio is currently using.
  useEffect(() => {
    const current = loadData() ?? MOCK_PAIN_POINTS;
    setJson(JSON.stringify(current, null, 2));
  }, []);

  const handleSave = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setStatus({ kind: "error", message: "Invalid JSON — check for syntax errors." });
      return;
    }
    const result = validatePainPoints(parsed);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    saveData(result.data);
    setStatus({
      kind: "success",
      message: `Saved ${result.data.length} pain point${
        result.data.length === 1 ? "" : "s"
      }. The studio will use this data on its next load.`,
    });
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Clear custom data? The studio will fall back to the built-in mock data set."
    );
    if (!confirmed) return;
    clearData();
    setJson(JSON.stringify(MOCK_PAIN_POINTS, null, 2));
    setStatus({
      kind: "success",
      message: "Custom data cleared. The studio will use the built-in mock data.",
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-7">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-bold tracking-tight" style={georgia}>
              Studio Admin
            </h1>
            <Link
              href="/"
              className="text-sm text-amber-800 underline underline-offset-2 hover:text-amber-900 ml-auto"
            >
              ← Back to the studio
            </Link>
          </div>
          <p className="text-stone-600 mt-2">
            Paste a <code className="text-stone-800">PainPoint[]</code> JSON
            array to replace the studio&apos;s data set. Stored locally in this
            browser only — no server involved.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <label
          htmlFor="data-json"
          className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2"
        >
          Pain point data (JSON)
        </label>
        <textarea
          id="data-json"
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setStatus({ kind: "idle" });
          }}
          spellCheck={false}
          rows={20}
          className="w-full rounded-lg border border-stone-300 bg-white p-4 font-mono text-xs text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />

        {status.kind === "error" && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <strong>Validation failed:</strong> {status.message}
          </div>
        )}
        {status.kind === "success" && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {status.message}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            className="bg-amber-700 text-white hover:bg-amber-800"
          >
            Validate &amp; save
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
          >
            Reset to mock data
          </Button>
        </div>

        <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-700">
          <h2 className="font-semibold text-stone-900 mb-2" style={georgia}>
            Schema
          </h2>
          <p className="mb-2">Each item in the array must have:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <code>id</code> — unique integer
            </li>
            <li>
              <code>title</code>, <code>person</code>, <code>timeSpent</code>,{" "}
              <code>description</code> — non-empty strings
            </li>
            <li>
              <code>department</code> — Development, Programs, Community
              Engagement, or Operations
            </li>
            <li>
              <code>frequency</code> — Daily, Weekly, or Monthly
            </li>
            <li>
              <code>tags</code> — array of strings
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
