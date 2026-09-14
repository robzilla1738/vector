// Generate the Vector app icon: render apps/desktop/icon.svg via Quick Look,
// resize into an iconset with sips, and compile icon.icns with iconutil.
// Usage: node scripts/make-icon.mjs   (run from the repo root, macOS only)
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SVG = join(process.cwd(), "apps", "desktop", "icon.svg");
const OUT = join(process.cwd(), "apps", "desktop", "icon.icns");
const WORK = join(tmpdir(), `vector-icon-${process.pid}`);
const SET = join(WORK, "vector.iconset");

mkdirSync(SET, { recursive: true });
execFileSync("qlmanage", ["-t", "-s", "1024", "-o", WORK, SVG], { stdio: "pipe" });
const png = readdirSync(WORK).find((f) => f.endsWith(".png"));
if (!png) throw new Error("qlmanage produced no thumbnail");
const full = join(SET, "icon_512x512@2x.png");
renameSync(join(WORK, png), full);

for (const s of [16, 32, 64, 128, 256, 512]) {
  const f = join(SET, `icon_${s}x${s}.png`);
  writeFileSync(f, "");
  execFileSync("sips", ["-z", String(s), String(s), full, "--out", f], { stdio: "pipe" });
  if (s <= 256) {
    const f2 = join(SET, `icon_${s}x${s}@2x.png`);
    execFileSync("sips", ["-z", String(s * 2), String(s * 2), full, "--out", f2], { stdio: "pipe" });
  }
}
execFileSync("sips", ["-z", "512", "512", full, "--out", join(SET, "icon_512x512.png")], { stdio: "pipe" });
execFileSync("iconutil", ["-c", "icns", SET, "-o", OUT]);
rmSync(WORK, { recursive: true, force: true });
console.log("wrote", OUT);
