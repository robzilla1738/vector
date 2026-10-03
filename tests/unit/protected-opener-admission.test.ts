import { afterEach, expect, it, vi } from "vitest";
import type { BrowserDriver } from "@aux/chromium-driver";
import { EventBus, NullNativeBridge, openDb, Repo } from "@aux/runtime";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { PageOpener } from "../../apps/runtime/src/services/pages/opener.js";
import { ActivationPolicy } from "../../apps/runtime/src/services/pages/activation.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const repos: Repo[] = [];
afterEach(() => { for (const repo of repos.splice(0)) repo.close(); });
function fixture() {
  const repo = new Repo(openDb(":memory:")); repos.push(repo);
  repo.saveRun({ runId: "original-run", goal: "Open selected website", status: "running", pageIds: [],
    createdAt: 1, config: { taskId: "original-task", taskRevision: 4 } });
  let connected = false, release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  const reconnect = vi.fn(async () => { await hold; connected = true; });
  const browser = { isConnected: () => connected, reconnect } as unknown as BrowserDriver;
  const nativeFailure = new Error("Original native transport refusal");
  const createAgentPage = vi.fn(async () => { throw nativeFailure; });
  const native = Object.assign(new NullNativeBridge(), { available: () => true, createAgentPage });
  const pages = new PageRegistry({ repo, events: new EventBus(repo), native,
    turnMentions: fixtureTurnMentions(id => repo.getPage(id)), drivers: () => ({ aux: browser, chrome: null }) });
  const opener = new PageOpener(pages, new ActivationPolicy(pages));
  const controller = new AbortController();
  const open = () => opener.open({ url: "https://selected.test/", background: true, ownedByRuntime: true,
    signal: controller.signal, beforeNavigate: async () => {},
    agentScope: { profileId: "profile", runId: "original-run", taskId: "original-task", taskRevision: 4,
      ancestry: ["original-run"] } });
  return { repo, pages, open, release, reconnect, createAgentPage, controller, nativeFailure };
}
it.each(["terminal", "revision", "abort"] as const)("rechecks original %s authority after held reconnect before native creation", async change => {
  const f = fixture();
  const pending = f.open().catch(error => error);
  expect(f.reconnect).toHaveBeenCalledTimes(1);
  expect(f.createAgentPage).not.toHaveBeenCalled();
  const original = f.repo.getRun("original-run")!;
  if (change === "terminal") f.repo.saveRun({ ...original, status: "completed" });
  if (change === "revision") f.repo.saveRun({ ...original, config: { ...original.config, taskRevision: 5 } });
  if (change === "abort") f.controller.abort();
  f.release();
  expect(await pending).toMatchObject({ code: "ref_stale" });
  expect(f.createAgentPage).not.toHaveBeenCalled();
  expect(f.pages.agentCreations.size).toBe(0);
  expect(f.pages.opening.size).toBe(0);
});
it("dispatches the unchanged original scope only after reconnect and retains actual native refusal", async () => {
  const f = fixture();
  const pending = f.open().catch(error => error);
  expect(f.createAgentPage).not.toHaveBeenCalled();
  f.release();
  expect(await pending).toBe(f.nativeFailure);
  expect(f.createAgentPage).toHaveBeenCalledExactlyOnceWith({ profileId: "profile", runId: "original-run",
    taskId: "original-task", taskRevision: 4, ancestry: ["original-run"], windowId: "main", background: true });
  expect(f.pages.agentCreations.size).toBe(0);
  expect(f.pages.opening.size).toBe(0);
});
