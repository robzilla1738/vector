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

it("secondary text clears 4.5:1 across the neutral glass composition range in both themes", () => {
  const source = readFileSync(fileURLToPath(new URL("../tokens.css", import.meta.url)), "utf8");
  const inks = [...source.matchAll(/--ink-2:\s*(#[0-9a-f]{6});/g)].slice(0, 2).map(match => match[1]!);
  const glass = [...source.matchAll(/--glass(?:-strong)?:\s*oklch\(([\d.]+)% 0 0 \/ ([\d.]+)\);/g)];
  expect(glass).toHaveLength(4);
  for (const [index, match] of glass.entries()) {
    // For neutral OKLCH, relative luminance is L³. Composite in sRGB as CSS
    // does here; the black/white range includes the worst-case page underlay.
    const linear = (Number(match[1]) / 100) ** 3;
    const channel = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
    const alpha = Number(match[2]);
    for (let underlay = 0; underlay <= 255; underlay++) {
      const composite = Math.round(channel * 255 * alpha + underlay * (1 - alpha));
      const background = `#${composite.toString(16).padStart(2, "0").repeat(3)}`;
      expect(ratio(inks[index < 2 ? 0 : 1]!, background)).toBeGreaterThanOrEqual(4.5);
    }
  }
});
