import { AuxError } from "@aux/contracts";

/** Keep an unavailable explicit context actionable without substituting scope. */
export function browserContextPage<T>(read: () => T): T {
  try { return read(); }
  catch (error) {
    if (error instanceof AuxError && error.code === "not_found")
      throw new AuxError("not_found", "The selected browser tab is no longer available. Choose another tab or remove its browser context before trying again.");
    throw error;
  }
}
