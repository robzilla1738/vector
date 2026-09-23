import { realpathSync } from "node:fs";
import { isAbsolute, relative, sep } from "node:path";

/** Files that `shell.openPath` would run or hand to an interpreter instead of showing. */
const LAUNCHABLE = /\.(app|command|sh|bash|zsh|csh|fish|tool|terminal|pkg|mpkg|scpt|scptd|applescript|workflow|action|jar|exe|bat|cmd|msi|ps1|vbs|py|rb|pl|php|webloc|inetloc|fileloc|desktop)$/i;

const within = (path: string, root: string) => {
  const rel = relative(root, path);
  return rel === "" || (!!rel && !rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
};

const real = (path: string) => {
  try { return realpathSync(path); } catch { return null; }
};

/**
 * The shell may open a file only when it lives under an Aux-owned root
 * (data dir: artifacts, projects, reviews, incidents; the download folders)
 * and is a document rather than something macOS would execute. Symlinks are
 * resolved first so a link inside a root cannot point outside it.
 */
export function openablePath(path: unknown, roots: string[]): string | null {
  if (typeof path !== "string" || !path || !isAbsolute(path)) return null;
  const target = real(path);
  if (!target || LAUNCHABLE.test(target)) return null;
  const allowed = roots.map(real).filter((root): root is string => !!root);
  return allowed.some(root => within(target, root)) ? target : null;
}
