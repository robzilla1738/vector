import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = readFileSync(new URL("../apps/shell/src/tokens.css", import.meta.url), "utf8");
const surfaces = readFileSync(new URL("../apps/shell/src/styles/surfaces.css", import.meta.url), "utf8");
const floatingOpacity =
  Number(
    surfaces.match(
      /--floating-glass-tint:\s*color-mix\(in srgb, var\(--floating-sidebar-surface\) (\d+)%, transparent\)/,
    )?.[1],
  ) / 100;
assert.ok(floatingOpacity > 0 && floatingOpacity <= 1, "floating glass opacity must be present");
const navigationOpacity =
  Number(surfaces.match(/--navigation-glass-tint:[\s\S]*?max\((\d+)%,/)?.[1]) / 100;
assert.ok(navigationOpacity > 0 && navigationOpacity <= 1, "navigation opacity must be present");
const palette = tokens.replace(/\/\*[\s\S]*?\*\//g, "");
const dark = palette.match(/:root\s*\{([^}]*)\}/)?.[1];
const light = palette.match(/\[data-theme="light"\]\s*\{([^}]*)\}/)?.[1];
assert.ok(dark && light, "dark and light theme token blocks must be present");

function tokenColor(sheet, name) {
  const hex = sheet.match(new RegExp(`--${name}:\\s*#([\\da-f]{6}|[\\da-f]{3});`, "i"))?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? [...hex].map((channel) => channel.repeat(2)).join("") : hex;
    const channels = expanded.match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255);
    return { channels, alpha: 1 };
  }
  const rgb = sheet.match(new RegExp(`--${name}:\\s*rgb\\((\\d+) (\\d+) (\\d+) / ([\\d.]+)(%)?\\);`));
  if (rgb)
    return {
      channels: rgb.slice(1, 4).map((value) => Number(value) / 255),
      alpha: Number(rgb[4]) / (rgb[5] ? 100 : 1),
    };
  const match = sheet.match(new RegExp(`--${name}: oklch\\(([\\d.]+)% 0 0(?: / ([\\d.]+))?\\);`));
  assert.ok(match, `${name} must be a hex, RGB or neutral OKLCH token for this check`);
  return {
    channels: Array(3).fill(srgb((Number(match[1]) / 100) ** 3)),
    alpha: match[2] ? Number(match[2]) : 1,
  };
}

function srgb(linear) {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
}

function linear(srgbValue) {
  return srgbValue <= 0.04045 ? srgbValue / 12.92 : ((srgbValue + 0.055) / 1.055) ** 2.4;
}

function contrast(ink, glass, behind) {
  const background = glass.channels.map((channel) => channel * glass.alpha + behind * (1 - glass.alpha));
  const foreground = ink.channels.map(
    (channel, index) => channel * ink.alpha + background[index] * (1 - ink.alpha),
  );
  const luminance = (channels) =>
    channels.map(linear).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const [higher, lower] = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
  return (higher + 0.05) / (lower + 0.05);
}

for (const [theme, sheet] of [
  ["dark", dark],
  ["light", light],
]) {
  const ink = tokenColor(sheet, "ink-2");
  const glass = tokenColor(sheet, "glass");
  const strong = tokenColor(sheet, "glass-strong");
  const floating = tokenColor(sheet, "floating-sidebar-surface");
  const sidebarInk = tokenColor(sheet, "sb-ink-2");
  for (const [surface, material, foreground] of [
    ["glass", glass, ink],
    ["strong glass", strong, ink],
    ["floating glass", { ...floating, alpha: floatingOpacity }, ink],
    ["navigation glass", { ...floating, alpha: navigationOpacity }, sidebarInk],
  ]) {
    for (const [underlay, behind] of [
      ["black", 0],
      ["white", 1],
    ]) {
      const ratio = contrast(foreground, material, behind);
      console.log(`${theme} ${surface} over ${underlay}: ${ratio.toFixed(2)}:1`);
      assert.ok(ratio >= 4.5, `${theme} secondary text on ${surface} over ${underlay} is below 4.5:1`);
    }
  }
}
