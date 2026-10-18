import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { nativeImageIntake } from "../../apps/runtime/src/services/native-image-intake.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";

const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aLp8AAAAASUVORK5CYII=",
  "base64",
);
const sha256 = createHash("sha256").update(bytes).digest("hex");
function fixture() {
  const controller = new AbortController();
  const response = { pngBase64: bytes.toString("base64"), sourceSha256: sha256, sha256, width: 1, height: 1 };
  const imageNormalize = vi.fn(async () => response);
  const native = {
    capabilities: async () => ({ methods: ["native.imageNormalize"] }),
    imageNormalize,
  } as unknown as NativeBridge;
  return {
    normalize: nativeImageIntake(native),
    imageNormalize,
    response,
    controller,
    input: { bytes, sha256, mediaType: "image/png", signal: controller.signal, checkCurrent: vi.fn() },
  };
}
it("admits only matching immutable source bytes and a real native capability", async () => {
  const f = fixture();
  await expect(f.normalize({ ...f.input, sha256: "0".repeat(64) })).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.imageNormalize).not.toHaveBeenCalled();
  const unavailable = nativeImageIntake({
    capabilities: async () => ({ methods: [] }),
    imageNormalize: f.imageNormalize,
  } as unknown as NativeBridge);
  await expect(unavailable(f.input)).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(f.imageNormalize).not.toHaveBeenCalled();
  expect(await f.normalize(f.input)).toMatchObject({
    bytes,
    sourceSha256: sha256,
    sha256,
    width: 1,
    height: 1,
  });
});
it("rejects changed output hashes, dimensions and original-source identity", async () => {
  for (const change of [
    { sha256: "0".repeat(64) },
    { sourceSha256: "0".repeat(64) },
    { width: 2 },
    { pngBase64: Buffer.from("false PNG").toString("base64") },
  ]) {
    const f = fixture();
    Object.assign(f.response, change);
    await expect(f.normalize(f.input)).rejects.toMatchObject({ code: "backend_unavailable" });
  }
});
it("joins the original native decode and suppresses a late result after cancellation", async () => {
  const f = fixture();
  let finish!: (value: typeof f.response) => void;
  f.imageNormalize.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = f.normalize(f.input);
  await vi.waitFor(() => expect(f.imageNormalize).toHaveBeenCalledTimes(1));
  f.controller.abort();
  let settled = false;
  const outcome = pending.then(
    () => {
      settled = true;
    },
    (error) => {
      settled = true;
      return error;
    },
  );
  await Promise.resolve();
  expect(settled).toBe(false);
  finish(f.response);
  expect(await outcome).toBeInstanceOf(DOMException);
  expect(f.imageNormalize).toHaveBeenCalledTimes(1);
});
