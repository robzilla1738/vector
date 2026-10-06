import { PNG } from "pngjs";
import { AuxError } from "@aux/contracts";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Model-visible PNGs stay inside both P1 image limits without native addons. */
export function limitCapturePng(buffer: Buffer): {
  buffer: Buffer;
  width: number;
  height: number;
  ratio: number;
} {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE))
    throw new AuxError("backend_unavailable", "The captured image is not a valid PNG.");
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (!width || !height)
    throw new AuxError("backend_unavailable", "The captured image has invalid dimensions.");
  if (width * height > 50_000_000)
    throw new AuxError(
      "capability_unsupported",
      "This full-page image is too large to process safely. Capture a smaller region.",
    );
  const ratio = Math.min(1, 1568 / width, 1568 / height, Math.sqrt(1_150_000 / (width * height)));
  if (ratio === 1) return { buffer, width, height, ratio };
  const scaledWidth = Math.max(1, Math.floor(width * ratio));
  const scaledHeight = Math.max(1, Math.floor(height * ratio));
  const source = PNG.sync.read(buffer);
  const output = new PNG({ width: scaledWidth, height: scaledHeight });
  for (let y = 0; y < scaledHeight; y++) {
    const fy = (y + 0.5) / ratio - 0.5;
    const y0 = Math.max(0, Math.min(height - 1, Math.floor(fy)));
    const y1 = Math.min(height - 1, y0 + 1);
    const wy = Math.max(0, Math.min(1, fy - y0));
    for (let x = 0; x < scaledWidth; x++) {
      const fx = (x + 0.5) / ratio - 0.5;
      const x0 = Math.max(0, Math.min(width - 1, Math.floor(fx)));
      const x1 = Math.min(width - 1, x0 + 1);
      const wx = Math.max(0, Math.min(1, fx - x0));
      const target = (y * scaledWidth + x) * 4;
      const a = (y0 * width + x0) * 4;
      const b = (y0 * width + x1) * 4;
      const c = (y1 * width + x0) * 4;
      const d = (y1 * width + x1) * 4;
      for (let channel = 0; channel < 4; channel++) {
        const top = source.data[a + channel]! * (1 - wx) + source.data[b + channel]! * wx;
        const bottom = source.data[c + channel]! * (1 - wx) + source.data[d + channel]! * wx;
        output.data[target + channel] = Math.round(top * (1 - wy) + bottom * wy);
      }
    }
  }
  return {
    buffer: PNG.sync.write(output),
    width: scaledWidth,
    height: scaledHeight,
    ratio: scaledWidth / width,
  };
}
