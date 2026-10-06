import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import type { FilesystemPolicy } from "../../apps/runtime/dist/services/filesystem-policy.js";
const canonical = (path: string) => {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
};
export function fixtureFilesystemPolicy(
  read: string[],
  write = read,
  denied: string[] = [],
): FilesystemPolicy {
  return {
    mode: "guard",
    revision: 0,
    readRoots: read.map(canonical),
    writeRoots: write.map(canonical),
    internalRoots: write.map(canonical),
    deniedRoots: denied.map(canonical),
    protectedRoots: [],
  };
}
