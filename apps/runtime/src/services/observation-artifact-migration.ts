import { randomUUID } from "node:crypto";
import { chmodSync, renameSync, rmSync } from "node:fs";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { basename, relative, sep } from "node:path";
import { ObservationSchema } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { observationEvidence } from "./observation-evidence.js";

const inFlight = new WeakMap<Repo, Promise<number>>();

export function minimizedObservationArtifactBytes(
  row: { path: string; pageId: string | null; mediaType: string }, original: Buffer,
): Buffer | undefined {
  if (row.mediaType !== "application/json" || !/-observation-r\d+\.json$/.test(basename(row.path))) return undefined;
  if (original.length > 4 * 1024 * 1024) throw new Error("An observation artifact is too large to minimize.");
  let parsed: unknown;
  try { parsed = JSON.parse(original.toString("utf8")); }
  catch { throw new Error("A saved observation artifact is not valid JSON."); }
  const observation = ObservationSchema.safeParse(parsed);
  if (!observation.success || observation.data.pageId !== row.pageId)
    throw new Error("A saved observation artifact does not match its page.");
  return Buffer.from(JSON.stringify(observationEvidence(observation.data)));
}

/** Minimize observation artifacts written before Aux stopped saving interactive page state. */
export function minimizeLegacyObservationArtifacts(repo: Repo, artifactRoot: string): Promise<number> {
  const existing = inFlight.get(repo);
  if (existing) return existing;
  const work = async () => {
    await mkdir(artifactRoot, { recursive: true, mode: 0o700 });
    const root = await realpath(artifactRoot);
    const rows = repo.db.prepare(`SELECT artifact_id AS artifactId,page_id AS pageId,path,size
      FROM artifacts WHERE status='complete' AND media_type='application/json' AND path LIKE '%-observation-r%.json'`)
      .all() as { artifactId: string; pageId: string | null; path: string; size: number }[];
    let changed = 0;
    let processed = 0;
    for (const row of rows) {
      if (!/-observation-r\d+\.json$/.test(basename(row.path))) continue;
      let source: string;
      try { source = await realpath(row.path); }
      catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") continue; throw error; }
      const rel = relative(root, source);
      if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error("An observation artifact is outside the Aux artifact folder.");
      const info = await lstat(row.path);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 4 * 1024 * 1024)
        throw new Error("An observation artifact is invalid or too large to minimize.");
      const original = await readFile(row.path);
      const minimized = minimizedObservationArtifactBytes({ ...row, mediaType: "application/json" }, original)!;
      const current = repo.getArtifact(row.artifactId);
      if (!current || current.path !== row.path) continue;
      if (!original.equals(minimized)) {
        const temporary = `${row.path}.${randomUUID()}.tmp`;
        try {
          await writeFile(temporary, minimized, { mode: 0o600 });
          chmodSync(temporary, 0o600);
          if (repo.getArtifact(row.artifactId)?.path !== row.path) continue;
          renameSync(temporary, row.path);
          changed++;
        } finally { rmSync(temporary, { force: true }); }
      }
      if (current.size !== minimized.length)
        repo.db.prepare("UPDATE artifacts SET size=? WHERE artifact_id=?").run(minimized.length, row.artifactId);
      // Yield to foreground browsing when an older profile contains many runs.
      if (++processed % 20 === 0) await new Promise<void>(resolve => setImmediate(resolve));
    }
    return changed;
  };
  const pending = work();
  inFlight.set(repo, pending);
  void pending.then(() => inFlight.delete(repo), () => inFlight.delete(repo));
  return pending;
}
