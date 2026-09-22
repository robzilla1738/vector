import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

/**
 * Maintained ad/tracker filter lists. Sources are fetched over HTTP, cached to
 * disk atomically, and merged with the built-in seed set at load — so blocking
 * works on first run and offline, and an update either lands whole or not at
 * all. Hosts-format only: `0.0.0.0 host`, `127.0.0.1 host`, or bare `host`.
 */

export interface FilterSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}
interface SourceMeta { fetchedAt: number; etag?: string; hosts: number; sha256: string; error?: string }
export interface FilterListStatus {
  sources: (FilterSource & { meta?: SourceMeta })[];
  hosts: number;
  builtinHosts: number;
}

const MAX_BYTES = 16 * 1024 * 1024;
const MAX_HOSTS = 400_000;
const HOST_RE = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?)+$/;

export function parseHostsList(text: string): Set<string> {
  const hosts = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#")[0]!.trim().toLowerCase();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const host = parts.length > 1 && /^(0\.0\.0\.0|127\.0\.0\.1|255\.255\.255\.255|::1|fe80::|ip6-)/.test(parts[0]!)
      ? parts[1]!
      : parts[0]!;
    if (!host || host === "localhost" || host.endsWith(".localhost") || host === "local" || host === "broadcasthost") continue;
    if (HOST_RE.test(host)) hosts.add(host);
    if (hosts.size >= MAX_HOSTS) break;
  }
  return hosts;
}

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
        return parsed.filter(s => s && typeof s.id === "string" && typeof s.url === "string" && s.url.startsWith("https://"))
          .map(s => ({ id: s.id, name: String(s.name ?? s.id), url: s.url, enabled: s.enabled !== false }));
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
    if (!url.startsWith("https://")) throw new Error("Filter lists must download over HTTPS.");
    const sources = this.sources();
    const id = createHash("sha256").update(url).digest("hex").slice(0, 12);
    if (sources.some(s => s.id === id || s.url === url)) throw new Error("That filter list is already added.");
    sources.push({ id, name: name.trim() || new URL(url).hostname, url, enabled: true });
    this.saveSources(sources);
    return sources;
  }

  removeSource(id: string): FilterSource[] {
    const sources = this.sources().filter(s => s.id !== id);
    this.saveSources(sources);
    rmSync(this.listPath(id), { force: true });
    rmSync(this.metaPath(id), { force: true });
    return sources;
  }

  private listPath(id: string) { return join(this.dir, `${id}.txt`); }
  private metaPath(id: string) { return join(this.dir, `${id}.meta.json`); }
  meta(id: string): SourceMeta | undefined {
    try { return JSON.parse(readFileSync(this.metaPath(id), "utf8")) as SourceMeta; }
    catch { return undefined; }
  }

  /** Merged hosts from every enabled, downloaded list — safe at startup. */
  loadHosts(): Set<string> {
    const hosts = new Set<string>();
    for (const source of this.sources()) {
      if (!source.enabled) continue;
      try {
        for (const host of parseHostsList(readFileSync(this.listPath(source.id), "utf8"))) {
          hosts.add(host);
          if (hosts.size >= MAX_HOSTS) return hosts;
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
          this.writeMeta(source.id, { ...prior!, fetchedAt: Date.now(), etag: prior?.etag, hosts: prior?.hosts ?? 0, sha256: prior?.sha256 ?? "" });
          continue;
        }
        if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (text.length > MAX_BYTES) throw new Error("The list is too large to use safely.");
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
    return { sources, hosts: sources.reduce((n, s) => n + (s.enabled ? s.meta?.hosts ?? 0 : 0), 0), builtinHosts };
  }
}
