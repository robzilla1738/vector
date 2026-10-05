import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { conservativeRendererMinify, conservativeRendererMinifyOptions, chooseConservativeRendererChunk } from "./conservative-renderer-minify.mjs";
const require = createRequire(new URL("../apps/shell/package.json", import.meta.url));
const { parseAst } = createRequire(require.resolve("vite"))("rollup/parseAst");
const parse = code => parseAst(code);
const padding = "/* " + "retained source padding ".repeat(80) + " */";
const load = code => import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));

test("pins supported conservative options and independent per-call bookkeeping", () => {
  assert.equal(require("terser/package.json").version, "5.44.0");
  const first = conservativeRendererMinifyOptions(), next = conservativeRendererMinifyOptions();
  assert.equal(first.keep_fnames, true);
  assert.equal(first.keep_classnames, true);
  assert.equal(first.mangle.properties, false);
  assert.equal(first.compress.keep_fargs, true);
  assert.equal(first.compress.pure_getters, false);
  assert.equal(first.compress.passes, 3);
  for (const [key, value] of Object.entries(first.compress)) if (key.startsWith("unsafe")) assert.equal(value, false);
  assert.equal(first.sourceMap, false);
  assert.equal(first.format.comments, "some");
  first.compress.passes = 99;
  assert.equal(next.compress.passes, 3);
  const plugin = conservativeRendererMinify();
  assert.equal(plugin.apply, "build");
  assert.equal(plugin.enforce, "post");
  assert.equal(plugin.renderChunk.order, "post");
});

test("actual minifier preserves getter/evaluation effects, exported values, function/class names and argument arity", async () => {
  const code = `
    export const effects = [];
    const subject = { get value() { effects.push("getter"); return 7; } };
    subject.value;
    export function OriginalFunction(first, second) { effects.push(first); return subject.value + (second ?? 0); }
    export class OriginalClass { method() { effects.push("method"); return "complete"; } }
    export function exercise() {
      const primitive = { [Symbol.toPrimitive]() { effects.push("primitive"); return "exact"; } };
      effects.push(String(primitive));
      const value = OriginalFunction((effects.push("arg1"), 2), (effects.push("arg2"), 3));
      return [value, new OriginalClass().method(), OriginalFunction.name, OriginalFunction.length, OriginalClass.name, Object.keys(subject)];
    }
  `;
  const plugin = conservativeRendererMinify();
  const result = await plugin.renderChunk.handler.call({ parse }, code, {}, { format: "es" });
  assert.ok(result);
  assert.ok(Buffer.byteLength(result.code) < Buffer.byteLength(code));
  assert.equal(result.map, null);
  const before = await load(code), after = await load(result.code);
  assert.deepEqual(Object.keys(after), Object.keys(before));
  assert.deepEqual(after.exercise(), before.exercise());
  assert.deepEqual(after.effects, before.effects);
  assert.deepEqual(after.effects, ["getter", "primitive", "exact", "arg1", "arg2", 2, "getter", "method"]);
  assert.equal(after.OriginalFunction.name, "OriginalFunction");
  assert.equal(after.OriginalFunction.length, 2);
  assert.equal(after.OriginalClass.name, "OriginalClass");
});

test("retains original thrown reason identity and mutation timing", async () => {
  const code = `
    export const effects = [];
    export const reason = new Error("Original failure");
    const subject = { get value() { effects.push("get"); throw reason; } };
    export function fail() { effects.push("before"); return subject.value; }
  `;
  const result = await conservativeRendererMinify().renderChunk.handler.call({ parse }, code, {}, { format: "es" });
  const current = await load(result?.code ?? code);
  assert.throws(() => current.fail(), thrown => thrown === current.reason);
  assert.deepEqual(current.effects, ["before", "get"]);
});

test("refuses changed ordered static imports, external exports, dynamic URLs and preload array indices", () => {
  const cases = [
    ['import "./a.js"; import "./b.js";', 'import "./b.js"; import "./a.js";'],
    ['import { one } from "./a.js"; export { one };', 'import { two } from "./a.js"; export { two };'],
    ['const a=1,b=2; export {a,b};', 'const a=1,b=2; export {b,a};'],
    ['export {a} from "./a.js";', 'export {a} from "./b.js";'],
    ['export {a as publicValue} from "./a.js";', 'export {b as publicValue} from "./a.js";'],
    ['export * as publicValue from "./a.js";', 'export {publicValue} from "./a.js";'],
    ['import * as value from "./a.js"; export {value};', 'import {"*" as value} from "./a.js"; export {value};'],
    ['export const open=()=>import("./a.js");', 'export const open=()=>import("./b.js");'],
    ['export const a=()=>import("./a.js"),b=()=>import("./b.js");', 'export const b=()=>import("./b.js"),a=()=>import("./a.js");'],
    ['export const paths=["assets/a.js","assets/b.css"];', 'export const paths=["assets/b.css","assets/a.js"];'],
  ];
  for (const [source, candidate] of cases) {
    const original = padding + source;
    assert.equal(chooseConservativeRendererChunk(original, candidate, parse), original);
  }
});

test("fails closed for computed imports, import options and invalid candidate syntax", () => {
  for (const source of ['export const open=(url)=>import(url);', 'export const open=()=>import("./a.js", {with:{type:"json"}});']) {
    const original = padding + source;
    assert.equal(chooseConservativeRendererChunk(original, source, parse), original);
  }
  const original = padding + 'export const value=1;';
  assert.equal(chooseConservativeRendererChunk(original, 'export const =;', parse), original);
  assert.equal(chooseConservativeRendererChunk(original, undefined, parse), original);
});

test("selects only smaller UTF8 bytes and leaves non-ES output untouched", async () => {
  const original = 'export const label="a";';
  const sameGraphLargerBytes = 'export const label="🦊";';
  assert.equal(chooseConservativeRendererChunk(original, sameGraphLargerBytes, parse), original);
  assert.equal(chooseConservativeRendererChunk(original, original, parse), original);
  assert.equal(chooseConservativeRendererChunk(padding + original, original, parse), original);
  const plugin = conservativeRendererMinify();
  assert.equal(await plugin.renderChunk.handler.call({ parse() { throw new Error("must not parse"); } }, original, {}, { format: "cjs" }), null);
});


test("retains existing legal notices without manufacturing comments", async () => {
  const code = `/*! Original retained license */
    // @license Original retained attribution
    // An ordinary implementation comment.
    export const original = 1 + 2;
    export const repeated = original + original + original;
  `;
  const result = await conservativeRendererMinify().renderChunk.handler.call({ parse }, code, {}, { format: "es" });
  assert.ok(result);
  assert.ok(result.code.includes("Original retained license"));
  assert.ok(result.code.includes("Original retained attribution"));
  assert.ok(!result.code.includes("ordinary implementation"));
});

test("does not suppress invalid baseline syntax behind the optional minifier", async () => {
  await assert.rejects(() => conservativeRendererMinify().renderChunk.handler.call({ parse }, "export const =;", {}, { format: "es" }));
});
