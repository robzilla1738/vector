import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import {
  googleAttachmentMetadata,
  googleAttachmentInspector,
} from "../../apps/runtime/src/services/google-attachments.js";
import type { ChannelIntakeDependencies } from "../../apps/runtime/src/services/channel-intake.js";
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const input = (bytes: Buffer, mediaType = "application/pdf") => ({
  bytes,
  sha256: hash(bytes),
  mediaType,
  filename: "report.pdf",
  signal: new AbortController().signal,
  checkCurrent: vi.fn(),
});
it("binds bounded attachment metadata to the exact original message/part and sanitizes its filename", () => {
  const source = {
    id: "message1",
    payload: {
      parts: [
        {
          filename: "../Private\u202e.pdf",
          mimeType: "Application/PDF; charset=utf-8",
          body: { attachmentId: "part1", size: 10 },
        },
      ],
    },
  };
  expect(googleAttachmentMetadata(source, "message1", "part1")).toEqual({
    filename: ".._Private.pdf",
    mediaType: "application/pdf",
    size: 10,
  });
  for (const [messageId, attachmentId] of [
    ["other", "part1"],
    ["message1", "another"],
  ])
    expect(() => googleAttachmentMetadata(source, messageId!, attachmentId!)).toThrow();
  source.payload.parts.push(source.payload.parts[0]!);
  expect(() => googleAttachmentMetadata(source, "message1", "part1")).toThrow();
  expect(() =>
    googleAttachmentMetadata(
      { id: "message1", payload: { parts: Array(1001).fill({}) } },
      "message1",
      "part1",
    ),
  ).toThrow(/structure/);
});
it("requires native decoding and matching immutable identity before publishing a document MIME", async () => {
  const bytes = Buffer.from("%PDF-1.7 decoder fixture"),
    release = vi.fn(async () => {}),
    source = input(bytes);
  const extractDocument = vi
    .fn<NonNullable<ChannelIntakeDependencies["extractDocument"]>>()
    .mockResolvedValue({
      identity: { sourceSha256: source.sha256 } as never,
      source: {} as never,
      release,
    });
  await expect(googleAttachmentInspector({ extractDocument })(source)).resolves.toEqual({
    mediaType: "application/pdf",
    sourceSha256: source.sha256,
  });
  expect(release).toHaveBeenCalledTimes(1);
  expect(extractDocument.mock.calls[0]?.[0].bytes).not.toBe(bytes);
  await expect(googleAttachmentInspector({})(source)).rejects.toMatchObject({
    code: "capability_unsupported",
  });
  await expect(
    googleAttachmentInspector({ extractDocument })({
      ...source,
      sha256: "0".repeat(64),
    }),
  ).rejects.toMatchObject({ code: "ref_stale" });
  await expect(
    googleAttachmentInspector({ extractDocument })({
      ...source,
      mediaType: "image/png",
    }),
  ).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(extractDocument).toHaveBeenCalledTimes(1);
  expect(bytes.toString()).toBe("%PDF-1.7 decoder fixture");
});
it("releases native results and refuses stale inspection identities", async () => {
  const source = input(Buffer.from("%PDF-1.7 decoder fixture")),
    release = vi.fn(async () => {});
  const extractDocument = vi
    .fn<NonNullable<ChannelIntakeDependencies["extractDocument"]>>()
    .mockResolvedValue({
      identity: { sourceSha256: "0".repeat(64) } as never,
      source: {} as never,
      release,
    });
  await expect(googleAttachmentInspector({ extractDocument })(source)).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(release).toHaveBeenCalledTimes(1);
});
it("requires image decoding, preserves original image bytes and clears decoder output after verification", async () => {
  const bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1]),
    source = input(bytes, "image/png"),
    output = Buffer.from("decoder output");
  const normalizeImage = vi.fn<NonNullable<ChannelIntakeDependencies["normalizeImage"]>>().mockResolvedValue({
    bytes: output,
    sourceSha256: source.sha256,
    sha256: "a".repeat(64),
    width: 1,
    height: 1,
  });
  await expect(googleAttachmentInspector({ normalizeImage })(source)).resolves.toEqual({
    mediaType: "image/png",
    sourceSha256: source.sha256,
  });
  expect(output.every((value) => value === 0)).toBe(true);
  expect(bytes[0]).toBe(137);
  await expect(googleAttachmentInspector({})(source)).rejects.toMatchObject({
    code: "capability_unsupported",
  });
});
