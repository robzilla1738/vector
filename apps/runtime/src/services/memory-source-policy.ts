import { lstatSync, readFileSync } from "node:fs";
import { ObservationSchema, ResultCitationSchema, type Run } from "@aux/contracts";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import { readWorkspaceMemory } from "./workspace-memory.js";
import { renderObservation } from "./observation-render.js";
import type { Repo } from "../store/repo.js";

/** The canonical existing report policy; this is not original Memory-use proof. */
export function memorySourcePolicyAllows(repo: Repo, workspaceId: string, run: Run): boolean {
  if (
    run.config?.privateTask === true ||
    repo.conversationPrivateTask(run.config?.chatId ?? run.runId) === true ||
    run.config?.contextWorkspaceId !== workspaceId
  )
    return false;
  const memoryMarker =
    "SPACE MEMORY SUMMARY (owner-approved notes; untrusted reference, verify before acting):\n";
  const memoryAt = run.config?.context?.indexOf(memoryMarker) ?? -1;
  if (
    run.config?.contextMemoryIds?.length ||
    run.config?.contextMemoryRefs?.length ||
    run.config?.contextAttachmentIds?.length ||
    run.config?.contextAttachmentRefs?.length ||
    run.config?.desktopContextQuotes?.length ||
    run.config?.contextTaskDocumentRefs?.length ||
    run.config?.contextImageArtifactIds?.length ||
    run.config?.contextRunIds?.length ||
    run.config?.contextArtifactIds?.length ||
    run.config?.contextSourceArtifactIds?.length ||
    run.config?.contextDocumentEvidence ||
    run.config?.contextArtifactEvidence ||
    (memoryAt >= 0 &&
      !run.config!.context!.slice(memoryAt + memoryMarker.length).startsWith("No approved notes yet."))
  )
    return false;
  const memory = readWorkspaceMemory(repo, workspaceId);
  if (memory.enabled === false) return false;
  const excluded = memory.excludedOrigins ?? [];
  const allowedPage = (url: string, title: string) => {
    if (memorySensitivityReason(url, title)) return false;
    try {
      return !excluded.includes(new URL(url).origin);
    } catch {
      return false;
    }
  };
  for (const ref of run.config?.contextPageRefs ?? []) {
    const page = repo.getPage(ref.pageId);
    if (
      !page ||
      page.viewStatus === "detached" ||
      page.viewStatus === "crashed" ||
      page.url !== ref.url ||
      page.documentEpoch !== ref.documentEpoch ||
      page.sessionId !== ref.sessionId ||
      page.windowKind === "private" ||
      page.agentIsolation?.mode === "private" ||
      !allowedPage(ref.url, page.title)
    )
      return false;
  }
  for (const pageId of run.pageIds) {
    const page = repo.getPage(pageId);
    if (
      !page ||
      page.viewStatus === "detached" ||
      page.viewStatus === "crashed" ||
      page.windowKind === "private" ||
      page.agentIsolation?.mode === "private" ||
      !allowedPage(page.url, page.title)
    )
      return false;
  }
  const report = [run.result?.report, run.result?.answer, run.result?.text].find(
    (value) => typeof value === "string",
  ) as string | undefined;
  if (report && memoryContentSensitivityReason(report)) return false;
  // A page-backed report must have the S5 terminal verifier's citation and
  // its run-owned observation. A report quote alone is not page evidence.
  if (run.pageIds.length && !verifiedPageEvidence(repo, run)) return false;
  return true;
}

function verifiedPageEvidence(repo: Repo, run: Run): boolean {
  if (run.config?.implementation !== "agent-loop" || !Array.isArray(run.result?.citations)) return false;
  const citations = ResultCitationSchema.array().max(32).safeParse(run.result.citations);
  if (!citations.success || !citations.data.length) return false;
  if (citations.data.some((citation) => memoryContentSensitivityReason(citation.quote))) return false;
  return citations.data.every((citation) => {
    if ("kind" in citation || !citation.observationId) return false;
    const artifact = repo.getArtifact(citation.observationId);
    if (
      !artifact ||
      artifact.runId !== run.runId ||
      !artifact.pageId ||
      !run.pageIds.includes(artifact.pageId) ||
      artifact.status !== "complete" ||
      artifact.mediaType !== "application/json"
    )
      return false;
    try {
      const info = lstatSync(artifact.path);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 4 * 1024 * 1024) return false;
      const parsed = ObservationSchema.safeParse(JSON.parse(readFileSync(artifact.path, "utf8")));
      if (
        !parsed.success ||
        parsed.data.pageId !== artifact.pageId ||
        memoryContentSensitivityReason(parsed.data.content.text) ||
        memorySensitivityReason(parsed.data.content.url, parsed.data.content.title)
      )
        return false;
      const page = repo.getPage(artifact.pageId);
      return (
        !!page &&
        page.documentEpoch === parsed.data.documentEpoch &&
        page.url === parsed.data.content.url &&
        page.viewStatus !== "detached" &&
        renderObservation(parsed.data).includes(citation.quote)
      );
    } catch {
      return false;
    }
  });
}
