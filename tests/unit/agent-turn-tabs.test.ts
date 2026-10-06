import { expect, it } from "vitest";
import { AgentTurnTabs } from "../../apps/runtime/src/agent/turn-tabs.js";
import type { PageTarget, AgentPageCreate } from "@aux/contracts";
import type { PageService } from "../../apps/runtime/src/services/pages.js";

it("reuses a turn tab, closes owned tabs at turn end, and preserves a human takeover", async () => {
  let now = 1000;
  const pages = new Map<string, PageTarget>();
  const closed: string[] = [];
  let next = 0;
  const service = {
    open: async ({ url }: { url: string }) => {
      const page = { pageId: `p${++next}`, url, ownedByRuntime: true, controller: "none" } as PageTarget;
      pages.set(page.pageId, page);
      return page;
    },
    get: (id: string) => {
      const page = pages.get(id);
      if (!page) throw new Error("closed");
      return page;
    },
    close: async (id: string) => {
      pages.delete(id);
      closed.push(id);
      return { ok: true };
    },
  } as Pick<PageService, "open" | "get" | "close">;
  const promoted: string[] = [];
  const turns = new AgentTurnTabs(
    service,
    (page) => {
      page.ownedByRuntime = false;
      promoted.push(page.pageId);
    },
    () => now,
  );
  try {
    const input = {
      connectionId: "c1",
      taskId: "t1",
      turnId: "turn1",
      url: "https://example.com/",
      skipIfActive: true,
    };
    const first = await turns.open(input);
    expect((await turns.open(input)).pageId).toBe(first.pageId);
    const second = await turns.open({ ...input, url: "https://example.com/other" });
    second.controller = "human";
    expect(turns.pageIds("c1")).toEqual([first.pageId, second.pageId]);
    expect(await turns.end("c1", "t1", "turn1")).toEqual({ closed: [first.pageId] });
    expect(promoted).toEqual([second.pageId]);
    expect(pages.has(second.pageId)).toBe(true);
    const old = await turns.open(input);
    now += 60 * 60_000 + 1;
    await turns.sweep();
    expect(closed).toContain(old.pageId);
    expect(turns.pageIds("c1")).toEqual([]);
  } finally {
    turns.dispose();
  }
});

it("never reuses a same-URL turn tab from an older run or task revision", async () => {
  const pages = new Map<string, PageTarget>();
  const service = {
    open: async ({
      url,
      agentScope,
    }: {
      url: string;
      agentScope?: Omit<AgentPageCreate, "windowId" | "background">;
    }) => {
      const page = {
        pageId: `p${pages.size + 1}`,
        url,
        ownedByRuntime: true,
        controller: "none",
        agentIsolation: {
          isolationId: `i${pages.size + 1}`,
          runId: agentScope!.runId,
          taskId: agentScope!.taskId,
          taskRevision: agentScope!.taskRevision,
          ...(agentScope!.mode === "private"
            ? { mode: "private", inMemory: true, cookies: "empty" }
            : { mode: "session", inMemory: false, cookies: "profile" }),
        },
      } as PageTarget;
      pages.set(page.pageId, page);
      return page;
    },
    get: (id: string) => pages.get(id)!,
    close: async () => ({ ok: true }),
  } as Pick<PageService, "open" | "get" | "close">;
  const turns = new AgentTurnTabs(service);
  try {
    const input = {
      connectionId: "c",
      taskId: "t",
      turnId: "turn",
      url: "https://source.test/",
      skipIfActive: true,
      agentScope: {
        mode: "session" as const,
        profileId: "profile",
        runId: "first",
        ancestry: ["first"],
        taskId: "t",
        taskRevision: 1,
      },
    };
    const first = await turns.open(input);
    expect((await turns.open(input)).pageId).toBe(first.pageId);
    const next = await turns.open({ ...input, agentScope: { ...input.agentScope, runId: "second" } });
    expect(next.pageId).not.toBe(first.pageId);
    const privatePage = await turns.open({
      ...input,
      agentScope: { ...input.agentScope, mode: "private" as const },
    });
    expect(privatePage.pageId).not.toBe(first.pageId);
    first.agentIsolation = { ...first.agentIsolation!, mode: "private", inMemory: true, cookies: "empty" };
    expect(turns.owns("c", "t", first.pageId)).toBe(false);

    expect(
      (await turns.open({ ...input, agentScope: { ...input.agentScope, taskRevision: 2 } })).pageId,
    ).not.toBe(first.pageId);
  } finally {
    turns.dispose();
  }
});
