import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MethodSchemas } from "@aux/contracts";
import { RENDERER_METHODS, rendererMayInvoke } from "../../apps/desktop/main/renderer-methods.js";

const rendererRoot = join(dirname(fileURLToPath(import.meta.url)), "../../apps/desktop/renderer/src");

/** Method names written in the renderer, excluding tests and the mock bridge. */
function methodsNamedInRenderer(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "mock") continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(name) && !name.includes(".test.")) files.push(path);
    }
  };
  walk(rendererRoot);
  const found = new Set<string>();
  const literal = /['"]([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)['"]/g;
  for (const path of files) {
    const text = readFileSync(path, "utf8");
    for (const match of text.matchAll(literal)) {
      const name = match[1];
      if (name !== undefined && name in MethodSchemas) found.add(name);
    }
  }
  return [...found].sort();
}

describe("renderer runtime method gate", () => {
  it("allows a method the window calls and rejects page script execution", () => {
    expect(rendererMayInvoke("pages.open")).toBe(true);
    expect(rendererMayInvoke("workspace.get")).toBe(true);
    expect(rendererMayInvoke("pages.execute")).toBe(false);
    expect(rendererMayInvoke("agentConnections.create")).toBe(false);
  });

  it("matches the methods named in the renderer and nothing else", () => {
    expect([...RENDERER_METHODS].sort()).toEqual(methodsNamedInRenderer());
  });
});
