/// <reference types="vite/client" />
// @vitest-environment jsdom
import { expect, it } from "vitest";
import { COMMANDS, SHORTCUTS, ShortcutOverridesSchema, shortcutInventorySize } from "@aux/contracts";
import { COMMAND_ACTIONS } from "../../apps/shell/src/commands";
import {
  platformConflicts,
  reservedShortcut,
} from "../../apps/shell/src/features/commands/shortcut-settings";
it("has unique command IDs and exactly one shell action per shell command", () => {
  expect(new Set(COMMANDS.map((command) => command.id)).size).toBe(COMMANDS.length);
  expect(Object.keys(COMMAND_ACTIONS).sort()).toEqual(
    COMMANDS.filter((command) => command.handler === "shell")
      .map((command) => command.id)
      .sort(),
  );
  expect(
    COMMANDS.filter((command) => command.handler === "native")
      .map((command) => command.id)
      .sort(),
  ).toEqual(["new-private-window", "new-window"]);
});
it("has bounded, conflict-free, safe defaults on every platform", () => {
  expect(SHORTCUTS).toHaveLength(COMMANDS.length);
  const worst = Object.fromEntries(
    COMMANDS.map((command) => [
      command.id,
      Array.from({ length: 4 }, (_, index) => ({ key: `F${index + 1}`, ctrl: true })),
    ]),
  );
  const fits = ["darwin", "win32", "linux"].every(
    (platform) => shortcutInventorySize(worst, platform) <= 512,
  );
  // Settings must refuse an inventory beyond the unchanged native row cap.
  expect(ShortcutOverridesSchema.safeParse(worst).success).toBe(fits);
  for (const platform of ["darwin", "win32", "linux"])
    expect(shortcutInventorySize({}, platform)).toBeLessThanOrEqual(512);
  for (const platform of ["darwin", "win32", "linux"]) {
    expect(platformConflicts({}, platform)).toEqual([]);
    for (const command of COMMANDS)
      for (const binding of command.bindings) {
        if (binding.platforms && !binding.platforms.includes(platform)) continue;
        expect(binding.command || binding.ctrl || binding.alt || /^f\d+$/.test(binding.key)).toBeTruthy();
        expect(reservedShortcut(binding, platform)).toBeUndefined();
      }
  }
});

it("renders only registered command IDs and centralizes command entry points", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = join(process.cwd(), "apps/shell/src");
  const ids = new Set(COMMANDS.map((command) => command.id));
  const files = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(join(directory, entry.name))
        : entry.name.endsWith(".tsx") && !entry.name.includes(".test.")
          ? [join(directory, entry.name)]
          : [],
    );
  const violations: string[] = [];
  for (const file of files(root)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/data-command-id=["']([^"']+)["']/g))
      expect(ids.has(match[1] as (typeof COMMANDS)[number]["id"])).toBe(true);
    // URL-bearing navigation is a store data operation. Parameterless actions
    // and direct palette/sidebar intents must dispatch through commands.ts.
    if (
      /\b(?:newTab|toggleSidebar)\(\s*\)|\bsetOverlay\(["']palette["']\)|onClick=\{toggleSidebar\}/.test(
        source,
      )
    )
      violations.push(file.slice(root.length));
  }
  expect(violations).toEqual([]);
  const allowlist = JSON.parse(
    readFileSync(join(process.cwd(), "tests/fixtures/native-commands.json"), "utf8"),
  );
  expect(
    COMMANDS.filter((command) => command.handler === "native")
      .map((command) => command.id)
      .sort(),
  ).toEqual(allowlist);
});
