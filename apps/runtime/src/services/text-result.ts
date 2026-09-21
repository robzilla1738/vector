import { basename } from "node:path";
import type { Artifact } from "@vector/contracts";
import { isObservationArtifactContent } from "./conversation-sources.js";

export const TEXT_RESULT_TYPES = ["text/plain", "text/markdown", "text/csv", "application/json"] as const;
export const TEXT_RESULT_LIMIT = 256 * 1024;
export function isTextResult(artifact: Artifact): boolean {
  return !!artifact.runId && artifact.status === "complete" && artifact.size <= TEXT_RESULT_LIMIT
    && (TEXT_RESULT_TYPES as readonly string[]).includes(artifact.mediaType)
    && !basename(artifact.path).includes("-observation-r");
}
export function isTextResultContent(mediaType: string, content: string): boolean {
  return !content.includes("\0") && !(mediaType === "application/json" && isObservationArtifactContent(content));
}
export function resultFilename(artifactId: string, path: string): string {
  const filename = basename(path), prefix = `${artifactId}-`;
  return (filename.startsWith(prefix) ? filename.slice(prefix.length) : filename).slice(0,255) || "result";
}
