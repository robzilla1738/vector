import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, join, relative, basename } from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

// Extract reference evidence only; never write into or redistribute the app bundle.
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: node scripts/extract-aside-pak.mjs <resource.pak> <external output directory>");
const source = resolve(input), destination = resolve(output);
if (destination.includes(".app/") || !relative(process.cwd(), destination).startsWith("..")) {
  throw new Error("Extract reference resources outside the repository and installed app.");
}
const data = await readFile(source);
if (data.length < 12 || data.readUInt32LE(0) !== 5) throw new Error("Expected Chromium DataPack v5.");
const count = data.readUInt16LE(8), aliasCount = data.readUInt16LE(10);
const tableEnd = 12 + (count + 1) * 6 + aliasCount * 4;
if (tableEnd > data.length) throw new Error("Truncated DataPack index.");
await mkdir(destination, { recursive: true });
const resources = [];
for (let index = 0; index < count; index++) {
  const position = 12 + index * 6;
  const id = data.readUInt16LE(position);
  const start = data.readUInt32LE(position + 2), end = data.readUInt32LE(position + 8);
  if (start < tableEnd || end < start || end > data.length) throw new Error(`Invalid resource bounds: ${id}`);
  const packed = data.subarray(start, end);
  const gzip = packed[0] === 0x1f && packed[1] === 0x8b;
  const bytes = gzip ? gunzipSync(packed, { maxOutputLength: 64 * 1024 * 1024 }) : packed;
  const prefix = bytes.subarray(0, 512).toString("utf8");
  const extension = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png"
    : /<svg\b/.test(prefix) ? "svg" : /<!doctype html|<html\b/i.test(prefix) ? "html" : "bin";
  const file = `${id}.${extension}`;
  await writeFile(join(destination, file), bytes, { flag: "wx" });
  resources.push({ id, file, gzip, packedBytes: packed.length, bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex") });
}
const aliases = Array.from({ length: aliasCount }, (_, index) => {
  const offset = 12 + (count + 1) * 6 + index * 4;
  const resourceIndex = data.readUInt16LE(offset + 2);
  if (resourceIndex >= count) throw new Error("Invalid alias index.");
  return { id: data.readUInt16LE(offset), resourceId: resources[resourceIndex].id };
});
await writeFile(join(destination, "manifest.json"), JSON.stringify({ source, encoding: data[4], resources, aliases }, null, 2), { flag: "wx" });
console.log(`${basename(source)}: ${resources.length} resources, ${aliases.length} aliases → ${destination}`);
