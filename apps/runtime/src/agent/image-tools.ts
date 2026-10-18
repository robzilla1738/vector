import { createHash } from "node:crypto";
import { DEFAULT_IMAGE_MODEL_ID } from "@aux/contracts/model-registry";
import { AuxError, ImageModelSchema, type ImageModel } from "@aux/contracts";
import type { ArtifactStore } from "../services/artifacts.js";
import { SpendLedger } from "../store/spend-ledger.js";

/** The catalog-backed default; explicit Settings null still disables generation. */
export const AGENT_IMAGE_MODEL = DEFAULT_IMAGE_MODEL_ID;
export const IMAGE_RESERVATION_USD = 1;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export type ImageReferenceIdentity = { artifactId: string; sha256: string; mediaType: string };
export type AdmittedImageReference = ImageReferenceIdentity & { bytes: Uint8Array };
export type ImageGenerator = (
  input: { prompt: string; references: readonly AdmittedImageReference[] },
  dispatch: { signal: AbortSignal; beforeDispatch: () => Promise<void> },
) => Promise<{ data: Uint8Array; mediaType: string; costUsd?: number }>;

export interface ImageGenerationContext {
  runId: string;
  taskId?: string;
  signal: AbortSignal;
  checkOwner: () => void | Promise<void>;
  recordReceipt: (receipt: {
    dispatched: boolean;
    costUsd: number;
    costEstimated: boolean;
    durationMs: number;
    error?: string;
  }) => Promise<void>;
}

export class AgentImageTools {
  constructor(
    private artifacts: ArtifactStore,
    private ledger: SpendLedger,
    private generator: ImageGenerator,
    private modelId: ImageModel = AGENT_IMAGE_MODEL,
  ) {
    ImageModelSchema.parse(modelId);
  }

  static withGateway(
    credential: (signal: AbortSignal) => Promise<{ apiKey: string; teamId?: string; signal?: AbortSignal }>,
    artifacts: ArtifactStore,
    ledger: SpendLedger,
    modelId: ImageModel,
  ): AgentImageTools {
    ImageModelSchema.parse(modelId);
    let provider:
      | Promise<{
          generateImage: typeof import("ai").generateImage;
          createGateway: typeof import("@ai-sdk/gateway").createGateway;
        }>
      | undefined;
    return new AgentImageTools(
      artifacts,
      ledger,
      async (input, dispatch) => {
        provider ??= Promise.all([import("ai"), import("@ai-sdk/gateway")]).then(([sdk, gateway]) => ({
          generateImage: sdk.generateImage,
          createGateway: gateway.createGateway,
        }));
        const { generateImage, createGateway } = await provider;
        let preDispatchFailure: unknown;
        const gateway = createGateway({
          apiKey: "aux-image-transport",
          fetch: async (input, init) => {
            const url = new URL(input instanceof Request ? input.url : String(input));
            if (url.href !== "https://ai-gateway.vercel.sh/v4/ai/image-model" || init?.method !== "POST")
              throw new AuxError(
                "permission_denied",
                "Image generation changed its original Gateway destination.",
              );
            let headers: Headers, signal: AbortSignal;
            try {
              dispatch.signal.throwIfAborted();
              const access = await credential(dispatch.signal);
              signal = access.signal ? AbortSignal.any([dispatch.signal, access.signal]) : dispatch.signal;
              signal.throwIfAborted();
              headers = new Headers(init.headers);
              headers.set("authorization", `Bearer ${access.apiKey}`);
              headers.delete("x-vercel-ai-gateway-team");
              if (access.teamId) headers.set("x-vercel-ai-gateway-team", access.teamId);
              await dispatch.beforeDispatch();
            } catch (error) {
              preDispatchFailure = error;
              throw error;
            }
            return fetch(input, { ...init, headers, redirect: "error", signal });
          },
        });
        const result = await generateImage({
          model: gateway.image(modelId),
          prompt: input.references.length
            ? { text: input.prompt, images: input.references.map((reference) => reference.bytes) }
            : input.prompt,
          n: 1,
          maxRetries: 0,
          abortSignal: dispatch.signal,
        }).catch((error: unknown) => {
          throw preDispatchFailure ?? error;
        });
        const metadata = result.providerMetadata as Record<string, { cost?: unknown }> | undefined;
        const rawCost = metadata?.gateway?.cost;
        const cost =
          typeof rawCost === "number" ? rawCost : typeof rawCost === "string" ? Number(rawCost) : NaN;
        return {
          data: result.image.uint8Array,
          mediaType: result.image.mediaType,
          ...(Number.isFinite(cost) && cost >= 0 ? { costUsd: cost } : {}),
        };
      },
      modelId,
    );
  }

  async generate(
    prompt: string,
    context: ImageGenerationContext,
    references: readonly AdmittedImageReference[] = [],
  ) {
    let reservation: string;
    try {
      if (!prompt.trim() || prompt.length > 4000)
        throw new AuxError("invalid_params", "Image prompt must be 1–4000 characters.");
      if (
        references.length > 4 ||
        new Set(references.map((item) => item.artifactId)).size !== references.length
      )
        throw new AuxError("invalid_params", "Choose up to four distinct admitted reference images.");
      if (
        references.reduce((sum, item) => sum + item.bytes.length, 0) > 8 * 1024 * 1024 ||
        references.some(
          (item) =>
            item.mediaType !== "image/png" ||
            !item.bytes.length ||
            item.bytes.length > 3 * 1024 * 1024 ||
            !Buffer.from(item.bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
            createHash("sha256").update(item.bytes).digest("hex") !== item.sha256,
        )
      )
        throw new AuxError(
          "invalid_params",
          "Reference image bytes do not match their admitted PNG identity.",
        );
      if (references.length && this.modelId !== "openai/gpt-image-2")
        throw new AuxError(
          "capability_unsupported",
          "The selected image model does not support verified reference inputs.",
        );
      await context.checkOwner();
      context.signal.throwIfAborted();
      reservation = this.ledger.reserve(context.runId, this.modelId, IMAGE_RESERVATION_USD);
    } catch (error) {
      await context.recordReceipt({
        dispatched: false,
        costUsd: 0,
        costEstimated: false,
        durationMs: 0,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
    const startedAt = Date.now();
    let dispatched = false;
    let actualCost: number | undefined;
    let failure: string | undefined;
    try {
      const image = await this.generator(
        { prompt, references },
        {
          signal: context.signal,
          beforeDispatch: async () => {
            await context.checkOwner();
            context.signal.throwIfAborted();
            if (dispatched) throw new AuxError("conflict", "An image request cannot be dispatched twice.");
            dispatched = true;
          },
        },
      );
      if (!dispatched)
        throw new AuxError("conflict", "The image provider did not establish a dispatch receipt.");
      if (image.costUsd !== undefined) {
        if (!Number.isFinite(image.costUsd) || image.costUsd < 0)
          throw new AuxError("model_output_invalid", "The image provider returned invalid cost metadata.");
        actualCost = image.costUsd;
      }
      await context.checkOwner();
      context.signal.throwIfAborted();
      if (
        !image.data.length ||
        image.data.length > MAX_IMAGE_BYTES ||
        !["image/png", "image/jpeg", "image/webp"].includes(image.mediaType)
      )
        throw new AuxError(
          "model_output_invalid",
          "Image provider returned an unsupported or oversized image.",
        );
      const bytes = image.data;
      const validHeader =
        image.mediaType === "image/png"
          ? bytes.length >= 24 &&
            Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : image.mediaType === "image/jpeg"
            ? bytes.length >= 4 &&
              bytes[0] === 0xff &&
              bytes[1] === 0xd8 &&
              bytes.at(-2) === 0xff &&
              bytes.at(-1) === 0xd9
            : bytes.length >= 12 &&
              Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" &&
              Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP";
      if (!validHeader)
        throw new AuxError("model_output_invalid", "Image provider returned invalid image bytes.");
      const artifact = this.artifacts.save({
        label: "agent-generated-image",
        buffer: Buffer.from(image.data),
        mediaType: image.mediaType,
        runId: context.runId,
        ...(context.taskId ? { subdir: `task-${context.taskId}` } : {}),
      });
      return {
        artifactId: artifact.artifactId,
        mediaType: image.mediaType,
        size: image.data.length,
        modelId: this.modelId,
        referenceImages: references.map(({ artifactId, sha256, mediaType }) => ({
          artifactId,
          sha256,
          mediaType,
        })),
      };
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      if (context.signal.aborted)
        throw new AuxError("cancelled", "The original image request was cancelled.");
      throw error;
    } finally {
      // Only a proved pre-dispatch refusal is free; unknown attempts retain the estimate.
      const costUsd = dispatched ? (actualCost ?? IMAGE_RESERVATION_USD) : 0;
      const costEstimated = dispatched && actualCost === undefined;
      this.ledger.settle(reservation, costUsd);
      await context.recordReceipt({
        dispatched,
        costUsd,
        costEstimated,
        durationMs: Date.now() - startedAt,
        ...(failure ? { error: failure } : {}),
      });
    }
  }
}
