import { fixtureFilesystemPolicy } from "../fixtures/filesystem-policy.js";
import { afterEach, expect, it } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BashSeatbelt, EventBus, openDb, Repo, TaskService, WorkspaceFolderService } from "@aux/runtime";

const cleanup: string[] = [];
afterEach(() => {
  for (const path of cleanup.splice(0)) rmSync(path, { recursive: true, force: true });
});

it("binds a reviewed Space folder, pins AGENTS.md, and removes roots on archive", () => {
  const base = mkdtempSync(join(tmpdir(), "aux-workspace-folder-"));
  cleanup.push(base);
  const userFolder = join(base, "project");
  const protectedFolder = join(base, "runtime");
  mkdirSync(userFolder);
  mkdirSync(protectedFolder);
  writeFileSync(join(userFolder, "AGENTS.md"), "Use the project style.");
  const projectSkills = join(userFolder, ".claude", "skills");
  mkdirSync(projectSkills, { recursive: true });
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Research");
    const service = new WorkspaceFolderService(repo, () => [protectedFolder]);
    const review = service.inspect(workspace.workspaceId, userFolder, "read");
    expect(review.path).toBe(realpathSync(userFolder));
    expect(review.agentsPreview).toBe("Use the project style.");
    expect(review.skillsPath).toBe(realpathSync(projectSkills));
    expect(() => service.add(workspace.workspaceId, userFolder, "readWrite", review.reviewDigest)).toThrow(
      /Review/,
    );
    const saved = service.add(workspace.workspaceId, userFolder, "read", review.reviewDigest);
    expect(service.roots(workspace.workspaceId)).toEqual({ read: [review.path], write: [] });
    expect(service.context(workspace.workspaceId)).toContain("Use the project style.");
    expect(service.context(workspace.workspaceId)).toContain(realpathSync(projectSkills));
    rmSync(projectSkills, { recursive: true });
    symlinkSync(protectedFolder, projectSkills, "dir");
    expect(service.list(workspace.workspaceId)[0]?.skillsPath).toBeUndefined();
    expect(service.context(workspace.workspaceId)).not.toContain(realpathSync(protectedFolder));
    expect(service.roots(workspace.workspaceId)).toEqual({ read: [review.path], write: [] });
    writeFileSync(join(userFolder, "AGENTS.md"), "Changed instructions.");
    expect(service.context(workspace.workspaceId)).toBe("");
    expect(service.roots(workspace.workspaceId)).toEqual({ read: [], write: [] });
    expect(service.list(workspace.workspaceId)[0]?.agentsChanged).toBe(true);
    expect(() => service.inspect(workspace.workspaceId, base, "read")).toThrow(/protected runtime data/);
    service.archive(workspace.workspaceId, saved.folderId);
    expect(service.roots(workspace.workspaceId)).toEqual({ read: [], write: [] });
    expect(service.context(workspace.workspaceId)).toBe("");
  } finally {
    db.close();
  }
});

it("invalidates reviewed roots when their inode or symlink resolution changes", () => {
  const base = mkdtempSync(join(tmpdir(), "aux-workspace-identity-"));
  cleanup.push(base);
  const root = join(base, "project");
  const other = join(base, "other");
  mkdirSync(root);
  mkdirSync(other);
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Research").workspaceId;
    const service = new WorkspaceFolderService(repo);
    const review = service.inspect(workspaceId, root, "readWrite");
    service.add(workspaceId, root, "readWrite", review.reviewDigest);
    const digest = service.scopeDigest(workspaceId, root);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    symlinkSync(other, join(root, "outside"));
    expect(() => service.scopeDigest(workspaceId, join(root, "outside"))).toThrow(/reviewed folder/i);
    renameSync(root, join(base, "old-project"));
    symlinkSync(other, root, "dir");
    expect(service.roots(workspaceId)).toEqual({ read: [], write: [] });
    expect(() => service.scopeDigest(workspaceId, root)).toThrow(/reviewed folder/i);
  } finally {
    db.close();
  }
});

it("keeps read-only folders outside bash write permissions", () => {
  const base = mkdtempSync(join(tmpdir(), "aux-workspace-bash-"));
  cleanup.push(base);
  const read = join(base, "read");
  const write = join(base, "write");
  mkdirSync(read);
  mkdirSync(write);
  const sandbox = new BashSeatbelt({
    filesystemPolicy: () => fixtureFilesystemPolicy([write, read], [write]),
    scratchDir: write,
    runner: async () => ({ stdout: "", stderr: "", exitCode: 0, timedOut: false }),
    platform: "darwin",
  });
  const profile = sandbox.profile(false);
  expect(profile).toContain(
    `(allow file-read-data (subpath "${realpathSync(write)}") (subpath "${realpathSync(read)}"))`,
  );
  expect(profile).toContain(`(allow file-write* (subpath "${realpathSync(write)}")`);
  expect(profile).not.toContain(`(allow file-write* (subpath "${realpathSync(read)}")`);
  expect(profile).toContain("(deny network-inbound network-outbound network-bind)");
});

it.skipIf(process.platform !== "darwin")(
  "lets bash read a reviewed folder but denies writes to it",
  async () => {
    const base = mkdtempSync(join(tmpdir(), "aux-workspace-seatbelt-"));
    cleanup.push(base);
    const read = join(base, "read");
    const write = join(base, "write");
    mkdirSync(read);
    mkdirSync(write);
    writeFileSync(join(read, "context.txt"), "reviewed context");
    const sandbox = new BashSeatbelt({
      filesystemPolicy: () => fixtureFilesystemPolicy([write, read], [write]),
      scratchDir: write,
      platform: "darwin",
    });
    const ctx = { runId: "run", threadId: "thread", turnId: "turn" };
    const readResult = await sandbox.run({ command: `cat '${join(read, "context.txt")}'` }, ctx);
    expect("stdout" in readResult && readResult.stdout).toContain("reviewed context");
    const writeResult = await sandbox.run({ command: `printf denied > '${join(read, "new.txt")}'` }, ctx);
    expect("exitCode" in writeResult && writeResult.exitCode).not.toBe(0);
  },
);
