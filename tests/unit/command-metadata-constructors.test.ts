import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { expect, it } from "vitest";
import { COMMANDS } from "../../packages/contracts/src/commands";

it("preserves original ordered command values and metadata reference relationships", () => {
  const source = readFileSync("docs/lane-requests/root/command-metadata-constructors/commands-before.ts", "utf8");
  const original = { exports: {} as { COMMANDS: typeof COMMANDS } };
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, original);
  const before = original.exports.COMMANDS;
  const retained = COMMANDS.filter(command => before.some(previous => previous.id === command.id));
  expect(JSON.stringify(retained)).toBe(JSON.stringify(before));
  for (let i = 0; i < before.length; i++) {
    expect(Object.keys(retained[i]!)).toEqual(Object.keys(before[i]!));
    for (let j = 0; j < before.length; j++) {
      expect(retained[i]!.bindings === retained[j]!.bindings).toBe(before[i]!.bindings === before[j]!.bindings);
      const a = retained[i]!, b = retained[j]!, oldA = before[i]!, oldB = before[j]!;
      expect(("windows" in a ? a.windows : undefined) === ("windows" in b ? b.windows : undefined))
        .toBe(("windows" in oldA ? oldA.windows : undefined) === ("windows" in oldB ? oldB.windows : undefined));
    }
  }
});

it("adds only the mounted image and model commands with their original window policy", () => {
  const ids = [
    "select-model-provider", "save-model-endpoint", "discover-provider-models", "save-provider-model-key",
    "save-planner-model", "probe-model-connection", "show-model-probe-details", "save-vision-model",
    "save-model-role", "use-automatic-model-role", "set-model-worker-limit", "set-model-turn-limit",
    "manage-model-provider", "edit-provider-models", "reauthenticate-model-provider",
    "toggle-model-provider-connection", "remove-saved-model-key", "set-image-generation-model",
    "confirm-model-key-removal", "cancel-model-key-removal",
  ];
  const rows = COMMANDS.filter(row => ids.includes(row.id));
  expect(rows.map(row => row.id)).toEqual(ids);
  expect(new Set(COMMANDS.map(row => row.id)).size).toBe(COMMANDS.length);
  for (const row of rows) {
    expect(row).toMatchObject({ handler: "shell", section: "Application", windows: ["normal", "private"], palette: false,
      intercept: true, focusShell: true, bindings: [], dispatch: "scoped" });
  }
});
