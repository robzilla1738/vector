import { basename } from "node:path";
import { ObservationSchema } from "@aux/contracts";
import { observationEvidence } from "./observation-evidence.js";

export function minimizedObservationArtifactBytes(
  row: { path: string; pageId: string | null; mediaType: string },
  original: Buffer,
): Buffer | undefined {
  if (row.mediaType !== "application/json" || !/-observation-r\d+\.json$/.test(basename(row.path)))
    return undefined;
  if (original.length > 4 * 1024 * 1024) throw new Error("An observation artifact is too large to minimize.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(original.toString("utf8"));
  } catch {
    throw new Error("A saved observation artifact is not valid JSON.");
  }
  const observation = ObservationSchema.safeParse(parsed);
  if (!observation.success || observation.data.pageId !== row.pageId)
    throw new Error("A saved observation artifact does not match its page.");
  return Buffer.from(JSON.stringify(observationEvidence(observation.data)));
}
