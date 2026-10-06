import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AgentApiManifest, agentApiDocs, supportedAgentApi } from "../packages/contracts/dist/agent-api.js";

const output = resolve("docs/AGENT-API.md");
const lines = [
  "# Aux agent API",
  "",
  "Generated from `packages/contracts/src/agent-api.ts`. Run `pnpm agent-api:docs` after editing the manifest.",
  "",
  "The SDK, MCP and CLI project this manifest. Code mode exposes only entries supported on the `code` surface. Each call is validated against the matching RPC parameter and result schemas. Calls inside QuickJS appear synchronous while the host dispatches them asynchronously.",
  "",
  "MCP keeps its default tool listing small: `aux_api_describe` returns the exact input schema for one path, and `aux_api_call` dispatches that path through the same typed RPC. Common page actions also have dedicated MCP tools; `aux_js` provides the code-mode surface.",
  "",
  "## Included model reference",
  "",
  agentApiDocs({ surface: "code" }, "included"),
  "",
  "## Full model reference",
  "",
  agentApiDocs({ surface: "code" }, "model"),
  "",
  "## Lookup reference",
  "",
  agentApiDocs({ surface: "code" }, "lookup"),
  "",
  "## Transport availability",
  "",
  "| API path | RPC method | Layer | Docs | SDK | MCP | CLI | Code |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ...AgentApiManifest.map((item) => {
    const yes = (surface) =>
      supportedAgentApi({ surface }).some((entry) => entry.path === item.path) ? "yes" : "—";
    return `| \`aux.${item.path}\` | \`${item.method}\` | ${item.layer} | ${item.documented} | ${yes("sdk")} | ${yes("mcp")} | ${yes("cli")} | ${yes("code")} |`;
  }),
  "",
  "The AX layer requires an explicit `ax` capability and stays disabled until the accessibility benchmark supports enabling it. Pixel actions require a captured document epoch and viewport. Code mode has no Node, file system or raw DevTools handle; page writes re-enter the guarded RPC invoker.",
  "",
].join("\n");

if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== lines) {
    process.stderr.write("docs/AGENT-API.md is stale. Run pnpm agent-api:docs.\n");
    process.exitCode = 1;
  }
} else writeFileSync(output, lines);
