import { join } from "node:path";
import type { CoderWorktree } from "@aux/contracts";
import type { FilesystemPolicy } from "./filesystem-policy.js";

/** The child receives no shared artifacts or sibling worktree filesystem authority. */
export function coderWorktreePolicy(
  policy: FilesystemPolicy,
  worktree: CoderWorktree,
  owned: { scratch: string; artifacts: string },
): FilesystemPolicy {
  const internalRoots = [worktree.root, owned.scratch, owned.artifacts];
  return {
    ...policy,
    internalRoots,
    readRoots: internalRoots,
    writeRoots: internalRoots,
    deniedRoots: [
      ...policy.deniedRoots,
      join(worktree.root, ".git"),
      join(worktree.root, ".aux-coder-baseline.json"),
      worktree.parentRoot,
    ],
  };
}
