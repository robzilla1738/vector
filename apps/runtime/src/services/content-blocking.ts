import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FilterLists, type FilterListStatus, type FilterSource } from "@aux/filter-lists";
import {
  assertContentBlockReceipt,
  filterSourceUrl,
  isAuxError,
  MAX_FILTER_HOSTS,
  readBoundedFilterText,
  TRACKER_HOSTS,
  type ContentBlockSnapshot,
  type FilterSourceKind,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { ContentBlockBegin } from "../native.js";

interface BlockingSettings {
  generation: number;
  enabled: boolean;
  allowedSiteHosts: string[];
}

/** Per-Profile list owner. The native receipt is the only proof that a downloaded
 * host became an active Chromium rule. Failed downloads retain the last cache;
 * failed native commits leave the old rules installed. */
export class ContentBlockingService {
  private readonly lists: FilterLists;
  private readonly settingsPath: string;
  private settings: BlockingSettings;
  private busy = false;

  constructor(private readonly dataDir: string, private readonly native: NativeBridge,
              private readonly profileId: string,
              private readonly fetchText = fetchFilterText) {
    this.lists = new FilterLists(dataDir, "subresource_filter");
    this.settingsPath = join(this.lists.dir, "blocking.json");
    this.settings = this.readSettings();
  }

  private readSettings(): BlockingSettings {
    try {
      const value = JSON.parse(readFileSync(this.settingsPath, "utf8")) as Partial<BlockingSettings>;
      return {
        generation: Number.isSafeInteger(value.generation) && value.generation! >= 0 ? value.generation! : 0,
        enabled: value.enabled !== false,
        allowedSiteHosts: Array.isArray(value.allowedSiteHosts)
          ? value.allowedSiteHosts.filter((host): host is string => typeof host === "string" && validSiteHost(host)).slice(0, 4096)
          : [],
      };
    } catch {
      return { generation: 0, enabled: true, allowedSiteHosts: [] };
    }
  }

  private saveSettings() {
    const path = `${this.settingsPath}.tmp`;
    writeFileSync(path, JSON.stringify(this.settings), { mode: 0o600 });
    renameSync(path, this.settingsPath);
  }

  status(): FilterListStatus {
    const state = this.lists.status(TRACKER_HOSTS.size);
    return { ...state, cookieSelectors: 0, sources: state.sources.map(source =>
      source.kind === "cookie_banner" ? { ...source, enabled: false,
        meta: { ...(source.meta ?? { fetchedAt: 0, hosts: 0, sha256: "" }),
          error: "Chromium has no native cosmetic filter backend." } } : source) };
  }

  privacy() {
    return { trackerBlock: this.settings.enabled, allowedHosts: [...this.settings.allowedSiteHosts] };
  }

  private async installSnapshot(siteGuard?: ContentBlockBegin["siteGuard"]) {
    if (!this.native.contentBlockBegin || !this.native.contentBlockAppend || !this.native.contentBlockCommit)
      throw new Error("Chromium content blocking is unavailable in this browser build.");
    const selected = await this.lists.loadHostsOffThread();
    const hosts = [...new Set([...TRACKER_HOSTS, ...selected])].sort();
    if (hosts.length > MAX_FILTER_HOSTS) throw new Error("Too many filter hosts for Chromium.");
    const hostsDigest = createHash("sha256").update(hosts.join("\n")).digest("hex");
    const generation = ++this.settings.generation;
    this.saveSettings();
    const snapshot: ContentBlockSnapshot = {
      generation, hostsDigest, hosts,
      allowedSiteHosts: this.settings.allowedSiteHosts,
      enabled: this.settings.enabled,
    };
    await this.native.contentBlockBegin({ profileId: this.profileId, generation, hostsDigest,
      hostCount: hosts.length, allowedSiteHosts: snapshot.allowedSiteHosts, enabled: snapshot.enabled,
      ...(siteGuard ? { siteGuard } : {}) });
    for (let offset = 0; offset < hosts.length; offset += 1024)
      await this.native.contentBlockAppend({ profileId: this.profileId, generation,
        offset, hosts: hosts.slice(offset, offset + 1024) });
    const receipt = await this.native.contentBlockCommit({ profileId: this.profileId, generation, hostsDigest });
    assertContentBlockReceipt(snapshot, receipt);
    if (receipt.backend !== "subresource_filter") throw new Error("Chromium reported the wrong filter backend.");
    if (receipt.installedRules !== hosts.length) throw new Error("Chromium installed a partial filter snapshot.");
    return receipt;
  }

  async boot() {
    await this.installSnapshot();
  }

  async maintain() {
    const sources = this.lists.status(TRACKER_HOSTS.size).sources.filter(source => source.enabled && source.kind === "hosts");
    if (!sources.length || this.busy || sources.every(source =>
      source.meta?.fetchedAt && Date.now() - source.meta.fetchedAt < 24 * 60 * 60 * 1000)) return;
    await this.update();
  }

  private async mutate<T>(work: () => Promise<T>): Promise<T> {
    if (this.busy) throw new Error("A filter list operation is already running.");
    this.busy = true;
    try { return await work(); }
    finally { this.busy = false; }
  }

  async update(): Promise<FilterListStatus> {
    return this.mutate(async () => {
      await this.lists.update(this.fetchText, ["hosts"]);
      await this.installSnapshot();
      return this.status();
    });
  }

  async add(name: string, url: string, kind: FilterSourceKind): Promise<FilterSource[]> {
    return this.mutate(async () => {
      if (kind !== "hosts") throw new Error("Cookie-banner selectors need the native cosmetic filter backend.");
      this.lists.addSource(name, filterSourceUrl(url), kind);
      await this.lists.update(this.fetchText, ["hosts"]);
      await this.installSnapshot();
      return this.status().sources;
    });
  }

  async remove(id: string): Promise<FilterSource[]> {
    return this.mutate(async () => {
      this.lists.removeSource(id);
      await this.installSnapshot();
      return this.status().sources;
    });
  }

  async setSourceEnabled(id: string, enabled: boolean): Promise<FilterSource[]> {
    return this.mutate(async () => {
      const source = this.lists.sources().find(item => item.id === id);
      if (enabled && source?.kind === "cookie_banner")
        throw new Error("Cookie-banner selectors need the native cosmetic filter backend.");
      this.lists.setEnabled(id, enabled);
      if (enabled) await this.lists.update(this.fetchText, ["hosts"]);
      await this.installSnapshot();
      return this.status().sources;
    });
  }

  async setEnabled(enabled: boolean) {
    return this.mutate(async () => {
      this.settings.enabled = enabled;
      await this.installSnapshot();
      return this.privacy();
    });
  }

  async setSiteAllowed(hostname: string, allowed: boolean,
                       siteGuard?: ContentBlockBegin["siteGuard"]) {
    return this.mutate(async () => {
      const host = hostname.toLowerCase();
      if (!validSiteHost(host)) throw new Error("Choose an HTTP or HTTPS site.");
      const previous = this.settings.allowedSiteHosts;
      const set = new Set(this.settings.allowedSiteHosts);
      if (allowed) {
        if (set.size >= 4096 && !set.has(host)) throw new Error("Too many site exceptions.");
        set.add(host);
      } else set.delete(host);
      this.settings.allowedSiteHosts = [...set].sort();
      try {
        await this.installSnapshot(siteGuard);
      } catch (error) {
        if (isAuxError(error) && error.code === "conflict") {
          this.settings.allowedSiteHosts = previous;
          this.saveSettings();
        }
        throw error;
      }
      return { hostname: host, allowed };
    });
  }

  async removeAllowedHost(hostname: string) {
    await this.setSiteAllowed(hostname, false);
    return [...this.settings.allowedSiteHosts];
  }

  handle(method: string, params: unknown): unknown {
    const object = params && typeof params === "object" && !Array.isArray(params)
      ? params as Record<string, unknown> : {};
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
      case "blocking.status": return this.status();
      case "blocking.privacy": return this.privacy();
      case "blocking.update": return this.update();
      case "blocking.add": return this.add(string("name"), string("url"), string("kind") as FilterSourceKind);
      case "blocking.remove": return this.remove(string("id"));
      case "blocking.setSourceEnabled": return this.setSourceEnabled(string("id"), boolean("enabled"));
      case "blocking.setEnabled": return this.setEnabled(boolean("enabled"));
      case "blocking.setSiteAllowed": {
        const guard = object.siteGuard;
        if (!guard || typeof guard !== "object" || Array.isArray(guard)) throw new Error("Missing page review.");
        const page = guard as Record<string, unknown>;
        if (typeof page.pageId !== "string" || typeof page.expectedUrl !== "string" ||
            !Number.isSafeInteger(page.navigationId)) throw new Error("Invalid page review.");
        return this.setSiteAllowed(string("hostname"), boolean("allowed"),
          { pageId: page.pageId, expectedUrl: page.expectedUrl, navigationId: page.navigationId as number });
      }
      case "blocking.removeAllowedHost": return this.removeAllowedHost(string("hostname"));
      default: throw new Error("Unsupported content blocking operation.");
    }
  }
}

function validSiteHost(host: string) {
  if (!host || host.length > 253 || /[/?#@\\]/.test(host)) return false;
  try { return new URL(`https://${host}/`).hostname === host; }
  catch { return false; }
}

async function fetchFilterText(url: string, etag?: string) {
  const expected = filterSourceUrl(url);
  const response = await fetch(expected, { redirect: "manual", signal: AbortSignal.timeout(12_000),
    headers: etag ? { "If-None-Match": etag.slice(0, 512) } : {} });
  if (response.url !== expected) throw new Error("The filter list redirected. Review its final HTTPS URL separately.");
  return { status: response.status, etag: response.headers.get("etag")?.slice(0, 512),
    text: () => readBoundedFilterText(response) };
}
