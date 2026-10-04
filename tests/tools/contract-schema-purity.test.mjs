import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { z } = createRequire(new URL("../../packages/contracts/package.json", import.meta.url))("zod");
import {
  annotateContractSchemaFactories,
  contractSchemaPurityPlugin,
} from "../../scripts/contract-schema-purity.mjs";
const strip = (code) => code.replaceAll("/* @__PURE__ */", "");
test("only original factory comments change; actual imported Zod validation stays identical", () => {
  const code =
    'import {z} from "zod"; const Id=z.string().min(1).max(5); const Used=z.object({id:Id,count:z.number().int().nonnegative()}).strict(); const Unused=z.array(z.boolean());';
  const result = annotateContractSchemaFactories(code, "schema.js");
  assert.equal(strip(result.code), code);
  const evaluate = (text) => Function("z", text.replace('import {z} from "zod";', "") + "return Used;")(z);
  const before = evaluate(code),
    after = evaluate(result.code);
  for (const input of [
    { id: "abc", count: 3 },
    { id: "", count: 3 },
    { id: "abc", count: 1.5 },
    { id: "abc", count: -1 },
    { id: "abc", count: 1, foreign: true },
  ]) {
    const a = before.safeParse(input),
      b = after.safeParse(input);
    assert.equal(a.success, b.success);
    assert.deepEqual(a.success ? a.data : a.error.issues, b.success ? b.data : b.error.issues);
  }
  assert.equal(result.map.sourcesContent[0], code);
  assert.equal(result.map.sources[0], "schema.js");
});
test("metadata, registry, parse, arbitrary globals and unrelated namespace calls remain unannotated", () => {
  for (const expression of [
    'z.string().describe("required metadata")',
    'z.string().meta({id:"global"})',
    "z.string().register(registry)",
    'z.string().parse("value")',
    "other.string().optional()",
    "z.arbitraryNamespace.string()",
  ]) {
    const code = `import {z} from "zod"; const value=${expression};`;
    assert.equal(annotateContractSchemaFactories(code), null);
  }
  assert.equal(annotateContractSchemaFactories("const z=other;const value=z.string();"), null);
});
test("actual validation callback bodies are untouched and still execute exactly at parse", () => {
  const code =
    'import {z as schema} from "zod";const Used=schema.string().refine(value=>{counter.calls++;return value.length>2;});';
  const result = annotateContractSchemaFactories(code);
  assert.equal(strip(result.code), code);
  const counter = { calls: 0 };
  const schema = Function(
    "schema",
    "counter",
    result.code.replace('import {z as schema} from "zod";', "") + "return Used;",
  )(z, counter);
  assert.equal(counter.calls, 0);
  assert.equal(schema.safeParse("a").success, false);
  assert.equal(counter.calls, 1);
  assert.equal(schema.safeParse("abc").success, true);
  assert.equal(counter.calls, 2);
  assert.equal(result.code.includes("value=>{/* @__PURE__ */"), false);
});
test("plugin refuses every foreign, renderer, query and declaration module", () => {
  const plugin = contractSchemaPurityPlugin("/owned/packages/contracts/dist"),
    code = 'import {z} from "zod";const Schema=z.boolean();';
  for (const id of [
    "/foreign/packages/contracts/dist/file.js",
    "/owned/packages/contracts/dist-other/file.js",
    "/owned/apps/shell/file.js",
    "/owned/packages/contracts/dist/file.d.ts",
    "/owned/packages/contracts/dist/file.js?foreign",
  ])
    assert.equal(plugin.transform(code, id), null);
  assert.equal(strip(plugin.transform(code, "/owned/packages/contracts/dist/file.js").code), code);
});
test("relative schema derivation preserves original imports and nullable/strict validation shape", () => {
  const code =
    'import {BaseSchema} from "./base.js";const Used=BaseSchema.extend({extra:BaseSchema.optional()}).strict();';
  const result = annotateContractSchemaFactories(code);
  assert.equal(strip(result.code), code);
  assert.equal(
    annotateContractSchemaFactories('import {BaseSchema} from "foreign";const Used=BaseSchema.optional();'),
    null,
  );
});

test("mapping joins exact original UTF-16 factory columns across newline and non-ASCII text", () => {
  const code='import {z} from "zod";\nconst Label="🟦";const Value=z.string().min(1);';
  const result=annotateContractSchemaFactories(code,"original.js");
  const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const decode=segment=>{let n=0,shift=0,values=[];for(const c of segment){const bits=alphabet.indexOf(c);n+=(bits&31)*2**shift;if(bits&32)shift+=5;else{values.push(n&1?-(n>>1):n>>1);n=shift=0;}}return values;};
  let source=0,line=0,column=0;const rows=[];
  for(const [generatedLine,mappings] of result.map.mappings.split(";").entries()){let generatedColumn=0;for(const segment of mappings.split(",")){if(!segment)continue;const values=decode(segment);generatedColumn+=values[0];source+=values[1];line+=values[2];column+=values[3];rows.push({generatedLine,generatedColumn,source,line,column});}}
  const originalLines=code.split("\n"),generatedLines=result.code.split("\n");
  for(const target of ["z.string", ".min"]){const original=originalLines[1].indexOf(target),generated=generatedLines[1].indexOf(target);assert.ok(rows.some(row=>row.generatedLine===1&&row.generatedColumn===generated&&row.source===0&&row.line===1&&row.column===original));}
  assert.equal(strip(result.code),code);
});

test("actual partialRecord/nonoptional constructors preserve missing/foreign/undefined validation and schema identity", () => {
  const code =
    'import {z} from "zod";const KeySchema=z.enum(["a","b"]);const ValueSchema=z.number().int().positive();const Used=z.partialRecord(KeySchema,ValueSchema);const Required=z.unknown().nonoptional();';
  const after = annotateContractSchemaFactories(code);
  assert.equal(strip(after.code), code);
  const evaluate = (text) =>
    Function(
      "z",
      text.replace('import {z} from "zod";', "") + "return {Used,Required,KeySchema,ValueSchema};",
    )(z);
  const a = evaluate(code),
    b = evaluate(after.code);
  for (const value of [{}, { a: 1 }, { b: 2 }, { a: 0 }, { a: 1.5 }, { foreign: 1 }, { a: undefined }]) {
    const before = a.Used.safeParse(value),
      after = b.Used.safeParse(value);
    assert.deepEqual(
      after.success ? after.data : after.error.issues,
      before.success ? before.data : before.error.issues,
    );
  }
  for (const value of [undefined, null, false, { a: 1 }])
    assert.equal(b.Required.safeParse(value).success, a.Required.safeParse(value).success);
  assert.equal(b.Used.keyType, b.KeySchema);
  assert.equal(b.Used.valueType, b.ValueSchema);
  assert.equal(after.code.includes("/* @__PURE__ */z.partialRecord"), true);
  assert.equal(after.code.includes("/* @__PURE__ */z.unknown().nonoptional"), true);
});

test("added constructors refuse dynamic/getter parameters, foreign namespaces, callbacks and registry/metadata effects", () => {
  for (const expression of [
    "z.partialRecord(KeySchema,produce())",
    "z.partialRecord(KeySchema,ValueSchema,parameters)",
    "z.unknown().nonoptional(parameters)",
    "other.partialRecord(KeySchema,ValueSchema)",
    'z.partialRecord(KeySchema,ValueSchema).meta({id:"kept"})',
    "z.partialRecord(KeySchema,ValueSchema).register(registry)",
  ]) {
    const source =
      'import {z} from "zod";const KeySchema=z.enum(["a"]);const ValueSchema=z.string();const Used=' +
      expression +
      ";";
    const result = annotateContractSchemaFactories(source);
    assert.equal(result.code.includes("const Used=/* @__PURE__ */"), false);
    assert.equal(strip(result.code), source);
  }
  const source =
    'import {z} from "zod";const callback=()=>z.unknown().nonoptional();const Used=z.object({value:produce()});';
  const result = annotateContractSchemaFactories(source);
  assert.equal(result.code.includes("()=>/* @__PURE__ */"), false);
  let calls = 0;
  const produce = () => {
    calls++;
    return z.unknown().nonoptional();
  };
  Function("z", "produce", result.code.replace('import {z} from "zod";', ""))(z, produce);
  assert.equal(calls, 1);
});
