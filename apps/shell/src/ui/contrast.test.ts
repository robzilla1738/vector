import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

function luminance(hex: string) {
  const rgb = hex.slice(1).match(/.{2}/g)!.map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
}
function ratio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

it("secondary text tokens retain at least 4.5:1 contrast on representative light and dark panels", () => {
  const source = readFileSync(fileURLToPath(new URL("../tokens.css", import.meta.url)), "utf8");
  const values = [...source.matchAll(/--ink-2:\s*(#[0-9a-f]{6});/g)].map(match => match[1]!);
  expect(values.slice(0, 2)).toEqual(["#c9c9c9", "#424242"]);
  expect(ratio(values[0]!, "#454545")).toBeGreaterThanOrEqual(4.5);
  expect(ratio(values[1]!, "#ffffff")).toBeGreaterThanOrEqual(4.5);
});
