import { publicHttpsText } from "./public-https.js";
import { createHash } from "node:crypto";
import {
  FilterLists,
  type FilterListStatus,
  type FilterSource,
  type BlockingState,
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
} from "@aux/contracts";
import type { NativeBridge, ContentBlockBegin } from "../native.js";
type BlockingNativeBridge = Pick<
  NativeBridge,
  "contentBlockState" | "contentBlockBegin" | "contentBlockAppend" | "contentBlockCommit"
>;

/** One Profile snapshot owner. Configuration, cache and statistics publish only after exact native activation. */
export class ContentBlockingService {
  private readonly lists: FilterLists;
  private operation: Promise<unknown> | null = null;
  private controller: AbortController | null = null;
  private closed = false;
  private cleanup: Promise<void> = Promise.resolve();
  constructor(
    dataDir: string,
    private readonly native: BlockingNativeBridge,
    private readonly profileId: string,
    private readonly fetchText: FetchFilter = fetchFilterText,
  ) {
    this.lists = new FilterLists(dataDir);
  }
  status(): FilterListStatus {
    return this.lists.status();
  }
  privacy() {
    const state = this.lists.current();
    return { trackerBlock: state.enabled, allowedHosts: state.allowedSiteHosts };
  }
  private snapshot(prepared: PreparedFilters): ContentBlockSnapshot {
    return {
      profileId: this.profileId,
      generation: prepared.state.generation,
      filterDigest: createHash("sha256")
        .update(
          filterSnapshotDigestInput(
            prepared.sources,
            prepared.state.enabled,
            prepared.state.allowedSiteHosts,
          ),
        )
        .digest("hex"),
      sources: prepared.sources,
      enabled: prepared.state.enabled,
      allowedSiteHosts: prepared.state.allowedSiteHosts,
    };
  }
  private async currentReceipt(): Promise<ChromiumContentBlockReceipt | null> {
    if (!this.native.contentBlockState)
      throw new Error("Chromium content filtering is unavailable in this browser build.");
    return (await this.native.contentBlockState({ profileId: this.profileId })).receipt;
  }
  private async install(
    state: BlockingState,
    signal: AbortSignal,
    siteGuard?: ContentBlockBegin["siteGuard"],
  ): Promise<void> {
    if (!this.native.contentBlockBegin || !this.native.contentBlockAppend || !this.native.contentBlockCommit)
      throw new Error("Chromium content filtering is unavailable in this browser build.");
    signal.throwIfAborted();
    const current = await this.currentReceipt();
    signal.throwIfAborted();
    state.generation = await this.lists.reserveGeneration(current?.generation ?? 0);
    const prepared = await this.lists.prepare(state);
    const snapshot = this.snapshot(prepared);
    // If the process exits after native ACK, boot recovers this exact candidate
    // using the native state receipt before publishing any different policy.
    await this.lists.stage(prepared);
    signal.throwIfAborted();
    await this.native.contentBlockBegin({
      profileId: this.profileId,
      generation: snapshot.generation,
      filterDigest: snapshot.filterDigest,
      sources: snapshot.sources.map(({ text, ...header }) => ({ ...header, bundled: text === undefined })),
      enabled: snapshot.enabled,
      allowedSiteHosts: snapshot.allowedSiteHosts,
      ...(siteGuard ? { siteGuard } : {}),
    });
    for (const source of snapshot.sources) {
      if (source.text === undefined) continue;
      let offset = 0;
      // Bound by encoded bytes while retaining whole UTF-8 code points.
      let chunk = "",
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
    // Cancellation after actual commit cannot erase the saved native receipt.
    // Complete its journal publication; never report an unactivated candidate.
    await this.lists.publish(prepared, receipt);
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
    // Finish collection before a later candidate writes new immutable cache files.
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
      const pending = this.lists.pending();
      if (pending) {
        const prepared = await this.lists.prepare(pending),
          snapshot = this.snapshot(prepared),
          current = await this.currentReceipt();
        if (current?.generation === snapshot.generation && current.filterDigest === snapshot.filterDigest) {
          assertContentBlockReceipt(snapshot, current);
          await this.lists.publish(prepared, current);
        }
      }
      await this.install(this.lists.current(), signal);
    });
  }
  async close(): Promise<void> {
    this.closed = true;
    this.controller?.abort(new Error("Content filtering closed."));
    await this.operation?.catch(() => {});
    await this.cleanup;
  }
  async maintain(): Promise<void> {
    if (this.closed || this.operation) return;
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
      const state = this.lists.current();
      await this.lists.update(state, this.fetchText, signal);
      await this.install(state, signal);
      return this.status();
    });
  }
  add(name: string, url: string, kind: FilterSourceKind = "adblock"): Promise<FilterSource[]> {
    return this.mutate(async (signal) => {
      const state = this.lists.current();
      this.lists.addSource(state, name, url, kind);
      const id = state.sources.at(-1)!.id;
      await this.lists.update(state, this.fetchText, signal, id);
      await this.install(state, signal);
      return this.status().sources;
    });
  }
  remove(id: string): Promise<FilterSource[]> {
    return this.mutate(async (signal) => {
      const state = this.lists.current();
      this.lists.removeSource(state, id);
      await this.install(state, signal);
      return this.status().sources;
    });
  }
  setSourceEnabled(id: string, enabled: boolean): Promise<FilterSource[]> {
    return this.mutate(async (signal) => {
      const state = this.lists.current();
      this.lists.setEnabled(state, id, enabled);
      if (enabled && !state.sources.find((source) => source.id === id)?.meta)
        await this.lists.update(state, this.fetchText, signal, id);
      await this.install(state, signal);
      return this.status().sources;
    });
  }
  setEnabled(enabled: boolean) {
    return this.mutate(async (signal) => {
      const state = this.lists.current();
      state.enabled = enabled;
      await this.install(state, signal);
      return this.privacy();
    });
  }
  setSiteAllowed(hostname: string, allowed: boolean, siteGuard?: ContentBlockBegin["siteGuard"]) {
    return this.mutate(async (signal) => {
      const host = hostname.toLowerCase();
      if (!validSiteHost(host)) throw new Error("Choose an HTTP or HTTPS site.");
      if (allowed || siteGuard) {
        let reviewed: URL;
        try {
          reviewed = new URL(siteGuard?.expectedUrl ?? "");
        } catch {
          throw new Error("Review the original HTTP or HTTPS page before changing its site exception.");
        }
        if (!siteGuard || !["http:", "https:"].includes(reviewed.protocol) || reviewed.hostname !== host)
          throw new Error("The site exception does not match the reviewed original page.");
      }
      const state = this.lists.current(),
        set = new Set(state.allowedSiteHosts);
      if (allowed) {
        if (set.size >= 4096 && !set.has(host)) throw new Error("Too many site exceptions.");
        set.add(host);
      } else set.delete(host);
      state.allowedSiteHosts = [...set].sort();
      await this.install(state, signal, siteGuard);
      return { hostname: host, allowed };
    });
  }
  async removeAllowedHost(hostname: string) {
    await this.setSiteAllowed(hostname, false);
    return this.privacy().allowedHosts;
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
      case "blocking.privacy":
        return this.privacy();
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
      case "blocking.setEnabled":
        return this.setEnabled(boolean("enabled"));
      case "blocking.setSiteAllowed": {
        const guard = object.siteGuard;
        if (!guard || typeof guard !== "object" || Array.isArray(guard))
          throw new Error("Missing page review.");
        const page = guard as Record<string, unknown>;
        if (
          typeof page.pageId !== "string" ||
          typeof page.expectedUrl !== "string" ||
          !Number.isSafeInteger(page.navigationId)
        )
          throw new Error("Invalid page review.");
        return this.setSiteAllowed(string("hostname"), boolean("allowed"), {
          pageId: page.pageId,
          expectedUrl: page.expectedUrl,
          navigationId: page.navigationId as number,
        });
      }
      case "blocking.removeAllowedHost":
        return this.removeAllowedHost(string("hostname"));
      default:
        throw new Error("Unsupported content blocking operation.");
    }
  }
}

function validSiteHost(host: string) {
  if (!host || host.length > 253 || /[/?#@\\]/.test(host)) return false;
  try {
    return new URL(`https://${host}/`).hostname === host;
  } catch {
    return false;
  }
}

async function fetchFilterText(url: string, etag?: string, signal?: AbortSignal) {
  const response = await publicHttpsText(new URL(filterSourceUrl(url)), {
    maxBytes: MAX_FILTER_BYTES,
    etag,
    signal,
  });
  return { status: response.status, etag: response.etag, text: async () => response.text };
}
