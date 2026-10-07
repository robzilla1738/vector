#!/usr/bin/env node
/** Compile the authored agent prompt into a resource tsc and the runtime bundler both understand. */
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function generateAgentPrompt({ check = false } = {}) {
  const directory = new URL("../apps/runtime/src/agent/prompt/", import.meta.url);
  const system = readFileSync(new URL("system.md", directory), "utf8").trim();
  if (!system) throw new Error("The agent system prompt is empty.");
  const destination = new URL("system.generated.json", directory);
  const output = JSON.stringify({ system }, null, 2) + "\n";
  let previous;
  try {
    previous = readFileSync(destination, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (check) {
    if (previous !== output)
      throw new Error("Regenerate the agent prompt with node scripts/gen-agent-prompt.mjs.");
  } else if (previous !== output) writeFileSync(destination, output);
  return destination;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  generateAgentPrompt({ check: process.argv.includes("--check") });
