import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { NativeImageNormalizeParams, NativeImageNormalizeResult } from "@aux/contracts/image-normalize";
import type { NativeBridge } from "../native.js";
import type { ChannelIntakeDependencies } from "./channel-intake.js";

const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

/** Native decoding accepts immutable bytes, never a network URL or a Profile path. */
export function nativeImageIntake(
  native: NativeBridge,
): NonNullable<ChannelIntakeDependencies["normalizeImage"]> {
  return async (input) => {
    const check = () => {
      input.signal.throwIfAborted();
      input.checkCurrent();
    };
    check();
    const bytes = Buffer.from(input.bytes);
    if (hash(bytes) !== input.sha256)
      throw new AuxError("conflict", "The original image bytes changed before decoding.");
    const params = NativeImageNormalizeParams.parse({
      bytesBase64: bytes.toString("base64"),
      mediaType: input.mediaType,
      sha256: input.sha256,
    });
    const capabilities = await native.capabilities?.();
    check();
    if (!native.imageNormalize || !capabilities?.methods.includes("native.imageNormalize"))
      throw new AuxError("capability_unsupported", "This browser build cannot normalize this image.");
    const result = NativeImageNormalizeResult.parse(await native.imageNormalize(params, input.signal));
    check();
    const png = Buffer.from(result.pngBase64, "base64");
    if (
      png.toString("base64") !== result.pngBase64 ||
      result.sourceSha256 !== input.sha256 ||
      hash(png) !== result.sha256 ||
      png.length < 33 ||
      !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      png.toString("ascii", 12, 16) !== "IHDR" ||
      png.readUInt32BE(16) !== result.width ||
      png.readUInt32BE(20) !== result.height ||
      result.width * result.height > 16_000_000
    )
      throw new AuxError(
        "backend_unavailable",
        "The isolated image decoder returned an invalid output identity.",
      );
    return {
      bytes: png,
      sourceSha256: result.sourceSha256,
      sha256: result.sha256,
      width: result.width,
      height: result.height,
    };
  };
}
