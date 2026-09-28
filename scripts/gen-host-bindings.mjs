#!/usr/bin/env node
/** Generate native and renderer bindings from the reviewed host method manifest. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const build = spawnSync("pnpm", ["--filter", "@aux/contracts", "build"], { cwd: root, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);
const { HostMethods, HostEvents } = await import(join(root, "packages/contracts/dist/host-methods.js") + `?build=${Date.now()}`);
const { MethodSchemas } = await import(join(root, "packages/contracts/dist/api.js") + `?build=${Date.now()}`);
const { RuntimeMethodPolicy } = await import(join(root, "packages/contracts/dist/runtime-method-policy.js") + `?build=${Date.now()}`);
const apiMethods = Object.keys(MethodSchemas);
if (JSON.stringify(apiMethods) !== JSON.stringify(Object.keys(RuntimeMethodPolicy))) {
  throw new Error("Runtime method policy must list every MethodSchemas entry in order");
}
const methodsDir = join(root, "apps/runtime/src/api/methods");
const handlerSource = readdirSync(methodsDir)
  .filter((file) => file.endsWith(".ts") && file !== "context.ts" && file !== "index.ts")
  .map((file) => readFileSync(join(methodsDir, file), "utf8"))
  .join("\n");
const handlerCases = new Set([...handlerSource.matchAll(/"([^"']+)"\s*:\s*h_/g)].map(match => match[1]));
if (apiMethods.some(method => !handlerCases.has(method))) {
  throw new Error(`Runtime API has schemas without handlers: ${apiMethods.filter(method => !handlerCases.has(method)).join(", ")}`);
}
const { z } = createRequire(join(root, "packages/contracts/package.json"))("zod");
const methods = Object.entries(HostMethods).map(([name, spec]) => ({
  name, owner: spec.owner, feature: spec.feature, trusted: spec.trusted,
  profileScoped: spec.profileScoped, schema: z.toJSONSchema(spec.wireArgs ?? spec.args),
}));
const events = Object.entries(HostEvents).map(([name, spec]) => ({
  name, owner: spec.owner, feature: spec.feature, trusted: spec.trusted,
  profileScoped: spec.profileScoped, schema: z.toJSONSchema(spec.payload),
}));
const hash = createHash("sha256").update(JSON.stringify({ methods, events })).digest("hex");
const enumName = name => `k${name.split(/[^A-Za-z0-9]+/).map(part => part[0].toUpperCase() + part.slice(1)).join("")}`;
const cppString = value => JSON.stringify(value);
const bool = value => value ? "true" : "false";

const nodes = [];
const nodeByJson = new Map();
function intern(value) {
  if (!value || typeof value !== "object") throw new Error("Invalid JSON Schema node");
  if (value.$ref || value.$defs || value.allOf || value.not) throw new Error("Unsupported JSON Schema combinator");
  const schema = { ...value };
  delete schema.$schema;
  const key = JSON.stringify(schema);
  if (nodeByJson.has(key)) return nodeByJson.get(key);
  const id = nodes.length;
  nodes.push(schema);
  nodeByJson.set(key, id);
  for (const child of Object.values(schema.properties ?? {})) intern(child);
  for (const child of schema.prefixItems ?? []) intern(child);
  if (schema.items && typeof schema.items === "object") intern(schema.items);
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") intern(schema.additionalProperties);
  for (const child of schema.oneOf ?? []) intern(child);
  for (const child of schema.anyOf ?? []) intern(child);
  return id;
}
const roots = methods.map(method => intern(method.schema));
const idOf = schema => nodeByJson.get(JSON.stringify(schema));
function literal(value) {
  if (typeof value === "string") return `base::Value(${cppString(value)})`;
  if (typeof value === "boolean") return `base::Value(${bool(value)})`;
  if (typeof value === "number" && Number.isInteger(value)) return `base::Value(${value})`;
  if (value === null) return "base::Value()";
  throw new Error(`Unsupported literal ${JSON.stringify(value)}`);
}
function emitNode(schema, index) {
  const out = [`bool ValidateNode${index}(const base::Value& value) {`];
  const add = line => out.push(`  ${line}`);
  if (schema.type) {
    const guards = {
      object: "value.is_dict()", array: "value.is_list()", string: "value.is_string()",
      boolean: "value.is_bool()", integer: "(value.is_int() || (value.is_double() && std::isfinite(value.GetDouble()) && std::floor(value.GetDouble()) == value.GetDouble()))", number: "(value.is_int() || value.is_double())",
      null: "value.is_none()",
    };
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const guard = types.map(type => guards[type]);
    if (guard.some(entry => !entry)) throw new Error(`Unsupported type ${schema.type}`);
    add(`if (!(${guard.join(" || ")})) return false;`);
  }
  if (schema.const !== undefined) add(`if (!(value == ${literal(schema.const)})) return false;`);
  if (schema.enum) add(`if (!(${schema.enum.map(item => `(value == ${literal(item)})`).join(" || ")})) return false;`);
  if (schema.oneOf) add(`if ((${schema.oneOf.map(item => `static_cast<int>(ValidateNode${idOf(item)}(value))`).join(" + ")}) != 1) return false;`);
  if (schema.anyOf) add(`if (!(${schema.anyOf.map(item => `ValidateNode${idOf(item)}(value)`).join(" || ")})) return false;`);
  if (schema.type === "string") {
    if (schema.minLength !== undefined || schema.maxLength !== undefined || schema.pattern) add("const auto utf16 = base::UTF8ToUTF16(value.GetString());");
    if (schema.minLength !== undefined) add(`if (utf16.size() < ${schema.minLength}) return false;`);
    if (schema.maxLength !== undefined) add(`if (utf16.size() > ${schema.maxLength}) return false;`);
    if (schema.format) {
      if (schema.format !== "uri") throw new Error(`Unsupported format ${schema.format}`);
      add("if (!GURL(value.GetString()).is_valid()) return false;");
    }
    if (schema.pattern) {
      if (schema.pattern === "^[^\\p{Cc}\\p{Cf}]+$") add("if (!HasNoControlOrFormatCharacters(utf16)) return false;");
      else if (schema.pattern === "^[a-f0-9]{64}$") add("if (!IsLowerHexSha256(value.GetString())) return false;");
      else throw new Error(`Unsupported pattern ${schema.pattern}`);
    }
  }
  if (schema.type === "number" || schema.type === "integer") {
    if (schema.minimum !== undefined) add(`if (AsNumber(value) < ${schema.minimum}) return false;`);
    if (schema.maximum !== undefined) add(`if (AsNumber(value) > ${schema.maximum}) return false;`);
  }
  if (schema.type === "array") {
    add("const auto& list = value.GetList();");
    if (schema.minItems !== undefined) add(`if (list.size() < ${schema.minItems}) return false;`);
    if (schema.maxItems !== undefined) add(`if (list.size() > ${schema.maxItems}) return false;`);
    for (const [position, child] of (schema.prefixItems ?? []).entries())
      add(`if (list.size() > ${position} && !ValidateNode${idOf(child)}(list[${position}])) return false;`);
    if (schema.items === false) add(`if (list.size() > ${(schema.prefixItems ?? []).length}) return false;`);
    else if (schema.items && typeof schema.items === "object")
      add(`for (size_t i = ${(schema.prefixItems ?? []).length}; i < list.size(); ++i) if (!ValidateNode${idOf(schema.items)}(list[i])) return false;`);
  }
  if (schema.type === "object") {
    add("const auto& dict = value.GetDict();");
    const required = new Set(schema.required ?? []);
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      add(`if (const base::Value* field = dict.Find(${cppString(name)})) {`);
      add(`  if (!ValidateNode${idOf(child)}(*field)) return false;`);
      add(required.has(name) ? `} else return false;` : `}`);
    }
    if (schema.additionalProperties === false) {
      const names = Object.keys(schema.properties ?? {});
      if (names.length === 0) add("if (!dict.empty()) return false;");
      else {
        add("for (auto entry : dict) {");
        add(`  if (!(${names.map(name => `entry.first == ${cppString(name)}`).join(" || ")})) return false;`);
        add("}");
      }
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      const names = Object.keys(schema.properties ?? {});
      add("for (auto entry : dict) {");
      add(`  if (!(${names.length ? names.map(name => `entry.first == ${cppString(name)}`).join(" || ") : "false"}) && !ValidateNode${idOf(schema.additionalProperties)}(entry.second)) return false;`);
      add("}");
    }
  }
  add("return true;");
  out.push("}");
  return out.join("\n");
}
const ids = methods.map(method => enumName(method.name));
if (new Set(ids).size !== ids.length) throw new Error("Method enum collision");
const headerBase = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\n#ifndef CHROME_BROWSER_UI_AUX_GENERATED_AUX_HOST_METHODS_H_\n#define CHROME_BROWSER_UI_AUX_GENERATED_AUX_HOST_METHODS_H_\n#include <optional>\n#include <span>\n#include <string>\n#include <string_view>\n#include "base/values.h"\nnamespace aux::generated {\ninline constexpr std::string_view kManifestHash = "${hash}";\nenum class MethodId { ${ids.join(", ")} };\nstruct MethodInfo { MethodId id; std::string_view name; std::string_view owner; std::string_view feature; std::string_view trusted; bool profile_scoped; };\nstd::optional<MethodId> LookupMethod(std::string_view name);\nstd::span<const MethodInfo> Methods();\nbool ValidateMethodArgs(MethodId id, const base::Value& args, std::string* error);\n}  // namespace aux::generated\n#endif\n`;
const header = headerBase.replace("enum class MethodId", "inline constexpr std::string_view kSourceCommit = \"__AUX_SOURCE_COMMIT__\";\n\nenum class MethodId");
const cpp = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\n#include "chrome/browser/ui/aux/generated/aux_host_methods.h"\n#include <cmath>\n#include <cstddef>\n#include "base/strings/utf_string_conversions.h"\n#include "url/gurl.h"\n#include "unicode/uchar.h"\n#include "unicode/utf16.h"\nnamespace aux::generated {\nnamespace {\ndouble AsNumber(const base::Value& value) { return value.is_int() ? value.GetInt() : value.GetDouble(); }\nbool HasNoControlOrFormatCharacters(const std::u16string& value) {\n  for (size_t i = 0; i < value.size(); ++i) {\n    UChar32 codepoint = value.at(i);\n    if (U16_IS_LEAD(codepoint) && i + 1 < value.size() &&\n        U16_IS_TRAIL(value.at(i + 1))) {\n      codepoint = U16_GET_SUPPLEMENTARY(codepoint, value.at(++i));\n    }\n    const int category = u_charType(codepoint);\n    if (category == U_CONTROL_CHAR || category == U_FORMAT_CHAR) return false;\n  }\n  return true;\n}\nbool IsLowerHexSha256(std::string_view value) {\n  if (value.size() != 64) return false;\n  for (char ch : value) if (!((ch >= 'a' && ch <= 'f') || (ch >= '0' && ch <= '9'))) return false;\n  return true;\n}\n${nodes.map((_, i) => `bool ValidateNode${i}(const base::Value& value);`).join("\n")}\n${nodes.map(emitNode).join("\n\n")}\nconstexpr MethodInfo kMethods[] = {\n${methods.map((m, i) => `  {MethodId::${ids[i]}, ${cppString(m.name)}, ${cppString(m.owner)}, ${cppString(m.feature)}, ${cppString(m.trusted)}, ${bool(m.profileScoped)}},`).join("\n")}\n};\n}  // namespace\nstd::optional<MethodId> LookupMethod(std::string_view name) {\n  for (const auto& method : kMethods) if (method.name == name) return method.id;\n  return std::nullopt;\n}\nstd::span<const MethodInfo> Methods() { return kMethods; }\nbool ValidateMethodArgs(MethodId id, const base::Value& args, std::string* error) {\n  bool valid = false;\n  switch (id) {\n${methods.map((m, i) => `    case MethodId::${ids[i]}: valid = ValidateNode${roots[i]}(args); break;`).join("\n")}\n  }\n  if (!valid && error) *error = "Invalid arguments for generated Aux host method";\n  return valid;\n}\n}  // namespace aux::generated\n`;
const client = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\nimport { requireAuxFeature, type AuxFeatureOverrides } from "@aux/contracts";\nimport { HostMethods, HostEvents, type HostMethodArgs, type HostMethodId, type HostMethodResult, type HostEventId, type HostEventPayload } from "@aux/contracts/host-methods";\nexport interface HostPort { featureStages?: AuxFeatureOverrides; request(method: string, args: unknown[]): Promise<unknown>; subscribe(event: string, callback: (payload: unknown) => void): () => void }\nexport function createHostClient(port: HostPort) {\n  async function call<M extends HostMethodId>(method: M, args: HostMethodArgs<M>): Promise<HostMethodResult<M>> {\n    const feature = HostMethods[method].feature;\n    if (feature !== "core") requireAuxFeature(feature, "chromium-fork", port.featureStages);\n    const checkedArgs = HostMethods[method].args.parse(args);\n    const result = await port.request(method, checkedArgs as unknown[]);\n    return HostMethods[method].result.parse(result) as HostMethodResult<M>;\n  }\n  function subscribe<E extends HostEventId>(event: E, callback: (payload: HostEventPayload<E>) => void): () => void {\n    return port.subscribe(event, payload => callback(HostEvents[event].payload.parse(payload) as HostEventPayload<E>));\n  }\n  return {\n${methods.filter(m => m.owner === "browser").map(m => `    ${m.name}: (...args: HostMethodArgs<${cppString(m.name)}>) => call(${cppString(m.name)}, args),`).join("\n")}\n${events.map(e => `    ${e.name}: (callback: (payload: HostEventPayload<${cppString(e.name)}>) => void) => subscribe(${cppString(e.name)}, callback),`).join("\n")}\n  };\n}\n`;
const gn = `# Generated by scripts/gen-host-bindings.mjs. Do not edit.\nsource_set("methods") {\n  sources = [ "aux_host_methods.cc", "aux_host_methods.h" ]\n  deps = [ "//base", "//third_party/icu", "//url" ]\n}\n`;
const { AUX_FEATURE_REQUIREMENTS } = await import(join(root, "packages/contracts/dist/feature-requirements.js") + `?build=${Date.now()}`);
const qualification = JSON.parse(readFileSync(join(root, "docs/qualification.json"), "utf8"));
const featureStagesBase = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\nconst requirements = ${JSON.stringify(AUX_FEATURE_REQUIREMENTS, null, 2)} as const;\nconst runtimeMethods = ${JSON.stringify(apiMethods.filter(method => RuntimeMethodPolicy[method].feature !== "core"))} as const;\nconst qualification: Record<string, string> = ${JSON.stringify(qualification)};\nconst sourceCommit = '__AUX_SOURCE_COMMIT__';\nexport type FeatureStage = 'off' | 'preview' | 'on';\nexport function featureStagesFor(methods: readonly string[]): Record<keyof typeof requirements, FeatureStage> {\n  const implemented = new Set<string>([...methods, ...runtimeMethods]);\n  return Object.fromEntries(Object.entries(requirements).map(([feature, spec]) => {\n    if (!spec.requires.every(method => implemented.has(method))) return [feature, 'off'];\n    return [feature, qualification[spec.journey] === sourceCommit ? 'on' : 'preview'];\n  })) as Record<keyof typeof requirements, FeatureStage>;\n}\n`;
const featureStages = featureStagesBase
  .replace("const sourceCommit = '__AUX_SOURCE_COMMIT__';\n", "")
  .replace("featureStagesFor(methods: readonly string[]):", "featureStagesFor(methods: readonly string[], sourceCommit: string):");
const authorizationHash = createHash("sha256").update(JSON.stringify(RuntimeMethodPolicy)).digest("hex");
const authorization = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\nimport type { AuxFeature, MethodName, RuntimeAuthClass } from "@aux/contracts";\nexport const kAuthorizationHash = ${JSON.stringify(authorizationHash)};\nexport const RuntimeAuthorization = ${JSON.stringify(RuntimeMethodPolicy, null, 2)} as const satisfies Record<MethodName, { feature: AuxFeature | "core"; auth: RuntimeAuthClass }>;\n`;
const methodFeatures = Object.fromEntries(apiMethods
  .filter(method => RuntimeMethodPolicy[method].feature !== "core")
  .map(method => [method, RuntimeMethodPolicy[method].feature]));
const runtimeMethodFeatures = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\nimport type { AuxFeature } from "./aux-features.js";\nimport type { MethodName } from "./api.js";\nexport const RuntimeMethodFeatures = ${JSON.stringify(methodFeatures, null, 2)} as const satisfies Partial<Record<MethodName, AuxFeature>>;\n`;

// ---- dev-only mock host: schema-valid stub results synthesized from the manifest ----
const zdef = schema => schema._zod?.def ?? schema._def;
const isOptionalish = schema => schema.safeParse(undefined).success;
const STRING_CANDIDATES = [
  "x", "a", "0", "mock", "mock-value", "en", "en-US", "GET", "POST", "1.0.0", "#0a84ff",
  "https://example.com/", "https://example.com", "http://localhost:1/",
  "dev@example.com", "a".repeat(64), "f".repeat(64), "0".repeat(64), "0123456789abcdef".repeat(4),
  "00000000-0000-4000-8000-000000000000", "/tmp/aux-mock", "./relative", "application/json",
  "text/plain", "image/png", "127.0.0.1", "1970-01-01T00:00:00.000Z", "1970-01-01", "00:00",
  "x".repeat(16), "x".repeat(64), "[]", "{}",
];
const NUMBER_CANDIDATES = [0, 1, -1, 0.5, 2, 4, 8, 16, 32, 64, 100, 1000, 86_400_000, 1_700_000_000_000];
function numberCandidates(schema) {
  const def = zdef(schema);
  const bounds = (def.checks ?? [])
    .map(check => { const inner = check._zod?.def ?? check.def ?? check; return inner; })
    .flatMap(inner => [inner.minimum, inner.maximum, inner.value].filter(n => typeof n === "number" && Number.isFinite(n)));
  return [...bounds, ...bounds.map(n => n + 1), ...NUMBER_CANDIDATES];
}
function stringCandidates(schema, hint) {
  const def = zdef(schema);
  const lengths = (def.checks ?? [])
    .map(check => { const inner = check._zod?.def ?? check.def ?? check; return inner; })
    .flatMap(inner => [inner.minimum, inner.maximum, inner.value, inner.length].filter(n => Number.isInteger(n) && n > 0 && n <= 512));
  const padded = [...new Set(lengths)].map(n => "a".repeat(n));
  const h = hint.toLowerCase();
  const preferred =
    /(url|origin|href|endpoint|redirect|feed|link|homepage)/.test(h) ? ["https://example.com/", "https://example.com"] :
    /(sha256|sha512|digest|hash|fingerprint|checksum)/.test(h) ? ["a".repeat(64), "f".repeat(64), "0".repeat(64)] :
    /(uuid|guid)/.test(h) ? ["00000000-0000-4000-8000-000000000000"] :
    /(email|account)/.test(h) ? ["dev@example.com"] :
    /(path|dir|folder|filename|filepath)/.test(h) ? ["/tmp/aux-mock", "./relative"] :
    /(color)/.test(h) ? ["#0a84ff", "#000000"] :
    /(lang|locale)/.test(h) ? ["en", "en-US"] :
    /(mime|mediatype|contenttype)/.test(h) ? ["application/json", "text/plain"] :
    /(ip|address)/.test(h) ? ["127.0.0.1"] :
    /(iso|timestamp|date|time)/.test(h) ? ["1970-01-01T00:00:00.000Z"] : [];
  return [...preferred, ...padded, `mock-${h.split(/[.\-_]/).pop() || "value"}`, ...STRING_CANDIDATES];
}
function* rawCandidates(schema, hint, depth) {
  if (depth > 8) return;
  const def = zdef(schema);
  switch (def.type) {
    case "string": yield* stringCandidates(schema, hint); return;
    case "number": case "int": yield* numberCandidates(schema); return;
    case "bigint": yield BigInt(0); return;
    case "boolean": yield false; yield true; return;
    case "date": yield 0; yield new Date(0); return;
    case "undefined": case "void": case "never": case "nan": yield undefined; return;
    case "null": yield null; return;
    case "any": case "unknown": yield null; yield undefined; return;
    case "literal": yield* def.values; return;
    case "enum": yield* Object.values(def.entries); return;
    case "optional": yield undefined; yield* rawCandidates(def.innerType, hint, depth + 1); return;
    case "nullable": yield null; yield* rawCandidates(def.innerType, hint, depth + 1); return;
    case "default": yield typeof def.defaultValue === "function" ? def.defaultValue() : def.defaultValue; return;
    case "prefault": yield* rawCandidates(def.innerType, hint, depth + 1); return;
    case "readonly": case "nonoptional": case "success": yield* rawCandidates(def.innerType, hint, depth + 1); return;
    case "catch": yield def.catchValue({}); yield* rawCandidates(def.innerType, hint, depth + 1); return;
    case "object": yield* objectCandidates(schema, def, hint, depth); return;
    case "array": yield []; yield [firstValid(def.element, `${hint}[]`, depth + 1)]; return;
    case "tuple": yield def.items.map(item => firstValid(item, `${hint}[]`, depth + 1)); return;
    case "record": yield {}; return;
    case "map": yield new Map(); return;
    case "set": yield new Set(); return;
    case "union": for (const option of def.options) yield* rawCandidates(option, hint, depth + 1); return;
    case "intersection": yield { ...firstValid(def.left, hint, depth + 1), ...firstValid(def.right, hint, depth + 1) }; return;
    case "lazy": yield* rawCandidates(def.getter(), hint, depth + 1); return;
    case "pipe": case "transform": yield* rawCandidates(def.in ?? def.schema ?? def.innerType, hint, depth + 1); return;
    case "custom": case "file": case "promise": case "function": case "symbol": case "template_literal":
      yield undefined; return;
    default: yield undefined; return;
  }
}
function* objectCandidates(schema, def, hint, depth) {
  const shape = def.shape ?? {};
  const keys = Object.keys(shape).filter(key => !isOptionalish(shape[key]));
  const streams = keys.map(key => validValues(shape[key], `${hint}.${key}`, depth + 1));
  const cursor = keys.map((key, index) => streams[index].next().value);
  let attempts = 0;
  while (attempts++ < 96) {
    yield Object.fromEntries(keys.map((key, index) => [key, cursor[index]]));
    const next = keys.map((key, index) => streams[index].next());
    let bumped = false;
    for (let index = keys.length - 1; index >= 0 && !bumped; index--) {
      if (!next[index].done) { cursor[index] = next[index].value; bumped = true; }
    }
    if (!bumped) return;
  }
}
function* validValues(schema, hint, depth) {
  let yielded = 0;
  for (const raw of rawCandidates(schema, hint, depth)) {
    const result = schema.safeParse(raw);
    if (result.success) { yield result.data; if (++yielded >= 12) return; }
  }
}
function firstValid(schema, hint, depth) {
  const value = validValues(schema, hint, depth).next();
  if (value.done) throw new Error(`No stub value satisfies ${hint}`);
  return value.value;
}
const mockResults = {};
for (const [name, spec] of Object.entries(HostMethods)) {
  try {
    mockResults[name] = firstValid(spec.result, name, 0);
  } catch (error) {
    throw new Error(`Cannot synthesize a mock result for host method ${name}: ${error.message}`);
  }
}
const mockHost = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.
/** Dev-only host for \`vite --mode mock\`: every host method returns a schema-valid
 * stub synthesized from the manifest; every host event registers listeners that
 * scenario fixtures can drive via {@link MockHost.emitEvent}. Hand-written
 * fixtures in mock/bridge.ts override whichever members need real state. */
import { HostMethods, HostEvents } from "@aux/contracts/host-methods";
import type { createHostClient } from "./client.generated";

const RESULTS: Record<string, unknown> = ${JSON.stringify(mockResults, null, 2)};

type HostClient = ReturnType<typeof createHostClient>;
type Listener = (payload: unknown) => void;

export interface MockHost extends HostClient {
  emitEvent(event: string, payload: unknown): void;
}

export function createMockHost(): MockHost {
  const listeners = new Map<string, Set<Listener>>();
  const results = new Map<string, unknown>(
    Object.entries(HostMethods).map(([name, spec]) => [name, spec.result.parse(RESULTS[name])]),
  );
  const host: Record<string, unknown> = {
    emitEvent(event: string, payload: unknown) {
      for (const listener of listeners.get(event) ?? []) listener(payload);
    },
  };
  for (const name of Object.keys(HostMethods)) host[name] = async () => structuredClone(results.get(name));
  for (const name of Object.keys(HostEvents)) {
    host[name] = (listener: Listener) => {
      const set = listeners.get(name) ?? new Set<Listener>();
      listeners.set(name, set);
      set.add(listener);
      return () => { set.delete(listener); };
    };
  }
  return host as unknown as MockHost;
}
`;

const outputs = [
  ["apps/runtime/src/api/authorization.generated.ts", authorization],
  ["packages/contracts/src/runtime-method-features.generated.ts", runtimeMethodFeatures],
  ["chromium/generated/BUILD.gn", gn],
  ["chromium/generated/aux_feature_stages.ts", featureStages],
  ["apps/runtime/src/api/feature-stages.generated.ts", featureStages],
  ["chromium/generated/aux_host_methods.h", header],
  ["chromium/generated/aux_host_methods.cc", cpp],
  ["chromium/generated/aux_host_methods.sha256", hash + "\n"],
  ["apps/shell/src/host/client.generated.ts", client],
  ["apps/shell/src/host/mock.generated.ts", mockHost],
];
for (const [relative, content] of outputs) {
  const path = join(root, relative);
  if (check) {
    if (readFileSync(path, "utf8") !== content) throw new Error(`${relative} is stale; run node scripts/gen-host-bindings.mjs`);
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}
console.log(`${check ? "Checked" : "Generated"} ${methods.length} host methods, ${events.length} events (${hash.slice(0, 12)})`);
