#!/usr/bin/env node
/** Generate native and renderer bindings from the reviewed host method manifest. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const build = spawnSync("pnpm", ["--filter", "@aux/contracts", "build"], { cwd: root, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);
const { HostMethods, HostEvents } = await import(join(root, "packages/contracts/dist/host-methods.js") + `?build=${Date.now()}`);
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
    const guard = {
      object: "value.is_dict()", array: "value.is_list()", string: "value.is_string()",
      boolean: "value.is_bool()", integer: "value.is_int()", number: "(value.is_int() || value.is_double())",
      null: "value.is_none()",
    }[schema.type];
    if (!guard) throw new Error(`Unsupported type ${schema.type}`);
    add(`if (!${guard}) return false;`);
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
const header = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\n#ifndef CHROME_BROWSER_UI_AUX_GENERATED_AUX_HOST_METHODS_H_\n#define CHROME_BROWSER_UI_AUX_GENERATED_AUX_HOST_METHODS_H_\n#include <optional>\n#include <span>\n#include <string>\n#include <string_view>\n#include "base/values.h"\nnamespace aux::generated {\ninline constexpr std::string_view kManifestHash = "${hash}";\nenum class MethodId { ${ids.join(", ")} };\nstruct MethodInfo { MethodId id; std::string_view name; std::string_view owner; std::string_view feature; std::string_view trusted; bool profile_scoped; };\nstd::optional<MethodId> LookupMethod(std::string_view name);\nstd::span<const MethodInfo> Methods();\nbool ValidateMethodArgs(MethodId id, const base::Value& args, std::string* error);\n}  // namespace aux::generated\n#endif\n`;
const cpp = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\n#include "chrome/browser/ui/aux/generated/aux_host_methods.h"\n#include <cstddef>\n#include "base/strings/utf_string_conversions.h"\n#include "url/gurl.h"\n#include "unicode/uchar.h"\n#include "unicode/utf16.h"\nnamespace aux::generated {\nnamespace {\ndouble AsNumber(const base::Value& value) { return value.is_int() ? value.GetInt() : value.GetDouble(); }\nbool HasNoControlOrFormatCharacters(const std::u16string& value) {\n  for (size_t i = 0; i < value.size(); ++i) {\n    UChar32 codepoint = value.at(i);\n    if (U16_IS_LEAD(codepoint) && i + 1 < value.size() &&\n        U16_IS_TRAIL(value.at(i + 1))) {\n      codepoint = U16_GET_SUPPLEMENTARY(codepoint, value.at(++i));\n    }\n    const int category = u_charType(codepoint);\n    if (category == U_CONTROL_CHAR || category == U_FORMAT_CHAR) return false;\n  }\n  return true;\n}\nbool IsLowerHexSha256(std::string_view value) {\n  if (value.size() != 64) return false;\n  for (char ch : value) if (!((ch >= 'a' && ch <= 'f') || (ch >= '0' && ch <= '9'))) return false;\n  return true;\n}\n${nodes.map((_, i) => `bool ValidateNode${i}(const base::Value& value);`).join("\n")}\n${nodes.map(emitNode).join("\n\n")}\nconstexpr MethodInfo kMethods[] = {\n${methods.map((m, i) => `  {MethodId::${ids[i]}, ${cppString(m.name)}, ${cppString(m.owner)}, ${cppString(m.feature)}, ${cppString(m.trusted)}, ${bool(m.profileScoped)}},`).join("\n")}\n};\n}  // namespace\nstd::optional<MethodId> LookupMethod(std::string_view name) {\n  for (const auto& method : kMethods) if (method.name == name) return method.id;\n  return std::nullopt;\n}\nstd::span<const MethodInfo> Methods() { return kMethods; }\nbool ValidateMethodArgs(MethodId id, const base::Value& args, std::string* error) {\n  bool valid = false;\n  switch (id) {\n${methods.map((m, i) => `    case MethodId::${ids[i]}: valid = ValidateNode${roots[i]}(args); break;`).join("\n")}\n  }\n  if (!valid && error) *error = "Invalid arguments for generated Aux host method";\n  return valid;\n}\n}  // namespace aux::generated\n`;
const client = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\nimport { HostMethods, HostEvents, type HostMethodArgs, type HostMethodId, type HostMethodResult, type HostEventId, type HostEventPayload } from "@aux/contracts/host-methods";\nexport interface HostPort { request(method: string, args: unknown[]): Promise<unknown>; subscribe(event: string, callback: (payload: unknown) => void): () => void }\nexport function createHostClient(port: HostPort) {\n  async function call<M extends HostMethodId>(method: M, args: HostMethodArgs<M>): Promise<HostMethodResult<M>> {\n    const checkedArgs = HostMethods[method].args.parse(args);\n    const result = await port.request(method, checkedArgs as unknown[]);\n    return HostMethods[method].result.parse(result) as HostMethodResult<M>;\n  }\n  function subscribe<E extends HostEventId>(event: E, callback: (payload: HostEventPayload<E>) => void): () => void {\n    return port.subscribe(event, payload => callback(HostEvents[event].payload.parse(payload) as HostEventPayload<E>));\n  }\n  return {\n${methods.filter(m => m.owner === "browser").map(m => `    ${m.name}: (...args: HostMethodArgs<${cppString(m.name)}>) => call(${cppString(m.name)}, args),`).join("\n")}\n${events.map(e => `    ${e.name}: (callback: (payload: HostEventPayload<${cppString(e.name)}>) => void) => subscribe(${cppString(e.name)}, callback),`).join("\n")}\n  };\n}\n`;
const gn = `# Generated by scripts/gen-host-bindings.mjs. Do not edit.\nsource_set("methods") {\n  sources = [ "aux_host_methods.cc", "aux_host_methods.h" ]\n  deps = [ "//base", "//third_party/icu", "//url" ]\n}\n`;
const { AUX_FEATURES } = await import(join(root, "packages/contracts/dist/aux-features.js") + `?build=${Date.now()}`);
const qualification = JSON.parse(readFileSync(join(root, "docs/qualification.json"), "utf8"));
const requirements = Object.fromEntries(Object.keys(AUX_FEATURES).map(feature => [feature, {
  requires: methods.filter(method => method.feature === feature).map(method => method.name),
  journey: `feature:${feature}`,
}]));
const featureStages = `// Generated by scripts/gen-host-bindings.mjs. Do not edit.\nconst requirements = ${JSON.stringify(requirements, null, 2)} as const;\nconst qualification: Record<string, string> = ${JSON.stringify(qualification)};\nconst sourceCommit = '__AUX_SOURCE_COMMIT__';\nexport type FeatureStage = 'off' | 'preview' | 'on';\nexport function featureStagesFor(methods: readonly string[]): Record<keyof typeof requirements, FeatureStage> {\n  const implemented = new Set(methods);\n  return Object.fromEntries(Object.entries(requirements).map(([feature, spec]) => {\n    if (spec.requires.length === 0 || !spec.requires.every(method => implemented.has(method))) return [feature, 'off'];\n    return [feature, qualification[spec.journey] === sourceCommit ? 'on' : 'preview'];\n  })) as Record<keyof typeof requirements, FeatureStage>;\n}\n`;
const outputs = [
  ["chromium/generated/BUILD.gn", gn],
  ["chromium/generated/aux_feature_stages.ts", featureStages],
  ["chromium/generated/aux_host_methods.h", header],
  ["chromium/generated/aux_host_methods.cc", cpp],
  ["chromium/generated/aux_host_methods.sha256", hash + "\n"],
  ["apps/desktop/renderer/src/host/client.generated.ts", client],
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
