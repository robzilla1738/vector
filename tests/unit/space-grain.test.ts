import { describe, expect, it } from "vitest";
import { BrowserSpaceSchema, MethodSchemas, SpaceInputSchema } from "@aux/contracts";
import { EventBus, openDb, Repo, SpaceService } from "@aux/runtime";

describe("per-Space grain", () => {
  it("migrates older Space records and validates the 0–100 integer range", () => {
    expect(SpaceInputSchema.parse({ id: "legacy", name: "Legacy", color: "blue" }).grain).toBe(0);
    expect(BrowserSpaceSchema.parse({ id: "legacy", name: "Legacy", color: "blue", workspaceId: "ws" }).grain).toBe(0);
    expect(MethodSchemas["spaces.create"].parse({ name: "New", color: "violet" }).grain).toBe(0);
    expect(MethodSchemas["spaces.update"].safeParse({ id: "space", grain: 101 }).success).toBe(false);
    expect(MethodSchemas["spaces.update"].safeParse({ id: "space", grain: 2.5 }).success).toBe(false);
  });

  it("persists grain through create, update, and import", () => {
    const db = openDb(":memory:");
    try {
      const repo = new Repo(db);
      const events = new EventBus(repo);
      const spaces = new SpaceService(repo, events);
      const created = spaces.create("Research", "violet", 72).find(space => space.name === "Research")!;
      expect(created.grain).toBe(72);
      spaces.update(created.id, { grain: 25 });
      expect(new SpaceService(repo, events).list().find(space => space.id === created.id)?.grain).toBe(25);
      spaces.import([SpaceInputSchema.parse({ id: "legacy", name: "Legacy", color: "blue" })]);
      expect(spaces.list().find(space => space.id === "legacy")?.grain).toBe(0);
    } finally {
      db.close();
    }
  });

  it("validates, persists, and resets a custom color recipe", () => {
    const theme = { hue: 195, lightness: 62, intensity: 80, inverted: true };
    expect(MethodSchemas["spaces.create"].safeParse({ name: "New", color: "teal", theme: { ...theme, hue: 360 } }).success).toBe(false);
    const db = openDb(":memory:");
    try {
      const repo = new Repo(db);
      const events = new EventBus(repo);
      const spaces = new SpaceService(repo, events);
      const created = spaces.create("Studio", "teal", 50, theme).find(space => space.name === "Studio")!;
      expect(new SpaceService(repo, events).list().find(space => space.id === created.id)?.theme).toEqual(theme);
      spaces.update(created.id, { theme: null });
      expect(new SpaceService(repo, events).list().find(space => space.id === created.id)?.theme).toBeUndefined();
    } finally {
      db.close();
    }
  });
});
