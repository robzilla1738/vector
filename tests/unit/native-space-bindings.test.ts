import { expect, it, vi } from "vitest";
import type { ProfileOrganizationSnapshot } from "@aux/contracts";

const snapshot = (
  revision: number,
  spaces: NonNullable<ProfileOrganizationSnapshot["shared"]>["spaces"],
  archivedSpaces: NonNullable<ProfileOrganizationSnapshot["shared"]>["archivedSpaces"] = [],
): ProfileOrganizationSnapshot => ({
  revision,
  shared: {
    spaces,
    archivedSpaces,
    pins: {},
    folders: [],
    tabSpace: {},
    order: [],
    tabFolder: {},
    tabNames: {},
    splitGroups: [],
  },
});
import { EventBus, Repo, openDb } from "@aux/runtime";
import { SpaceService } from "../../apps/runtime/dist/services/spaces.js";
import { installNativeSpaceBindings } from "../../apps/runtime/dist/services/native-space-bindings.js";

it("publishes real active workspace mappings and retires archived bindings without trusting event payloads", async () => {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const spaces = new SpaceService(repo, events);
  let current = snapshot(1, [
    { id: "one", name: "One", color: "slate", grain: 0 },
    { id: "two", name: "Two", color: "slate", grain: 0 },
  ]);
  const initial = spaces.reconcileNative(current);
  const organizationSnapshot = async () => current;
  repo.setSetting("browserSpaces", [
    ...initial,
    { id: "invented", name: "Invented", color: "slate", grain: 0, archived: false, workspaceId: "absent" },
  ]);
  const publish = vi.fn(async (_input: { bindings: { spaceId: string; workspaceId: string }[] }) => ({
    accepted: true as const,
  }));
  const onError = vi.fn();
  const stop = await installNativeSpaceBindings(
    repo,
    events,
    { spaceBindingsSet: publish, organizationSnapshot },
    onError,
  );
  expect(publish.mock.calls[0]![0].bindings).toEqual(
    initial.map((space) => ({ spaceId: space.id, workspaceId: space.workspaceId })),
  );
  current = snapshot(2, [current.shared!.spaces[1]!], [current.shared!.spaces[0]!]);
  events.emit("spaces.updated", { spaces: [{ id: "forged", workspaceId: "outside" }] });
  await stop();
  expect(publish.mock.calls.at(-1)![0].bindings).toEqual([
    { spaceId: "two", workspaceId: initial[1]!.workspaceId },
  ]);
  const count = publish.mock.calls.length;
  events.emit("spaces.updated", { spaces: [] });
  await Promise.resolve();
  expect(publish).toHaveBeenCalledTimes(count);
  expect(onError).not.toHaveBeenCalled();
  repo.db.close();
});

it("retires the event subscription when the authenticated initial publication fails", async () => {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const fault = new Error("Original native connection retired");
  const publish = vi.fn().mockRejectedValue(fault);
  const onError = vi.fn();
  await expect(
    installNativeSpaceBindings(
      repo,
      events,
      { spaceBindingsSet: publish, organizationSnapshot: async () => ({ revision: 0, shared: null }) },
      onError,
    ),
  ).rejects.toBe(fault);
  events.emit("workspace.created", { workspace: { workspaceId: "untrusted-event" } });
  await Promise.resolve();
  expect(publish).toHaveBeenCalledTimes(1);
  expect(onError).toHaveBeenCalledExactlyOnceWith(fault);
  repo.db.close();
});
