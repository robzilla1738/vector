#!/usr/bin/env node
/** Check the real WebUI-to-runtime ingress, independently of handler unit fixtures. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { nativeSource } from "../chromium/dev-config.mjs";

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--source"))
  throw new Error("Usage: check-window-context-routing.mjs [--source <webui_browser_ui.cc>]");
const path = args[1] ?? join(nativeSource, "chrome/browser/ui/webui_browser/webui_browser_ui.cc");
const source = readFileSync(path, "utf8");
assert.match(
  source,
  /#include "chrome\/browser\/ui\/aux\/generated\/aux_host_methods.h"/,
  "WebUI must use the generated native window-context route contract",
);
const start = source.indexOf("const auto& api_method = (*list)[0].GetString();");
assert.ok(start >= 0, "The genuine runtime invoke ingress is missing");
const ingress = source.slice(start, source.indexOf("\n}", start));
assert.match(
  ingress,
  /if \(aux::generated::RuntimeMethodNeedsWindowContext\(api_method\)\)\s*(?:\{\s*)?host->CallApiFromWindow\(browser_->GetWeakPtr\(\),\s*web_ui\(\)->GetRenderFrameHost\(\)->GetWeakDocumentPtr\(\),\s*api_method, \*params_json, std::move\(reply\)\);\s*(?:}\s*)?else\s*(?:\{\s*)?host->CallApi\(api_method, \*params_json, std::move\(reply\)\);/,
  "Window-owned methods must bind the original browser/document; plain boot reads must retain CallApi",
);
assert.doesNotMatch(
  ingress,
  /api_method\.starts_with|api_method\.find\(/,
  "Native window provenance must use exact reviewed method names, not whole namespaces",
);
