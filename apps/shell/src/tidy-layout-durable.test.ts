import { expect, it } from "vitest";
import type { OrganizationSnapshot, PageTarget, TidyProposal } from "@aux/contracts";
import { applyTidyProposal, revertTidyRecord, tidyUndoRecord } from "./tidy-layout";
import { undoTidyChange } from "./tidy-commit";
import { OrganizationPersistence } from "./store/organization-persistence";
import { fromOrganizationLayout, toOrganizationLayout } from "./store/organization-layout";
import { assignFolder, emptyLayout, renameFolder, type Layout } from "./workspace";

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
  const newWindow = fromOrganizationLayout({ ...snapshot.layout!, window: toOrganizationLayout(emptyLayout()).window });
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

it("keeps a changed folder after restart and refuses the stale Tidy receipt", async () => {
  const before = emptyLayout();
  const pages = ["one", "two"].map(pageId => ({ pageId, url: `https://example.test/${pageId}`,
    title: pageId, controller: "none", ownedByRuntime: false, viewStatus: "visible" })) as PageTarget[];
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
  const session = new OrganizationPersistence(host, before);
  await session.hydrate();
  const applied = applyTidyProposal(before, pages, before.activeSpaceId, proposal);
  const receipt = tidyUndoRecord(before, applied);
  session.persist({ ...applied, tidyUndo: receipt });
  await session.flush();
  const changed = renameFolder({ ...applied, tidyUndo: receipt }, receipt.created[0]!.id, "Changed by owner");
  expect(changed.tidyUndo).toBeUndefined();
  session.persist(changed);
  await session.flush();

  const recovered = await new OrganizationPersistence(host, emptyLayout()).hydrate();
  expect(recovered.folders[0]?.name).toBe("Changed by owner");
  expect(recovered.tidyUndo).toBeUndefined();
  expect(recovered.tabFolder.one).toBe(receipt.moved[0]?.toFolderId);
  expect(() => revertTidyRecord(receipt, recovered)).toThrow(/folder changed/);
});

function tidyPages(ids: string[]): PageTarget[] {
  return ids.map(pageId => ({
    pageId, url: `https://example.test/${pageId}`, title: pageId,
    controller: "none", ownedByRuntime: false, viewStatus: "visible",
  })) as PageTarget[];
}

function tidyProposal(pageIds: string[]): TidyProposal {
  return {
    pages: pageIds.map(pageId => ({ pageId, url: `https://example.test/${pageId}`, title: pageId })),
    groups: [{ name: "Research", pageIds }], modelId: "fixture", createdAt: 1,
  } as TidyProposal;
}

function memoryHost(box: { snapshot: OrganizationSnapshot }) {
  return {
    organizationSnapshot: async () => structuredClone(box.snapshot),
    organizationCommit: async (input: { expectedRevision: number; layout: NonNullable<OrganizationSnapshot["layout"]> }) => {
      if (input.expectedRevision !== box.snapshot.revision) throw new Error("stale revision");
      box.snapshot = { revision: box.snapshot.revision + 1, layout: structuredClone(input.layout) };
      return structuredClone(box.snapshot);
    },
  };
}

async function reviewedTidy() {
  const before = emptyLayout();
  const box = { snapshot: { revision: 0, layout: null } as OrganizationSnapshot };
  const session = new OrganizationPersistence(memoryHost(box), before);
  await session.hydrate();
  const applied = applyTidyProposal(before, tidyPages(["one", "two"]), before.activeSpaceId, tidyProposal(["one", "two"]));
  const receipt = tidyUndoRecord(before, applied);
  const tidied = { ...applied, tidyUndo: receipt };
  session.persist(tidied);
  await session.flush();
  return { before, box, session, receipt, tidied };
}

function publish(box: { snapshot: OrganizationSnapshot }, layout: Layout) {
  box.snapshot = { revision: box.snapshot.revision + 1, layout: structuredClone(toOrganizationLayout(layout)) };
}

it("refuses a stale Tidy undo after the folder, a tab, or its revision changes", async () => {
  const renamed = await reviewedTidy();
  const renamedUndo = revertTidyRecord(renamed.receipt, renamed.tidied);
  publish(renamed.box, renameFolder(renamed.tidied, renamed.receipt.created[0]!.id, "Changed by owner"));
  const renamedRevision = renamed.box.snapshot.revision;
  renamed.session.persist(renamedUndo);
  await expect(renamed.session.flush()).rejects.toThrow(/out of date/);
  expect(renamed.box.snapshot.revision).toBe(renamedRevision);
  expect(renamed.box.snapshot.layout?.shared.folders.map(folder => folder.name)).toEqual(["Changed by owner"]);
  expect(renamed.box.snapshot.layout?.shared.tidyUndo).toBeUndefined();
  renamed.session.persist(renamedUndo);
  const kept = await renamed.session.refresh();
  expect(kept.folders.map(folder => folder.name)).toEqual(["Changed by owner"]);
  await renamed.session.flush();
  expect(renamed.box.snapshot.layout?.shared.folders.map(folder => folder.name)).toEqual(["Changed by owner"]);
  await expect(undoTidyChange(renamed.session, renamed.receipt)).rejects.toThrow(/folder changed|moved again|out of date/);
  expect(renamed.box.snapshot.layout?.shared.folders.map(folder => folder.name)).toEqual(["Changed by owner"]);
  expect(renamed.box.snapshot.layout?.shared.tidyUndo).toBeUndefined();

  const moved = await reviewedTidy();
  const movedUndo = revertTidyRecord(moved.receipt, moved.tidied);
  publish(moved.box, assignFolder(moved.tidied, "one", null));
  moved.session.persist(movedUndo);
  await expect(moved.session.flush()).rejects.toThrow(/out of date/);
  expect(moved.box.snapshot.layout?.shared.folders.map(folder => folder.name)).toEqual(["Research"]);
  expect(moved.box.snapshot.layout?.shared.tabFolder.one).toBeUndefined();
  expect(moved.box.snapshot.layout?.shared.tidyUndo).toBeUndefined();
  await expect(undoTidyChange(moved.session, moved.receipt)).rejects.toThrow(/folder changed|moved again|out of date/);
  expect(moved.box.snapshot.layout?.shared.folders).toHaveLength(1);
  expect(moved.box.snapshot.layout?.shared.tabFolder.one).toBeUndefined();

  const revised = await reviewedTidy();
  const revisedUndo = revertTidyRecord(revised.receipt, revised.tidied);
  publish(revised.box, {
    ...revised.tidied,
    folders: revised.tidied.folders.map(folder => ({ ...folder, collapsed: true })),
  });
  revised.session.persist(revisedUndo);
  await expect(revised.session.flush()).rejects.toThrow(/out of date/);
  expect(revised.box.snapshot.layout?.shared.folders[0]).toMatchObject({ name: "Research", collapsed: true });
  expect(revised.box.snapshot.layout?.shared.tidyUndo).toEqual(revised.receipt);
  await expect(undoTidyChange(revised.session, revised.receipt)).rejects.toThrow(/folder changed|out of date/);
  expect(revised.box.snapshot.layout?.shared.folders[0]).toMatchObject({ name: "Research", collapsed: true });
  expect(revised.box.snapshot.layout?.shared.tidyUndo).toEqual(revised.receipt);
});

it("still undoes a reviewed Tidy change after an unrelated pin revision", async () => {
  const { before, box, session, receipt, tidied } = await reviewedTidy();
  const pin = [{ url: "https://pin.example", title: "Pin" }];
  publish(box, { ...tidied, pins: { ...tidied.pins, [before.activeSpaceId]: pin } });
  const restored = await undoTidyChange(session, receipt);
  expect(restored.folders).toEqual([]);
  expect(restored.pins[before.activeSpaceId]).toEqual(pin);
  expect(box.snapshot.layout?.shared.folders).toEqual([]);
  expect(box.snapshot.layout?.shared.tidyUndo).toBeUndefined();
  expect(box.snapshot.layout?.shared.pins[before.activeSpaceId]).toEqual(pin);
});

it("does not restore a stale Tidy grouping after folder membership or identity changes", () => {
  const before = emptyLayout();
  const applied = applyTidyProposal(before, tidyPages(["one", "two"]), before.activeSpaceId, tidyProposal(["one", "two"]));
  const receipt = tidyUndoRecord(before, applied);
  const tidied = { ...applied, tidyUndo: receipt };
  const filed = assignFolder(tidied, "three", receipt.created[0]!.id);
  expect(filed.tidyUndo).toBeUndefined();
  const restarted = fromOrganizationLayout({
    ...toOrganizationLayout(filed),
    window: { ...toOrganizationLayout(emptyLayout()).window },
  });
  expect(restarted.tabFolder).toEqual(filed.tabFolder);
  expect(restarted.tabFolder.three).toBe(receipt.created[0]!.id);
  expect(restarted.tidyUndo).toBeUndefined();
  expect(() => revertTidyRecord(receipt, restarted)).toThrow("A new tab was added to a Tidy folder. Review it before undoing.");

  const stored = structuredClone(toOrganizationLayout(tidied));
  stored.shared.folders = stored.shared.folders.map((folder, index) =>
    index === 0 ? { ...folder, name: "Changed by owner" } : folder);
  const renamed = fromOrganizationLayout({ ...stored, window: toOrganizationLayout(emptyLayout()).window });
  expect(renamed.folders[0]?.name).toBe("Changed by owner");
  expect(renamed.tidyUndo).toBeUndefined();
  expect(renamed.tabFolder).toEqual(stored.shared.tabFolder);
  expect(() => revertTidyRecord(receipt, renamed)).toThrow(/folder changed/);
});
