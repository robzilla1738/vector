import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import { SafetyAuthorityRevocation } from "../../apps/runtime/src/safety/authority-revocation.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { PageTargetSchema, type PageTarget } from "@aux/contracts";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
/** Real authority service over each test's existing current page producer. No refs or grants are seeded. */
export function fixtureTurnMentions(page: (pageId: string) => PageTarget | undefined): TurnMentionService {
 return new TurnMentionService({ page, organization: async () => ({ revision: 0, shared: null }), routine: () => undefined, connectors: () => ({ entries: [], access: [] }) });
}

/** Explicit synthetic attachment data for structural coordinator transports. It grants no authority. */
export function fixturePage(pageId: string, url: string, documentEpoch: number): PageTarget {
 return PageTargetSchema.parse({ pageId, targetId: "synthetic-target:" + pageId, backend: "aux", windowId: "main", url,
  title: "Fixture", documentEpoch, sessionId: "synthetic-attachment:" + pageId, lastRevision: 0,
  viewStatus: "visible", lifecycle: "live", controller: "none", controllerEpoch: 0,
  ownedByRuntime: false, createdAt: 1, lastActiveAt: 1 });
}

/** Real empty transport authority for fixtures that have no installed native browser leases. */
export function fixtureSafetyAuthority(repo: import("../../apps/runtime/src/store/repo.js").Repo) {
 const egress = new BrowserEgress({ profileId: "default", native: new NullNativeBridge(),
  run: () => null, page: pageId => repo.getPage(pageId)!, ownsPage: () => false, audit: () => {}, approve: async () => false });
 return new SafetyAuthorityRevocation({ profileId: "default", runScope: runId => {
  const run = repo.getRun(runId); return run ? run.config?.taskId ? { kind: "task", id: run.config.taskId }
   : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" } : undefined;
 }, invalidate: matches => egress.invalidateAuthority(matches) });
}
