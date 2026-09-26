import { describe, expect, it } from "vitest";
import type { PageTarget, TidyProposal } from "@aux/contracts";
import { proposeTabTidy } from "../../apps/runtime/src/agent/tidy.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import { applyTidyProposal, revertTidyProposal } from "../../apps/shell/src/tidy-layout.js";
import { emptyLayout } from "../../apps/shell/src/workspace.js";

const pages = [1, 2, 3, 4].map(index => ({
  pageId: `p${index}`, url: `https://example.com/private/${index}?token=secret`, title: `Research ${index}`,
  controller: "human", viewStatus: "visible", ownedByRuntime: false,
}) as PageTarget);

describe("AI Tidy proposal and guarded layout apply", () => {
  it("uses the fast Contributor route and sends only titles and site origins", async () => {
    let called: { modelId: string; reasoning?: string; prompt: string; maxAttempts?: number } | undefined;
    const model = { generateStructured: async (opts: typeof called & { schema: unknown }) => {
      called = opts;
      return { object: { groups: [{ name: "Reading", pageIds: ["p1", "p2"] }] } };
    } } as unknown as ModelClient;
    const proposal = await proposeTabTidy({ pageIds: pages.map(page => page.pageId) }, pages, model,
      { modelId: "meta/muse-spark-1.3-contributor", reasoning: "low" });
    expect(called).toMatchObject({ modelId: "meta/muse-spark-1.3-contributor", reasoning: "low", maxAttempts: 1 });
    expect(called!.prompt).toContain("https://example.com");
    expect(called!.prompt).not.toContain("/private/");
    expect(called!.prompt).not.toContain("secret");
    expect(proposal.groups).toEqual([{ name: "Reading", pageIds: ["p1", "p2"] }]);
    expect(proposal.pages).toHaveLength(4);
  });

  it("rejects hallucinated and duplicate tab IDs before proposing any move", async () => {
    const model = { generateStructured: async () => ({ object: { groups: [{ name: "Reading", pageIds: ["p1", "unknown"] }] } }) } as unknown as ModelClient;
    await expect(proposeTabTidy({ pageIds: ["p1", "p2", "p3"] }, pages, model,
      { modelId: "meta/muse-spark-1.3-contributor", reasoning: "low" })).rejects.toMatchObject({ code: "model_output_invalid" });
    await expect(proposeTabTidy({ pageIds: ["p1", "p1", "p2"] }, pages, model,
      { modelId: "meta/muse-spark-1.3-contributor", reasoning: "low" })).rejects.toMatchObject({ code: "invalid_params" });
  });

  it("applies an atomic folder layout and refuses changed tab identity", () => {
    const before = emptyLayout();
    const proposal: TidyProposal = { pages: pages.map(({ pageId, url, title }) => ({ pageId, url, title })),
      groups: [{ name: "Reading", pageIds: ["p1", "p2"] }, { name: "Later", pageIds: ["p3", "p4"] }],
      modelId: "meta/muse-spark-1.3-contributor", createdAt: 1 };
    const after = applyTidyProposal(before, pages, before.activeSpaceId, proposal);
    expect(before.folders).toHaveLength(0);
    expect(after.folders.map(folder => folder.name)).toEqual(["Reading", "Later"]);
    expect(after.tabFolder.p1).toBe(after.tabFolder.p2);
    expect(after.tabFolder.p3).toBe(after.tabFolder.p4);
    expect(after.tabFolder.p1).not.toBe(after.tabFolder.p3);
    const unrelated = { ...after, pins: { ...after.pins, [before.activeSpaceId]: [{ url: "https://unrelated.example", title: "Kept" }] } };
    const restored = revertTidyProposal(before, after, unrelated);
    expect(restored.folders).toEqual(before.folders);
    expect(restored.tabFolder).toEqual(before.tabFolder);
    expect(restored.pins).toEqual(unrelated.pins);
    expect(() => revertTidyProposal(before, after, { ...after, tabFolder: { ...after.tabFolder, p1: "another-folder" } }))
      .toThrow(/moved again/);
    expect(() => applyTidyProposal(before, [{ ...pages[0]!, url: "https://changed.example" }, ...pages.slice(1)], before.activeSpaceId, proposal))
      .toThrow(/changed or moved/);
    expect(() => applyTidyProposal(before, [{ ...pages[0]!, controller: "agent" }, ...pages.slice(1)], before.activeSpaceId, proposal))
      .toThrow(/changed or moved/);
  });
});
