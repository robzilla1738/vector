import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MethodSchemas } from "@aux/contracts";
import { RENDERER_METHODS, SMOKE_HARNESS_METHODS, rendererMayInvoke } from "../../apps/desktop/main/renderer-methods.js";

const rendererRoot = join(dirname(fileURLToPath(import.meta.url)), "../../apps/shell/src");

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

  it("keeps the smoke-harness surface disjoint and covers every smoke-invoked method", () => {
    const renderer = new Set(methodsNamedInRenderer());
    for (const method of SMOKE_HARNESS_METHODS) {
      expect(renderer.has(method), `${method} is called by the renderer — it belongs in RENDERER_METHODS`).toBe(false);
    }
    const smokeRoot = join(rendererRoot, "../../../tests/smoke");
    const literal = /aux\.invoke\(['"]([A-Za-z0-9.]+)['"]/g;
    const invoked = new Map<string, string>();
    for (const name of readdirSync(smokeRoot)) {
      if (!name.endsWith(".mjs")) continue;
      for (const match of readFileSync(join(smokeRoot, name), "utf8").matchAll(literal)) {
        if (match[1] && match[1] in MethodSchemas) invoked.set(match[1], name);
      }
    }
    for (const [method, name] of invoked) {
      expect(rendererMayInvoke(method), `${method} invoked by ${name} is not allowed for the shell`).toBe(true);
    }
  });
});
