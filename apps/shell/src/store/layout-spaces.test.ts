import { expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";
import { OrganizationCommitSchema, type OrganizationSnapshot } from "@aux/contracts";
import { createLayoutSlice } from "./layout-slice";
import { loadOrganizationLayout } from "./persistence";
import { OrganizationPersistence } from "./organization-persistence";
import { emptyLayout } from "../workspace";
import { normalizePages } from "./pages";
import type { Workspace } from "./types";

const host = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn(), invoke: vi.fn() }));
vi.mock("../bridge", () => ({
  bridge: {
    privateMode: false,
    windowKind: "normal",
    windowId: "native-window",
    organizationSnapshot: host.read,
    organizationCommit: host.write,
    invoke: host.invoke,
    overlay: async () => false,
  },
}));
vi.mock("../feature-availability", () => ({ featureStage: () => "on" }));
vi.mock("../store", () => ({ errToast: vi.fn(), toast: vi.fn() }));

it("creates, edits, archives and restores normal Spaces through native acknowledgement with no runtime", async () => {
  let snapshot: OrganizationSnapshot = { revision: 0, layout: null };
  host.read.mockImplementation(async () => structuredClone(snapshot));
  const commit = (value: unknown) => {
    const input = OrganizationCommitSchema.parse(value);
    if (input.expectedRevision !== snapshot.revision) throw new Error("stale revision");
    snapshot = { revision: snapshot.revision + 1, layout: structuredClone(input.layout) };
    return structuredClone(snapshot);
  };
  host.write.mockImplementation(async (value: unknown) => commit(value));
  host.invoke.mockRejectedValue(new Error("Runtime unavailable"));
  const store = createStore<Workspace>()((set, get, api) => ({
    ...({} as Workspace),
    connected: false,
    pages: normalizePages([]),
    activePageId: null,
    ...createLayoutSlice(set, get, api),
  }));
  store.setState({ layout: await loadOrganizationLayout() });

  let release!: () => void;
  host.write.mockImplementationOnce(async (value: unknown) => {
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    return commit(value);
  });
  let acknowledged = false;
  const saving = store
    .getState()
    .addSpace("Research", "teal", 25)
    .then(() => {
      acknowledged = true;
    });
  await vi.waitFor(() => expect(release).toBeTypeOf("function"));
  expect(acknowledged).toBe(false);
  release();
  await saving;
  const id = store.getState().layout.activeSpaceId;
  expect(snapshot.layout?.shared.spaces.find((space) => space.id === id)).toMatchObject({
    name: "Research",
    color: "teal",
  });
  expect(snapshot.layout?.shared.spaces.find((space) => space.id === id)?.workspaceId).toBeUndefined();

  await store.getState().editSpace(id, "Sources", "orange", 40);
  await store.getState().deleteSpace(id);
  expect(snapshot.layout?.shared.archivedSpaces.find((space) => space.id === id)?.name).toBe("Sources");
  await store.getState().restoreSpace(id);
  expect(host.invoke).not.toHaveBeenCalled();
  const restarted = await new OrganizationPersistence(
    { organizationSnapshot: host.read, organizationCommit: host.write },
    emptyLayout(),
  ).hydrate();
  expect(restarted.spaces.find((space) => space.id === id)).toMatchObject({
    name: "Sources",
    color: "orange",
    grain: 40,
  });
  expect(restarted.archivedSpaces).toEqual([]);
});
