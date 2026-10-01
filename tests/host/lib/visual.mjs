import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { evidenceBytes } from '../../../scripts/lib/qualification.mjs';

/** Relative pixel comparisons within one run; geometry is normalized to the capture. */
export function createVisual(outputDir) {
  function compare(a, b, box = { x0: 0, y0: 0, x1: 1, y1: 1 }, threshold = 72) {
    const left = PNG.sync.read(evidenceBytes(outputDir, a.path ?? a));
    const right = PNG.sync.read(evidenceBytes(outputDir, b.path ?? b));
    assert.equal(left.width, right.width, 'Capture width changed');
    assert.equal(left.height, right.height, 'Capture height changed');
    assert.ok(Object.values(box).every(value => Number.isFinite(value) && value >= 0 && value <= 1) && box.x1 > box.x0 && box.y1 > box.y0, 'Invalid comparison bounds');
    let changed = 0, delta = 0, pixels = 0;
    for (let y = Math.floor(left.height * box.y0); y < left.height * box.y1; y += 2) {
      for (let x = Math.floor(left.width * box.x0); x < left.width * box.x1; x += 2) {
        const offset = (y * left.width + x) * 4;
        const difference = [0, 1, 2].reduce((sum, channel) => sum + Math.abs(left.data[offset + channel] - right.data[offset + channel]), 0);
        delta += difference; changed += Number(difference > threshold); pixels++;
      }
    }
    assert.ok(pixels, 'Comparison region is empty');
    return { changedFraction: changed / pixels, meanAbsDelta: delta / (pixels * 3), pixels };
  }
  return { compare,
    changedFraction: (a, b, fraction = 0.45) => compare(a, b, { x0: 0, y0: 0.15, x1: fraction, y1: 0.85 }).changedFraction,
    meanAbsDelta: (a, b, box) => compare(a, b, box).meanAbsDelta };
}
