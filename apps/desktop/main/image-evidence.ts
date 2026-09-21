import { open } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, extname } from "node:path";
import { nativeImage } from "electron";

const MAX_BYTES = 16 * 1024 * 1024;

/** Only the native picker supplies paths. Return pixels and a name, never a local path. */
export async function readEvidenceImage(path: string): Promise<{ filename: string; dataUrl: string }> {
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(extname(path).toLowerCase()))
    throw new Error("Choose a PNG, JPEG or WebP image.");
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  let bytes: Buffer;
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > MAX_BYTES) throw new Error("Choose an image file up to 16 MB.");
    const buffer = Buffer.alloc(Math.min(stat.size + 1, MAX_BYTES + 1));
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(buffer, length, buffer.length - length, null);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > stat.size) throw new Error("The image changed while being read. Choose it again.");
    bytes = buffer.subarray(0, length);
  } finally { await file.close(); }
  const image = nativeImage.createFromBuffer(bytes);
  if (image.isEmpty()) throw new Error("This image could not be opened. Choose another PNG, JPEG or WebP file.");
  const { width, height } = image.getSize();
  if (!width || !height || width * height > 64_000_000) throw new Error("Choose an image up to 64 million pixels.");
  let scale = Math.min(1, 2048 / Math.max(width, height));
  for (let attempt = 0; attempt < 5; attempt++) {
    // Re-encoding strips original file metadata; only the reviewed image is retained.
    const png = image.resize({ width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), quality: "best" }).toPNG();
    if (png.length <= 3 * 1024 * 1024) return {
      filename: `${basename(path, extname(path)).slice(0, 180)}.png`,
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
    };
    scale *= .7;
  }
  throw new Error("The image is too large to attach. Choose a smaller version.");
}
