import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { MethodSchemas } from "@aux/contracts";

const renderer = join(process.cwd(), "apps/shell/src");
const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = join(dir, entry.name);
  if (entry.isDirectory()) return entry.name === "mock" ? [] : sources(path);
  return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
});

/** Runtime methods named anywhere in renderer source — covers `call`, `bridge.invoke` and method names chosen at runtime. */
function rendererMethods() {
  const known = new Set(Object.keys(MethodSchemas));
  const found = new Set<string>();
  for (const file of sources(renderer)) {
    for (const [, name] of readFileSync(file, "utf8").matchAll(/["'`]([a-z][\w]*(?:\.[\w]+)+)["'`]/g)) if (known.has(name!)) found.add(name!);
  }
  return found;
}

function mockMethods() {
  const text = readFileSync(join(renderer, "mock/bridge.ts"), "utf8");
  const table = text.slice(text.indexOf("const handlers = {"), text.indexOf("} satisfies Partial<Record<MethodName"));
  const fixtures = readFileSync(join(renderer, "mock/work.ts"), "utf8");
  const connectors = readFileSync(join(renderer, "mock/connectors.ts"), "utf8");
  return new Set([
    ...[...table.matchAll(/^ {4}"([\w.]+)":/gm)].map(match => match[1]!),
    ...[...fixtures.matchAll(/^ {4}'([\w.]+)':/gm)].map(match => match[1]!),
    ...[...connectors.matchAll(/^ {4}"([\w.]+)":/gm)].map(match => match[1]!),
  ]);
}

it("lists the runtime methods the renderer uses that the mock bridge does not implement", () => {
  const mocked = mockMethods();
  const missing = [...rendererMethods()].filter(method => !mocked.has(method)).sort();
  // Shrink this list as the mock grows; a new renderer call must be mocked or added here.
  expect(missing).toEqual(UNMOCKED);
});

const UNMOCKED = [
  "artifacts.list", "bookmarks.folders.remove", "bookmarks.folders.rename", "bookmarks.markRead",
  "bookmarks.offline.get", "bookmarks.offline.set", "bookmarks.readingList", "chrome.attach",
  "chrome.detach", "chrome.tabs",
  "commands.escalations.decide", "commands.escalations.list", "commands.escalations.revoke",
  "downloads.projectNative",
  "goals.cancel", "goals.create", "goals.list", "goals.pause", "goals.resume", "goals.start",
  "hooks.approve", "hooks.invocations", "hooks.list", "hooks.register", "hooks.revoke", "hooks.test",
  "import.cancel", "import.preview", "import.run", "import.status",
  "installation.backupRetention", "installation.deleteBackup", "installation.exportRecovery", "installation.inspectRecovery",
  "installation.listBackups", "installation.restoreStatus", "installation.setBackupRetention", "installation.stageRecovery",
  "installation.stageRestore",
  "mcp.oauth.clear", "mcp.oauth.start", "mcp.oauth.status", "mcp.tools.call",
  "memory.paste.commit", "memory.paste.preview", "memory.paste.status",
  "memory.pipeline.claims", "memory.pipeline.extractRun", "memory.pipeline.forget", "memory.pipeline.history",
  "memory.pipeline.inbox", "memory.pipeline.overview", "memory.pipeline.policy", "memory.pipeline.revert",
  "memory.pipeline.review", "memory.pipeline.setPolicy", "memory.pipeline.sources",
  "onboarding.get", "onboarding.start", "onboarding.update",
  "pages.list", "pages.openLive",
  "routines.compare", "routines.create", "routines.export", "routines.fromResult", "routines.import",
  "routines.outcome", "routines.reconcile", "routines.replay.compile", "routines.replay.result", "routines.replay.test",
  "routines.run", "routines.update",
  "runs.steer", "safety.approvals.decide", "safety.approvals.pending",
  "tasks.captureEvidence", "tasks.create",
  "tasks.importDocumentEvidence", "tasks.promote",
  "tasks.reconcileAction", "tasks.reconcileOperation", "tasks.recordEvidence", "tasks.replaceAgent",
  "tasks.reviewCriterion", "tasks.start",
  "tasks.undoBookmarkChange", "tasks.undoBrowserChange", "tasks.undoDownloadChange", "tasks.undoHistoryChange", "tasks.undoRunBrowserChanges",
  "tasks.update", "tasks.verifyCriterion", "usage.report", "vault.expiredGrants",
  "vault.generate", "vault.grant", "vault.grants", "vault.history", "vault.list",
  "vault.lock", "vault.renewGrant", "vault.revoke", "vault.save", "vault.status", "vault.unlock",
  "workspaces.folders.add", "workspaces.folders.archive", "workspaces.folders.inspect", "workspaces.folders.list",
];
