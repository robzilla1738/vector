import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { MethodSchemas } from "@aux/contracts";

const renderer = join(process.cwd(), "apps/desktop/renderer/src");
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
  return new Set([...table.matchAll(/^ {4}"([\w.]+)":/gm)].map(match => match[1]!));
}

it("lists the runtime methods the renderer uses that the mock bridge does not implement", () => {
  const mocked = mockMethods();
  const missing = [...rendererMethods()].filter(method => !mocked.has(method)).sort();
  // Shrink this list as the mock grows; a new renderer call must be mocked or added here.
  expect(missing).toEqual(UNMOCKED);
});

const UNMOCKED = [
  "artifacts.list", "bookmarks.folders.remove", "bookmarks.folders.rename", "bookmarks.markRead",
  "bookmarks.offline.get", "bookmarks.offline.set", "bookmarks.readingList", "calendar.auth.start",
  "calendar.connections.list", "calendar.connections.revoke", "calendar.events.list",
  "calendar.taskEvents.list", "calendar.taskGrants.create", "calendar.taskGrants.list",
  "calendar.taskGrants.revoke", "chrome.attach",
  "chrome.detach", "chrome.tabs", "cloud.cleanupOrphan", "cloud.commands", "cloud.create", "cloud.delete",
  "cloud.downloadResultArtifact", "cloud.environments", "cloud.exportWorkspace", "cloud.files",
  "cloud.forgetMissing", "cloud.handoff", "cloud.handoffAndStart", "cloud.importTaskResult",
  "cloud.inventory", "cloud.openPreview", "cloud.openTerminal", "cloud.preserveTaskResult", "cloud.readFile",
  "cloud.reconnectStatus", "cloud.refresh", "cloud.refreshCommand", "cloud.resume", "cloud.runCommand",
  "cloud.startService", "cloud.stop", "cloud.stopCommand", "cloud.syncProject", "cloud.taskResult",
  "development.githubStatus", "development.operationsStatus", "development.prepareIncidentFix",
  "github.probe", "import.cancel", "import.preview", "import.run", "import.status",
  "installation.backupRetention", "installation.listBackups", "installation.setBackupRetention",
  "installation.stageRestore", "pages.console", "pages.list", "pages.network", "pages.openLive", "routines.alerts",
  "routines.compare", "routines.export", "routines.fromResult", "routines.get", "routines.import",
  "routines.list", "routines.outcome", "routines.pause", "routines.reconcile", "routines.run", "routines.update",
  "runs.message.cancel", "runs.messages.list", "runs.queue", "runs.steer", "sentry.probe",
  "sentry.projects", "tasks.archive", "tasks.captureEvidence", "tasks.create", "tasks.get",
  "tasks.importCommandEvidence", "tasks.importDocumentEvidence", "tasks.promote", "tasks.receipt",
  "tasks.reconcileAction", "tasks.reconcileOperation", "tasks.recordEvidence", "tasks.replaceAgent",
  "tasks.reviewCriterion", "tasks.start", "tasks.update", "tasks.verifyCriterion", "vault.expiredGrants",
  "vault.generate", "vault.grant", "vault.grants", "vault.history", "vault.itemsForOrigin", "vault.list",
  "vault.lock", "vault.renewGrant", "vault.revoke", "vault.save", "vault.status", "vault.unlock",
  "vercel.probe", "vercel.projects",
];
