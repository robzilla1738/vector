import { createElement, Suspense, useState, type ReactNode } from "react";

/** Retain visited forms, while unopened sections do no work. */
export function VisitedSection({ active, children }: { active: boolean; children: ReactNode }) {
  const [visited, setVisited] = useState(false);
  if (active && !visited) setVisited(true);
  if (!active && !visited) return null;
  return createElement(
    Suspense,
    { fallback: active ? createElement("section", { role: "status" }, "Loading settings…") : null },
    children,
  );
}
