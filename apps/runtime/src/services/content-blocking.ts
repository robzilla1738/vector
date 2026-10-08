import { publicHttpsText } from "./public-https.js";
import { createHash } from "node:crypto";
import {
  FilterLists,
  type FilterListStatus,
  type FilterSource,
  type FilterListState,
  type PreparedFilters,
  type FetchFilter,
} from "@aux/filter-lists";
import {
  assertContentBlockReceipt,
  filterSnapshotDigestInput,
  filterSourceUrl,
  MAX_FILTER_BYTES,
  MAX_FILTER_CHUNK_BYTES,
  type ContentBlockSnapshot,
  type ChromiumContentBlockReceipt,
  type FilterSourceKind,
  type HostMethodResult,
  AuxError,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
type BlockingNativeBridge = Pick<
  NativeBridge,
  "contentBlockState" | "contentBlockBegin" | "contentBlockAppend" | "contentBlockCommit"
>;
type NativeState = HostMethodResult<"native.contentBlockState"> & { receipt: ChromiumContentBlockReceipt };

/** Source cache ownership only. Native owns enabled state and site exceptions. */
export class ContentBlockingService {
  private readonly lists: FilterLists;
  private operation: Promise<unknown> | null = null;
  private controller: AbortController | null = null;
  private closed = false;
  private cleanup: Promise<void> = Promise.resolve();
  private attested = false;
  private recoverySources: FilterListState | undefined;
  private sourceMismatch: string | undefined;
  constructor(
    dataDir: string,
    private readonly native: BlockingNativeBridge,
    private readonly profileId: string,
    private readonly fetchText: FetchFilter = fetchFilterText,
  ) {
    this.lists = new FilterLists(dataDir);
  }
  status(): FilterListStatus {
    const status = this.lists.status();
    if (this.attested) return status;
    return {
      sources: structuredClone(this.recoverySources?.sources ?? status.sources).map((source) =>
        this.sourceMismatch && source.meta
          ? { ...source, meta: { ...source.meta, error: this.sourceMismatch } }
          : source,
      ),
      backend: "unavailable",
      cosmeticBackend: "unavailable",
      compilationWarnings: [],
    };
  }
  private sourceState(): FilterListState {
    if (this.sourceMismatch) throw new AuxError("conflict", this.sourceMismatch);
    return this.recoverySources ? structuredClone(this.recoverySources) : this.lists.current();
  }
  private snapshot(prepared: PreparedFilters, current: NativeState): ContentBlockSnapshot {
    return {
      profileId: this.profileId,
      generation: prepared.state.generation,
      filterDigest: createHash("sha256")
        .update(filterSnapshotDigestInput(prepared.sources, current.enabled, current.allowedSiteHosts))
        .digest("hex"),
      sources: prepared.sources,
      enabled: current.enabled,
      allowedSiteHosts: current.allowedSiteHosts,
    };
  }
  private async nativeState(): Promise<NativeState> {
    if (!this.native.contentBlockState)
      throw new AuxError(
        "capability_unsupported",
        "Chromium content filtering is unavailable in this browser build.",
      );
    const current = await this.native.contentBlockState({ profileId: this.profileId });
    if (!current.receipt || current.receipt.profileId !== this.profileId)
      throw new AuxError("backend_unavailable", "The original native filter Profile is unavailable.");
    return { ...current, receipt: current.receipt };
  }
  private async install(state: FilterListState, signal: AbortSignal): Promise<void> {
    if (!this.native.contentBlockBegin || !this.native.contentBlockAppend || !this.native.contentBlockCommit)
      throw new AuxError(
        "capability_unsupported",
        "Chromium content filtering is unavailable in this browser build.",
      );
    signal.throwIfAborted();
    const current = await this.nativeState();
    signal.throwIfAborted();
    state.generation = await this.lists.reserveGeneration(current.receipt.generation);
    const prepared = await this.lists.prepare(state);
    const snapshot = this.snapshot(prepared, current);
    // This is only a source candidate. It cannot restore or replace native control policy.
    await this.lists.stage(prepared);
    signal.throwIfAborted();
    await this.native.contentBlockBegin({
      profileId: this.profileId,
      baseGeneration: current.receipt.generation,
      generation: snapshot.generation,
      filterDigest: snapshot.filterDigest,
      sources: snapshot.sources.map(({ text, ...header }) => ({ ...header, bundled: text === undefined })),
      enabled: snapshot.enabled,
      allowedSiteHosts: snapshot.allowedSiteHosts,
    });
    for (const source of snapshot.sources) {
      if (source.text === undefined) continue;
      let offset = 0,
        chunk = "",
        bytes = 0;
      const append = async () => {
        signal.throwIfAborted();
        await this.native.contentBlockAppend!({
          profileId: this.profileId,
          generation: snapshot.generation,
          sourceId: source.id,
          offset,
          text: chunk,
        });
        offset += bytes;
        chunk = "";
        bytes = 0;
      };
      for (const character of source.text) {
        const size = Buffer.byteLength(character, "utf8");
        if (bytes + size > MAX_FILTER_CHUNK_BYTES) await append();
        chunk += character;
        bytes += size;
      }
      if (bytes) await append();
    }
    signal.throwIfAborted();
    const receipt = await this.native.contentBlockCommit({
      profileId: this.profileId,
      generation: snapshot.generation,
      filterDigest: snapshot.filterDigest,
    });
    assertContentBlockReceipt(snapshot, receipt);
    // Join publication after actual acceptance even if Stop arrives during the ACK.
    this.attested = false;
    this.recoverySources = prepared.state;
    await this.lists.publish(prepared, receipt);
    this.attested = true;
    this.recoverySources = undefined;
    this.cleanup = this.cleanup
      .then(() => this.lists.collectUnused())
      .catch((error) => {
        console.warn("Unable to collect inactive filter cache files", error);
      });
  }
  private mutate<T>(work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new Error("Content filtering is closed."));
    if (this.operation) return Promise.reject(new Error("A filter list operation is already running."));
    const controller = new AbortController();
    this.controller = controller;
    const operation = this.cleanup.then(() => {
      controller.signal.throwIfAborted();
      return work(controller.signal);
    });
    this.operation = operation;
    return operation.finally(() => {
      if (this.operation === operation) {
        this.operation = null;
        this.controller = null;
      }
    });
  }
  async boot(): Promise<void> {
    await this.mutate(async (signal) => {
      this.attested = false;
      this.recoverySources = undefined;
      this.sourceMismatch = undefined;
      const current = await this.nativeState();
      signal.throwIfAborted();
      for (const state of [this.lists.pending(), this.lists.current()]) {
        if (!state) continue;
        const sources = state.sources.filter((source) => source.enabled);
        if (
          sources.length !== current.receipt.sourceHeaders.length ||
          !sources.every((source, index) => {
            const header = current.receipt.sourceHeaders[index]!;
            return (
              source.id === header.id &&
              source.url === header.url &&
              source.kind === header.kind &&
              source.meta?.sha256 === header.sha256 &&
              source.meta.bytes === header.bytes
            );
          })
        )
          continue;
        state.generation = current.receipt.generation;
        let prepared: PreparedFilters;
        try {
          prepared = await this.lists.prepare(state);
        } catch {
          // Native still owns these exact sources. Keep the matched candidate
          // for an explicit repair, including an accepted but unpublished one.
          for (const source of state.sources) {
            signal.throwIfAborted();
            if (!source.enabled) continue;
            try {
              await this.lists.prepare({ generation: state.generation, sources: [source] });
            } catch (error) {
              if (source.meta) {
                delete source.meta.etag;
                source.meta.error = error instanceof Error ? error.message : String(error);
              }
            }
          }
          this.recoverySources = state;
          return;
        }
        signal.throwIfAborted();
        assertContentBlockReceipt(this.snapshot(prepared, current), current.receipt);
        await this.lists.publish(prepared, current.receipt);
        this.attested = true;
        return;
      }
      this.sourceMismatch =
        "The saved source list does not match Chromium's active filters. Restore this Profile's source list before updating filters; the active native sources are preserved.";
    });
  }
  async close(): Promise<void> {
    this.closed = true;
    this.controller?.abort(new Error("Content filtering closed."));
    await this.operation?.catch(() => {});
    await this.cleanup;
  }
  async maintain(): Promise<void> {
    if (this.closed || this.operation || !this.attested) return;
    const enabled = this.lists.current().sources.filter((source) => source.enabled);
    if (
      !enabled.length ||
      enabled.every((source) => source.meta?.fetchedAt && Date.now() - source.meta.fetchedAt < 86_400_000)
    )
      return;
    await this.update();
  }
  update(): Promise<FilterListStatus> {
    return this.mutate(async (signal) => {
      const state = this.sourceState();
      await this.lists.update(state, this.fetchText, signal);
      await this.install(state, signal);
      return this.status();
    });
  }
  add(name: string, url: string, kind: FilterSourceKind = "adblock"): Promise<FilterSource[]> {
    return this.mutate(async (signal) => {
      const state = this.sourceState();
      this.lists.addSource(state, name, url, kind);
      const id = state.sources.at(-1)!.id;
      await this.lists.update(state, this.fetchText, signal, id);
      await this.install(state, signal);
      return this.status().sources;
    });
  }
  remove(id: string): Promise<FilterSource[]> {
    return this.mutate(async (signal) => {
      const state = this.sourceState();
      this.lists.removeSource(state, id);
      await this.install(state, signal);
      return this.status().sources;
    });
  }
  setSourceEnabled(id: string, enabled: boolean): Promise<FilterSource[]> {
    return this.mutate(async (signal) => {
      const state = this.sourceState();
      this.lists.setEnabled(state, id, enabled);
      if (enabled && !state.sources.find((source) => source.id === id)?.meta)
        await this.lists.update(state, this.fetchText, signal, id);
      await this.install(state, signal);
      return this.status().sources;
    });
  }
  handle(method: string, params: unknown): unknown {
    const object =
      params && typeof params === "object" && !Array.isArray(params)
        ? (params as Record<string, unknown>)
        : {};
    const string = (name: string) => {
      const value = object[name];
      if (typeof value !== "string") throw new Error(`Invalid ${name}.`);
      return value;
    };
    const boolean = (name: string) => {
      const value = object[name];
      if (typeof value !== "boolean") throw new Error(`Invalid ${name}.`);
      return value;
    };
    switch (method) {
      case "blocking.status":
        return this.status();
      case "blocking.update":
        return this.update();
      case "blocking.add":
        return this.add(
          string("name"),
          string("url"),
          object.kind === undefined ? "adblock" : (string("kind") as FilterSourceKind),
        );
      case "blocking.remove":
        return this.remove(string("id"));
      case "blocking.setSourceEnabled":
        return this.setSourceEnabled(string("id"), boolean("enabled"));
      default:
        throw new Error("Unsupported content blocking operation.");
    }
  }
}

async function fetchFilterText(url: string, etag?: string, signal?: AbortSignal) {
  const response = await publicHttpsText(new URL(filterSourceUrl(url)), {
    maxBytes: MAX_FILTER_BYTES,
    etag,
    signal,
  });
  return {
    status: response.status,
    etag: response.etag,
    text: async () => response.text,
  };
}
