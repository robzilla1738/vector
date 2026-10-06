import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { emptyLayout, createSpace } from "../workspace";
import { toOrganizationLayout } from "./organization-layout";

vi.mock("../bridge", () => ({
  bridge: {
    windowId: "local",
    privateMode: false,
    windowKind: "normal",
    organizationSnapshot: vi.fn(),
    organizationCommit: vi.fn(),
  },
}));
vi.mock("../store", () => ({ toast: vi.fn() }));
vi.mock("../feature-availability", () => ({ featureStage: () => "on" }));
const values = new Map<string, string>();
const storage = {
  getItem: vi.fn((key: string) => values.get(key) ?? null),
  setItem: (key: string, value: string) => values.set(key, value),
};
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  values.clear();
  vi.stubGlobal("localStorage", storage);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("loads the actual Profile snapshot without importing old localStorage organization", async () => {
  const stale = createSpace(emptyLayout(), "Old cache");
  storage.setItem("aux.layout.v1", JSON.stringify(stale));
  storage.setItem("aux.layout.v1:local", JSON.stringify(stale));

  const native = createSpace(emptyLayout(), "Profile Space");
  vi.mocked(bridge.organizationSnapshot).mockResolvedValue({
    revision: 4,
    layout: toOrganizationLayout(native),
  });
  const persistence = await import("./persistence");
  expect(persistence.initialLayout).toEqual(emptyLayout());
  expect((await persistence.loadOrganizationLayout()).spaces).toEqual(native.spaces);
  expect(storage.getItem.mock.calls.some(([key]) => key.startsWith("aux.layout.v1"))).toBe(false);
  expect(bridge.organizationCommit).not.toHaveBeenCalled();
});

it("initializes an empty Profile through the real host CAS with the fresh layout", async () => {
  storage.setItem("aux.layout.v1:local", "{corrupt cache");
  vi.mocked(bridge.organizationSnapshot).mockResolvedValue({ revision: 7, layout: null });
  vi.mocked(bridge.organizationCommit).mockImplementation(async (input) => ({
    revision: 8,
    layout: input.layout,
  }));
  const persistence = await import("./persistence");
  expect((await persistence.loadOrganizationLayout()).spaces).toEqual(emptyLayout().spaces);
  expect(bridge.organizationCommit).toHaveBeenCalledWith({
    expectedRevision: 7,
    layout: toOrganizationLayout(emptyLayout()),
  });
});
