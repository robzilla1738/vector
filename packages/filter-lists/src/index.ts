import { mkdirSync, readFileSync, statSync } from "node:fs";
import { readFile, open, rename, readdir, unlink, stat } from "node:fs/promises";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import {
  filterSourceUrl,
  MAX_FILTER_BYTES,
  MAX_FILTER_SNAPSHOT_BYTES,
  MAX_FILTER_SOURCES,
  type FilterSourceKind,
  type FilterSourceDefinition,
  type ContentBlockSource,
  type ChromiumContentBlockReceipt,
} from "@aux/contracts";
import { BUNDLED_FILTER_SOURCES } from "@aux/contracts/filter-defaults.generated";
export type FilterSource = FilterSourceDefinition;
export interface SourceMeta {
  fetchedAt: number;
  etag?: string;
  bytes: number;
  sha256: string;
  error?: string;
}
export interface FilterListStatus {
  sources: (FilterSource & { meta?: SourceMeta })[];
  backend: ChromiumContentBlockReceipt["backend"] | "unavailable";
  engineVersion?: ChromiumContentBlockReceipt["engineVersion"];
  cosmeticBackend: ChromiumContentBlockReceipt["cosmeticBackend"] | "unavailable";
}
export interface BlockingState {
  generation: number;
  enabled: boolean;
  allowedSiteHosts: string[];
  sources: (FilterSource & { meta?: SourceMeta })[];
  receipt?: ChromiumContentBlockReceipt;
}
export interface PreparedFilters {
  state: BlockingState;
  sources: ContentBlockSource[];
}
export interface FilterResponse {
  status: number;
  etag?: string;
  text(): Promise<string>;
}
export type FetchFilter = (url: string, etag?: string, signal?: AbortSignal) => Promise<FilterResponse>;
export const sourceId = (url: string) => createHash("sha256").update(url).digest("hex").slice(0, 12);
const digest = (text: string) => createHash("sha256").update(text).digest("hex");
const validDigest = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const validHost = (host: unknown): host is string => {
  if (typeof host !== "string" || !host || host.length > 253 || /[/?#@\\]/.test(host)) return false;
  try {
    return new URL(`https://${host}/`).hostname === host;
  } catch {
    return false;
  }
};

/** Immutable byte cache and one atomic Profile manifest. Parsing and activation belong to Chromium. */
export class FilterLists {
  readonly dir: string;
  private state: BlockingState;
  private attestedReceipt: ChromiumContentBlockReceipt | undefined;
  private readonly activePath: string;
  private readonly pendingPath: string;
  private readonly generationPath: string;
  constructor(dataDir: string) {
    this.dir = join(dataDir, "filters");
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    this.activePath = join(this.dir, "active.json");
    this.pendingPath = join(this.dir, "pending.json");
    this.generationPath = join(this.dir, "generation.json");
    this.state = this.readState(this.activePath) ?? {
      generation: 0,
      enabled: true,
      allowedSiteHosts: [],
      sources: BUNDLED_FILTER_SOURCES.map(({ bytes, sha256, ...source }) => ({
        ...source,
        meta: { fetchedAt: 0, bytes, sha256 },
      })),
    };
  }
  private readState(path: string): BlockingState | undefined {
    let text: string;
    try {
      if (statSync(path).size > 2 * 1024 * 1024) throw new Error("Oversized filter manifest");
      text = readFileSync(path, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
    const state = JSON.parse(text) as BlockingState;
    if (
      !state ||
      !Number.isSafeInteger(state.generation) ||
      state.generation < 0 ||
      typeof state.enabled !== "boolean" ||
      !Array.isArray(state.allowedSiteHosts) ||
      state.allowedSiteHosts.length > 4096 ||
      !state.allowedSiteHosts.every(validHost) ||
      state.allowedSiteHosts.some((host, index) => index > 0 && host <= state.allowedSiteHosts[index - 1]!) ||
      !Array.isArray(state.sources) ||
      state.sources.length > MAX_FILTER_SOURCES
    )
      throw new Error("Invalid filter manifest");
    const ids = new Set<string>();
    for (const source of state.sources) {
      if (
        !source ||
        source.id !== sourceId(filterSourceUrl(source.url)) ||
        ids.has(source.id) ||
        typeof source.name !== "string" ||
        source.name.length > 120 ||
        typeof source.enabled !== "boolean" ||
        (source.kind !== "adblock" && source.kind !== "hosts")
      )
        throw new Error("Invalid filter source");
      ids.add(source.id);
      if (
        source.meta &&
        (!validDigest(source.meta.sha256) ||
          !Number.isSafeInteger(source.meta.bytes) ||
          source.meta.bytes < 0 ||
          source.meta.bytes > MAX_FILTER_BYTES ||
          !Number.isSafeInteger(source.meta.fetchedAt) ||
          source.meta.fetchedAt < 0)
      )
        throw new Error("Invalid filter source metadata");
      if (source.meta) {
        const { fetchedAt, etag, bytes, sha256, error } = source.meta;
        source.meta = { fetchedAt, bytes, sha256, ...(etag ? { etag } : {}), ...(error ? { error } : {}) };
      }
    }
    return state;
  }
  current(): BlockingState {
    return structuredClone(this.state);
  }
  pending(): BlockingState | undefined {
    return this.readState(this.pendingPath);
  }
  sources(): FilterSource[] {
    return this.state.sources.map(({ meta: _meta, ...source }) => source);
  }
  status(): FilterListStatus {
    const state = this.current();
    const receipt = this.attestedReceipt;
    return {
      sources: state.sources,
      backend: receipt?.backend ?? "unavailable",
      ...(receipt ? { engineVersion: receipt.engineVersion } : {}),
      cosmeticBackend: receipt?.cosmeticBackend ?? "unavailable",
    };
  }
  addSource(state: BlockingState, name: string, rawUrl: string, kind: FilterSourceKind): void {
    const url = filterSourceUrl(rawUrl),
      id = sourceId(url);
    if (kind !== "hosts" && kind !== "adblock") throw new Error("Choose a supported filter list format.");
    if (state.sources.length >= MAX_FILTER_SOURCES)
      throw new Error("Remove a filter list before adding another.");
    if (state.sources.some((source) => source.id === id))
      throw new Error("That filter list is already added.");
    state.sources.push({
      id,
      url,
      name: name.trim().slice(0, 120) || new URL(url).hostname,
      kind,
      enabled: true,
    });
  }
  removeSource(state: BlockingState, id: string): void {
    if (!state.sources.some((source) => source.id === id)) throw new Error("Choose a saved filter list.");
    state.sources = state.sources.filter((source) => source.id !== id);
  }
  setEnabled(state: BlockingState, id: string, enabled: boolean): void {
    const source = state.sources.find((source) => source.id === id);
    if (!source || typeof enabled !== "boolean") throw new Error("Choose a saved filter list state.");
    source.enabled = enabled;
  }
  private async atomic(path: string, text: string): Promise<void> {
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
      const file = await open(temporary, "wx", 0o600);
      try {
        await file.writeFile(text, "utf8");
        await file.sync();
      } finally {
        await file.close();
      }
      await rename(temporary, path);
      const directory = await open(this.dir, "r");
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
    } finally {
      await unlink(temporary).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  }
  async reserveGeneration(nativeFloor: number): Promise<number> {
    let last = 0;
    try {
      if ((await stat(this.generationPath)).size > 64) throw new Error("Oversized filter generation journal");
      const text = await readFile(this.generationPath, "utf8");
      last = JSON.parse(text) as number;
      if (!Number.isSafeInteger(last) || last < 0) throw new Error("Invalid filter generation journal");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const next = Math.max(last, nativeFloor, this.state.generation, this.pending()?.generation ?? 0) + 1;
    if (!Number.isSafeInteger(next)) throw new Error("Filter generation exhausted");
    await this.atomic(this.generationPath, JSON.stringify(next));
    return next;
  }
  private async cached(source: BlockingState["sources"][number]): Promise<ContentBlockSource> {
    const meta = source.meta;
    if (!meta) throw new Error(`Download ${source.name} before enabling it.`);
    const header = {
      id: source.id,
      url: source.url,
      kind: source.kind,
      bytes: meta.bytes,
      sha256: meta.sha256,
    };
    const bundled = BUNDLED_FILTER_SOURCES.find(
      (item) =>
        item.id === source.id &&
        item.url === source.url &&
        item.kind === source.kind &&
        item.sha256 === meta.sha256 &&
        item.bytes === meta.bytes,
    );
    if (bundled) return header; // Native verifies the exact same compiled asset header.
    const path = join(this.dir, `${meta.sha256}.txt`);
    const info = await stat(path);
    if (info.size !== meta.bytes || info.size > MAX_FILTER_BYTES)
      throw new Error(`The cached ${source.name} is damaged.`);
    const bytes = await readFile(path);
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    if (digest(text) !== meta.sha256) throw new Error(`The cached ${source.name} is damaged.`);
    return { ...header, text };
  }
  async prepare(state: BlockingState): Promise<PreparedFilters> {
    const sources: ContentBlockSource[] = [];
    for (const source of state.sources) if (source.enabled) sources.push(await this.cached(source));
    if (sources.reduce((sum, source) => sum + source.bytes, 0) > MAX_FILTER_SNAPSHOT_BYTES)
      throw new Error("Filter snapshot is too large.");
    return { state, sources };
  }
  async stage(prepared: PreparedFilters): Promise<void> {
    await this.atomic(this.pendingPath, JSON.stringify(prepared.state));
  }
  async publish(prepared: PreparedFilters, receipt: ChromiumContentBlockReceipt): Promise<void> {
    const state = { ...prepared.state, receipt };
    await this.atomic(this.activePath, JSON.stringify(state));
    this.state = structuredClone(state);
    this.attestedReceipt = receipt;
    await unlink(this.pendingPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  async collectUnused(): Promise<void> {
    const keep = new Set(
      [...this.state.sources, ...(this.pending()?.sources ?? [])].flatMap((source) =>
        source.meta ? [`${source.meta.sha256}.txt`] : [],
      ),
    );
    for (const file of await readdir(this.dir))
      if (/^[a-f0-9]{64}\.txt$/.test(file) && !keep.has(file)) await unlink(join(this.dir, file));
  }
  /** No candidate body/configuration becomes active before the matching native ACK. */
  async update(
    state: BlockingState,
    fetchText: FetchFilter,
    signal: AbortSignal,
    requiredId?: string,
  ): Promise<void> {
    for (const source of state.sources) {
      if (!source.enabled || (requiredId && source.id !== requiredId)) continue;
      const previous = source.meta;
      try {
        signal.throwIfAborted();
        // Standard lists may include independently updated fragments; never reuse
        // a root 304 as proof that those fragments are unchanged.
        const response = await fetchText(
          source.url,
          source.kind === "hosts" ? previous?.etag : undefined,
          signal,
        );
        if (response.status === 304) {
          await this.cached(source);
          source.meta = { ...previous!, fetchedAt: Date.now(), error: undefined };
          continue;
        }
        if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
        const raw = await response.text();
        const text =
          source.kind === "adblock" ? await this.expandIncludes(source.url, raw, fetchText, signal) : raw;
        const bytes = Buffer.byteLength(text, "utf8");
        if (bytes > MAX_FILTER_BYTES) throw new Error("The list is too large.");
        const sha256 = digest(text);
        await this.atomic(join(this.dir, `${sha256}.txt`), text);
        source.meta = {
          fetchedAt: Date.now(),
          bytes,
          sha256,
          etag: response.etag,
        };
      } catch (error) {
        if (signal.aborted || source.id === requiredId || !previous) throw error;
        source.meta = { ...previous, error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
  private async expandIncludes(
    url: string,
    text: string,
    fetchText: FetchFilter,
    signal: AbortSignal,
  ): Promise<string> {
    let count = 0,
      bytes = 0;
    const expand = async (
      currentUrl: string,
      body: string,
      ancestors: readonly string[],
    ): Promise<string> => {
      signal.throwIfAborted();
      bytes += Buffer.byteLength(body, "utf8");
      if (bytes > MAX_FILTER_BYTES) throw new Error("Included filter lists exceed their byte limit.");
      const output: string[] = [];
      for (const line of body.split(/\r?\n/)) {
        const directive = /^!#include\s+(\S+)\s*$/.exec(line.trim());
        if (!directive) {
          output.push(line);
          continue;
        }
        if (++count > 64 || ancestors.length >= 8) throw new Error("Too many included filter lists.");
        const child = filterSourceUrl(new URL(directive[1]!, currentUrl).href);
        if (new URL(child).origin !== new URL(url).origin || ancestors.includes(child))
          throw new Error("Filter includes must stay on their original public HTTPS origin without cycles.");
        const response = await fetchText(child, undefined, signal);
        if (response.status !== 200) throw new Error(`Included filter list HTTP ${response.status}`);
        output.push(await expand(child, await response.text(), [...ancestors, child]));
      }
      return output.join("\n");
    };
    return expand(url, text, [url]);
  }
}
