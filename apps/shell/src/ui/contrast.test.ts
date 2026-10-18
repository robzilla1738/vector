import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

type Color = { channels: number[]; alpha: number };
const tokens = readFileSync(new URL("../tokens.css", import.meta.url), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
const surfaces = readFileSync(new URL("../styles/surfaces.css", import.meta.url), "utf8");

function color(sheet: string, name: string): Color {
  const value = sheet.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
  if (!value) throw new Error(`Missing ${name}`);
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expanded = hex.length === 3 ? [...hex].map((channel) => channel.repeat(2)).join("") : hex;
    return { channels: expanded.match(/.{2}/g)!.map((channel) => parseInt(channel, 16) / 255), alpha: 1 };
  }
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)(%)?\)$/);
  if (rgb)
    return {
      channels: rgb.slice(1, 4).map((channel) => Number(channel) / 255),
      alpha: Number(rgb[4]) / (rgb[5] ? 100 : 1),
    };
  const neutral = value.match(/^oklch\(([\d.]+)% 0 0(?: \/ ([\d.]+))?\)$/);
  if (!neutral) throw new Error(`Unsupported color ${value}`);
  const linear = (Number(neutral[1]) / 100) ** 3;
  const channel = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return { channels: [channel, channel, channel], alpha: Number(neutral[2] ?? 1) };
}

function ratio(ink: Color, material: Color, underlay: number) {
  const background = material.channels.map(
    (channel) => channel * material.alpha + underlay * (1 - material.alpha),
  );
  const foreground = ink.channels.map(
    (channel, index) => channel * ink.alpha + background[index]! * (1 - ink.alpha),
  );
  const luminance = (channels: number[]) =>
    channels.reduce((sum, channel, index) => {
      const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][index]!;
    }, 0);
  const [light, dark] = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

it.each(["dark", "light"])(
  "secondary text clears 4.5:1 on %s panels and across the glass composition range",
  (theme) => {
    const sheet =
      theme === "dark"
        ? tokens.match(/:root\s*\{([^}]*)\}/)?.[1]
        : tokens.match(/\[data-theme="light"\]\s*\{([^}]*)\}/)?.[1];
    if (!sheet) throw new Error(`Missing ${theme} theme`);
    const ink = color(sheet, "ink-2");
    expect(ratio(ink, color(sheet, "bg-1"), 0)).toBeGreaterThanOrEqual(4.5);
    const floatingAlpha =
      Number(
        surfaces.match(
          /--floating-glass-tint:\s*color-mix\(in srgb, var\(--floating-sidebar-surface\) (\d+)%, transparent\)/,
        )?.[1],
      ) / 100;
    expect(floatingAlpha).toBeGreaterThan(0);
    for (const material of [
      color(sheet, "glass"),
      color(sheet, "glass-strong"),
      { ...color(sheet, "floating-sidebar-surface"), alpha: floatingAlpha },
    ]) {
      for (let underlay = 0; underlay <= 255; underlay++) {
        expect(ratio(ink, material, underlay / 255)).toBeGreaterThanOrEqual(4.5);
      }
    }
  },
);
