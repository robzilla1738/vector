import { describe, expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { suggestTabName } from "../../apps/runtime/src/agent/tab-name.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import { emptyLayout, parseLayout, syncLayout, tabLabel } from "../../apps/desktop/renderer/src/workspace.js";

const page = { pageId: "p1", url: "https://example.com/private/report?token=secret", title: "Quarterly report — Example",
  documentEpoch: 3, viewStatus: "visible", controller: "none", ownedByRuntime: false } as PageTarget;
const route = { modelId: "meta/muse-spark-1.3-contributor", reasoning: "low" as const };
const input = { pageId: page.pageId, expectedUrl: page.url, expectedDocumentEpoch: page.documentEpoch };

describe("AI tab naming", () => {
  it("uses the fast Contributor route without sending the page path or query", async () => {
    let called: { modelId: string; reasoning?: string; prompt: string; maxAttempts?: number; maxOutputTokens?: number } | undefined;
    const model = { generateStructured: async (opts: typeof called & { schema: unknown }) => {
      called = opts;
      return { object: { name: "Quarterly report" } };
    } } as unknown as ModelClient;
    const suggestion = await suggestTabName(input, page, model, route);
    expect(called).toMatchObject({ modelId: route.modelId, reasoning: "low", maxAttempts: 1, maxOutputTokens: 128 });
    expect(called!.prompt).toContain("https://example.com");
    expect(called!.prompt).not.toContain("/private/report");
    expect(called!.prompt).not.toContain("secret");
    expect(suggestion).toMatchObject({ name: "Quarterly report", sourceTitle: page.title, sourceUrl: page.url,
      documentEpoch: page.documentEpoch, modelId: route.modelId });
  });

  it("rejects stale or agent-controlled tabs before calling a model", async () => {
    let called = false;
    const model = { generateStructured: async () => { called = true; return { object: { name: "Report" } }; } } as unknown as ModelClient;
    await expect(suggestTabName(input, { ...page, documentEpoch: 4 }, model, route)).rejects.toMatchObject({ code: "conflict" });
    await expect(suggestTabName(input, { ...page, controller: "agent" }, model, route)).rejects.toMatchObject({ code: "conflict" });
    expect(called).toBe(false);
  });

  it("rejects unsafe model output with a public error code", async () => {
    const model = { generateStructured: async () => ({ object: { name: "\u202esecret" } }) } as unknown as ModelClient;
    await expect(suggestTabName(input, page, model, route)).rejects.toMatchObject({ code: "model_output_invalid" });
  });

  it("keeps a human label only for the exact URL and prunes it on navigation or close", () => {
    const layout = { ...emptyLayout(), tabNames: { p1: { title: "Work report", url: page.url } } };
    expect(tabLabel(layout, page)).toBe("Work report");
    expect(tabLabel(layout, { ...page, url: "https://example.com/other" })).toBe(page.title);
    expect(parseLayout(JSON.stringify(layout)).tabNames?.p1).toEqual(layout.tabNames.p1);
    expect(syncLayout(layout, [{ ...page, url: "https://example.com/other" }]).tabNames).toEqual({});
    expect(syncLayout(layout, []).tabNames).toEqual({});
  });
});
