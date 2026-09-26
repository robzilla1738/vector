import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { trafficLights } from "../../apps/desktop/main/traffic-lights";

const tokens = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../apps/shell/src/tokens.css"), "utf8");

it("keeps the macOS window buttons on the toolbar row", () => {
  expect(tokens).toMatch(/--toolbar-h:\s*40px/);
  expect(trafficLights).toEqual({ x: 16, y: 13 });
});
