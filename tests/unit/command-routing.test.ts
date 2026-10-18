import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { expect, it } from "vitest";
import { COMMANDS } from "../../packages/contracts/src/commands.js";
import {
  STARTUP_COMMANDS,
  STARTUP_SCOPED_COMMANDS,
} from "../../packages/contracts/src/command-routing.generated.js";
import { effectiveShortcuts } from "../../packages/contracts/src/shortcut-defs.js";
import { effectiveShortcutBindings } from "../../packages/contracts/src/shortcut-startup.js";
import {
  matchShortcut,
  type ShortcutBinding,
  type ShortcutOverrides,
} from "../../packages/contracts/src/shortcut-bindings.js";
import { commandRoutingSource, generateCommandRouting } from "../../scripts/gen-command-routing.mjs";
const fields = ["id", "handler", "windows", "dispatch", "bindings", "intercept", "focusShell"] as const;
const projection = (value: object) =>
  Object.fromEntries(
    fields.filter((field) => field in value).map((field) => [field, value[field as keyof typeof value]]),
  );
it("preserves every canonical command, original order, routing/window policy and binding without presentation metadata", () => {
  expect(STARTUP_COMMANDS.map(projection)).toEqual(COMMANDS.map(projection));
  expect(STARTUP_SCOPED_COMMANDS.map((row) => row.id)).toEqual(
    COMMANDS.filter((row) => "dispatch" in row && row.dispatch === "scoped").map((row) => row.id),
  );
  for (const row of STARTUP_COMMANDS)
    expect(Object.keys(row).every((key) => fields.includes(key as (typeof fields)[number]))).toBe(true);
});
it("matches all platform default chords identically through the shared synchronous matcher", () => {
  for (const platform of ["darwin", "win32", "linux"])
    for (const row of COMMANDS)
      for (const binding of row.bindings) {
        const input = {
          key: binding.key,
          meta: !!binding.command && platform === "darwin",
          ctrl: !!binding.ctrl || (!!binding.command && platform !== "darwin"),
          alt: !!binding.alt,
          shift: !!binding.shift,
        };
        for (const forIntercept of [false, true])
          expect(matchShortcut(effectiveShortcutBindings(), input, { platform, forIntercept })?.id).toBe(
            matchShortcut(effectiveShortcuts(), input, { platform, forIntercept })?.id,
          );
      }
});
it("preserves unbound remaps, disabled defaults, platform filters and canonical collision priority", () => {
  const binding: ShortcutBinding = { key: "l", command: true };
  for (const target of [COMMANDS.find((row) => !row.bindings.length)!, COMMANDS.at(-1)!]) {
    const overrides: ShortcutOverrides = { [target.id]: [binding], "open-address": null };
    expect(effectiveShortcutBindings(overrides).find(row => row.id === "open-address")?.bindings).toEqual([]);
    expect(effectiveShortcutBindings(overrides).find((row) => row.id === target.id)?.bindings).toEqual([
      binding,
    ]);
    for (const platform of ["darwin", "win32", "linux"]) {
      const input = {
        key: "l",
        meta: platform === "darwin",
        ctrl: platform !== "darwin",
        alt: false,
        shift: false,
      };
      expect(matchShortcut(effectiveShortcutBindings(overrides), input, { platform })?.id).toBe(
        matchShortcut(effectiveShortcuts(overrides), input, { platform })?.id,
      );
    }
  }
  const overrides = { [COMMANDS[0]!.id]: [{ ...binding, platforms: ["linux"] }] };
  for (const platform of ["darwin", "win32", "linux"])
    expect(
      matchShortcut(
        effectiveShortcutBindings(overrides),
        { key: "l", meta: platform === "darwin", ctrl: platform !== "darwin", alt: false, shift: false },
        { platform },
      )?.id,
    ).toBe(
      matchShortcut(
        effectiveShortcuts(overrides),
        { key: "l", meta: platform === "darwin", ctrl: platform !== "darwin", alt: false, shift: false },
        { platform },
      )?.id,
    );
});
it("generates deterministically from current source and refuses stale generated data", async () => {
  const source = await commandRoutingSource(process.cwd());
  expect(source).toBe(
    readFileSync(join(process.cwd(), "packages/contracts/src/command-routing.generated.ts"), "utf8"),
  );
  const directory = mkdtempSync(join(tmpdir(), "aux-command-routing-")),
    destination = join(directory, "routing.ts");
  try {
    await generateCommandRouting({ root: process.cwd(), destination });
    await expect(generateCommandRouting({ root: process.cwd(), destination, check: true })).resolves.toBe(
      source,
    );
    writeFileSync(destination, source.replace("STARTUP_COMMANDS", "STALE_COMMANDS"));
    await expect(generateCommandRouting({ root: process.cwd(), destination, check: true })).rejects.toThrow(
      /Regenerate command routing/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
