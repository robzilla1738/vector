import { PageTargetSchema, type PageTarget } from "@aux/contracts";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
/** Real authority service over each test's existing current page producer. No refs or grants are seeded. */
export function fixtureTurnMentions(page: (pageId: string) => PageTarget | undefined): TurnMentionService {
  return new TurnMentionService({
    page,
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [], bindings: {} }),
  });
}

/** Explicit synthetic attachment data for structural coordinator transports. It grants no authority. */
export function fixturePage(pageId: string, url: string, documentEpoch: number): PageTarget {
  return PageTargetSchema.parse({
    pageId,
    targetId: "synthetic-target:" + pageId,
    backend: "aux",
    windowId: "main",
    url,
    title: "Fixture",
    documentEpoch,
    sessionId: "synthetic-attachment:" + pageId,
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
}
