import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = readFileSync(new URL("../apps/shell/src/tokens.css", import.meta.url), "utf8");
const surfaces = readFileSync(new URL("../apps/shell/src/styles/surfaces.css", import.meta.url), "utf8");
const floatingOpacity = Number(surfaces.match(/--floating-glass-tint:\s*color-mix\(in srgb, var\(--sb-bg\) (\d+)%, transparent\)/)?.[1]) / 100;
assert.ok(floatingOpacity > 0 && floatingOpacity <= 1, "floating glass opacity must be present");
const dark = tokens.slice(0, tokens.indexOf('[data-theme="light"] {'));
const light = tokens.slice(tokens.indexOf('[data-theme="light"] {'));

function neutralColor(sheet, name) {
  const hex = sheet.match(new RegExp(`--${name}:\\s*#([\\da-f]{6}|[\\da-f]{3});`, "i"))?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? [...hex].map(channel => channel.repeat(2)).join("") : hex;
    const channels = expanded.match(/.{2}/g).map(channel => parseInt(channel, 16) / 255);
    assert.ok(channels.every(channel => channel === channels[0]), `${name} must be neutral for this check`);
    return { luminance: linear(channels[0]), alpha: 1 };
  }
  const match = sheet.match(new RegExp(`--${name}: oklch\\(([\\d.]+)% 0 0(?: / ([\\d.]+))?\\);`));
  assert.ok(match, `${name} must be a neutral hex or OKLCH token for this check`);
  return { luminance: (Number(match[1]) / 100) ** 3, alpha: match[2] ? Number(match[2]) : 1 };
}

function srgb(linear) {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
}

function linear(srgbValue) {
  return srgbValue <= 0.04045 ? srgbValue / 12.92 : ((srgbValue + 0.055) / 1.055) ** 2.4;
}

function contrast(ink, glass, behind) {
  const background = srgb(glass.luminance) * glass.alpha + behind * (1 - glass.alpha);
  const foreground = srgb(ink.luminance) * ink.alpha + background * (1 - ink.alpha);
  const [higher, lower] = [linear(background), linear(foreground)].sort((a, b) => b - a);
  return (higher + 0.05) / (lower + 0.05);
}

for (const [theme, sheet] of [["dark", dark], ["light", light]]) {
  const ink = neutralColor(sheet, "ink-2");
  const glass = neutralColor(sheet, "glass");
  const strong = neutralColor(sheet, "glass-strong");
  const window = neutralColor(sheet, "bg-window");
  for (const [surface, material] of [["glass", glass], ["strong glass", strong], ["floating glass", { ...window, alpha: floatingOpacity }]]) {
    for (const [underlay, behind] of [["black", 0], ["white", 1]]) {
      const ratio = contrast(ink, material, behind);
      console.log(`${theme} ${surface} over ${underlay}: ${ratio.toFixed(2)}:1`);
      assert.ok(ratio >= 4.5, `${theme} secondary text on ${surface} over ${underlay} is below 4.5:1`);
    }
  }
}
