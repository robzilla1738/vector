import { expect, it } from "vitest";
import {
  exportShortcuts,
  importShortcuts,
  platformConflicts,
  reservedShortcut,
  shortcutWarning,
} from "./shortcut-settings";
it("refuses every macOS reserved chord and explains its system use", () => {
  expect(reservedShortcut({ key: "m", command: true }, "darwin")).toBe("macOS uses ⌘M for Minimize.");
  for (const key of ["q", "h", "m", "tab", " ", "`"])
    expect(() => importShortcuts(exportShortcuts({ sidebar: [{ key, command: true }] }), "darwin")).toThrow(
      "macOS uses",
    );
  expect(reservedShortcut({ key: "m", command: true }, "linux")).toBeUndefined();
});
it("roundtrips disabled and changed bindings without changing defaults", () => {
  const overrides = { sidebar: [{ key: "s", command: true, alt: true }], find: null };
  expect(importShortcuts(exportShortcuts(overrides), "darwin")).toEqual(overrides);
  expect(() => importShortcuts('{"schema":1,"overrides":{"unknown":null}}', "darwin")).toThrow(
    "Unknown command",
  );
  expect(() => importShortcuts(exportShortcuts({ sidebar: [{ key: "x" }] }), "darwin")).toThrow("modifier");
});
it("detects conflicts across overlapping platform lists, not disjoint lists", () => {
  expect(
    platformConflicts(
      { sidebar: [{ key: "s", command: true, platforms: ["darwin"] }], find: [{ key: "s", command: true }] },
      "darwin",
    ),
  ).toHaveLength(1);
  expect(
    platformConflicts(
      {
        sidebar: [{ key: "x", command: true, platforms: ["darwin"] }],
        find: [{ key: "x", command: true, platforms: ["linux"] }],
      },
      "darwin",
    ),
  ).toHaveLength(0);
  expect(shortcutWarning({ key: "1", ctrl: true }, "darwin")).toContain("Mission Control");
});
