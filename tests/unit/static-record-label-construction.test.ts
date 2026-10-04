import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { expect, it } from "vitest";
const packet = join(process.cwd(), "docs/lane-requests/design/static-record-label-constructors");
function evaluate(source: string, intrinsic = Object): Record<string, unknown> {
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  runInNewContext(code, { exports, Object: intrinsic });
  return exports;
}
function references(value: unknown) {
  const seen = new Map<object, number>(),
    rows: unknown[] = [];
  function visit(value: unknown, path: string) {
    if (!value || typeof value !== "object") return;
    const old = seen.get(value);
    if (old !== undefined) {
      rows.push([path, "alias", old]);
      return;
    }
    seen.set(value, seen.size);
    rows.push([path, Object.keys(value)]);
    for (const key of Object.keys(value)) visit((value as Record<string, unknown>)[key], `${path}.${key}`);
  }
  visit(value, "exports");
  return rows;
}
it("retains whole ordered metadata values, property keys and original aliases", () => {
  const relative = "packages/contracts/src/commands.ts";
  const before = evaluate(readFileSync(join(packet, "before", relative), "utf8"));
  const result = evaluate(readFileSync(join(packet, "after", relative), "utf8"));
  expect(JSON.stringify(result)).toBe(JSON.stringify(before));
  expect(references(result)).toEqual(references(before));
});
it("retains each exact frozen record, allocation, freeze call order and input property", () => {
  const relative = "apps/shell/src/ui/class-props.ts";
  function run(source: string) {
    const calls: unknown[] = [];
    const intrinsic = Object.create(Object) as ObjectConstructor;
    intrinsic.freeze = ((record: object) => {
      calls.push([Object.keys(record), { ...record }]);
      return Object.freeze(record);
    }) as ObjectConstructor["freeze"];
    const exports = evaluate(source, intrinsic);
    return { exports, calls };
  }
  const before = run(readFileSync(join(packet, "before", relative), "utf8"));
  const result = run(readFileSync(join(packet, "after", relative), "utf8"));
  expect(result.calls).toEqual(before.calls);
  expect(Object.keys(result.exports)).toEqual(Object.keys(before.exports));
  expect(JSON.stringify(result.exports)).toBe(JSON.stringify(before.exports));
  expect(new Set(Object.values(result.exports)).size).toBe(Object.keys(result.exports).length);
  for (const record of Object.values(result.exports)) expect(Object.isFrozen(record)).toBe(true);
});
it("has exact whole-source inverses limited to the frozen construction spans", () => {
  const ledger = JSON.parse(readFileSync(join(packet, "SPAN-LEDGER.json"), "utf8")) as {
    files: { path: string; edits: { start: number; end: number; original: string; result: string }[] }[];
  };
  for (const file of ledger.files) {
    const before = readFileSync(join(packet, "before", file.path), "utf8");
    let result = before;
    for (const edit of file.edits.slice().sort((a, b) => b.start - a.start))
      result = result.slice(0, edit.start) + edit.result + result.slice(edit.end);
    expect(result).toBe(readFileSync(join(packet, "after", file.path), "utf8"));
    let inverse = result;
    let delta = 0;
    const positioned = file.edits
      .slice()
      .sort((a, b) => a.start - b.start)
      .map((edit) => {
        const start = edit.start + delta;
        delta += edit.result.length - edit.original.length;
        return { ...edit, start };
      });
    for (const edit of positioned.reverse())
      inverse = inverse.slice(0, edit.start) + edit.original + inverse.slice(edit.start + edit.result.length);
    expect(inverse).toBe(before);
  }
});
