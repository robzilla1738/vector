import { expect, it, vi } from "vitest";
import type { OrganizationCommit, OrganizationSnapshot } from "@aux/contracts";
import { emptyLayout } from "../workspace";
import { OrganizationPersistence } from "./organization-persistence";
import { rebaseOrganizationLayout, sameOrganizationValue, toOrganizationLayout } from "./organization-layout";

// Chromium's dictionaries serialize in key order, unlike renderer object literals.
function nativeWire<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
      return Object.fromEntries(
        Object.keys(entry)
          .sort()
          .map((key) => [key, entry[key]]),
      );
    }),
  );
}

it("does not bounce unchanged native organization back between windows", async () => {
  const initial = emptyLayout();
  let snapshot: OrganizationSnapshot = { revision: 1, layout: nativeWire(toOrganizationLayout(initial)) };
  const host = {
    organizationSnapshot: async () => nativeWire(snapshot),
    organizationCommit: vi.fn(async (input: OrganizationCommit) => {
      if (input.expectedRevision !== snapshot.revision) throw new Error("Organization revision conflict");
      snapshot = nativeWire({ revision: snapshot.revision + 1, layout: input.layout });
      return nativeWire(snapshot);
    }),
  };
  const first = new OrganizationPersistence(host, initial);
  const second = new OrganizationPersistence(host, initial);
  const loaded = await first.hydrate();
  await second.hydrate();
  first.persist({ ...loaded, spaces: loaded.spaces.map((space) => ({ ...space, name: "Research" })) });
  await first.flush();
  // Model each window refreshing, reconciling runtime Spaces, and persisting again.
  for (let turn = 0; turn < 6; turn++) {
    for (const session of [second, first]) {
      session.persist(await session.refresh());
      await session.flush();
    }
  }
  expect(host.organizationCommit).toHaveBeenCalledTimes(1);
  expect(snapshot.revision).toBe(2);
  expect(snapshot.layout?.shared.spaces[0]?.name).toBe("Research");
});

it("keeps remote changes when local nested objects only have different key order", () => {
  const base = toOrganizationLayout(emptyLayout());
  const local = nativeWire(base);
  const remote = structuredClone(base);
  remote.shared.spaces[0]!.name = "Renamed in another window";
  const merged = rebaseOrganizationLayout(base, local, remote);
  expect(merged.shared.spaces[0]!.name).toBe("Renamed in another window");
  expect(sameOrganizationValue(base, local)).toBe(true);
  expect(sameOrganizationValue({ optional: undefined }, {})).toBe(true);
  expect(sameOrganizationValue(["one", "two"], ["two", "one"])).toBe(false);
});

it("still commits a real tab reorder after native hydration", async () => {
  const layout = { ...emptyLayout(), order: ["one", "two"] };
  let snapshot: OrganizationSnapshot = { revision: 1, layout: nativeWire(toOrganizationLayout(layout)) };
  const commit = vi.fn(async (input: OrganizationCommit) => {
    snapshot = nativeWire({ revision: snapshot.revision + 1, layout: input.layout });
    return snapshot;
  });
  const session = new OrganizationPersistence(
    { organizationSnapshot: async () => snapshot, organizationCommit: commit },
    layout,
  );
  const loaded = await session.hydrate();
  session.persist({ ...loaded, order: ["two", "one"] });
  await session.flush();
  expect(commit).toHaveBeenCalledOnce();
  expect(snapshot.layout?.shared.order).toEqual(["two", "one"]);
});
