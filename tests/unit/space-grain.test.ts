import { describe, expect, it } from "vitest";
import { BrowserSpaceSchema, SpaceInputSchema, type ProfileOrganizationSnapshot } from "@aux/contracts";
import { EventBus, openDb, Repo, SpaceService } from "@aux/runtime";

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

describe("native Space presentation and runtime workspace identity", () => {
  it("migrates older grain records and validates grain and custom color bounds", () => {
    expect(SpaceInputSchema.parse({ id: "legacy", name: "Legacy", color: "blue" }).grain).toBe(0);
    expect(
      BrowserSpaceSchema.parse({ id: "legacy", name: "Legacy", color: "blue", workspaceId: "ws" }).grain,
    ).toBe(0);
    expect(SpaceInputSchema.safeParse({ id: "space", name: "New", color: "blue", grain: 101 }).success).toBe(
      false,
    );
    expect(SpaceInputSchema.safeParse({ id: "space", name: "New", color: "blue", grain: 2.5 }).success).toBe(
      false,
    );
    expect(
      SpaceInputSchema.safeParse({
        id: "space",
        name: "New",
        color: "teal",
        theme: { hue: 360, lightness: 62, intensity: 80, inverted: true },
      }).success,
    ).toBe(false);
  });

  it("keeps native edits and archive state while retaining genuine workspace identities", () => {
    const repo = new Repo(openDb(":memory:"));
    try {
      const service = new SpaceService(repo, new EventBus(repo));
      repo.insertWorkspace("existing", "Existing", 1);
      const theme = { hue: 195, lightness: 62, intensity: 80, inverted: true };
      const native = {
        id: "studio",
        name: "Studio",
        color: "teal" as const,
        grain: 72,
        theme,
        workspaceId: "existing",
      };
      const initial = service.reconcileNative(snapshot(1, [native]));
      const studio = initial.find((space) => space.id === "studio")!;
      expect(studio.workspaceId).not.toBe("existing");
      expect(initial.find((space) => space.id === "workspace:existing")?.workspaceId).toBe("existing");
      const changed = { ...native, name: "Renamed offline", grain: 25, theme: undefined };
      service.reconcileNative(snapshot(2, [], [changed]));
      expect(
        new SpaceService(repo, new EventBus(repo)).list().find((space) => space.id === "studio"),
      ).toEqual({
        ...changed,
        workspaceId: studio.workspaceId,
        archived: true,
      });
      expect(() => service.reconcileNative(snapshot(1, [native]))).toThrow(/organization changed/);
      expect(service.list().find((space) => space.id === "studio")?.archived).toBe(true);
      expect(
        repo.listWorkspaces().find((workspace) => workspace.workspaceId === studio.workspaceId)?.name,
      ).toBe("Renamed offline");
      // Removing presentation never revives its task workspace as a new browser Space.
      service.reconcileNative(snapshot(3, []));
      expect(service.list().some((space) => space.workspaceId === studio.workspaceId)).toBe(false);
      expect(repo.listWorkspaces().some((workspace) => workspace.workspaceId === studio.workspaceId)).toBe(
        true,
      );
      const restored = service
        .reconcileNative(snapshot(4, [changed]))
        .find((space) => space.id === "studio")!;
      expect(restored.workspaceId).toBe(studio.workspaceId);
      repo.db.prepare("DELETE FROM workspaces WHERE workspace_id=?").run(studio.workspaceId);
      const repaired = service
        .reconcileNative(snapshot(4, [changed]))
        .find((space) => space.id === "studio")!;
      expect(repaired.workspaceId).not.toBe(studio.workspaceId);
      expect(repaired.workspaceId).not.toBe(native.workspaceId);
      expect(repo.listWorkspaces().some((workspace) => workspace.workspaceId === repaired.workspaceId)).toBe(
        true,
      );
    } finally {
      repo.close();
    }
  });
});
