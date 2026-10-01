import { readFileSync } from "node:fs";

export interface RuntimeIdentity { commit: string; tree: string; dirty: boolean; label: string }

/** Staging writes this beside the bundled dist directory, never from a Profile. */
export function readRuntimeIdentity(entry: string): RuntimeIdentity | null {
  let value: RuntimeIdentity;
  try {
    value = JSON.parse(readFileSync(new URL("../aux-runtime-identity.json", entry), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  if (!/^[a-f0-9]{40}$/.test(value.commit) || !/^[a-f0-9]{40}$/.test(value.tree) ||
      typeof value.dirty !== "boolean" || value.label !== value.commit + (value.dirty ? "+dirty" : ""))
    throw new Error("Invalid staged runtime identity");
  return value;
}
