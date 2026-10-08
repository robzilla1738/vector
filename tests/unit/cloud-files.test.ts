import { mkdtempSync, realpathSync, rmSync, writeFileSync, readFileSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, expect, it } from "vitest";
import { openDb } from "../../apps/runtime/dist/store/db.js";
import { Repo } from "../../apps/runtime/dist/store/repo.js";
import { CodingFilesService } from "../../apps/runtime/dist/services/coding-files.js";
import { CloudFileBackend } from "../../apps/runtime/dist/services/cloud-files.js";
import { executeCloudFileRequest } from "../../apps/runtime/dist/services/cloud-files-worker.js";
import { CodingFileReceiptSchema } from "@aux/contracts/coding-api";

const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach((close) => close()));
function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "aux-cloud-files-")));
  const db = openDb(":memory:"),
    repo = new Repo(db),
    context = { runId: "original-run" };
  cleanups.push(() => {
    db.close();
    rmSync(root, { recursive: true, force: true });
  });
  let loseResponse = false,
    admitted = true;
  const identity = {
    backend: "cloud" as const,
    resourceId: "vm",
    sandboxName: "aux-vm",
    sessionId: "original-session",
    root,
  };
  const dispatch = async (request: Record<string, unknown>, _signal?: AbortSignal, fence?: () => void) => {
    fence?.();
    const result = await executeCloudFileRequest(request, root);
    if (request.kind === "apply" && loseResponse) throw new Error("Lost provider acknowledgement");
    return result;
  };
  const service = (execution = identity) =>
    new CodingFilesService(repo, new CloudFileBackend(context.runId, execution, dispatch), async () => () => {
      if (!admitted) throw new Error("Original authority retired");
    });
  return {
    root,
    context,
    identity,
    service,
    lose: () => {
      loseResponse = true;
    },
    revoke: () => {
      admitted = false;
    },
  };
}
it("keeps cloud write, move, delete, versions and Undo in the shared durable ledger", async () => {
  const f = fixture(),
    files = f.service(),
    path = join(f.root, "code.ts");
  const created = await files.applyChanges(
    { actionId: "create", changes: [{ kind: "create", path, content: "before\n" }] },
    f.context,
  );
  expect(CodingFileReceiptSchema.parse(created).execution).toEqual(f.identity);
  const read = await files.read({ path }, f.context);
  const destination = join(f.root, "moved.ts");
  const moved = await files.applyChanges(
    { actionId: "move", changes: [{ kind: "move", path, destination, expectedVersion: read.version }] },
    f.context,
  );
  expect((await files.versions([path, destination], f.context)).map((value) => value.version)).toEqual([
    null,
    read.version,
  ]);
  writeFileSync(destination, "later user edit");
  await expect(
    files.undo({ actionId: "undo-move", receiptIds: [moved.receiptId] }, f.context),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(readFileSync(destination, "utf8")).toBe("later user edit");
  writeFileSync(destination, "before\n");
  await files.undo({ actionId: "undo-move", receiptIds: [moved.receiptId] }, f.context);
  const deleted = await files.applyChanges(
    { actionId: "delete", changes: [{ kind: "delete", path, expectedVersion: read.version }] },
    f.context,
  );
  await files.undo({ actionId: "undo-delete", receiptIds: [deleted.receiptId] }, f.context);
  expect(readFileSync(path, "utf8")).toBe("before\n");
});
it("reconciles a lost acknowledgement only against its exact original VM session", async () => {
  const f = fixture(),
    files = f.service(),
    path = join(f.root, "result.txt");
  f.lose();
  await expect(
    files.applyChanges(
      { actionId: "write", changes: [{ kind: "create", path, content: "applied" }] },
      f.context,
    ),
  ).rejects.toMatchObject({ code: "operation_uncertain" });
  const receipt = files.changes(f.context.runId)[0]!;
  expect(receipt).toMatchObject({ status: "uncertain", execution: f.identity });
  const replacement = f.service({ ...f.identity, sessionId: "replacement-session" });
  await expect(replacement.reconcile(receipt.receiptId, f.context)).rejects.toMatchObject({
    code: "ref_stale",
  });
  await expect(
    replacement.undo({ actionId: "undo", receiptIds: [receipt.receiptId] }, f.context),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect((await f.service().reconcile(receipt.receiptId, f.context)).status).toBe("confirmed");
});
it("rejects out-of-root, secret, Aux-owned and symlink targets before governed dispatch", async () => {
  const f = fixture(),
    files = f.service();
  symlinkSync(tmpdir(), join(f.root, "escape"));
  for (const path of [
    join(f.root, ".env"),
    `${f.root}/../outside`,
    join(f.root, ".aux-files-any.json"),
    join(f.root, "escape", "outside"),
  ])
    await expect(files.read({ path }, f.context)).rejects.toThrow();
  await expect(executeCloudFileRequest({ kind: "worktree_copy", root: f.root }, f.root)).rejects.toThrow(
    "Unsupported",
  );
  await expect(files.read({ path: join(f.root, "file") }, { runId: "other-run" })).rejects.toMatchObject({
    code: "ref_stale",
  });
  const stop = new AbortController();
  stop.abort();
  await expect(
    files.read({ path: join(f.root, "file") }, { ...f.context, signal: stop.signal }),
  ).rejects.toMatchObject({ code: "cancelled" });
});
