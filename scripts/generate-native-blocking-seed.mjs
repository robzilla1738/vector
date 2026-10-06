import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const output = process.argv[2];
if (!output) throw new Error("Pass an isolated Chromium output path.");
const source = readFileSync(resolve("packages/contracts/src/tracker-hosts.ts"), "utf8");
const hosts = [...source.matchAll(/^  "([a-z0-9.-]+)",?$/gm)].map((match) => match[1]);
if (hosts.length < 50 || new Set(hosts).size !== hosts.length)
  throw new Error("Invalid built-in tracker seed.");
writeFileSync(
  output,
  `// Generated from packages/contracts/src/tracker-hosts.ts. Do not edit.\nconstexpr const char* kBuiltInBlockingHosts[] = {\n${hosts.map((host) => `    "${host}",`).join("\n")}\n};\n`,
);
