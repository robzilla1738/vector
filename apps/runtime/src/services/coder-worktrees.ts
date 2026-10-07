import { createHash, randomUUID } from "node:crypto";
import { join, relative, isAbsolute } from "node:path";
import { z } from "zod";
import type { WorktreeFile } from "./coder-worktree-worker.js";
import { AuxError, type CoderWorktree } from "@aux/contracts";
export type WorktreeAuthority = {
  directory: string;
  inspect(
    root: string,
  ): Promise<{ exists: boolean; files: WorktreeFile[]; directories: string[]; blockedPaths: string[] }>;
  snapshot(root: string, paths: string[]): Promise<WorktreeFile[]>;
  copy(root: string, files: WorktreeFile[]): Promise<void>;
  read(path: string): Promise<{ bytes: Buffer; version: string } | undefined>;
  write(path: string, bytes: Buffer | undefined): Promise<void>;
  git(root: string, args: string[]): Promise<string>;
  record<T>(operation: string, input: Record<string, unknown>, perform: () => Promise<T>): Promise<T>;
};
const BaselineFilesSchema = z.array(
  z
    .object({
      path: z
        .string()
        .min(1)
        .refine((path) => !isAbsolute(path) && !path.split("/").includes("..")),
      version: z.string().optional(),
      hash: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .nullable(),
    })
    .strict(),
);
export const CoderBaselineSchema = z
  .object({ baseCommit: z.string(), snapshotDigest: z.string(), files: BaselineFilesSchema })
  .strict();
const forbidden = /(^|\/)(\.env(?:\..*)?|\.npmrc|\.netrc|\.git|credentials?|cookies?|vault)(\/|$)/i;

/** Every callback must use the filesystem/process sandbox and the run's current authority. */
export async function createCoderWorktree(
  parentRoot: string,
  authority: WorktreeAuthority,
  identity: string = randomUUID(),
): Promise<CoderWorktree> {
  const top = (await authority.git(parentRoot, ["rev-parse", "--show-toplevel"])).trim();
  if (top !== parentRoot)
    throw new AuxError("invalid_params", "Attach the Git project root before spawning a coder.");
  const baseCommit = (await authority.git(parentRoot, ["rev-parse", "HEAD"])).trim();
  const paths = (
    await authority.git(parentRoot, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter(Boolean);
  const changed = new Set(
    (await authority.git(parentRoot, ["diff", "--name-only", "-z", "HEAD"])).split("\0").filter(Boolean),
  );
  const files = await authority.snapshot(parentRoot, [...new Set([...paths, ...changed])]);
  const snapshot = createHash("sha256").update(baseCommit);
  for (const file of files)
    snapshot
      .update(file.path)
      .update(file.contentBase64 ?? "deleted")
      .update(String(file.mode));
  const snapshotDigest = snapshot.digest("hex");
  const root = join(authority.directory, identity);
  return authority.record(
    "coder_worktree_create",
    { parentRoot, root, baseCommit, snapshotDigest },
    async () => {
      await authority.git(parentRoot, ["worktree", "add", "--detach", "--no-checkout", root, baseCommit]);
      await authority.copy(root, files);
      await authority.write(
        join(root, ".aux-coder-baseline.json"),
        Buffer.from(
          JSON.stringify({
            baseCommit,
            snapshotDigest,
            files: files.map((file) => ({
              path: file.path,
              version: file.version ?? undefined,
              hash:
                file.contentBase64 === null
                  ? null
                  : createHash("sha256")
                      .update(Buffer.from(file.contentBase64, "base64"))
                      .update(String(file.mode))
                      .digest("hex"),
            })),
          }),
        ),
      );
      return { root, parentRoot, baseCommit, snapshotDigest, integrated: false };
    },
  );
}
export async function coderWorktreeChanges(
  worktree: CoderWorktree,
  authority: WorktreeAuthority,
  previouslyIntegratedPaths: string[] = [],
) {
  const baselineFile = await authority.read(join(worktree.root, ".aux-coder-baseline.json"));
  if (!baselineFile) throw new AuxError("conflict", "The coder snapshot baseline is unavailable.");
  const baseline = CoderBaselineSchema.parse(JSON.parse(baselineFile.bytes.toString("utf8"))).files;
  const paths = (
    await authority.git(worktree.root, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter((path) => path && path !== ".aux-coder-baseline.json");
  const originals = new Map(baseline.map((entry) => [entry.path, entry]));
  const changes = [];
  const files = await authority.snapshot(worktree.root, [
    ...new Set([...paths, ...originals.keys(), ...previouslyIntegratedPaths]),
  ]);
  for (const current of files) {
    const path = current.path;
    if (forbidden.test(path)) continue;
    const bytes = current.contentBase64 === null ? undefined : Buffer.from(current.contentBase64, "base64");
    const hash = bytes ? createHash("sha256").update(bytes).update(String(current.mode)).digest("hex") : null;
    const original = originals.get(path);
    if (hash !== (original?.hash ?? null) || previouslyIntegratedPaths.includes(path))
      changes.push({
        path,
        expectedParentVersion: original?.version,
        desiredVersion: current.version,
        bytes,
        mode: current.mode,
        hash,
      });
  }
  return changes;
}
export async function retireCoderWorktree(
  worktree: CoderWorktree,
  authority: WorktreeAuthority,
): Promise<boolean> {
  if (!worktree.integrated) return false;
  const within = relative(authority.directory, worktree.root);
  if (!within || within.startsWith("..") || isAbsolute(within))
    throw new AuxError("permission_denied", "This worktree is not owned by Aux.");
  await authority.record("coder_worktree_retire", { root: worktree.root }, async () => {
    await authority.git(worktree.parentRoot, ["worktree", "remove", "--force", worktree.root]);
  });
  return true;
}
