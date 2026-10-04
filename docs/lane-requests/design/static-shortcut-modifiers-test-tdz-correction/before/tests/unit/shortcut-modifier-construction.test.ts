import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { expect, it } from "vitest";

const packet = join(process.cwd(), "docs/lane-requests/design/static-shortcut-modifiers");
const sourcePath = "packages/contracts/src/commands.ts";
function evaluate(source: string) {
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: Record<string, unknown> = {};
  runInNewContext(output, { exports, Object });
  return exports as { COMMANDS: { id: string; bindings: Record<string, unknown>[] }[]; SCOPED_COMMANDS: object[] };
}
const before = readFileSync(join(packet, "before", sourcePath), "utf8");
const frozenResult = readFileSync(join(packet, "after", sourcePath), "utf8");
const result = readFileSync(join(process.cwd(), sourcePath), "utf8");
const stableIds = new Set(evaluate(before).COMMANDS.filter(command => command.bindings.some(binding => {
  const keys = Object.keys(binding).slice(1).join(",");
  return ["command,shift", "command", "ctrl,shift", "command,alt", "ctrl"].includes(keys);
})).map(command => command.id));
const stableRows = (source: string) => evaluate(source).COMMANDS.filter(command => stableIds.has(command.id));
function ledger(root: unknown) {
  const seen = new Map<object, number>();
  const entries: unknown[] = [];
  function visit(value: unknown, path: string) {
    if (!value || typeof value !== "object") return;
    const known = seen.get(value);
    if (known !== undefined) { entries.push([path, "alias", known]); return; }
    seen.set(value, seen.size);
    entries.push([path, Object.keys(value)]);
    for (const key of Object.keys(value)) visit((value as Record<string, unknown>)[key], `${path}.${key}`);
  }
  visit(root, "exports");
  return entries;
}
it("retains whole command values, ordered property keys and all original reference aliases", () => {
  const original = evaluate(before), changed = evaluate(frozenResult);
  expect(JSON.stringify(changed)).toBe(JSON.stringify(original));

  expect(ledger(changed)).toEqual(ledger(original));
  const bindings = changed.COMMANDS.flatMap(command => command.bindings);
  expect(new Set(bindings).size).toBe(bindings.length);
});
it("has a byte-exact source inverse limited to original modifier inputs", () => {
  const ledger = JSON.parse(readFileSync(join(packet, "SPAN-LEDGER.json"), "utf8")) as { insert: string; edits: { original: string; symbol: string }[] };
  let inverse = frozenResult.replace(ledger.insert, "");
  for (const [symbol, original] of new Map(ledger.edits.map(edit => [edit.symbol, edit.original]))) {
    inverse = inverse.replaceAll(`, ${symbol})`, `, ${original})`);
  }
  expect(inverse).toBe(before);
});

it("retains live original modifier command rows and constructors while allowing unrelated additive commands", () => {
  const expected = stableRows(before);
  expect(JSON.stringify(stableRows(result))).toBe(JSON.stringify(expected));
  expect(ledger(stableRows(result))).toEqual(ledger(expected));
  expect(result).toContain('const B = (key: string, options: Omit<ShortcutBinding, "key"> = {}): ShortcutBinding => ({ key, ...options });');
  const ledger = JSON.parse(readFileSync(join(packet, "SPAN-LEDGER.json"), "utf8")) as { insert: string };
  expect(result).toContain(ledger.insert);
  const appended = result.replace('] as const satisfies readonly CommandDef[];', '  C("future-unrelated-command", "Future unrelated command", { section: "Application", handler: "shell", bindings: [] }),\n] as const satisfies readonly CommandDef[];');
  expect(evaluate(appended).COMMANDS.some(row => row.id === "future-unrelated-command")).toBe(true);
  expect(JSON.stringify(stableRows(appended))).toBe(JSON.stringify(expected));
  const bindings = stableRows(result).flatMap(row => row.bindings);
  expect(new Set(bindings).size).toBe(bindings.length);
});
