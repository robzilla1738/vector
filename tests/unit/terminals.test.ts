import { TerminalService } from "../../apps/runtime/dist/services/terminals.js";
import { mkdtempSync, mkdirSync, chmodSync, writeFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import {
  EventBus,
  Repo,
  TaskService,
  WorkspaceFolderService,
  openDb,
  type NativeBridge,
} from "@aux/runtime";
import type { TerminalSession } from "@aux/contracts/terminal";
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0).reverse()) close();
  vi.unstubAllEnvs();
});
function fixture(access: "read" | "readWrite" = "readWrite") {
  const root = mkdtempSync(join(tmpdir(), "aux-terminal-"));
  cleanup.push(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin"),
    project = join(root, "project");
  mkdirSync(bin);
  mkdirSync(project);
  writeFileSync(join(project, "AGENTS.md"), "Use project style.");
  writeFileSync(join(bin, "claude"), "#!/bin/sh\nexit 0\n");
  chmodSync(join(bin, "claude"), 0o755);
  vi.stubEnv("PATH", bin);
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Project");
  const folders = new WorkspaceFolderService(repo),
    review = folders.inspect(workspace.workspaceId, project, access);
  const folder = folders.add(workspace.workspaceId, project, access, review.reviewDigest);
  const calls: string[] = [],
    sessions = new Map<string, TerminalSession>();
  let retired = false,
    failedClose = false;
  const native: Pick<
    NativeBridge,
    | "turnSourceContext"
    | "terminalStart"
    | "terminalInput"
    | "terminalClose"
    | "terminalListeners"
    | "terminalPreview"
    | "terminalPreviewClose"
  > = {
    turnSourceContext: async () => {
      if (retired) throw new Error("Original document retired");
      return { windowId: "window", activePageId: null, revision: 0, layout: null };
    },
    terminalStart: async (input) => {
      const actual = statSync(project, { bigint: true });
      expect(input).toMatchObject({
        cwd: review.path,
        rootDevice: actual.dev.toString(),
        rootInode: actual.ino.toString(),
      });
      calls.push("start");
      const value: TerminalSession = {
        terminalId: input.terminalId,
        workspaceId: input.workspaceId,
        folderId: input.folderId,
        client: input.client,
        cols: input.cols,
        rows: input.rows,
        state: "running",
      };
      sessions.set(input.terminalId, value);
      return value;
    },
    terminalInput: async (input) => {
      calls.push("input");
      return { terminalId: input.terminalId, nextSequence: input.sequence + 1 };
    },
    terminalClose: async (input) => {
      calls.push("close");
      if (failedClose) throw new Error("No termination acknowledgement");
      const original = sessions.get(input.terminalId);
      if (!original) throw new Error("No original session");
      const closed = { ...original, state: "closed" as const };
      sessions.set(input.terminalId, closed);
      return closed;
    },
  };
  const service = new TerminalService(native, folders);
  const start = () =>
    service.start(
      { workspaceId: workspace.workspaceId, folderId: folder.folderId, client: "claude", cols: 80, rows: 24 },
      "original",
    );
  return {
    service,
    native,
    folders,
    folder,
    project,
    calls,
    start,
    retire: () => {
      retired = true;
    },
    failClose: (value: boolean) => {
      failedClose = value;
    },
  };
}
it("requires the reviewed read/write Project and original owner before interactive input", async () => {
  const read = fixture("read");
  await expect(read.start()).rejects.toThrow(/read\/write/);
  expect(read.calls).toEqual([]);
  const f = fixture(),
    session = await f.start();
  await expect(f.service.input(session.terminalId, 0, "secret\r", "another-owner")).rejects.toThrow(/owner/);
  expect(f.calls).toEqual(["start"]);
  writeFileSync(join(f.project, "AGENTS.md"), "Changed review.");
  await expect(f.service.input(session.terminalId, 0, "command\r", "original")).rejects.toThrow(/review/);
  expect(f.calls).toEqual(["start", "close"]);
});
it("retires the original document before input and requires acknowledged process cleanup", async () => {
  const f = fixture(),
    session = await f.start();
  f.retire();
  await expect(f.service.input(session.terminalId, 0, "command\r", "original")).rejects.toThrow(/retired/);
  expect(f.calls).toEqual(["start", "close"]);
  const pending = fixture();
  await pending.start();
  pending.failClose(true);
  await expect(pending.service.dispose()).rejects.toThrow(/acknowledgement/);
  pending.failClose(false);
  await expect(pending.service.dispose()).resolves.toBeUndefined();
  expect(pending.calls).toEqual(["start", "close", "close"]);
});

it("does not create termination debt when the original owner retires before launch", async () => {
  const f = fixture();
  f.retire();
  await expect(f.start()).rejects.toThrow(/retired/);
  await expect(f.service.dispose()).resolves.toBeUndefined();
  expect(f.calls).toEqual([]);
});

it("retires a pending launch at shutdown without inventing a native process to close", async () => {
  const f = fixture();
  let began!: () => void;
  const started = new Promise<void>((resolve) => {
    began = resolve;
  });
  let finish!: () => void;
  const source = new Promise<void>((resolve) => {
    finish = resolve;
  });
  f.native.turnSourceContext = async () => {
    began();
    await source;
    return { windowId: "window", activePageId: null, revision: 0, layout: null };
  };
  const pending = f.start();
  const rejected = expect(pending).rejects.toMatchObject({ code: "permission_denied" });
  await started;
  let joined = false;
  const closing = f.service.dispose().then(() => { joined = true; });
  await Promise.resolve();
  expect(joined).toBe(false);
  expect(f.calls).toEqual([]);
  finish();
  await rejected;
  await closing;
  expect(joined).toBe(true);
  expect(f.calls).toEqual([]);
});

it("binds Preview admission to its original Project and keeps retired cleanup until ACK", async () => {
  const f = fixture(),
    session = await f.start();
  const listenerId = "00000000-0000-4000-8000-000000000001";
  f.native.terminalListeners = async () => ({
    terminalId: session.terminalId,
    listeners: [{ listenerId, url: "http://127.0.0.1:3000/" }],
  });
  let fail = true;
  f.native.terminalPreview = async (request) => {
    expect(await f.service.admitPreview(request.terminalId, request.previewId, request.token)).toBe(true);
    return {
      terminalId: request.terminalId,
      previewId: request.previewId,
      contentId: "original-guest",
      url: "http://127.0.0.1:3000/",
    };
  };
  f.native.terminalPreviewClose = async () => {
    if (fail) throw new Error("Workers still closing");
    return { closed: true };
  };
  expect((await f.service.listeners(session.terminalId, "original")).listeners).toHaveLength(1);
  const preview = await f.service.preview(
    { terminalId: session.terminalId, listenerId, protocol: "http" },
    "original",
  );
  await expect(
    f.service.admitPreview(session.terminalId, preview.previewId, "another-owner"),
  ).rejects.toThrow(/owner/);
  await expect(f.service.closePreview(session.terminalId, preview.previewId, "original")).rejects.toThrow(
    /closing/,
  );
  expect(await f.service.admitPreview(session.terminalId, preview.previewId, "original")).toBe(false);
  fail = false;
  await expect(f.service.closePreview(session.terminalId, preview.previewId, "original")).resolves.toEqual({
    closed: true,
  });
  const next = await f.service.preview(
    { terminalId: session.terminalId, listenerId, protocol: "http" },
    "original",
  );
  writeFileSync(join(f.project, "AGENTS.md"), "Review revoked.");
  await expect(f.service.admitPreview(session.terminalId, next.previewId, "original")).rejects.toMatchObject({
    code: "permission_denied",
  });
});
