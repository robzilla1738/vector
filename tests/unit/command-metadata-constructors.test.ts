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
