import { describe, expect, it } from "vitest";
import { OrganizationLayoutSchema, type PageTarget, type TidyProposal } from "@aux/contracts";
import { proposeTabTidy } from "../../apps/runtime/src/agent/tidy.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import {
  applyTidyProposal,
  revertTidyProposal,
  revertTidyRecord,
  tidyUndoRecord,
} from "../../apps/shell/src/tidy-layout.js";
import { assignFolder, emptyLayout } from "../../apps/shell/src/workspace.js";
import {
  fromOrganizationLayout,
  toOrganizationLayout,
} from "../../apps/shell/src/store/organization-layout.js";

const pages = [1, 2, 3, 4].map(
  (index) =>
    ({
      pageId: `p${index}`,
      url: `https://example.com/private/${index}?token=secret`,
      title: `Research ${index}`,
      controller: "human",
      viewStatus: "visible",
      ownedByRuntime: false,
    }) as PageTarget,
);

describe("AI Tidy proposal and guarded layout apply", () => {
  it("uses the fast Contributor route and sends only titles and site origins", async () => {
    let called: { modelId: string; reasoning?: string; prompt: string; maxAttempts?: number } | undefined;
    const model = {
      generateStructured: async (opts: typeof called & { schema: unknown }) => {
        called = opts;
        return { object: { groups: [{ name: "Reading", pageIds: ["p1", "p2"] }] } };
      },
    } as unknown as ModelClient;
    const proposal = await proposeTabTidy({ pageIds: pages.map((page) => page.pageId) }, pages, model, {
      modelId: "meta/muse-spark-1.3-contributor",
      reasoning: "low",
    });
    expect(called).toMatchObject({
      modelId: "meta/muse-spark-1.3-contributor",
      reasoning: "low",
      maxAttempts: 1,
    });
    expect(called!.prompt).toContain("https://example.com");
    expect(called!.prompt).not.toContain("/private/");
    expect(called!.prompt).not.toContain("secret");
    expect(proposal.groups).toEqual([{ name: "Reading", pageIds: ["p1", "p2"] }]);
    expect(proposal.pages).toHaveLength(4);
  });

  it("rejects hallucinated and duplicate tab IDs before proposing any move", async () => {
    const model = {
      generateStructured: async () => ({
        object: { groups: [{ name: "Reading", pageIds: ["p1", "unknown"] }] },
      }),
    } as unknown as ModelClient;
    await expect(
      proposeTabTidy({ pageIds: ["p1", "p2", "p3"] }, pages, model, {
        modelId: "meta/muse-spark-1.3-contributor",
        reasoning: "low",
      }),
    ).rejects.toMatchObject({ code: "model_output_invalid" });
    await expect(
      proposeTabTidy({ pageIds: ["p1", "p1", "p2"] }, pages, model, {
        modelId: "meta/muse-spark-1.3-contributor",
        reasoning: "low",
      }),
    ).rejects.toMatchObject({ code: "invalid_params" });
  });

  it("applies an atomic folder layout and refuses changed tab identity", () => {
    const before = emptyLayout();
    const proposal: TidyProposal = {
      pages: pages.map(({ pageId, url, title }) => ({ pageId, url, title })),
      groups: [
        { name: "Reading", pageIds: ["p1", "p2"] },
        { name: "Later", pageIds: ["p3", "p4"] },
      ],
      modelId: "meta/muse-spark-1.3-contributor",
      createdAt: 1,
    };
    const after = applyTidyProposal(before, pages, before.activeSpaceId, proposal);
    expect(before.folders).toHaveLength(0);
    expect(after.folders.map((folder) => folder.name)).toEqual(["Reading", "Later"]);
    expect(after.tabFolder.p1).toBe(after.tabFolder.p2);
    expect(after.tabFolder.p3).toBe(after.tabFolder.p4);
    expect(after.tabFolder.p1).not.toBe(after.tabFolder.p3);
    const unrelated = {
      ...after,
      pins: { ...after.pins, [before.activeSpaceId]: [{ url: "https://unrelated.example", title: "Kept" }] },
    };
    const restored = revertTidyProposal(before, after, unrelated);
    expect(restored.folders).toEqual(before.folders);
    expect(restored.tabFolder).toEqual(before.tabFolder);
    expect(restored.pins).toEqual(unrelated.pins);
    expect(() =>
      revertTidyProposal(before, after, {
        ...after,
        tabFolder: { ...after.tabFolder, p1: "another-folder" },
      }),
    ).toThrow(/moved again/);
    expect(() =>
      applyTidyProposal(
        before,
        [{ ...pages[0]!, url: "https://changed.example" }, ...pages.slice(1)],
        before.activeSpaceId,
        proposal,
      ),
    ).toThrow(/changed or moved/);
    expect(() =>
      applyTidyProposal(
        before,
        [{ ...pages[0]!, controller: "agent" }, ...pages.slice(1)],
        before.activeSpaceId,
        proposal,
      ),
    ).toThrow(/changed or moved/);
  });

  it("persists a compact group receipt and restores only unchanged Tidy folders after reload", () => {
    const before = emptyLayout();
    const proposal: TidyProposal = {
      pages: pages.map(({ pageId, url, title }) => ({ pageId, url, title })),
      groups: [{ name: "Reading", pageIds: ["p1", "p2"] }],
      modelId: "meta/muse-spark-1.3-contributor",
      createdAt: 1,
    };
    const applied = applyTidyProposal(before, pages, before.activeSpaceId, proposal);
    const receipt = tidyUndoRecord(before, applied);
    const saved = OrganizationLayoutSchema.parse(toOrganizationLayout({ ...applied, tidyUndo: receipt }));
    expect(saved.shared.tidyUndo).toEqual(receipt);
    const restored = fromOrganizationLayout(JSON.parse(JSON.stringify(saved)));
    expect(restored.tidyUndo).toEqual(receipt);
    const restarted = fromOrganizationLayout({
      ...saved,
      window: toOrganizationLayout(emptyLayout()).window,
    });
    expect(restarted.tabFolder.p1).toBe(receipt.created[0]!.id);
    expect(restarted.tabFolder.p2).toBe(receipt.created[0]!.id);
    const manuallyMoved = assignFolder(restored, "p1", null);
    expect(manuallyMoved.tidyUndo).toBeUndefined();
    const afterMove = fromOrganizationLayout({
      ...toOrganizationLayout(manuallyMoved),
      window: toOrganizationLayout(emptyLayout()).window,
    });
    expect(afterMove.tabFolder.p1).toBeUndefined();
    const unrelated = {
      ...restored,
      pins: {
        ...restored.pins,
        [before.activeSpaceId]: [{ url: "https://unrelated.example", title: "Kept" }],
      },
    };
    const undone = revertTidyRecord(restored.tidyUndo!, unrelated);
    expect(undone.folders).toEqual(before.folders);
    expect(undone.tabFolder).toEqual(before.tabFolder);
    expect(undone.pins).toEqual(unrelated.pins);
    expect(undone.tidyUndo).toBeUndefined();
    expect(() =>
      revertTidyRecord(receipt, {
        ...restored,
        folders: restored.folders.map((folder) => ({ ...folder, name: "Renamed" })),
      }),
    ).toThrow(/folder changed/);
    expect(() =>
      revertTidyRecord(receipt, {
        ...restored,
        tabFolder: { ...restored.tabFolder, p3: receipt.created[0]!.id },
      }),
    ).toThrow(/new tab/);
  });
});

it("uses the saved owner grouping preference without exposing full tab URLs or changing the output guard", async () => {
  let request: { prompt: string; system: string } | undefined;
  const model = {
    generateStructured: async (value: typeof request) => {
      request = value;
      return { object: { groups: [{ name: "By site", pageIds: ["p1", "p2"] }] } };
    },
  } as unknown as ModelClient;
  const result = await proposeTabTidy(
    { pageIds: ["p1", "p2", "p3"] },
    pages,
    model,
    { modelId: "synthetic-model", reasoning: "low" },
    undefined,
    1200,
    "Group by website and keep folder names short.",
  );
  expect(request!.prompt).toContain(
    "Owner grouping preference: Group by website and keep folder names short.",
  );
  expect(request!.prompt).not.toContain("/private/");
  expect(request!.prompt).not.toContain("token=secret");
  expect(request!.system).toContain("Use only IDs given");
  expect(result.groups[0]!.pageIds).toEqual(["p1", "p2"]);
});
