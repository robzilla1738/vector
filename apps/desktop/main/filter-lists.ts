import { mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { Worker } from "node:worker_threads";
import {
  filterSourceUrl, MAX_FILTER_BYTES, MAX_FILTER_HOSTS, MAX_FILTER_SOURCES, parseHostsList,
  type FilterSourceDefinition,
} from "@aux/contracts";
export { parseHostsList } from "@aux/contracts";

/**
 * Maintained ad/tracker filter lists. Sources are fetched over HTTP, cached to
 * disk atomically, and merged with the built-in seed set at load — so blocking
 * works on first run and offline, and an update either lands whole or not at
 * all. Hosts-format only: `0.0.0.0 host`, `127.0.0.1 host`, or bare `host`.
 */

export type FilterSource = FilterSourceDefinition;
interface SourceMeta { fetchedAt: number; etag?: string; hosts: number; sha256: string; error?: string }
export interface FilterListStatus {
  sources: (FilterSource & { meta?: SourceMeta })[];
  hosts: number;
  builtinHosts: number;
  backend: "electron_web_request";
}

const sourceId = (url: string) => createHash("sha256").update(url).digest("hex").slice(0, 12);
const validId = (id: string) => /^[a-f0-9]{12}$/.test(id);

export class FilterLists {
  readonly dir: string;
  private readonly sourcesFile: string;

  constructor(dataDir: string) {
    this.dir = join(dataDir, "filters");
    this.sourcesFile = join(this.dir, "sources.json");
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
  }

  sources(): FilterSource[] {
    try {
      const parsed = JSON.parse(readFileSync(this.sourcesFile, "utf8")) as FilterSource[];
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_FILTER_SOURCES).flatMap(s => {
          if (!s || typeof s.id !== "string" || !validId(s.id) || typeof s.url !== "string") return [];
          try {
            const url = filterSourceUrl(s.url);
            if (sourceId(url) !== s.id) return [];
            return [{ id: s.id, name: String(s.name ?? s.id).slice(0, 120), url, enabled: s.enabled !== false }];
          } catch { return []; }
        });
      }
    } catch { /* no configured sources yet */ }
    return [];
  }

  saveSources(sources: FilterSource[]) {
    const temp = `${this.sourcesFile}.tmp`;
    writeFileSync(temp, JSON.stringify(sources, null, 2), { mode: 0o600 });
    renameSync(temp, this.sourcesFile);
  }

  addSource(name: string, url: string): FilterSource[] {
    url = filterSourceUrl(url);
    const sources = this.sources();
    if (sources.length >= MAX_FILTER_SOURCES) throw new Error("Remove a filter list before adding another.");
    const id = sourceId(url);
    if (sources.some(s => s.id === id || s.url === url)) throw new Error("That filter list is already added.");
    sources.push({ id, name: name.trim().slice(0, 120) || new URL(url).hostname, url, enabled: true });
    this.saveSources(sources);
    return sources;
  }

  removeSource(id: string): FilterSource[] {
    if (!validId(id) || !this.sources().some(source => source.id === id)) throw new Error("Choose a saved filter list.");
    const sources = this.sources().filter(s => s.id !== id);
    this.saveSources(sources);
    rmSync(this.listPath(id), { force: true });
    rmSync(this.metaPath(id), { force: true });
    return sources;
  }

  setEnabled(id: string, enabled: boolean): FilterSource[] {
    if (!validId(id) || typeof enabled !== "boolean") throw new Error("Choose a saved filter list state.");
    const sources = this.sources();
    const current = sources.find(source => source.id === id);
    if (!current) throw new Error("Choose a saved filter list.");
    current.enabled = enabled;
    this.saveSources(sources);
    return sources;
  }

  private listPath(id: string) { return join(this.dir, `${id}.txt`); }
  private metaPath(id: string) { return join(this.dir, `${id}.meta.json`); }
  meta(id: string): SourceMeta | undefined {
    try { return JSON.parse(readFileSync(this.metaPath(id), "utf8")) as SourceMeta; }
    catch { return undefined; }
  }

  /**
   * `loadHosts` on a worker thread: multi-megabyte lists parse without
   * blocking the main process. Resolves to the merged hosts, newline-joined.
   */
  loadHostsOffThread(): Promise<string[]> {
    const paths = this.sources().filter(source => source.enabled).map(source => this.listPath(source.id));
    if (!paths.length) return Promise.resolve([]);
    const source = `const { parentPort, workerData } = require("node:worker_threads");
const { readFileSync, statSync } = require("node:fs");
const parse = (${parseHostsList.toString()});
const hosts = new Set();
for (const path of workerData.paths) {
  let text; try { if(statSync(path).size>workerData.bytes)continue;text = readFileSync(path, "utf8"); } catch { continue; }
  for (const host of parse(text, workerData.max)) { hosts.add(host); if (hosts.size >= workerData.max) break; }
  if (hosts.size >= workerData.max) break;
}
parentPort.postMessage([...hosts].join("\\n"));`;
    return new Promise((resolve, reject) => {
      const worker = new Worker(source, { eval: true, workerData: { paths, max: MAX_FILTER_HOSTS, bytes: MAX_FILTER_BYTES } });
      worker.once("message", (joined: string) => { resolve(joined ? joined.split("\n") : []); void worker.terminate(); });
      worker.once("error", reject);
      worker.once("exit", code => { if (code !== 0) reject(new Error(`filter list worker exited with ${code}`)); });
    });
  }

  /** Merged hosts from every enabled, downloaded list — safe at startup. */
  loadHosts(): Set<string> {
    const hosts = new Set<string>();
    for (const source of this.sources()) {
      if (!source.enabled) continue;
      try {
        if (statSync(this.listPath(source.id)).size > MAX_FILTER_BYTES) continue;
        for (const host of parseHostsList(readFileSync(this.listPath(source.id), "utf8"))) {
          hosts.add(host);
          if (hosts.size >= MAX_FILTER_HOSTS) return hosts;
        }
      } catch { /* list not downloaded yet — the built-in seed still applies */ }
    }
    return hosts;
  }

  /**
   * Fetch every enabled source with its cached etag; each accepted response is
   * validated, bounded and committed atomically so a bad fetch keeps the old
   * list. Returns per-source status for the Settings surface.
   */
  async update(fetchText: (url: string, etag?: string) => Promise<{ status: number; etag?: string; text: () => Promise<string> }>): Promise<FilterListStatus> {
    for (const source of this.sources()) {
      if (!source.enabled) continue;
      const prior = this.meta(source.id);
      try {
        const response = await fetchText(source.url, prior?.etag);
        if (response.status === 304) {
          if (!prior?.sha256 || !statSync(this.listPath(source.id), { throwIfNoEntry: false }))
            throw new Error("The cached filter list is unavailable; download a full copy.");
          this.writeMeta(source.id, { ...prior!, fetchedAt: Date.now(), etag: prior?.etag, hosts: prior?.hosts ?? 0, sha256: prior?.sha256 ?? "" });
          continue;
        }
        if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (Buffer.byteLength(text, "utf8") > MAX_FILTER_BYTES) throw new Error("The list is too large to use safely.");
        const hosts = parseHostsList(text);
        if (!hosts.size) throw new Error("The download did not look like a hosts filter list.");
        const sha256 = createHash("sha256").update(text).digest("hex");
        if (sha256 !== prior?.sha256) {
          const temp = `${this.listPath(source.id)}.tmp`;
          writeFileSync(temp, text, { mode: 0o600 });
          renameSync(temp, this.listPath(source.id));
        }
        this.writeMeta(source.id, { fetchedAt: Date.now(), etag: response.etag ?? prior?.etag, hosts: hosts.size, sha256 });
      } catch (error) {
        this.writeMeta(source.id, { ...(prior ?? { fetchedAt: 0, hosts: 0, sha256: "" }), error: error instanceof Error ? error.message : String(error) });
      }
    }
    return this.status(0);
  }

  private writeMeta(id: string, meta: SourceMeta) {
    const temp = `${this.metaPath(id)}.tmp`;
    writeFileSync(temp, JSON.stringify(meta), { mode: 0o600 });
    renameSync(temp, this.metaPath(id));
  }

  status(builtinHosts: number): FilterListStatus {
    const sources = this.sources().map(s => ({ ...s, meta: this.meta(s.id) }));
    return { sources, hosts: sources.reduce((n, s) => n + (s.enabled ? s.meta?.hosts ?? 0 : 0), 0),
      builtinHosts, backend: "electron_web_request" };
  }
}
