import { ProjectsService } from "../../apps/runtime/dist/services/projects.js";
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { EventBus, Repo, TaskService, WorkspaceFolderService, openDb } from "@aux/runtime";
import { FilesystemAccessService } from "../../apps/runtime/dist/services/filesystem-access.js";
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0).reverse()) close();
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "aux-project-inspection-"));
  cleanup.push(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, "project"),
    protectedRoot = join(root, "private-profile");
  mkdirSync(path);
  mkdirSync(protectedRoot);
  writeFileSync(join(path, "AGENTS.md"), "Use project style.");
  writeFileSync(join(path, "README.md"), "Original file text");
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Project");
  const folders = new WorkspaceFolderService(repo),
    review = folders.inspect(workspace.workspaceId, path, "read");
  const folder = folders.add(workspace.workspaceId, path, "read", review.reviewDigest);
  const filesystem = new FilesystemAccessService({
    homeDir: root,
    internalRoots: [],
    scratchDir: root,
    protectedRoots: [protectedRoot],
    settings: () => ({ fileAccessMode: "guard", fileAccessRevision: 0 }),
    reviewedRoots: () => folders.roots(workspace.workspaceId),
  });
  let changed = false,
    failedRead = false,
    failedClose = false;
  const calls: string[] = [];
  const native: NonNullable<ConstructorParameters<typeof ProjectsService>[0]> = {
    turnSourceContext: async (token) => {
      if (token !== "original") throw new Error("Original window changed");
      return {
        windowId: "window",
        activePageId: null,
        revision: 0,
        layout: null,
      };
    },
    projectFiles: async () => ({ path: "", entries: [], truncated: false }),
    projectChanges: async () => ({ status: "", diff: "", truncated: false }),
    projectFile: async (input) => {
      calls.push("read");
      const actual = statSync(path, { bigint: true });
      expect(input).toMatchObject({
        cwd: review.path,
        token: "original",
        rootDevice: actual.dev.toString(),
        rootInode: actual.ino.toString(),
      });
      expect(input.deniedRoots).toContain(realpathSync(protectedRoot));
      if (failedRead) throw new Error("Native worker outcome unavailable");
      if (changed) writeFileSync(join(path, "AGENTS.md"), "Changed review.");
      return {
        path: input.path,
        text: readFileSync(join(path, input.path), "utf8"),
        truncated: false,
      };
    },
    projectCancel: async () => {
      calls.push("close");
      if (failedClose) throw new Error("Original close ACK unavailable");
      return { closed: true };
    },
  };
  return {
    repo,
    native,
    service: new ProjectsService(native, folders, filesystem),
    input: {
      workspaceId: workspace.workspaceId,
      folderId: folder.folderId,
      path: "README.md",
    },
    calls,
    change: () => {
      changed = true;
    },
    failRead: () => {
      failedRead = true;
    },
    failClose: (value: boolean) => {
      failedClose = value;
    },
  };
}
it("pins read-only Project identity and refuses stale reviews without releasing file text", async () => {
  const f = fixture();
  await expect(f.service.file(f.input, "another-window")).rejects.toThrow(/Original window/);
  expect(f.calls).toEqual([]);
  await expect(f.service.file(f.input, "original")).resolves.toMatchObject({
    text: "Original file text",
  });
  f.change();
  await expect(f.service.file(f.input, "original")).rejects.toThrow(/Project review/);
  expect(f.calls).toEqual(["read", "read"]);
  expect(f.repo.db.prepare("SELECT COUNT(*) AS n FROM model_calls").get()).toMatchObject({ n: 0 });
});
it("retains uncertain native Project operations until their original cleanup acknowledges", async () => {
  const f = fixture();
  f.failRead();
  f.failClose(true);
  await expect(f.service.file(f.input, "original")).rejects.toThrow(
    /termination still needs acknowledgement/,
  );
  await expect(f.service.dispose()).rejects.toThrow(/termination acknowledgement/);
  f.failClose(false);
  await expect(f.service.dispose()).resolves.toBeUndefined();
  expect(f.calls).toEqual(["read", "close", "close", "close"]);
});

it("joins pending original-window inspection on shutdown without cancelling an unsent native read", async () => {
  const f = fixture();
  let entered!: () => void;
  const ownerEntered = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let release!: () => void;
  const owner = new Promise<void>((resolve) => {
    release = resolve;
  });
  f.native.turnSourceContext = async () => {
    entered();
    await owner;
    return {
      windowId: "window",
      activePageId: null,
      revision: 0,
      layout: null,
    };
  };
  const reading = f.service.file(f.input, "original");
  const refused = expect(reading).rejects.toThrow(/original Project review/);
  await ownerEntered;
  let joined = false;
  const closing = f.service.dispose().then(() => {
    joined = true;
  });
  await Promise.resolve();
  expect(joined).toBe(false);
  expect(f.calls).toEqual([]);
  release();
  await refused;
  await closing;
  expect(joined).toBe(true);
  expect(f.calls).toEqual([]);
});
