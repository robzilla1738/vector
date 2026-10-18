import { createHash } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SpendLedger } from "../../apps/runtime/src/store/spend-ledger.js";
import {
  gatewayAudioGenerator,
  inspectChannelAudio,
  transcribeAdmittedAudio,
  type ChannelAudioInput,
  type AudioInspection,
} from "../../apps/runtime/src/services/audio-transcription.js";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});
function fixture() {
  const bytes = Uint8Array.from(Buffer.from("RIFF1234WAVE-audio-fixture"));
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const controller = new AbortController();
  const input: ChannelAudioInput = {
    runId: "source-run",
    bytes,
    mediaType: "audio/wav",
    sha256,
    source: {
      connectionId: "connection",
      connectionRevision: "revision",
      peerKey: "peer",
      messageKey: "message",
      attachmentKey: "file",
      provider: "telegram",
      conversationId: "conversation",
    },
    signal: controller.signal,
    checkCurrent: vi.fn(),
    beforeDispatch: vi.fn(async () => {}),
    recordReceipt: vi.fn(async () => {}),
  };
  const inspection: AudioInspection = {
    sourceSha256: sha256,
    mediaType: "audio/wav",
    decodedFrames: 48000,
    sampleRate: 48000,
    channels: 1,
    durationSeconds: 1,
    complete: true,
  };
  const directory = mkdtempSync(join(tmpdir(), "aux-audio-test-"));
  dirs.push(directory);
  const ledger = new SpendLedger(join(directory, "spend.sqlite"), { AUX_PROGRAM_SPEND_CAP_USD: "1" });
  return { input, inspection, ledger, controller };
}
it.each([
  { durationSeconds: 601, decodedFrames: 601 * 48000 },
  { durationSeconds: 0 },
  { decodedFrames: 7 },
  { channels: 3 },
  { sampleRate: 192001 },
  { complete: false },
  { sourceSha256: "0".repeat(64) },
  { mediaType: "audio/ogg" },
])("refuses incomplete, mismatched or unsupported native inspection %j", async (patch) => {
  const f = fixture();
  try {
    await expect(
      inspectChannelAudio(f.input, async () => ({ ...f.inspection, ...patch }) as AudioInspection),
    ).rejects.toThrow();
    expect(f.input.beforeDispatch).not.toHaveBeenCalled();
  } finally {
    f.ledger.close();
  }
});
it("copies source bytes before inspection and ignores transport duration hints", async () => {
  const f = fixture();
  try {
    f.input.durationSeconds = 999999;
    const result = await inspectChannelAudio(f.input, async (capture) => {
      f.input.bytes.fill(0);
      expect(capture.bytes).not.toEqual(f.input.bytes);
      return f.inspection;
    });
    expect(result.inspection.durationSeconds).toBe(1);
  } finally {
    f.ledger.close();
  }
});
it.each([0, undefined])(
  "preserves observed zero or estimated unknown cost (%s), without fabricating token usage",
  async (costUsd) => {
    const f = fixture(),
      recordReceipt = vi.fn<ChannelAudioInput["recordReceipt"]>(async () => {});
    try {
      const outcome = await transcribeAdmittedAudio({
        capture: f.input,
        bytes: f.input.bytes,
        inspection: f.inspection,
        modelId: "openai/whisper-1",
        callId: "call",
        estimateUsd: 0.001,
        ledger: f.ledger,
        checkCurrent: async () => {},
        recordReceipt,
        generator: async (request) => {
          await request.beforeDispatch();
          return { text: "synthetic fixture", costUsd };
        },
      });
      expect(outcome).toMatchObject({
        text: "synthetic fixture",
        costUsd: costUsd ?? 0.001,
        costEstimated: costUsd === undefined,
      });
      expect(recordReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          dispatched: true,
          costUsd: costUsd ?? 0.001,
          costEstimated: costUsd === undefined,
        }),
      );
      expect(recordReceipt.mock.calls[0]![0]).not.toHaveProperty("inputTokens");
      expect(f.ledger.summary().committedUsd).toBe(costUsd ?? 0.001);
    } finally {
      f.ledger.close();
    }
  },
);
it("settles uncertain sends and joins cancellation without publishing transcript", async () => {
  const f = fixture(),
    recordReceipt = vi.fn<ChannelAudioInput["recordReceipt"]>(async () => {});
  try {
    await expect(
      transcribeAdmittedAudio({
        capture: f.input,
        bytes: f.input.bytes,
        inspection: f.inspection,
        modelId: "openai/whisper-1",
        callId: "call",
        estimateUsd: 0.001,
        ledger: f.ledger,
        checkCurrent: async () => f.controller.signal.throwIfAborted(),
        recordReceipt,
        generator: async (request) => {
          await request.beforeDispatch();
          f.controller.abort();
          return { text: "stale" };
        },
      }),
    ).rejects.toThrow();
    expect(recordReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ dispatched: true, costEstimated: true }),
    );
    expect(f.ledger.summary().reservedUsd).toBe(0);
    expect(f.ledger.summary().committedUsd).toBe(0.001);
  } finally {
    f.ledger.close();
  }
});
it("records proved pre-dispatch refusal as zero and prevents a second send", async () => {
  const f = fixture(),
    recordReceipt = vi.fn<ChannelAudioInput["recordReceipt"]>(async () => {});
  try {
    await expect(
      transcribeAdmittedAudio({
        capture: f.input,
        bytes: f.input.bytes,
        inspection: f.inspection,
        modelId: "openai/whisper-1",
        callId: "call",
        estimateUsd: 0.001,
        ledger: f.ledger,
        checkCurrent: async () => {},
        recordReceipt,
        generator: async () => {
          throw new Error("before send");
        },
      }),
    ).rejects.toThrow();
    expect(recordReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ dispatched: false, costUsd: 0, costEstimated: false }),
    );
    await expect(
      transcribeAdmittedAudio({
        capture: f.input,
        bytes: f.input.bytes,
        inspection: f.inspection,
        modelId: "openai/whisper-1",
        callId: "call2",
        estimateUsd: 0.001,
        ledger: f.ledger,
        checkCurrent: async () => {},
        recordReceipt,
        generator: async (request) => {
          await request.beforeDispatch();
          await request.beforeDispatch();
          return { text: "bad" };
        },
      }),
    ).rejects.toThrow(/twice/);
  } finally {
    f.ledger.close();
  }
});
it("binds SDK dispatch to original bytes, MIME, model and current Gateway credential, maxRetries zero", async () => {
  const f = fixture(),
    credential = vi.fn(async () => ({ apiKey: "fixture-secret", teamId: "fixture-team" }));
  const request = vi.fn<typeof fetch>().mockImplementation(async (target, init) => {
    expect(String(target)).toBe("https://ai-gateway.vercel.sh/v4/ai/transcription-model");
    expect(init?.redirect).toBe("error");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer fixture-secret");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      audio: Buffer.from(f.input.bytes).toString("base64"),
      mediaType: "audio/wav",
    });
    return new Response(
      JSON.stringify({
        text: "Fixture transcript",
        segments: [],
        language: "en",
        durationInSeconds: 99,
        warnings: [],
        providerMetadata: { gateway: { cost: "0" } },
      }),
      { headers: { "content-type": "application/json" } },
    );
  });
  try {
    const generator = gatewayAudioGenerator(credential, request);
    expect(await generator({ ...f.input, modelId: "openai/whisper-1" })).toMatchObject({
      text: "Fixture transcript",
      costUsd: 0,
    });
    expect(f.input.beforeDispatch).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledOnce();
    request.mockResolvedValue(new Response("error", { status: 503 }));
    await expect(generator({ ...f.input, modelId: "openai/whisper-1" })).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(2);
  } finally {
    f.ledger.close();
  }
});
