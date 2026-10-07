import { coderWorktreePolicy } from "../../apps/runtime/src/services/coder-worktree-policy.js";
import { filesystemPermits } from "../../apps/runtime/src/services/filesystem-paths.js";
import { CoderWorktreeRecoverySchema } from "@aux/contracts";
import { describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, writeFile, readFile, chmod, stat, rm, realpath } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb } from "@aux/runtime/database";
import { Repo } from "@aux/runtime/repository";
import {
  FilesystemAccessService,
  CodingFilesService,
  startCoderWorktree,
  recoverCoderWorktree,
  worktreeAuthority,
  CoderWorktreeOperations,
  createCoderWorktree,
} from "@aux/runtime";
const execute = promisify(execFile);

describe.skipIf(process.platform !== "darwin")("supervised coder worktrees", () => {
  it("snapshots dirty projects including binary/modes and integrates with journaled conflicts", async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "aux-coder-")));
    const project = join(root, "project"),
      artifacts = join(root, "artifacts"),
      scratch = join(root, "scratch");
    await Promise.all([mkdir(project), mkdir(artifacts), mkdir(scratch)]);
    const git = (args: string[]) => execute("/usr/bin/git", ["-C", project, ...args]);
    const db = openDb(":memory:");
    try {
      await git(["init"]);
      await writeFile(join(project, "source.txt"), "original\n");
      await writeFile(join(project, "image.bin"), Buffer.from([0, 255, 1, 128]));
      await writeFile(join(project, "run.sh"), "#!/bin/sh\nexit 0\n");
      await chmod(join(project, "run.sh"), 0o755);
      await writeFile(join(project, ".env"), "TOKEN=synthetic-test-value\n");
      await git(["add", "."]);
      await git([
        "-c",
        "user.name=Aux Test",
        "-c",
        "user.email=aux@example.invalid",
        "commit",
        "-m",
        "fixture",
      ]);
      await writeFile(join(project, "source.txt"), "parent dirty\n");
      await writeFile(join(project, "extra.txt"), "untracked\n");
      const repo = new Repo(db);
      const filesystem = new FilesystemAccessService({
        homeDir: root,
        internalRoots: [artifacts],
        scratchDir: scratch,
        protectedRoots: [],
        reviewedRoots: () => ({ read: [project], write: [project] }),
        settings: () => ({ fileAccessMode: "guard", fileAccessRevision: 0 }),
      });
      const options = {
        repo,
        filesystem,
        directory: join(artifacts, "worktrees"),
        runId: "parent",
        checkOwner: () => {},
        authorize: async () => {},
      };
      let worktree = await startCoderWorktree(options, project, "fixture-child");
      expect(await readFile(join(worktree.root, "source.txt"), "utf8")).toBe("parent dirty\n");
      expect(await readFile(join(worktree.root, "extra.txt"), "utf8")).toBe("untracked\n");
      expect(await readFile(join(worktree.root, "image.bin"))).toEqual(Buffer.from([0, 255, 1, 128]));
      expect((await stat(join(worktree.root, "run.sh"))).mode & 0o777).toBe(0o755);
      const childPolicy = coderWorktreePolicy(filesystem.codingPolicy(), worktree, {
        scratch: join(scratch, "child"),
        artifacts: join(artifacts, "child"),
      });
      expect(filesystemPermits(childPolicy, join(worktree.root, "source.txt"), "write")).toBe(true);
      expect(filesystemPermits(childPolicy, join(options.directory, "sibling", "source.txt"), "write")).toBe(
        false,
      );
      expect(filesystemPermits(childPolicy, join(options.directory, "sibling", "source.txt"), "read")).toBe(
        false,
      );
      expect(filesystemPermits(childPolicy, join(project, "source.txt"), "write")).toBe(false);

      await expect(stat(join(worktree.root, ".env"))).rejects.toMatchObject({ code: "ENOENT" });
      await writeFile(join(worktree.root, "source.txt"), "child change\n");
      await writeFile(join(worktree.root, "image.bin"), Buffer.from([0, 254, 2, 129]));
      const files = new CodingFilesService(repo, filesystem, async () => {});
      const operations = new CoderWorktreeOperations(
        {
          worktreeFor: () => worktree,
          updateWorktree: (_id, value) => {
            worktree = value;
          },
          recoveryFor: () => {
            throw new Error("No incomplete snapshot in this scenario");
          },
          updateRecovery: () => {},
        },
        files,
        () => worktreeAuthority(options),
      );
      await writeFile(join(project, "source.txt"), "person change\n");
      await expect(
        operations.integrate("cell", { runId: "parent", actionId: "integration" }),
      ).rejects.toThrow();
      expect(await readFile(join(project, "source.txt"), "utf8")).toBe("person change\n");
      await writeFile(join(project, "source.txt"), "parent dirty\n");
      const integrated = await operations.integrate("cell", { runId: "parent", actionId: "integration" });
      expect(integrated.receipt?.status).toBe("confirmed");
      expect(await readFile(join(project, "image.bin"))).toEqual(Buffer.from([0, 254, 2, 129]));
      expect(await readFile(join(project, "source.txt"), "utf8")).toBe("child change\n");
      expect(await readFile(join(project, "extra.txt"), "utf8")).toBe("untracked\n");
      const undone = await files.undo(
        { actionId: "undo", receiptIds: [integrated.receipt!.receiptId] },
        { runId: "parent" },
      );
      expect(undone[0]?.status).toBe("confirmed");
      expect(await readFile(join(project, "source.txt"), "utf8")).toBe("parent dirty\n");
      expect(await readFile(join(project, "image.bin"))).toEqual(Buffer.from([0, 255, 1, 128]));
      const supervised = worktreeAuthority(options);
      let failure: unknown;
      try {
        await createCoderWorktree(
          project,
          {
            ...supervised,
            copy: async (root, snapshot) => {
              await supervised.copy(
                root,
                snapshot.filter((file) => file.path === "source.txt"),
              );
              throw new Error("Interrupted after copying one file");
            },
          },
          "interrupted-child",
        );
      } catch (error) {
        failure = error;
      }
      let recovery = CoderWorktreeRecoverySchema.parse(
        (failure as { detail: { worktreeRecovery: unknown } }).detail.worktreeRecovery,
      );
      db.prepare("UPDATE coder_worktree_receipts SET state='pending' WHERE action_id=?").run(
        recovery.actionId,
      );
      expect(recoverCoderWorktree(repo, options.directory, "parent", "interrupted-child")).toEqual(recovery);
      const recovering = new CoderWorktreeOperations(
        {
          worktreeFor: () => worktree,
          updateWorktree: () => {},
          recoveryFor: () => recovery,
          updateRecovery: (_id, value) => {
            recovery = value;
          },
        },
        files,
        () => worktreeAuthority(options),
      );
      const inspected = await recovering.inspectRecovery("interrupted-cell", {
        runId: "parent",
        actionId: "inspect",
      });
      expect(inspected.files.map((file) => file.path)).toEqual(["source.txt"]);
      await writeFile(join(recovery.root, "source.txt"), "preserved later change\n");
      await expect(
        recovering.archiveRecovery("interrupted-cell", inspected.digest, {
          runId: "parent",
          actionId: "archive",
        }),
      ).rejects.toMatchObject({ code: "ref_stale" });
      const updated = await recovering.inspectRecovery("interrupted-cell", {
        runId: "parent",
        actionId: "inspect-current",
      });
      const archived = await recovering.archiveRecovery("interrupted-cell", updated.digest, {
        runId: "parent",
        actionId: "archive-current",
      });
      expect(archived.state).toBe("archived");
      expect(await readFile(join(archived.root, "source.txt"), "utf8")).toBe("preserved later change\n");
      await expect(stat(recovery.root)).rejects.toMatchObject({ code: "ENOENT" });
      worktree = await startCoderWorktree(options, project, "batched-child");
      await Promise.all(
        Array.from({ length: 101 }, (_, index) =>
          writeFile(join(worktree.root, `batch-${String(index).padStart(3, "0")}.txt`), `change ${index}\n`),
        ),
      );
      const realCoding = filesystem.coding.bind(filesystem);
      let interrupt = true;
      const dispatch = vi.spyOn(filesystem, "coding").mockImplementation(async (request, ...args) => {
        if (interrupt && request.kind === "apply" && (request.after as unknown[]).length === 100) {
          interrupt = false;
          await realCoding(
            {
              ...request,
              before: [(request.before as unknown[])[0]],
              after: [(request.after as unknown[])[0]],
            },
            ...args,
          );
          throw new Error("Lost worker after the first confirmed file");
        }
        return realCoding(request, ...args);
      });
      const partial = await operations.integrate("cell", { runId: "parent", actionId: "batch-partial" });
      expect(partial.integrated).toBe(false);
      expect(partial.receipt?.status).toBe("uncertain");
      const reconciled = await files.reconcile(partial.receipt!.receiptId, { runId: "parent" });
      expect(reconciled.status).toBe("partially_applied");
      const recovered = await operations.integrate("cell", { runId: "parent", actionId: "batch-recovery" });
      expect(recovered.integrated).toBe(true);
      expect(recovered.receipt?.after).toHaveLength(100);
      expect(await readFile(join(project, "batch-000.txt"), "utf8")).toBe("change 0\n");
      expect(await readFile(join(project, "batch-100.txt"), "utf8")).toBe("change 100\n");
      dispatch.mockRestore();
      await Promise.all(
        Array.from({ length: 101 }, (_, index) =>
          writeFile(join(worktree.root, `more-${index}.txt`), "another change\n"),
        ),
      );
      const large = await operations.integrate("cell", { runId: "parent", actionId: "large-batch" });
      expect(large.integrated).toBe(true);
      expect(large.receipts.slice(-2).map((receipt) => receipt.after.length)).toEqual([100, 1]);
      expect(new Set(worktree.integrationBatches!.map((batch) => batch.actionId)).size).toBe(
        worktree.integrationBatches!.length,
      );
    } finally {
      db.close();
      await rm(root, { recursive: true, force: true });
    }
  }, 60_000);
});
