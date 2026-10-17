import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** Flat shipped button rules for jsdom, which cannot resolve CSS layers or tokens. */
export const settingsControlCss = readFileSync(join(root, "apps/shell/src/settings/controls.css"), "utf8");
const tokens = readFileSync(join(root, "apps/shell/src/tokens.css"), "utf8");
const height = tokens.match(/--control-h-lg:\s*([^;]+);/)?.[1];
const buttons = settingsControlCss.match(
  /:is\(\.settings-content, \.aux-native-dialog\) \.btn \{[^}]+\}/,
)?.[0];
if (!height || !buttons) throw new Error("Shared Settings control rules are missing");
export const settingsButtonCss = buttons.replaceAll("var(--control-h-lg)", height);
