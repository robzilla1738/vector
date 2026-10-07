import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, statSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { openDb } from "../../apps/runtime/dist/store/db.js";
import { Repo } from "../../apps/runtime/dist/store/repo.js";
import { CodingFilesService } from "../../apps/runtime/dist/services/coding-files.js";
import { FilesystemAccessService } from "../../apps/runtime/dist/services/filesystem-access.js";

const disposals: (() => void)[] = [];
afterEach(() => disposals.splice(0).forEach((dispose) => dispose()));
function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "aux-coding-files-")));
  const scratch = join(root, "scratch"),
    project = join(root, "project");
  mkdirSync(scratch);
  mkdirSync(project);
  const db = openDb(":memory:"),
    repo = new Repo(db);
  disposals.push(() => {
    db.close();
    rmSync(root, { recursive: true, force: true });
  });
  const access = new FilesystemAccessService({
    homeDir: root,
    internalRoots: [],
    scratchDir: scratch,
    protectedRoots: [],
    settings: () => ({}),
    reviewedRoots: () => ({ read: [project], write: [project] }),
  });
  const approvals: string[] = [];
  const service = new CodingFilesService(repo, access, async (request) => {
    approvals.push(request.category);
  });
  return { service, project, approvals, repo, access, context: { runId: "coding-test" } };
}
it.runIf(process.platform === "darwin")(
  "journals versioned batches, suppresses duplicate dispatch, and undoes only matching results",
  async () => {
    const { service, project, context, approvals } = fixture();
    const path = join(project, "code.ts");
    writeFileSync(path, "before\n");
    const initial = await service.read({ path }, context);
    const receipt = await service.applyChanges(
      {
        actionId: "change",
        changes: [{ kind: "edit", path, expectedVersion: initial.version, content: "after\n" }],
      },
      context,
    );
    expect(receipt.status).toBe("confirmed");
    expect(
      await service.applyChanges(
        {
          actionId: "change",
          changes: [{ kind: "edit", path, expectedVersion: initial.version, content: "after\n" }],
        },
        context,
      ),
    ).toEqual(receipt);
    expect(approvals.filter((category) => category === "file_write")).toHaveLength(1);
    writeFileSync(path, "user edit\n");
    await expect(
      service.undo({ actionId: "undo", receiptIds: [receipt.receiptId] }, context),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(readFileSync(path, "utf8")).toBe("user edit\n");
    writeFileSync(path, "after\n");
    await service.undo({ actionId: "undo", receiptIds: [receipt.receiptId] }, context);
    expect(readFileSync(path, "utf8")).toBe("before\n");
    expect(service.changes(context.runId)).toHaveLength(2);
  },
);
it.runIf(process.platform === "darwin")(
  "searches ignored project files without Bash and rejects a stale batch before its first write",
  async () => {
    const { service, project, context, approvals } = fixture();
    writeFileSync(join(project, ".gitignore"), "ignored\n");
    mkdirSync(join(project, "ignored"));
    writeFileSync(join(project, "ignored", "hidden.ts"), "needle\n");
    writeFileSync(join(project, "binary.ts"), Buffer.from([0xff, 0xfe]));
    writeFileSync(join(project, ".env"), "SECRET=needle");
    const path = join(project, "visible.ts");
    writeFileSync(path, "needle\n");
    const search = await service.search({ root: project, pattern: "**/*.ts", query: "needle" }, context);
    expect(search.matches).toEqual([{ path, line: 1, text: "needle" }]);
    const initial = await service.read({ path }, context);
    writeFileSync(path, "changed\n");
    const created = join(project, "new.ts");
    await expect(
      service.applyChanges(
        {
          actionId: "stale",
          changes: [
            { kind: "create", path: created, content: "new" },
            { kind: "edit", path, expectedVersion: initial.version, content: "overwrite" },
          ],
        },
        context,
      ),
    ).rejects.toMatchObject({ code: "conflict" });
    expect((await service.stat(created, context)).kind).toBe("missing");
    expect(approvals).not.toContain("bash");
  },
);

it.runIf(process.platform === "darwin").each([true, false])(
  "reconciles a lost execution response after restart without redispatch (applied=%s)",
  async (applied) => {
    const { service, project, context, repo, access } = fixture();
    const path = join(project, "receipt.ts");
    const execute = access.coding.bind(access);
    const lost = vi.spyOn(access, "coding").mockImplementation(async (request, runId, signal) => {
      if (request.kind === "apply" && !applied) throw new Error("Lost worker before dispatch");
      const result = await execute(request, runId, signal);
      if (request.kind === "apply") throw new Error("Lost response after dispatch");
      return result;
    });
    await expect(
      service.applyChanges(
        { actionId: "lost", changes: [{ kind: "create", path, content: "completed" }] },
        context,
      ),
    ).rejects.toMatchObject({ code: "operation_uncertain" });
    lost.mockRestore();
    const restarted = new CodingFilesService(repo, access, async () => {});
    const receipt = restarted.changes(context.runId)[0]!;
    expect(receipt.status).toBe("uncertain");
    expect((await restarted.reconcile(receipt.receiptId, context)).status).toBe(
      applied ? "confirmed" : "not_applied",
    );
    expect(
      (
        await restarted.applyChanges(
          { actionId: "lost", changes: [{ kind: "create", path, content: "completed" }] },
          context,
        )
      ).receiptId,
    ).toBe(receipt.receiptId);
    const contents = applied ? readFileSync(path, "utf8") : (await restarted.stat(path, context)).kind;
    expect(contents).toBe(applied ? "completed" : "missing");
  },
);

it.runIf(process.platform === "darwin")(
  "journals binary worktree assets and executable modes through move and undo",
  async () => {
    const { service, project, context } = fixture();
    const path = join(project, "asset.bin"),
      destination = join(project, "moved.bin");
    const bytes = Buffer.from([0xff, 0, 0x41]);
    const created = await service.applyChanges(
      {
        actionId: "binary-create",
        changes: [
          { kind: "create", path, content: bytes.toString("base64"), encoding: "base64", mode: 0o755 },
        ],
      },
      context,
    );
    expect(readFileSync(path)).toEqual(bytes);
    expect(statSync(path).mode & 0o777).toBe(0o755);
    const version = (await service.stat(path, context)).version!;
    expect(version).toBe(created.after[0]!.version);
    const moved = await service.applyChanges(
      { actionId: "binary-move", changes: [{ kind: "move", path, destination, expectedVersion: version }] },
      context,
    );
    await service.undo({ actionId: "binary-undo", receiptIds: [moved.receiptId] }, context);
    expect(readFileSync(path)).toEqual(bytes);
    expect(statSync(path).mode & 0o777).toBe(0o755);
    expect((await service.stat(destination, context)).kind).toBe("missing");
  },
);

it.runIf(process.platform === "darwin")(
  "settles a partial batch from file evidence and undoes only its confirmed writes",
  async () => {
    const { service, project, context, access } = fixture();
    const first = join(project, "first.ts"),
      second = join(project, "second.ts");
    writeFileSync(first, "before-first");
    writeFileSync(second, "before-second");
    const a = await service.read({ path: first }, context),
      b = await service.read({ path: second }, context);
    const execute = access.coding.bind(access);
    const partial = vi.spyOn(access, "coding").mockImplementation(async (request, runId, signal) => {
      if (request.kind !== "apply") return execute(request, runId, signal);
      await execute(
        {
          ...request,
          before: (request.before as unknown[]).slice(0, 1),
          after: (request.after as unknown[]).slice(0, 1),
        },
        runId,
        signal,
      );
      throw new Error("Lost worker after first write");
    });
    await expect(
      service.applyChanges(
        {
          actionId: "partial",
          changes: [
            { kind: "edit", path: first, content: "after-first", expectedVersion: a.version },
            { kind: "edit", path: second, content: "after-second", expectedVersion: b.version },
          ],
        },
        context,
      ),
    ).rejects.toMatchObject({ code: "operation_uncertain" });
    partial.mockRestore();
    const receipt = service.changes(context.runId)[0]!;
    expect((await service.reconcile(receipt.receiptId, context)).status).toBe("partially_applied");
    await service.undo({ actionId: "partial-undo", receiptIds: [receipt.receiptId] }, context);
    expect(readFileSync(first, "utf8")).toBe("before-first");
    expect(readFileSync(second, "utf8")).toBe("before-second");
  },
);

it("limits receipt decryption to selected history and direct duplicate lookups", async () => {
  const { service, project, context, repo } = fixture();
  const changes = [{ kind: "create" as const, path: join(project, "already.ts"), content: "x" }];
  const requestHash = createHash("sha256").update(JSON.stringify(changes)).digest("hex");
  for (let i = 0; i < 40; i++) {
    const receipt = {
      receiptId: `receipt-${i}`,
      runId: context.runId,
      actionId: `action-${i}`,
      createdAt: i,
      status: i === 0 ? "uncertain" : "confirmed",
      requestHash,
      before: [],
      after: [],
      evidence: "x".repeat(50000),
    };
    repo.db
      .prepare(
        "INSERT INTO coding_file_receipts(receipt_id,run_id,action_id,created_at,status,receipt,summary) VALUES(?,?,?,?,?,?,?)",
      )
      .run(
        receipt.receiptId,
        receipt.runId,
        receipt.actionId,
        i,
        receipt.status,
        JSON.stringify(receipt),
        JSON.stringify({ ...receipt, evidence: undefined }),
      );
  }
  const reveal = vi.spyOn(repo, "revealRecordField");
  expect(service.recentChanges(context.runId, 3).map((receipt) => receipt.receiptId)).toEqual([
    "receipt-37",
    "receipt-38",
    "receipt-39",
  ]);
  expect(reveal).toHaveBeenCalledTimes(3);
  expect(service.unresolvedIds(context.runId)).toEqual(["receipt-0"]);
  expect(service.receiptIds(context.runId, 2)).toEqual(["receipt-38", "receipt-39"]);
  expect(service.count(context.runId)).toBe(40);
  expect(reveal).toHaveBeenCalledTimes(3);
  expect(
    service.changesByIds(context.runId, ["receipt-1", "receipt-2"]).map((receipt) => receipt.receiptId),
  ).toEqual(["receipt-2", "receipt-1"]);
  expect(reveal).toHaveBeenCalledTimes(5);
  expect((await service.applyChanges({ actionId: "action-39", changes }, context)).receiptId).toBe(
    "receipt-39",
  );
  expect(reveal).toHaveBeenCalledTimes(6);
});

it.runIf(process.platform === "darwin")(
  "retrieves metadata without before-images and loads bounded selected file previews",
  async () => {
    const { service, project, context, repo } = fixture();
    const path = join(project, "large.txt");
    const content = "a".repeat(70000);
    const receipt = await service.applyChanges(
      { actionId: "large", changes: [{ kind: "create", path, content }] },
      context,
    );
    const reveal = vi.spyOn(repo, "revealRecordField");
    const [metadata] = service.changeViews(context.runId);
    expect(metadata?.after[0]?.content).toBe("");
    expect(metadata?.after[0]?.version).toBe(receipt.after[0]?.version);
    expect(reveal.mock.calls.map((call) => call[2])).toEqual(["summary"]);
    const [preview] = service.changeViews(context.runId, { receiptId: receipt.receiptId, path });
    expect(preview?.after[0]?.content).toHaveLength(65536);
    expect(preview?.after[0]?.contentTruncated).toBe(true);
    const [full] = service.changeViews(context.runId, { receiptId: receipt.receiptId, path, full: true });
    expect(full?.after[0]?.content).toBe(content);
    expect(full?.after[0]?.contentTruncated).toBe(false);
  },
);
