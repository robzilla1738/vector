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
  return exports as { COMMANDS: { bindings: object[] }[]; SCOPED_COMMANDS: object[] };
}
const before = readFileSync(join(packet, "before", sourcePath), "utf8");
const result = readFileSync(join(process.cwd(), sourcePath), "utf8");
it("retains whole command values, ordered property keys and all original reference aliases", () => {
  const original = evaluate(before), changed = evaluate(result);
  expect(JSON.stringify(changed)).toBe(JSON.stringify(original));
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
  expect(ledger(changed)).toEqual(ledger(original));
  const bindings = changed.COMMANDS.flatMap(command => command.bindings);
  expect(new Set(bindings).size).toBe(bindings.length);
});
it("has a byte-exact source inverse limited to original modifier inputs", () => {
  const ledger = JSON.parse(readFileSync(join(packet, "SPAN-LEDGER.json"), "utf8")) as { insert: string; edits: { original: string; symbol: string }[] };
  let inverse = result.replace(ledger.insert, "");
  for (const [symbol, original] of new Map(ledger.edits.map(edit => [edit.symbol, edit.original]))) {
    inverse = inverse.replaceAll(`, ${symbol})`, `, ${original})`);
  }
  expect(inverse).toBe(before);
});
