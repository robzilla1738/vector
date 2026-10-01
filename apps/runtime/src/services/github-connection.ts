import { randomUUID } from "node:crypto";
import { AuxError, type LiveFolder, type LiveFolderItem } from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import { liveFolderFetch } from "./live-folder-fetch.js";

export interface GithubConnection { id: string; name: string; login: string; connected: boolean; error?: string }
type ConnectionRecord = GithubConnection & { secretName: string };

/** Only this service reads its native secret; public account records never contain the PAT. */
export class GithubConnectionService {
  constructor(private readonly deps: { repo: Repo; native: NativeBridge; endpoint?: string | (() => Promise<string | undefined>); fetch?: typeof fetch }) {
    void this.cleanupRevoked().catch(() => undefined);
  }
  private async cleanupRevoked() {
    for (const name of this.deps.repo.getSetting<string[]>("liveFolders:githubRevoked") ?? []) {
      await this.deps.native.storeSecret(name, "");
      const remaining = this.deps.repo.getSetting<string[]>("liveFolders:githubRevoked") ?? [];
      this.deps.repo.setSetting("liveFolders:githubRevoked", remaining.filter(value => value !== name));
    }
  }
  private records() { return this.deps.repo.getSetting<ConnectionRecord[]>("liveFolders:github") ?? []; }
  list(): GithubConnection[] { return this.records().map(({ secretName: _secretName, ...account }) => account); }
  private async endpoint() {
    return (typeof this.deps.endpoint === "function" ? await this.deps.endpoint() : this.deps.endpoint) ?? "https://api.github.com";
  }
  private async request(path: string, token: string, signal?: AbortSignal, authorized?: () => boolean) {
    const endpoint = new URL(await this.endpoint());
    const text = await liveFolderFetch(new URL(path, `${endpoint.href.replace(/\/$/, "")}/`).href, [endpoint.host], {
      fetch: (input, init) => {
        if (authorized && !authorized()) throw new AuxError("cancelled", "GitHub was disconnected during refresh.");
        return (this.deps.fetch ?? fetch)(input, init);
      }, signal, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
    });
    try { return JSON.parse(text) as Record<string, unknown>; }
    catch { throw new AuxError("backend_unavailable", "GitHub returned invalid data."); }
  }
  async connect(name: string, token: string): Promise<GithubConnection> {
    if (!this.deps.native.available()) throw new AuxError("backend_unavailable", "Connect GitHub in Aux desktop.");
    if (this.records().length >= 100) throw new AuxError("conflict", "Remove a GitHub connection before adding another.");
    const user = await this.request("user", token);
    if (typeof user.login !== "string" || !user.login.length || user.login.length > 200) throw new AuxError("backend_unavailable", "GitHub did not identify this account.");
    const id = randomUUID();
    const record: ConnectionRecord = { id, name, login: user.login, connected: true, secretName: `aux.liveFolders.github.${id}` };
    await this.deps.native.storeSecret(record.secretName, token);
    try {
      if (this.records().length >= 100) throw new AuxError("conflict", "Remove a GitHub connection before adding another.");
      this.deps.repo.setSetting("liveFolders:github", [...this.records(), record]);
    }
    catch (error) { await this.deps.native.storeSecret(record.secretName, "").catch(() => undefined); throw error; }
    return { id, name, login: user.login, connected: true };
  }
  async revoke(id: string) {
    const record = this.records().find(account => account.id === id);
    if (!record) throw new AuxError("not_found", "This GitHub connection is unavailable.");
    // Remove local authority before touching native storage; a storage failure cannot reactivate it.
    this.deps.repo.setSetting("liveFolders:githubRevoked", [...new Set([...(this.deps.repo.getSetting<string[]>("liveFolders:githubRevoked") ?? []), record.secretName])]);
    this.deps.repo.setSetting("liveFolders:github", this.records().filter(account => account.id !== id));
    await this.cleanupRevoked();
    return { ok: true as const };
  }
  async items(source: Extract<LiveFolder, { kind: "github" }>, signal?: AbortSignal): Promise<LiveFolderItem[]> {
    const record = this.records().find(account => account.id === source.config.connectionId);
    if (!record) throw new AuxError("needs_input", "Couldn't refresh — Reconnect GitHub");
    const secret = await this.deps.native.readSecret(record.secretName);
    if (!secret.value) throw new AuxError("needs_input", "Couldn't refresh — Reconnect GitHub");
    const query = source.config.source === "query" ? source.config.query! : {
      "awaiting-review": `is:pr is:open review-requested:${record.login}`,
      "open-prs": `is:pr is:open author:${record.login}`,
      "assigned-issues": `is:issue is:open assignee:${record.login}`,
    }[source.config.source];
    const payload = await this.request(`search/issues?q=${encodeURIComponent(query)}&per_page=25&sort=updated`, secret.value, signal, () => this.records().some(account => account.id === record.id && account.secretName === record.secretName));
    // A revoked account must not publish the in-flight read.
    if (!this.records().some(account => account.id === record.id)) throw new AuxError("cancelled", "GitHub was disconnected during refresh.");
    if (!Array.isArray(payload.items)) throw new AuxError("backend_unavailable", "GitHub returned invalid search results.");
    return payload.items.slice(0, 25).flatMap(raw => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;
      if (typeof item.html_url !== "string" || typeof item.title !== "string" || typeof item.id !== "number") return [];
      let url: URL;
      try { url = new URL(item.html_url); } catch { return []; }
      if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.href.length > 8192) return [];
      const repo = url.pathname.split("/").slice(1, 3).join("/");
      return [{ id: String(item.id), url: url.href, title: item.title.slice(0, 500) || "Untitled GitHub item",
        subtitle: `${repo} #${item.number ?? ""}`.slice(0, 500), unread: true,
        updatedAt: typeof item.updated_at === "string" && Number.isFinite(Date.parse(item.updated_at)) ? Date.parse(item.updated_at) : 0 }];
    });
  }
}
