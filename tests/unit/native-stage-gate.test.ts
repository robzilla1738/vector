import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, expect, it } from "vitest";
import { EventBus, NullNativeBridge, PageService, Repo, openDb, type NativeBridge } from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";

describe("native interactive stage", () => {
  it("does not dispatch browser input after native stage rejection or lost acknowledgement", async () => {
    let enabled = false;
    let mode: "rejected" | "lost" | "ready" = "rejected";
    let clicked = 0;
    let releases = 0;
    const visibilityRequests: boolean[] = [];
    const native: NativeBridge = Object.assign(new NullNativeBridge(), {
      available: () => enabled,
      acquireStage: async (_pageId: string, requiresVisible = false) => {
        visibilityRequests.push(requiresVisible);
        if (mode === "lost") throw new Error("socket closed");
        return { ok: mode === "ready" && !requiresVisible };
      },
      releaseStage: async () => {
        releases++;
        return { ok: true };
      },
    });
    const page = {
      identity: { pageId: "p", targetId: "t", backend: "aux" },
      url: () => "https://app.test/",
      title: async () => "App",
      isAttached: () => true,
      navigate: async () => {},
      click: async () => {
        clicked++;
      },
      setEvents: () => {},
      dispose: async () => {},
    } as unknown as DriverPage;
    const driver = {
      backend: "aux",
      isConnected: () => true,
      createTarget: async () => "t",
      attach: async (_targetId: string, pageId: string) => ({
        ...page,
        identity: { pageId, targetId: "t", backend: "aux" },
      }),
    } as unknown as BrowserDriver;
    const repo = new Repo(openDb(":memory:"));
    const pages = new PageService({
      turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
        pages.get(pageId),
      ),
      repo,
      events: new EventBus(repo),
      native,
      drivers: () => ({ aux: driver, chrome: null }),
    });
    const target = await pages.open({ url: "https://app.test/", background: true, ownedByRuntime: true });
    enabled = true;
    const program = { pageId: target.pageId, steps: [{ id: "click", op: "click" as const, target: "r1" }] };
    await expect(pages.execute(program)).rejects.toMatchObject({ code: "backend_unavailable" });
    mode = "lost";
    await expect(pages.execute(program)).rejects.toMatchObject({ code: "backend_unavailable" });
    expect(clicked).toBe(0);
    expect(releases).toBe(1);
    mode = "ready";
    await expect(pages.execute(program)).resolves.toMatchObject({ status: "completed" });
    expect(clicked).toBe(1);
    expect(releases).toBe(2);
    await expect(
      pages.execute({ pageId: target.pageId, steps: [{ id: "pixel", op: "clickPoint", x: 12, y: 24 }] }),
    ).rejects.toMatchObject({ code: "backend_unavailable" });
    expect(visibilityRequests).toEqual([false, false, false, true]);
    expect(clicked).toBe(1);
  });
});
