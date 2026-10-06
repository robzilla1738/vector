import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Read stylesheet imports in cascade order for source-level CSS assertions. */
export function readCssGraph(path: string, seen = new Set<string>()): string {
  const file = resolve(path);
  if (seen.has(file)) return "";
  seen.add(file);
  return readFileSync(file, "utf8").replace(
    /@import\s+["'](\.[^"']+)["'];/g,
    (_statement, relative: string) => readCssGraph(resolve(dirname(file), relative), seen),
  );
}
