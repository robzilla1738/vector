import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { MethodSchemas } from "@aux/contracts";
import { RuntimeWindowContextMethods } from "../../packages/contracts/src/runtime-window-context.js";
import { windowOwnedHandlers } from "../support/window-context-audit.js";

const methodsDirectory = join(process.cwd(), "apps/runtime/src/api/methods");
const owned = readdirSync(methodsDirectory)
  .filter((name) => name.endsWith(".ts"))
  .flatMap((name) => windowOwnedHandlers(name, readFileSync(join(methodsDirectory, name), "utf8")));

it("routes every window-owned runtime handler through original native document admission", () => {
  const routed = new Set<string>(RuntimeWindowContextMethods);
  // Search explicitly supports a tokenless bounded read; tokens only coalesce
  // optional searches. It is not an original-window authority requirement.
  const optional = new Set(["conversations.search"]);
  expect(owned.length).toBeGreaterThan(65);
  expect(owned.filter((method) => !routed.has(method) && !optional.has(method))).toEqual([]);
  expect(new Set(RuntimeWindowContextMethods).size).toBe(RuntimeWindowContextMethods.length);
  expect(RuntimeWindowContextMethods.every((method) => method in MethodSchemas)).toBe(true);
});
it("keeps plain boot reads and controls using durable run authority out of turn registration", () => {
  for (const method of [
    "settings.get",
    "models.list",
    "models.transcription.list",
    "memory.pipeline.documentList",
    "memory.pipeline.dreamStatus",
    "memory.pipeline.dreamActivity",
    "memory.pipeline.recall",
    "memory.pipeline.readSource",
    "runs.messages.order",
    "runs.messages.reorder",
    "runs.context.stats",
  ])
    expect(RuntimeWindowContextMethods).not.toContain(method);
  // Idle compaction creates an owned utility operation; both controls require
  // their original requesting window even when the source turn has completed.
  expect(RuntimeWindowContextMethods).toContain("runs.context.compact");
  expect(RuntimeWindowContextMethods).toContain("runs.context.cancelCompaction");
});
it("generates the exact reviewed runtime route table for the native dispatcher", () => {
  const header = readFileSync(join(process.cwd(), "chromium/generated/aux_host_methods.h"), "utf8");
  const cpp = readFileSync(join(process.cwd(), "chromium/generated/aux_host_methods.cc"), "utf8");
  expect(header).toContain("bool RuntimeMethodNeedsWindowContext(std::string_view name);");
  const table = cpp.match(/constexpr std::string_view kWindowContextMethods\[\] = \{([\s\S]*?)\n\};/)?.[1];
  expect(table).toBeDefined();
  expect([...table!.matchAll(/"([^"]+)"/g)].map((match) => match[1])).toEqual([
    ...RuntimeWindowContextMethods,
  ]);
  expect(cpp).toContain("for (const auto method : kWindowContextMethods) if (method == name) return true;");
});
it("audits shared conditional handlers without promoting their early-return boot reads", () => {
  const fixture = `async function original(ctx) { return normalWindowOwner(ctx); }
    async function handler(ctx) {const {method} = ctx;
      if (method === "memory.read") return ctx.s.read();
      if (method === "memory.edit" || method === "memory.dream") {return original(ctx);}
      return ctx.s.status();
    }
    export const methods = {"memory.read":handler,"memory.edit":handler,"memory.dream":handler,"memory.status":handler};`;
  expect(windowOwnedHandlers("fixture.ts", fixture)).toEqual(["memory.edit", "memory.dream"]);
});

it("rejects native ingress regressions that drop the window token or register plain reads", () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-window-routing-"));
  const path = join(dir, "webui_browser_ui.cc");
  const ingress = `#include "chrome/browser/ui/aux/generated/aux_host_methods.h"
void Handle() {
  const auto& api_method = (*list)[0].GetString();
  if (aux::generated::RuntimeMethodNeedsWindowContext(api_method))
    host->CallApiFromWindow(browser_->GetWeakPtr(), web_ui()->GetRenderFrameHost()->GetWeakDocumentPtr(), api_method, *params_json, std::move(reply));
  else
    host->CallApi(api_method, *params_json, std::move(reply));
}`;
  const run = () =>
    execFileSync(
      process.execPath,
      [join(process.cwd(), "scripts/check-window-context-routing.mjs"), "--source", path],
      { stdio: "pipe" },
    );
  try {
    writeFileSync(path, ingress);
    expect(run).not.toThrow();
    for (const broken of [
      ingress.replace("RuntimeMethodNeedsWindowContext(api_method)", "true"),
      ingress.replace("GetWeakDocumentPtr()", "GetPrimaryMainFrame()"),
      ingress.replace("else\n    host->CallApi(", "else\n    host->CallApiFromWindow("),
    ]) {
      writeFileSync(path, broken);
      expect(run).toThrow();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
