import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { nativeDocumentJob } from "../../apps/runtime/src/services/native-document-jobs.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import type { NativeDocumentJobInput, NativeDocumentJobOutput } from "@aux/contracts/document-jobs";
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
function fixture() {
  const source = Buffer.alloc(600_000, 32);
  const output = Buffer.from("%PDF-1.7\nverified test output");
  const owner = { signal: new AbortController().signal, checkCurrent: vi.fn() };
  const seen: NativeDocumentJobInput[] = [];
  let resultHash = hash(source);
  const method = vi.fn(async (input: NativeDocumentJobInput): Promise<NativeDocumentJobOutput> => {
    seen.push(input);
    switch (input.action) {
      case "begin":
        return { action: "begin", jobId: "original-job" };
      case "append":
        return { action: "append", offset: input.offset + Buffer.from(input.bytesBase64, "base64").length };
      case "run":
        return {
          action: "run",
          report: { kind: "pdf", sourceSha256: [resultHash] },
          outputs: [
            { sha256: hash(output), size: output.length, mediaType: "application/pdf", label: "copy.pdf" },
          ],
        };
      case "read":
        return {
          action: "read",
          offset: input.offset,
          bytesBase64: output.subarray(input.offset).toString("base64"),
          done: true,
        };
      case "close":
        return { action: "close", joined: true };
    }
  });
  const native = {
    capabilities: async () => ({ methods: ["native.documentJob"] }),
    documentJob: method,
  } as unknown as NativeBridge;
  return {
    source,
    output,
    owner,
    method,
    native,
    seen,
    setResultHash: (value: string) => (resultHash = value),
    run: () =>
      nativeDocumentJob(
        native,
        { kind: "pdf", options: { operation: "fields" } },
        [{ bytes: source, sha256: hash(source), mediaType: "application/pdf" }],
        owner,
      ),
  };
}
it("uploads immutable chunks in exact order, verifies every output and joins its utility", async () => {
  const f = fixture();
  const pending = f.run();
  f.source.fill(99);
  const result = await pending;
  expect(result.outputs[0]?.bytes).toEqual(f.output);
  const chunks = f.seen.filter((input) => input.action === "append");
  expect(chunks.map((input) => input.offset)).toEqual([0, 262144, 524288]);
  expect(Buffer.concat(chunks.map((input) => Buffer.from(input.bytesBase64, "base64")))).toEqual(
    Buffer.alloc(600_000, 32),
  );
  expect(f.seen.at(-1)).toEqual({ action: "close", jobId: "original-job" });
});
it("rejects changed source/result identity and closes the original job", async () => {
  const f = fixture();
  f.setResultHash("0".repeat(64));
  await expect(f.run()).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(f.seen.at(-1)?.action).toBe("close");
  expect(f.seen.some((input) => input.action === "read")).toBe(false);
});
it("rejects reordered or truncated output chunks", async () => {
  const f = fixture();
  const implementation = f.method.getMockImplementation()!;
  f.method.mockImplementation(async (input) =>
    input.action === "read"
      ? { action: "read", offset: 1, bytesBase64: "", done: true }
      : implementation(input),
  );
  await expect(f.run()).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(f.seen.at(-1)?.action).toBe("close");
});
it("cancellation closes once and joins before the run settles", async () => {
  const f = fixture();
  const controller = new AbortController();
  f.owner.signal = controller.signal;
  const implementation = f.method.getMockImplementation()!;
  let rejectRun!: (error: Error) => void;
  let finishClose!: () => void;
  f.method.mockImplementation(async (input) => {
    if (input.action === "run")
      return new Promise((_, reject) => {
        rejectRun = reject;
      });
    if (input.action === "close") {
      f.seen.push(input);
      await new Promise<void>((resolve) => {
        finishClose = resolve;
      });
      rejectRun(new Error("original utility retired"));
      return { action: "close", joined: true };
    }
    return implementation(input);
  });
  const pending = f.run();
  let settled = false;
  const outcome = pending
    .catch((error) => error)
    .finally(() => {
      settled = true;
    });
  await vi.waitFor(() => expect(rejectRun).toBeTypeOf("function"));
  controller.abort();
  await vi.waitFor(() => expect(finishClose).toBeTypeOf("function"));
  expect(settled).toBe(false);
  finishClose();
  expect(await outcome).toBeInstanceOf(Error);
  expect(f.seen.filter((input) => input.action === "close")).toHaveLength(1);
});
it("refuses missing capabilities and invalid input hashes before native admission", async () => {
  const f = fixture();
  await expect(
    nativeDocumentJob(
      f.native,
      { kind: "audioInspect" },
      [{ bytes: f.source, sha256: "0".repeat(64), mediaType: "audio/wav" }],
      f.owner,
    ),
  ).rejects.toMatchObject({ code: "invalid_params" });
  expect(f.method).not.toHaveBeenCalled();
  f.native.capabilities = async () => ({ methods: [] }) as never;
  await expect(f.run()).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(f.method).not.toHaveBeenCalled();
});
