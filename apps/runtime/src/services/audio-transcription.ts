import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import type { AudioTranscriptionReceipt } from "@aux/contracts/model-connections";
import type { SpendLedger } from "../store/spend-ledger.js";

export type AudioSourceIdentity = {
  connectionId: string;
  connectionRevision: string;
  messageKey: string;
  attachmentKey: string;
  peerKey: string;
  provider: string;
  conversationId: string;
  threadId?: string;
};
export type AudioInspection = {
  sourceSha256: string;
  mediaType: string;
  decodedFrames: number;
  sampleRate: number;
  channels: number;
  durationSeconds: number;
  complete: true;
};
export type InspectAudio = (input: {
  bytes: Uint8Array;
  mediaType: string;
  sha256: string;
  signal: AbortSignal;
  checkCurrent(): void;
}) => Promise<AudioInspection>;
export type ChannelAudioInput = {
  runId: string;
  bytes: Uint8Array;
  mediaType: string;
  sha256: string;
  source: AudioSourceIdentity;
  /** Untrusted transport hint, deliberately unused for admission or billing. */
  durationSeconds?: number;
  beforeDispatch(): Promise<void>;
  recordReceipt(receipt: AudioTranscriptionReceipt): Promise<void>;
  signal: AbortSignal;
  checkCurrent(): void;
};
export type AudioOutcome = {
  text: string;
  modelId: string;
  durationMs: number;
  language?: string;
  costUsd?: number;
  costEstimated: boolean;
};
export type AudioGenerator = (input: {
  bytes: Uint8Array;
  mediaType: string;
  modelId: string;
  sha256: string;
  signal: AbortSignal;
  beforeDispatch(): Promise<void>;
}) => Promise<{ text: string; language?: string; costUsd?: number }>;

const AUDIO_TYPES = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/flac", "audio/webm"];

/** Immutable local capture is the sole source; container duration hints are insufficient. */
export async function inspectChannelAudio(
  input: ChannelAudioInput,
  inspect: InspectAudio,
): Promise<{
  bytes: Uint8Array;
  inspection: AudioInspection;
}> {
  input.checkCurrent();
  input.signal.throwIfAborted();
  const bytes = Uint8Array.from(input.bytes);
  if (
    !bytes.length ||
    bytes.length > 20_000_000 ||
    !AUDIO_TYPES.includes(input.mediaType) ||
    createHash("sha256").update(bytes).digest("hex") !== input.sha256
  )
    throw new AuxError("invalid_params", "Audio must match its captured identity and be at most 20 MB.");
  const inspection = await inspect({ ...input, bytes });
  input.checkCurrent();
  input.signal.throwIfAborted();
  if (
    inspection.complete !== true ||
    inspection.sourceSha256 !== input.sha256 ||
    inspection.mediaType !== input.mediaType ||
    !Number.isSafeInteger(inspection.decodedFrames) ||
    inspection.decodedFrames <= 0 ||
    !Number.isSafeInteger(inspection.sampleRate) ||
    inspection.sampleRate <= 0 ||
    inspection.sampleRate > 192_000 ||
    !Number.isSafeInteger(inspection.channels) ||
    inspection.channels < 1 ||
    inspection.channels > 2 ||
    !Number.isFinite(inspection.durationSeconds) ||
    inspection.durationSeconds <= 0 ||
    inspection.durationSeconds > 600 ||
    Math.abs(inspection.decodedFrames / inspection.sampleRate - inspection.durationSeconds) >
      1 / inspection.sampleRate
  )
    throw new AuxError(
      "invalid_params",
      "Audio needs a complete native decode: at most 10 minutes, stereo and 192 kHz.",
    );
  return { bytes, inspection };
}

/** Maintained SDK with an exact original-account, model, bytes and destination boundary. */
export function gatewayAudioGenerator(
  credential: (signal: AbortSignal) => Promise<{ apiKey: string; teamId?: string } | undefined>,
  request: typeof fetch = fetch,
): AudioGenerator {
  return async (input) => {
    const [{ transcribe }, { createGateway }] = await Promise.all([import("ai"), import("@ai-sdk/gateway")]);
    let preDispatchFailure: unknown;
    const gateway = createGateway({
      apiKey: "aux-audio-transport",
      fetch: async (target, init) => {
        try {
          input.signal.throwIfAborted();
          const url = new URL(target instanceof Request ? target.url : String(target));
          const headers = new Headers(init?.headers);
          if (
            url.href !== "https://ai-gateway.vercel.sh/v4/ai/transcription-model" ||
            init?.method !== "POST" ||
            headers.get("ai-model-id") !== input.modelId ||
            typeof init.body !== "string"
          )
            throw new AuxError(
              "permission_denied",
              "The original transcription destination or model changed.",
            );
          const body = JSON.parse(init.body) as Record<string, unknown>;
          if (
            body.mediaType !== input.mediaType ||
            typeof body.audio !== "string" ||
            body.audio !== Buffer.from(input.bytes).toString("base64") ||
            createHash("sha256").update(input.bytes).digest("hex") !== input.sha256
          )
            throw new AuxError("permission_denied", "The original transcription capture changed.");
          const access = await credential(input.signal);
          input.signal.throwIfAborted();
          if (!access)
            throw new AuxError("backend_unavailable", "Connect AI Gateway before transcribing audio.");
          headers.set("authorization", `Bearer ${access.apiKey}`);
          headers.delete("x-vercel-ai-gateway-team");
          if (access.teamId) headers.set("x-vercel-ai-gateway-team", access.teamId);
          await input.beforeDispatch();
          input.signal.throwIfAborted();
          // One original attempt. The SDK is also configured with maxRetries: 0.
          const response = await request(target, {
            ...init,
            headers,
            redirect: "error",
            signal: input.signal,
          });
          const reader = response.body?.getReader();
          if (!reader) return response;
          const chunks: Uint8Array[] = [];
          let size = 0;
          try {
            for (;;) {
              const part = await reader.read();
              if (part.done) break;
              size += part.value.length;
              if (size > 2_000_000)
                throw new AuxError("model_output_invalid", "Transcription response is too large.");
              chunks.push(part.value);
            }
          } finally {
            await reader.cancel().catch(() => {});
          }
          return new Response(Buffer.concat(chunks), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } catch (error) {
          // Retain only our sanitized authority errors, never provider request bodies.
          if (error instanceof AuxError) preDispatchFailure = error;
          throw error;
        }
      },
    });
    const model = gateway.transcription(input.modelId);
    const result = await transcribe({
      model: {
        specificationVersion: model.specificationVersion,
        provider: model.provider,
        modelId: model.modelId,
        doGenerate: async (args) => {
          const result = await model.doGenerate({ ...args, mediaType: input.mediaType });
          // Provider warnings may contain request text. Keep them outside logs.
          return { ...result, warnings: [] };
        },
      },
      audio: input.bytes,
      maxRetries: 0,
      abortSignal: input.signal,
    }).catch(() => {
      throw (
        preDispatchFailure ??
        new AuxError(
          "backend_unavailable",
          "Transcription did not return a usable result; its send may have completed.",
        )
      );
    });
    const raw = (result.providerMetadata?.gateway as { cost?: unknown } | undefined)?.cost;
    const cost = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
    return {
      text: result.text,
      ...(result.language ? { language: result.language.slice(0, 100) } : {}),
      ...(Number.isFinite(cost) && cost >= 0 ? { costUsd: cost } : {}),
    };
  };
}

/** An original send is settled even when cancellation suppresses transcript publication. */
export async function transcribeAdmittedAudio(input: {
  capture: ChannelAudioInput;
  bytes: Uint8Array;
  inspection: AudioInspection;
  modelId: string;
  callId: string;
  estimateUsd: number;
  ledger: SpendLedger;
  generator: AudioGenerator;
  checkCurrent(): Promise<void>;
  recordReceipt(receipt: AudioTranscriptionReceipt): Promise<void>;
}): Promise<AudioOutcome> {
  const { capture } = input;
  let dispatched = false,
    actualCost: number | undefined,
    reservation: string | undefined;
  const startedAt = Date.now();
  try {
    await input.checkCurrent();
    reservation = input.ledger.reserve(capture.runId, input.modelId, input.estimateUsd);
    const outcome = await input.generator({
      bytes: input.bytes,
      mediaType: capture.mediaType,
      sha256: capture.sha256,
      modelId: input.modelId,
      signal: capture.signal,
      beforeDispatch: async () => {
        await input.checkCurrent();
        if (dispatched) throw new AuxError("conflict", "Audio cannot be dispatched twice.");
        await capture.beforeDispatch();
        dispatched = true;
      },
    });
    if (!dispatched) throw new AuxError("conflict", "Transcription did not establish a dispatch receipt.");
    if (outcome.costUsd !== undefined && Number.isFinite(outcome.costUsd) && outcome.costUsd >= 0)
      actualCost = outcome.costUsd;
    await input.checkCurrent();
    const text = outcome.text.trim();
    if (!text || text.length > 20_000)
      throw new AuxError("model_output_invalid", "Transcription returned empty or oversized text.");
    return {
      text,
      modelId: input.modelId,
      durationMs: Date.now() - startedAt,
      language: outcome.language,
      costUsd: actualCost ?? input.estimateUsd,
      costEstimated: actualCost === undefined,
    };
  } finally {
    if (reservation) input.ledger.settle(reservation, dispatched ? actualCost : 0);
    await input.recordReceipt({
      callId: input.callId,
      modelId: input.modelId,
      sourceSha256: capture.sha256,
      dispatched,
      durationMs: Date.now() - startedAt,
      audioDurationSeconds: input.inspection.durationSeconds,
      costUsd: dispatched ? (actualCost ?? input.estimateUsd) : 0,
      costEstimated: dispatched && actualCost === undefined,
    });
  }
}
