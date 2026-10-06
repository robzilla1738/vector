#!/usr/bin/env node
/** Embed the sole authored SQL schema for TypeScript and bundled runtime builds. */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export function generateRuntimeSchema({ check = false } = {}) {
  const directory = new URL("../apps/runtime/src/store/", import.meta.url);
  const source = readFileSync(new URL("schema.sql", directory), "utf8");
  const sections = {};
  const markers = [...source.matchAll(/^-- @schema (profile|spend)\s*$/gm)];
  if (markers.length !== 2 || markers[0][1] !== "profile" || markers[1][1] !== "spend")
    throw new Error("Runtime schema must contain one profile section followed by one spend section.");
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    sections[marker[1]] = source.slice(marker.index + marker[0].length, markers[i + 1]?.index).trim() + "\n";
  }
  const destination = new URL("schema.generated.json", directory);
  const output = JSON.stringify(sections, null, 2) + "\n";
  if (check) {
    if (readFileSync(destination, "utf8") !== output)
      throw new Error(`Regenerate ${fileURLToPath(destination)} with node scripts/gen-runtime-schema.mjs.`);
  } else {
    let previous;
    try {
      previous = readFileSync(destination, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (previous !== output) writeFileSync(destination, output);
  }

  return destination;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  generateRuntimeSchema({ check: process.argv.includes("--check") });
