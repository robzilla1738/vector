// Fixed, deterministic texture: no SVG filter or per-frame raster work in the shell.
import { PNG } from "pngjs";
import { writeFileSync } from "node:fs";

const size = 256;
const tile = new PNG({ width: size, height: size });
let seed = 0x5a17e39d;
for (let i = 0; i < size * size; i++) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  const value = seed & 255;
  const offset = i * 4;
  tile.data[offset] = value;
  tile.data[offset + 1] = value;
  tile.data[offset + 2] = value;
  tile.data[offset + 3] = 255;
}
writeFileSync(new URL("../apps/shell/src/styles/space-grain.png", import.meta.url), PNG.sync.write(tile));
