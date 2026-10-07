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
    .update(JSON.stringify(changes.map(({ path, hash, mode }) => ({ path, hash, mode }))))
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
    const changes = await coderWorktreeChanges(worktree, this.authority(context));
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
    const worktree = this.subagents.worktreeFor(cellId, context.runId);
    const changes = await coderWorktreeChanges(worktree, this.authority(context));
    const requested: CodingFileChange[] = changes.map((change) => {
      const path = join(worktree.parentRoot, change.path);
      if (!change.bytes) {
        if (!change.expectedParentVersion)
          throw new AuxError("conflict", "The deleted file was absent from the original snapshot.");
        return { kind: "delete", path, expectedVersion: change.expectedParentVersion };
      }
      const content = change.bytes.toString("base64"),
        encoding = "base64" as const,
        mode = change.mode;
      return change.expectedParentVersion
        ? { kind: "edit", path, expectedVersion: change.expectedParentVersion, content, encoding, mode }
        : { kind: "create", path, content, encoding, mode };
    });
    const receipts = requested.length
      ? await this.files.applyChanges(
          { actionId: context.actionId, changes: requested },
          { runId: context.runId },
        )
      : undefined;
    if (receipts && receipts.status !== "confirmed")
      return {
        cellId,
        integrated: false,
        receipt: receipts,
        recovery:
          "Inspect current parent files, reconcile_file using this receiptId, then integrate only the remaining changed files. The child worktree is retained.",
      };
    this.subagents.updateWorktree(cellId, {
      ...worktree,
      integrated: true,
      integratedDigest: changeDigest(changes),
    });
    return { cellId, integrated: true, receipt: receipts };
  }
  async retire(cellId: string, context: Context) {
    const worktree = this.subagents.worktreeFor(cellId, context.runId);
    const authority = this.authority(context);
    const changes = await coderWorktreeChanges(worktree, authority);
    if (!worktree.integrated || worktree.integratedDigest !== changeDigest(changes))
      throw new AuxError("conflict", "Integrate the current worktree changes before retiring it.");
    return { cellId, retired: await retireCoderWorktree(worktree, authority) };
  }
}
