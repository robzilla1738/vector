import { createHash } from "node:crypto";
import { join, dirname, basename, relative, isAbsolute } from "node:path";
import { AuxError } from "@aux/contracts";
import type { CodingFileChange } from "@aux/contracts/coding-files";
import type { SubagentService } from "./subagents.js";
import type { CodingFilesService } from "./coding-files.js";
import { coderWorktreeChanges, retireCoderWorktree, type WorktreeAuthority } from "./coder-worktrees.js";
export type CoderWorktreeContext = {
  runId: string;
  actionId: string;
  actor?: "user";
  original?: () => Promise<void>;
};
type Context = CoderWorktreeContext;
const changeDigest = (changes: Awaited<ReturnType<typeof coderWorktreeChanges>>) =>
  createHash("sha256")
    .update(
      JSON.stringify(
        changes
          .map(({ path, hash, mode }) => ({ path, hash, mode }))
          .sort((left, right) => left.path.localeCompare(right.path)),
      ),
    )
    .digest("hex");
export class CoderWorktreeOperations {
  constructor(
    private readonly subagents: Pick<
      SubagentService,
      "worktreeFor" | "updateWorktree" | "recoveryFor" | "updateRecovery"
    >,
    private readonly files: CodingFilesService,
    private readonly authority: (context: Context) => WorktreeAuthority,
  ) {}
  private recovery(cellId: string, context: Context) {
    const recovery = this.subagents.recoveryFor(cellId, context.runId);
    const authority = this.authority(context);
    const child = relative(authority.directory, recovery.root);
    if (!child || child.includes("/") || child.startsWith("..") || isAbsolute(child))
      throw new AuxError("permission_denied", "Recovery must belong to an Aux-owned coder worktree.");
    if (recovery.archivedRoot) {
      const archive = relative(
        join(dirname(authority.directory), "coder-worktree-archives"),
        recovery.archivedRoot,
      );
      if (!archive.startsWith(`${basename(recovery.root)}-`) || archive.includes("/") || isAbsolute(archive))
        throw new AuxError("permission_denied", "The recovery archive is outside its owned directory.");
    }
    return { recovery, authority };
  }
  async inspectRecovery(cellId: string, context: Context) {
    const { recovery, authority } = this.recovery(cellId, context);
    let root = recovery.state === "archived" ? recovery.archivedRoot! : recovery.root;
    let inventory = await authority.inspect(root);
    let archiveOutcomeUnknown = false;
    if (!inventory.exists && recovery.state === "incomplete" && recovery.archivedRoot) {
      root = recovery.archivedRoot;
      inventory = await authority.inspect(root);
      archiveOutcomeUnknown = inventory.exists;
    }
    const digest = createHash("sha256").update(JSON.stringify(inventory)).digest("hex");
    let previewBudget = 256 * 1024;
    return {
      cellId,
      root,
      state: recovery.state,
      exists: inventory.exists,
      archiveOutcomeUnknown,
      digest,
      blockedPaths: inventory.blockedPaths,
      files: inventory.files.map((file) => {
        const bytes = file.contentBase64 === null ? undefined : Buffer.from(file.contentBase64, "base64");
        const text = bytes?.toString("utf8");
        const binary =
          bytes !== undefined &&
          text !== undefined &&
          (text.includes("\0") || !Buffer.from(text).equals(bytes));
        const preview = binary ? undefined : text?.slice(0, Math.min(8000, previewBudget));
        previewBudget -= preview?.length ?? 0;
        return {
          path: file.path,
          size: bytes?.length ?? 0,
          mode: file.mode,
          binary,
          preview,
        };
      }),
    };
  }
  async archiveRecovery(cellId: string, expectedDigest: string, context: Context) {
    const { recovery, authority } = this.recovery(cellId, context);
    if (recovery.state === "archived") return this.inspectRecovery(cellId, context);
    const inventory = await authority.inspect(recovery.root);
    if (!inventory.exists)
      throw new AuxError(
        "operation_uncertain",
        "The original partial worktree is absent. Inspect its recovery locations before continuing.",
      );
    if (inventory.blockedPaths.length)
      throw new AuxError(
        "permission_denied",
        "This worktree contains protected or linked paths. Its contents are preserved; review them outside the agent before archiving.",
      );
    const digest = createHash("sha256").update(JSON.stringify(inventory)).digest("hex");
    if (digest !== expectedDigest)
      throw new AuxError(
        "ref_stale",
        "The partial worktree changed. Inspect its current files before archiving.",
      );
    const archiveRoot = join(
      dirname(authority.directory),
      "coder-worktree-archives",
      `${basename(recovery.root)}-${digest.slice(0, 16)}`,
    );
    this.subagents.updateRecovery(cellId, { ...recovery, archivedRoot: archiveRoot });
    await authority.record(
      "coder_worktree_archive",
      {
        root: recovery.root,
        parentRoot: recovery.parentRoot,
        archiveRoot,
        digest,
        fileCount: inventory.files.length,
        files: inventory.files,
        directories: inventory.directories,
      },
      async () => {
        const current = await authority.inspect(recovery.root);
        if (createHash("sha256").update(JSON.stringify(current)).digest("hex") !== expectedDigest)
          throw new AuxError("ref_stale", "The partial worktree changed before archive dispatch.");
        await authority.git(recovery.parentRoot, ["worktree", "move", recovery.root, archiveRoot]);
        return { archiveRoot };
      },
    );
    this.subagents.updateRecovery(cellId, { ...recovery, state: "archived", archivedRoot: archiveRoot });
    return this.inspectRecovery(cellId, context);
  }
  async diff(cellId: string, context: Context) {
    const worktree = this.subagents.worktreeFor(cellId, context.runId);
    const changes = await coderWorktreeChanges(
      worktree,
      this.authority(context),
      worktree.integrationBatches?.flatMap((batch) =>
        batch.paths.map((path) => relative(worktree.parentRoot, path)),
      ),
    );
    return {
      cellId,
      baseCommit: worktree.baseCommit,
      changes: changes.map(({ path, bytes, expectedParentVersion, mode }) => {
        const text = bytes?.toString("utf8");
        const binary =
          bytes !== undefined &&
          text !== undefined &&
          (text.includes("\0") || !Buffer.from(text).equals(bytes));
        return {
          path,
          kind: bytes ? (expectedParentVersion ? "edit" : "create") : "delete",
          bytes: bytes?.length ?? 0,
          mode,
          binary,
          preview: binary ? undefined : text?.slice(0, 8000),
        };
      }),
    };
  }
  async integrate(cellId: string, context: Context) {
    let worktree = this.subagents.worktreeFor(cellId, context.runId);
    const changes = (
      await coderWorktreeChanges(
        worktree,
        this.authority(context),
        worktree.integrationBatches?.flatMap((batch) =>
          batch.paths.map((path) => relative(worktree.parentRoot, path)),
        ),
      )
    ).sort((left, right) => left.path.localeCompare(right.path));
    const batches = [...(worktree.integrationBatches ?? [])];
    const receipts = batches
      .map((batch) => this.files.receiptForAction(context.runId, batch.actionId))
      .filter((receipt): receipt is NonNullable<typeof receipt> => receipt !== undefined);
    const confirmed = new Map<string, string | null>();
    for (const receipt of receipts) {
      if (receipt.status === "pending" || receipt.status === "uncertain")
        return {
          cellId,
          integrated: false,
          receipt,
          receipts,
          recovery:
            "Reconcile this receipt with reconcile_file before continuing the preserved worktree integration.",
        };
      if (receipt.status !== "confirmed" && receipt.status !== "partially_applied") continue;
      for (const after of receipt.after) {
        if (
          receipt.status === "confirmed" ||
          receipt.fileOutcomes?.some(
            (outcome) => outcome.path === after.path && outcome.status === "confirmed",
          )
        )
          confirmed.set(after.path, after.version);
      }
    }
    const currentVersions = new Map(
      (await this.files.versions([...confirmed.keys()], { runId: context.runId })).map((state) => [
        state.path,
        state.version,
      ]),
    );
    const requested: CodingFileChange[] = [];
    for (const change of changes) {
      const path = join(worktree.parentRoot, change.path);
      let expectedVersion = change.expectedParentVersion;
      if (confirmed.has(path)) {
        const recorded = confirmed.get(path)!;
        if (currentVersions.get(path) !== recorded)
          throw new AuxError(
            "conflict",
            "A previously integrated parent file changed. Review it before continuing.",
          );
        if (change.desiredVersion === recorded) continue;
        expectedVersion = recorded ?? undefined;
      }
      if (!change.bytes) {
        // A new file reverted in the child before its batch applied has no
        // parent effect to undo. Confirmed creations use their recorded version.
        if (!expectedVersion && !confirmed.has(path)) continue;
        if (!expectedVersion)
          throw new AuxError("conflict", "The deleted file was absent from the original snapshot.");
        requested.push({ kind: "delete", path, expectedVersion });
      } else {
        const content = change.bytes.toString("base64"),
          encoding = "base64" as const,
          mode = change.mode;
        requested.push(
          expectedVersion
            ? { kind: "edit", path, expectedVersion, content, encoding, mode }
            : { kind: "create", path, content, encoding, mode },
        );
      }
    }
    // Every batch has its own exact approval and durable identity. A parked or
    // interrupted call resumes its matching batch without replaying prior writes.
    for (let offset = 0; offset < requested.length; offset += 100) {
      const batch = requested.slice(offset, offset + 100);
      const digest = createHash("sha256").update(JSON.stringify(batch)).digest("hex");
      const preserved = batches.find(
        (entry) => entry.digest === digest && !this.files.receiptForAction(context.runId, entry.actionId),
      );
      const actionId =
        preserved?.actionId ?? `${context.actionId}:batch:${offset / 100}:${digest.slice(0, 16)}`;
      if (!preserved) {
        batches.push({ actionId, digest, paths: batch.map((change) => change.path) });
        worktree = { ...worktree, integrated: false, integrationBatches: batches };
        this.subagents.updateWorktree(cellId, worktree);
      }
      let receipt;
      try {
        receipt = await this.files.applyChanges({ actionId, changes: batch }, { runId: context.runId });
      } catch (error) {
        if (error instanceof AuxError && error.code === "needs_input") throw error;
        receipt = this.files.receiptForAction(context.runId, actionId);
        if (!receipt) throw error;
        receipts.push(receipt);
        return {
          cellId,
          integrated: false,
          receipt,
          receipts,
          recovery:
            "Reconcile this receipt with reconcile_file. Confirmed earlier batches are preserved; integration will review only remaining changes.",
        };
      }
      receipts.push(receipt);
      if (receipt.status !== "confirmed")
        return {
          cellId,
          integrated: false,
          receipt,
          receipts,
          recovery:
            "Reconcile this receipt with reconcile_file, then call coder_worktree_integrate again. Aux verifies already confirmed files and reviews only remaining changes.",
        };
    }
    this.subagents.updateWorktree(cellId, {
      ...worktree,
      integrated: true,
      integratedDigest: changeDigest(changes),
      integrationBatches: batches,
    });
    return { cellId, integrated: true, receipt: receipts.at(-1), receipts };
  }
  async retire(cellId: string, context: Context) {
    const worktree = this.subagents.worktreeFor(cellId, context.runId);
    const authority = this.authority(context);
    const changes = await coderWorktreeChanges(
      worktree,
      authority,
      worktree.integrationBatches?.flatMap((batch) =>
        batch.paths.map((path) => relative(worktree.parentRoot, path)),
      ),
    );
    if (!worktree.integrated || worktree.integratedDigest !== changeDigest(changes))
      throw new AuxError("conflict", "Integrate the current worktree changes before retiring it.");
    return { cellId, retired: await retireCoderWorktree(worktree, authority) };
  }
}
