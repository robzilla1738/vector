import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { AuxError } from "@aux/contracts";
import type { WorktreeFile } from "./coder-worktree-worker.js";
import type { CodingFileState } from "@aux/contracts/coding-files";
import type { Repo } from "../store/repo.js";
import type { FilesystemAccessService } from "./filesystem-access.js";
import { filesystemSeatbelt } from "./filesystem-policy.js";
import { createCoderWorktree, CoderBaselineSchema, type WorktreeAuthority } from "./coder-worktrees.js";
const execute = promisify(execFile);

export function worktreeAuthority(options: {
  repo: Repo;
  filesystem: FilesystemAccessService;
  directory: string;
  projectRoot?: string;
  runId: string;
  checkOwner(): void;
  checkOriginal?: () => Promise<void>;
  authorize(actionId: string, details: unknown[]): Promise<void | (() => void)>;
}): WorktreeAuthority {
  const context = options;
  let fence: (() => void) | undefined;
  const checkOwner = () => {
    context.checkOwner();
    fence?.();
  };
  const state = (path: string) =>
    options.filesystem.coding<CodingFileState>({ kind: "read", path }, options.runId);
  return {
    directory: options.directory,
    inspect: async (root) => {
      await options.checkOriginal?.();
      const access = await options.authorize(createHash("sha256").update(`inspect:${root}`).digest("hex"), [
        "coder_worktree_inspect",
        { root },
      ]);
      await options.checkOriginal?.();
      checkOwner();
      if (typeof access === "function") access();
      const result = await options.filesystem.coding<{
        exists: boolean;
        files: WorktreeFile[];
        directories: string[];
        blockedPaths: string[];
      }>({ kind: "worktree_inspect", root }, options.runId);
      await options.checkOriginal?.();
      checkOwner();
      if (typeof access === "function") access();
      return result;
    },
    snapshot: async (root, paths) => {
      checkOwner();
      return options.filesystem.coding<WorktreeFile[]>(
        { kind: "worktree_snapshot", root, paths },
        options.runId,
      );
    },
    copy: async (root, files) => {
      checkOwner();
      await options.filesystem.coding({ kind: "worktree_copy", root, files }, options.runId);
    },
    read: async (path) => {
      checkOwner();
      const file = await state(path);
      return file.content === null || file.version === null
        ? undefined
        : { bytes: Buffer.from(file.content), version: file.version };
    },
    write: async (path, bytes) => {
      checkOwner();
      const before = await state(path);
      if (!bytes && before.version === null) return;
      const content = bytes?.toString("utf8") ?? null;
      const mode = before.mode ?? 0o600;
      const after = {
        path,
        content,
        mode,
        version: bytes
          ? createHash("sha256")
              .update(JSON.stringify([content, mode]))
              .digest("hex")
          : null,
      };
      await options.filesystem.coding(
        { kind: "apply", path, before: [before], after: [after] },
        options.runId,
      );
    },
    git: async (root, args) => {
      await options.checkOriginal?.();
      checkOwner();
      const permitted = ["rev-parse", "ls-files", "diff", "worktree"].includes(args[0] ?? "");
      if (!permitted) throw new AuxError("permission_denied", "This internal Git operation is unavailable.");
      const base = options.filesystem.codingPolicy(options.runId);
      const archives = join(options.directory, "..", "coder-worktree-archives");
      const policy = {
        ...base,
        deniedRoots: base.deniedRoots.filter(
          (path) => path !== join(root, ".git") && path !== join(options.projectRoot ?? root, ".git"),
        ),
        readRoots: [...base.readRoots, options.directory, archives],
        writeRoots: [join(root, ".git"), options.directory, archives],
        internalRoots: [...base.internalRoots, options.directory, archives],
      };
      if (args[0] === "worktree" && args[1] === "move")
        await options.filesystem.coding(
          { kind: "worktree_archive_directory", root: archives },
          options.runId,
        );
      await options.checkOriginal?.();
      checkOwner();
      const result = await execute(
        "/usr/bin/sandbox-exec",
        [
          "-p",
          filesystemSeatbelt(policy, false),
          "/usr/bin/git",
          "-c",
          "core.hooksPath=/dev/null",
          "-c",
          "core.fsmonitor=false",
          "-c",
          "protocol.file.allow=never",
          "-C",
          root,
          ...args,
        ],
        {
          maxBuffer: 16 * 1024 * 1024,
          encoding: "utf8",
          env: {
            PATH: "/usr/bin:/bin",
            HOME: options.directory,
            GIT_CONFIG_NOSYSTEM: "1",
            GIT_CONFIG_GLOBAL: "/dev/null",
            GIT_TERMINAL_PROMPT: "0",
          },
        },
      );
      checkOwner();
      return result.stdout;
    },
    record: async (operation, input, perform) => {
      const actionId = createHash("sha256")
        .update(JSON.stringify([operation, input.root]))
        .digest("hex");
      const existing = options.repo.db
        .prepare("SELECT state,body FROM coder_worktree_receipts WHERE action_id=?")
        .get(actionId) as { state: string; body: string } | undefined;
      if (existing) {
        const saved = JSON.parse(
          options.repo.revealRecordField("coder_worktree_receipts", [actionId], "body", existing.body),
        );
        if (existing.state === "confirmed") return saved.result;
        if (operation === "coder_worktree_create") {
          try {
            const root = String(saved.input.root);
            const baselineState = await state(join(root, ".aux-coder-baseline.json"));
            if (baselineState.content !== null) {
              const baseline = CoderBaselineSchema.parse(JSON.parse(baselineState.content));
              const head = (
                await execute(
                  "/usr/bin/sandbox-exec",
                  [
                    "-p",
                    filesystemSeatbelt(
                      {
                        ...options.filesystem.codingPolicy(options.runId),
                        deniedRoots: options.filesystem
                          .codingPolicy(options.runId)
                          .deniedRoots.filter(
                            (path) => path !== join(String(saved.input.parentRoot), ".git"),
                          ),
                        readRoots: [root, String(saved.input.parentRoot)],
                        writeRoots: [],
                      },
                      false,
                    ),
                    "/usr/bin/git",
                    "-c",
                    "core.hooksPath=/dev/null",
                    "-C",
                    root,
                    "rev-parse",
                    "HEAD",
                  ],
                  {
                    encoding: "utf8",
                    env: { PATH: "/usr/bin:/bin", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" },
                  },
                )
              ).stdout.trim();
              const files = await options.filesystem.coding<WorktreeFile[]>(
                { kind: "worktree_snapshot", root, paths: baseline.files.map((file) => file.path) },
                options.runId,
              );
              const hash = createHash("sha256").update(head);
              for (const file of files)
                hash
                  .update(file.path)
                  .update(file.contentBase64 ?? "deleted")
                  .update(String(file.mode));
              if (
                head === saved.input.baseCommit &&
                baseline.snapshotDigest === saved.input.snapshotDigest &&
                hash.digest("hex") === baseline.snapshotDigest
              ) {
                const result = {
                  root,
                  parentRoot: String(saved.input.parentRoot),
                  baseCommit: head,
                  snapshotDigest: baseline.snapshotDigest,
                  integrated: false,
                };
                const body = options.repo.protectRecordField(
                  "coder_worktree_receipts",
                  [actionId],
                  "body",
                  JSON.stringify({ ...saved, result }),
                );
                options.repo.db
                  .prepare("UPDATE coder_worktree_receipts SET state='confirmed',body=? WHERE action_id=?")
                  .run(body, actionId);
                return result;
              }
            }
          } catch (error) {
            if (error instanceof AuxError && ["permission_denied", "cancelled"].includes(error.code))
              throw error;
          }
        }
        throw new AuxError(
          "operation_uncertain",
          "The original worktree has an incomplete snapshot. Inspect or archive its preserved files before continuing.",
          operation === "coder_worktree_create"
            ? { worktreeRecovery: { ...saved.input, actionId, state: "incomplete" } }
            : { actionId },
        );
      }
      const authorized = await options.authorize(actionId, [operation, input]);
      if (typeof authorized === "function") fence = authorized;
      await options.checkOriginal?.();
      checkOwner();
      const save = (state: string, result?: unknown) => {
        const body = options.repo.protectRecordField(
          "coder_worktree_receipts",
          [actionId],
          "body",
          JSON.stringify({ operation, input, result }),
        );
        options.repo.db
          .prepare(
            "INSERT INTO coder_worktree_receipts VALUES(?,?,?,?) ON CONFLICT(action_id) DO UPDATE SET state=excluded.state,body=excluded.body",
          )
          .run(actionId, options.runId, state, body);
      };
      save("pending");
      try {
        const result = await perform();
        save("confirmed", result);
        return result;
      } catch (error) {
        save("uncertain");
        if (operation === "coder_worktree_create") {
          const uncertain = new AuxError(
            "operation_uncertain",
            "Coder worktree creation was interrupted. Its files are preserved for inspection and recovery.",
            { worktreeRecovery: { ...input, actionId, state: "incomplete" } },
          );
          uncertain.cause = error;
          throw uncertain;
        }
        throw error;
      }
    },
  };
}
export async function startCoderWorktree(
  options: Parameters<typeof worktreeAuthority>[0],
  root: string,
  identity: string,
) {
  return createCoderWorktree(root, worktreeAuthority(options), identity);
}
