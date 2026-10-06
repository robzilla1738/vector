// Build Aux's macOS icon from the approved transparent 1024px master.
// Usage: node scripts/make-icon.mjs (macOS; no Quick Look rendering or background fill)
import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, mkdtempSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "assets/brand/aux-icon-1024.png");
const output = join(root, "assets/brand/Aux.icns");
if (process.platform !== "darwin") throw new Error("Use macOS sips and iconutil to build the ICNS asset.");
const properties = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", "-g", "hasAlpha", source], {
  encoding: "utf8",
});
if (
  !/pixelWidth: 1024\b/.test(properties) ||
  !/pixelHeight: 1024\b/.test(properties) ||
  !/hasAlpha: yes\b/.test(properties)
)
  throw new Error("The Aux icon master must be a transparent 1024 × 1024 PNG.");
const work = mkdtempSync(join(tmpdir(), "aux-icon-"));
try {
  const iconset = join(work, "Aux.iconset");
  mkdirSync(iconset);
  for (const points of [16, 32, 128, 256, 512]) {
    for (const scale of [1, 2]) {
      const pixels = points * scale;
      const target = join(iconset, `icon_${points}x${points}${scale === 2 ? "@2x" : ""}.png`);
      if (pixels === 1024) copyFileSync(source, target);
      else
        execFileSync("sips", ["-z", String(pixels), String(pixels), source, "--out", target], {
          stdio: "pipe",
        });
    }
  }
  const compiled = join(work, "Aux.icns");
  execFileSync("iconutil", ["-c", "icns", iconset, "-o", compiled]);
  copyFileSync(compiled, `${output}.next`);
  renameSync(`${output}.next`, output);
  // The runtime dock icon never renders above 512px.
  copyFileSync(join(iconset, "icon_512x512.png"), join(root, "apps/shell/public/aux-icon.png"));
  cpSync(iconset, join(root, "assets/brand/Aux.iconset"), { recursive: true });
  console.log(`Built ${output} from ${source}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
