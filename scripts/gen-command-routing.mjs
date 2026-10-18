#!/usr/bin/env node
/** Derive startup routing from the sole authored command registry, before compiling contracts. */
import { readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routeFields = ["handler", "windows", "dispatch", "intercept", "focusShell"];
export async function commandRoutingSource(root = defaultRoot) {
  const filename = resolve(root, "packages/contracts/src/commands.ts");
  const javascript = stripTypeScriptTypes(readFileSync(filename, "utf8"), {
    mode: "strip",
    sourceUrl: filename,
  });
  // The registry is static authored metadata; imports must stay type-only to avoid a stale-dist bootstrap.
  if (/^\s*import\s/m.test(javascript))
    throw new Error("Command routing generation requires a self-contained canonical registry.");
  const { COMMANDS } = await import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
  const ids = new Set(),
    groups = [],
    rows = [];
  for (const command of COMMANDS) {
    if (
      typeof command.id !== "string" ||
      ids.has(command.id) ||
      !["shell", "native"].includes(command.handler) ||
      !Array.isArray(command.bindings)
    )
      throw new Error("Canonical commands must have distinct IDs and actual routing/bindings.");
    ids.add(command.id);
    const route = Object.fromEntries(
      routeFields.filter((field) => command[field] !== undefined).map((field) => [field, command[field]]),
    );
    const serialized = JSON.stringify(route);
    let group = groups.indexOf(serialized);
    if (group < 0) {
      group = groups.length;
      groups.push(serialized);
    }
    rows.push(
      `  {id:${JSON.stringify(command.id)},...r${group}${command.bindings.length ? `,bindings:${JSON.stringify(command.bindings)}` : ""}},`,
    );
  }
  return `// Generated from commands.ts by scripts/gen-command-routing.mjs. Do not edit.\nimport type { CommandDef } from "./commands.js";\n\nexport type StartupCommandDef = Pick<CommandDef, "id" | "handler" | "windows" | "dispatch" | "bindings" | "intercept" | "focusShell">;\n${groups.map((group, index) => `const r${index}=${group.slice(0, -1)},"bindings":[]} as const;`).join("\n")}\n\nexport const STARTUP_COMMANDS=[\n${rows.join("\n")}\n] as const satisfies readonly StartupCommandDef[];\n\nexport const STARTUP_SCOPED_COMMANDS=STARTUP_COMMANDS.filter(command=>"dispatch" in command&&command.dispatch==="scoped");\n`;
}
export async function generateCommandRouting({
  root = defaultRoot,
  destination = resolve(root, "packages/contracts/src/command-routing.generated.ts"),
  check = false,
} = {}) {
  const output = await commandRoutingSource(root);
  let previous;
  try {
    previous = readFileSync(destination, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (check && previous !== output)
    throw new Error("Regenerate command routing with node scripts/gen-command-routing.mjs.");
  if (!check && previous !== output) writeFileSync(destination, output);
  return output;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await generateCommandRouting({ check: process.argv.includes("--check") });
