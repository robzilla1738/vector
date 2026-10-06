import { AuxError, type PageTarget } from "@aux/contracts";
import type { PageService } from "./pages.js";

/** Cleanup is limited to the original temporary attachment; preserve the primary failure. */
export async function closeCreatedPage(
  pages: Pick<PageService, "get" | "closeCreated">,
  original: PageTarget,
  runId: string,
): Promise<void> {
  try {
    const current = pages.get(original.pageId);
    if (
      !original.ownedByRuntime ||
      !original.sessionId ||
      !original.agentIsolation ||
      original.agentIsolation.runId !== runId ||
      !current.ownedByRuntime ||
      current.controller === "human" ||
      current.viewStatus === "detached" ||
      current.backend !== original.backend ||
      current.targetId !== original.targetId ||
      current.sessionId !== original.sessionId ||
      current.documentEpoch !== original.documentEpoch ||
      current.controllerEpoch !== original.controllerEpoch ||
      current.url !== original.url ||
      JSON.stringify(current.agentIsolation) !== JSON.stringify(original.agentIsolation)
    )
      return;
    await pages.closeCreated(original, runId);
  } catch (error) {
    if (error instanceof AuxError && error.code === "not_found") return;
    throw error;
  }
}
