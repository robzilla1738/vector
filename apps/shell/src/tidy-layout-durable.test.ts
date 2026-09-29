import { expect, it } from "vitest";
import type { OrganizationSnapshot, PageTarget, TidyProposal } from "@aux/contracts";
import { applyTidyProposal, revertTidyRecord, tidyUndoRecord } from "./tidy-layout";
import { OrganizationPersistence } from "./store/organization-persistence";
import { fromOrganizationLayout } from "./store/organization-layout";
import { emptyLayout } from "./workspace";

it("commits reviewed Tidy and Undo across independent organization sessions", async () => {
  const original = emptyLayout();
  const spaceId = original.activeSpaceId;
  const pages = ["one", "two"].map(pageId => ({
    pageId, url: `https://example.test/${pageId}`, title: pageId,
    controller: "none", ownedByRuntime: false, viewStatus: "visible",
  })) as PageTarget[];
  const proposal = { pages: pages.map(({ pageId, url, title }) => ({ pageId, url, title })),
    groups: [{ name: "Research", pageIds: ["one", "two"] }], modelId: "fixture", createdAt: 1 } as TidyProposal;
  let snapshot: OrganizationSnapshot = { revision: 0, layout: null };
  const host = {
    organizationSnapshot: async () => structuredClone(snapshot),
    organizationCommit: async (input: { expectedRevision: number; layout: NonNullable<OrganizationSnapshot["layout"]> }) => {
      if (input.expectedRevision !== snapshot.revision) throw new Error("stale revision");
      snapshot = { revision: snapshot.revision + 1, layout: structuredClone(input.layout) };
      return structuredClone(snapshot);
    },
  };
  const session = new OrganizationPersistence(host, original);
  expect(await session.hydrate()).toEqual(original);
  const applied = applyTidyProposal(original, pages, spaceId, proposal);
  const receipt = tidyUndoRecord(original, applied);
  session.persist({ ...applied, tidyUndo: receipt });
  await session.flush();

  const restarted = new OrganizationPersistence(host, emptyLayout());
  const recovered = await restarted.hydrate();
  expect(recovered.folders.map(folder => folder.name)).toEqual(["Research"]);
  expect(recovered.tidyUndo).toEqual(receipt);
  const newWindow = fromOrganizationLayout({ ...snapshot.layout!, window: { ...snapshot.layout!.window, order: [], tabFolder: {} } });
  expect(() => revertTidyRecord(newWindow.tidyUndo!, newWindow)).not.toThrow();
  const restored = revertTidyRecord(recovered.tidyUndo!, recovered);
  restarted.persist(restored);
  await restarted.flush();
  expect(await new OrganizationPersistence(host, emptyLayout()).hydrate()).toEqual(original);
});

it("refuses Undo if a tidied tab or its folder changed after review", () => {
  const before = emptyLayout();
  const pages = ["one", "two"].map(pageId => ({ pageId, url: `https://example.test/${pageId}`,
    title: pageId, controller: "none", ownedByRuntime: false, viewStatus: "visible" })) as PageTarget[];
  const after = applyTidyProposal(before, pages, before.activeSpaceId, { pages: pages.map(({ pageId, url, title }) => ({ pageId, url, title })),
    groups: [{ name: "Research", pageIds: ["one", "two"] }], modelId: "fixture", createdAt: 1 } as TidyProposal);
  const record = tidyUndoRecord(before, after);
  expect(() => revertTidyRecord(record, { ...after, tabFolder: { ...after.tabFolder, one: "other" } })).toThrow(/moved again/);
  expect(() => revertTidyRecord(record, { ...after, folders: after.folders.map(folder => ({ ...folder, name: "Changed" })) })).toThrow(/folder changed/);
});
