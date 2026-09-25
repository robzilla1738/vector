import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { OrganizationLayoutSchema } from "../../packages/contracts/src/organization";
import { OrganizationHostStore } from "../../apps/desktop/main/organization-store";
import { OrganizationPersistence } from "../../apps/desktop/renderer/src/store/organization-persistence";
import {
  fromOrganizationLayout,
  toOrganizationLayout,
} from "../../apps/desktop/renderer/src/store/organization-layout";
import { emptyLayout } from "../../apps/desktop/renderer/src/workspace";

const directories: string[] = [];
const directory = () => {
  const path = mkdtempSync(join(tmpdir(), "aux-org-"));
  directories.push(path);
  return path;
};
afterEach(() => {
  for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true });
});

it("keeps Profile files isolated and selects the calling window's state", () => {
  const first = directory(),
    second = directory();
  const store = new OrganizationHostStore(first);
  const layout = toOrganizationLayout({
    ...emptyLayout(),
    order: ["tab-a"],
    tabSpace: { "tab-a": "space-personal" },
  });
  expect(store.snapshot("window-a")).toEqual({ revision: 0, layout: null });
  store.commit("window-a", { expectedRevision: 0, layout });
  expect(() => store.commit("window-b", { expectedRevision: 0, layout })).toThrow(/revision conflict/i);
  const otherWindow = store.snapshot("window-b");
  expect(otherWindow.layout?.window.activeSpaceId).toBe(layout.shared.spaces[0]!.id);
  store.commit("window-b", {
    expectedRevision: otherWindow.revision,
    layout: {
      ...layout,
      window: {
        ...layout.window,
        splitRatio: 0.65,
        order: ["tab-b"],
        tabSpace: { "tab-b": "space-personal" },
      },
    },
  });
  expect(store.snapshot("window-a").layout?.window.splitRatio).toBe(0.5);
  expect(store.snapshot("window-b").layout?.window.splitRatio).toBe(0.65);
  expect(store.snapshot("window-a").layout?.window.order).toEqual(["tab-a"]);
  expect(store.snapshot("window-b").layout?.window.order).toEqual(["tab-b"]);
  expect(new OrganizationHostStore(first).snapshot("window-b").revision).toBe(2);
  expect(new OrganizationHostStore(second).snapshot("window-a").layout).toBeNull();
  expect(
    JSON.parse(readFileSync(join(first, "organization.v1.json"), "utf8")).windows["window-b"].splitRatio,
  ).toBe(0.65);
});

it("imports legacy layout once and rebases independent windows' pin and folder edits", async () => {
  const store = new OrganizationHostStore(directory());
  const host = (windowId: string) => ({
    organizationSnapshot: async () => store.snapshot(windowId),
    organizationCommit: async (input: Parameters<OrganizationHostStore["commit"]>[1]) =>
      store.commit(windowId, input),
  });
  const legacy = {
    ...emptyLayout(),
    pins: { "space-personal": [{ url: "https://legacy.example", title: "Legacy" }] },
  };
  const first = new OrganizationPersistence(host("window-a"), legacy);
  const second = new OrganizationPersistence(host("window-b"), emptyLayout());
  expect((await first.hydrate()).pins["space-personal"]).toHaveLength(1);
  expect((await second.hydrate()).pins["space-personal"]).toHaveLength(1);
  expect(store.snapshot("window-a").revision).toBe(1);

  const firstLayout = fromOrganizationLayout(store.snapshot("window-a").layout!);
  const secondLayout = fromOrganizationLayout(store.snapshot("window-b").layout!);
  first.persist({
    ...firstLayout,
    pins: {
      ...firstLayout.pins,
      "space-personal": [
        ...firstLayout.pins["space-personal"]!,
        { url: "https://first.example", title: "First" },
      ],
    },
  });
  second.persist({
    ...secondLayout,
    folders: [{ id: "folder-b", name: "Window B", spaceId: "space-personal", collapsed: false }],
  });
  await first.flush();
  await second.flush();
  const result = store.snapshot("window-a").layout!;
  expect(result.shared.pins["space-personal"]?.map((pin) => pin.url)).toEqual([
    "https://legacy.example",
    "https://first.example",
  ]);
  expect(result.shared.folders.map((folder) => folder.id)).toEqual(["folder-b"]);
  expect((await first.refresh()).folders.map((folder) => folder.id)).toEqual(["folder-b"]);
});

it("preserves separate pin edits in the same Space and bounds native payloads", async () => {
  const store = new OrganizationHostStore(directory());
  const host = (windowId: string) => ({
    organizationSnapshot: async () => store.snapshot(windowId),
    organizationCommit: async (input: Parameters<OrganizationHostStore["commit"]>[1]) =>
      store.commit(windowId, input),
  });
  const first = new OrganizationPersistence(host("window-a"), emptyLayout());
  const second = new OrganizationPersistence(host("window-b"), emptyLayout());
  const firstLayout = await first.hydrate();
  const secondLayout = await second.hydrate();
  first.persist({
    ...firstLayout,
    pins: { "space-personal": [{ url: "https://one.example", title: "One" }] },
  });
  second.persist({
    ...secondLayout,
    pins: { "space-personal": [{ url: "https://two.example", title: "Two" }] },
  });
  await first.flush();
  await second.flush();
  expect(store.snapshot("window-a").layout?.shared.pins["space-personal"]?.map((pin) => pin.url)).toEqual([
    "https://one.example",
    "https://two.example",
  ]);
  expect((await first.refresh()).pins["space-personal"]?.map((pin) => pin.url)).toEqual([
    "https://one.example",
    "https://two.example",
  ]);
  const oversized = toOrganizationLayout({
    ...emptyLayout(),
    pins: {
      "space-personal": Array.from({ length: 500 }, (_, index) => ({
        url: `https://example.com/${index}/${"x".repeat(800)}`,
        title: "Test",
      })),
    },
  });
  expect(OrganizationLayoutSchema.safeParse(oversized).success).toBe(false);
});

it("adopts a completed native migration without writing stale tab changes over it", async () => {
  const store = new OrganizationHostStore(directory());
  const host = {
    organizationSnapshot: async () => store.snapshot("window-a"),
    organizationCommit: async (input: Parameters<OrganizationHostStore["commit"]>[1]) =>
      store.commit("window-a", input),
  };
  const renderer = new OrganizationPersistence(host, emptyLayout());
  const initial = await renderer.hydrate();
  renderer.persist({ ...initial, order: ["stale-tab"], tabSpace: { "stale-tab": "space-personal" } });
  const native = toOrganizationLayout({ ...initial, order: ["imported-tab"], tabSpace: { "imported-tab": "space-personal" } });
  store.commit("window-a", { expectedRevision: 1, layout: native });
  expect((await renderer.adoptNativeImport()).order).toEqual(["imported-tab"]);
  await renderer.flush();
  expect(store.snapshot("window-a").layout?.window.order).toEqual(["imported-tab"]);
});

it("keeps URL-bound custom tab labels through Profile persistence and renderer mapping", () => {
  const profileDir = directory();
  const store = new OrganizationHostStore(profileDir);
  const withLabel = toOrganizationLayout({
    ...emptyLayout(),
    order: ["imported-tab"],
    tabSpace: { "imported-tab": "space-personal" },
    tabNames: { "imported-tab": { title: "Project brief", url: "https://example.com/brief" } },
  });
  store.commit("window-a", { expectedRevision: 0, layout: withLabel });
  const reopened = new OrganizationHostStore(profileDir);
  expect(reopened.snapshot("window-a").layout?.window.tabNames?.["imported-tab"])
    .toEqual({ title: "Project brief", url: "https://example.com/brief" });
  expect(fromOrganizationLayout(reopened.snapshot("window-a").layout!).tabNames?.["imported-tab"]?.title)
    .toBe("Project brief");
});
