import { expect, it } from "vitest";
import { PNG } from "pngjs";
import { limitCapturePng } from "../../apps/runtime/src/services/capture-size.js";

it("resizes a masked PNG inside the model image limits and keeps its pixel scale", () => {
  const source = new PNG({ width: 2000, height: 1200 });
  source.data.fill(120);
  const original = PNG.sync.write(source);
  const limited = limitCapturePng(original);
  const decoded = PNG.sync.read(limited.buffer);
  expect(Math.max(decoded.width, decoded.height)).toBeLessThanOrEqual(1568);
  expect(decoded.width * decoded.height).toBeLessThanOrEqual(1_150_000);
  expect(limited.ratio).toBeCloseTo(decoded.width / source.width);
  expect(decoded.data[0]).toBe(120);
});
