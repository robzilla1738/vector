import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { expect, it } from "vitest";
import { RuntimeMethodPolicy } from "../../packages/contracts/src/runtime-method-policy";
import { BrowserRuntimeMethodPolicy } from "../../packages/contracts/src/browser-runtime-api";

it("preserves the complete original ordered authentication policy and every original record identity relationship", () => {
  const source = readFileSync("docs/lane-requests/root/runtime-policy-constructors/runtime-method-policy-before.ts", "utf8");
  const original = {
    exports: {} as { RuntimeMethodPolicy: typeof RuntimeMethodPolicy },
    require(path: string) {
      expect(path).toBe("./browser-runtime-api.js");
      return { BrowserRuntimeMethodPolicy };
    },
  };
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, original);
  const before = original.exports.RuntimeMethodPolicy;
  expect(JSON.stringify(RuntimeMethodPolicy)).toBe(JSON.stringify(before));
  expect(Object.keys(RuntimeMethodPolicy)).toEqual(Object.keys(before));
  const keys = Object.keys(before) as (keyof typeof before)[];
  for (const a of keys) {
    expect(Object.keys(RuntimeMethodPolicy[a])).toEqual(Object.keys(before[a]));
    expect(Object.getPrototypeOf(RuntimeMethodPolicy[a])).toBe(Object.prototype);
    for (const b of keys) expect(RuntimeMethodPolicy[a] === RuntimeMethodPolicy[b]).toBe(before[a] === before[b]);
  }
  for (const key of Object.keys(BrowserRuntimeMethodPolicy) as (keyof typeof BrowserRuntimeMethodPolicy)[])
    expect(RuntimeMethodPolicy[key]).toBe(BrowserRuntimeMethodPolicy[key]);
});
