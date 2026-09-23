import { afterEach, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertProfileBackupAllowed,
  mcpCatalogForScope,
  mcpCatalogGrouped,
  profileBackupAction,
  refuseSilentCredentialMove,
  requireScopedAuxMcpCatalog,
  SESSION_PARTITIONS,
  TaskResourceSchema,
} from "@aux/contracts";
import {
  beginConsequentialWrite,
  CoordinatorLease,
  coordinatorOwnerId,
  createRuntimeBackup,
  DurableWriteLedger,
  EventBus,
  listRuntimeBackups,
  openDb,
  Repo,
  SpaceService,
  TaskService,
} from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

it("keeps Aux session and MCP identities fail-closed", () => {
  expect(SESSION_PARTITIONS).toEqual({ browsing: "persist:aux-default" });
  expect(mcpCatalogGrouped("task").map(group => group.group)).toEqual(["browser", "task", "workspace"]);
  expect(mcpCatalogForScope("task", { query: "verify", group: "task" }).map(tool => tool.name)).toEqual(["aux_task_verify_criterion"]);
  expect(profileBackupAction("Default/Bookmarks")).toBe("copy");
  expect(profileBackupAction("Default/Cookies")).toBe("refuse");
  expect(profileBackupAction("Default/Login Data")).toBe("refuse");
  expect(profileBackupAction("Default/Web Data")).toBe("refuse");
  expect(profileBackupAction("Default/Local Storage/leveldb/000003.log")).toBe("refuse");
  expect(() => assertProfileBackupAllowed("Default/Cookies")).toThrow(/stay in place/i);
  expect(() => refuseSilentCredentialMove("Adapter")).toThrow(/stay in place/i);
  expect(() => requireScopedAuxMcpCatalog({})).toThrow(/AUX_MCP_TOKEN/);
  requireScopedAuxMcpCatalog({ AUX_MCP_TOKEN: "scoped" });
  expect(mcpCatalogForScope("task").some(tool => tool.name === "aux_task_verify_criterion")).toBe(true);
  expect(mcpCatalogForScope("task").some(tool => tool.name === "aux_task_replace_agent")).toBe(true);
});

it("unifies Spaces with workspaces by retained IDs and never merges the same name", () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const spaces = new SpaceService(repo, events);
  const first = tasks.createWorkspace("Research");
  const second = tasks.createWorkspace("Research");
  const listed = spaces.list();
  expect(listed.filter(space => space.name === "Research")).toHaveLength(2);
  expect(new Set(listed.map(space => space.workspaceId))).toEqual(new Set([first.workspaceId, second.workspaceId]));
  expect(listed.find(space => space.workspaceId === first.workspaceId)?.id).not.toBe(listed.find(space => space.workspaceId === second.workspaceId)?.id);
});

it("fences coordinator leases in-process and allows expired takeover", () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const lease = new CoordinatorLease(db);
  const owner = coordinatorOwnerId();
  const first = lease.acquire("task:one", owner, 1_000, 1_000);
  expect(() => lease.acquire("task:one", coordinatorOwnerId(), 1_500, 1_000)).toThrow(/held/i);
  const taken = lease.acquire("task:one", coordinatorOwnerId(), 2_001, 1_000);
  expect(taken.generation).toBe(first.generation + 1);
  expect(() => lease.refresh("task:one", owner, 2_100)).toThrow(/fenced|taken over/i);
});

it("skips incomplete backups and fails closed when the backup cannot fit", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-backup-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const db = openDb(join(directory, "state.sqlite"));
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const incomplete = join(directory, "backups", "aux-runtime-incomplete");
  mkdirSync(incomplete, { recursive: true });
  writeFileSync(join(incomplete, "readme.txt"), "not a backup");
  expect(await listRuntimeBackups(directory)).toEqual([]);
  await expect(createRuntimeBackup(repo, directory, { maxBackupBytes: 1 })).rejects.toThrow(/Not enough free space/);
  expect(await listRuntimeBackups(directory)).toEqual([]);
  await expect(createRuntimeBackup(repo, directory, { interrupt: () => { throw new Error("killed"); } })).rejects.toThrow(/killed/);
  expect(await listRuntimeBackups(directory)).toEqual([]);
  const killed = join(directory, "backups", "aux-runtime-killed");
  mkdirSync(killed, { recursive: true });
  writeFileSync(join(killed, "state.sqlite"), "partial");
  expect(await listRuntimeBackups(directory)).toEqual([]);
});

it("keeps the compact and mid-width conversation breakpoints", () => {
  const css = readFileSync(join(process.cwd(), "apps/desktop/renderer/src/styles.css"), "utf8");
  // wider layouts are governed by the full-page conversation rule, not a breakpoint
  expect(css).toContain("@media (max-width: 1024px)");
  expect(css).toContain("@media (min-width: 1025px) and (max-width: 1279px)");
  const compact = css.slice(css.indexOf("@media (max-width: 1024px)"), css.indexOf("@media (min-width: 1025px)"));
  expect(compact).toContain(".empty-state");
  expect(compact).toContain(".navigation-error");
  expect(compact).toContain(".stage-card.loading");
  expect(compact).toContain(".sidebar.collapsed");
  expect(css).toContain(".empty-state {");
  expect(css).toContain(".navigation-error {");
});

it("does not share the retained profile partition with the private process", () => {
  const privateMain = readFileSync(join(process.cwd(), "apps/desktop/main/private-main.ts"), "utf8");
  expect(privateMain).not.toContain(SESSION_PARTITIONS.browsing);
  expect(privateMain).toMatch(/no runtime child[\s\S]*extension loader/);
});

it("defaults task resource access to reference and never journals read-only programs", () => {
  expect(TaskResourceSchema.parse({ resourceId: "r1", kind: "url", locator: "https://example.test/", label: "Example" }).access).toBeUndefined();
  expect(TaskResourceSchema.parse({ resourceId: "r2", kind: "repository", locator: "/tmp/checkout", label: "Repo" }).access).toBeUndefined();
  expect(TaskResourceSchema.parse({ resourceId: "r3", kind: "url", locator: "https://example.test/", label: "Example", access: "read" }).access).toBe("read");
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const ledger = new DurableWriteLedger(db);
  const read = beginConsequentialWrite(ledger, { runId: "direct:p", pageId: "p", documentEpoch: 1, steps: [{ op: "extract", target: "r1" }] });
  expect(read.skip).toBe(false);
  expect(read.intentId).toBeUndefined();
  expect(ledger.unresolved("direct:p")).toEqual([]);
  const write = beginConsequentialWrite(ledger, { runId: "direct:p", pageId: "p", documentEpoch: 1, steps: [{ op: "click", target: "r1" }] });
  expect(write.intentId).toBeTruthy();
});

it("keeps coordinator leases after the owner process identity is gone", () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const lease = new CoordinatorLease(db);
  const first = lease.acquire("task:kill", "pid:1:dead", 1_000, 5_000);
  expect(lease.get("task:kill")?.ownerId).toBe("pid:1:dead");
  const successor = new CoordinatorLease(db);
  expect(() => successor.acquire("task:kill", "pid:2:alive", 2_000, 5_000)).toThrow(/held/i);
  const taken = successor.acquire("task:kill", "pid:2:alive", 7_000, 5_000);
  expect(taken.generation).toBe(first.generation + 1);
});

it("derives the same task logical action across runs until it is confirmed", () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const ledger = new DurableWriteLedger(db);
  const first = beginConsequentialWrite(ledger, { runId: "a", pageId: "p", documentEpoch: 1, steps: [{ op: "click", target: "r1" }], taskId: "t", taskRevision: 2 });
  expect(first.skip).toBe(false);
  const second = beginConsequentialWrite(ledger, { runId: "b", pageId: "q", documentEpoch: 8, steps: [{ op: "click", target: "r1" }], taskId: "t", taskRevision: 2 });
  expect(second.skip).toBe(true);
});
