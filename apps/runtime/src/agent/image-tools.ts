import { generateImage } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { AuxError, ImageModelSchema, type ImageModel } from "@aux/contracts";
import type { ArtifactStore } from "../services/artifacts.js";
import { SpendLedger } from "../store/spend-ledger.js";

/** Compatibility default for injected fixtures; production requires an explicit owner selection. */
export const AGENT_IMAGE_MODEL = "google/imagen-4.0-fast-generate-001";
const IMAGE_RESERVATION_USD = 1;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export type ImageGenerator = (
  prompt: string,
) => Promise<{ data: Uint8Array; mediaType: string; costUsd?: number }>;

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
    apiKey: string,
    artifacts: ArtifactStore,
    ledger: SpendLedger,
    modelId: ImageModel,
  ): AgentImageTools {
    ImageModelSchema.parse(modelId);
    const gateway = createGateway({ apiKey });
    return new AgentImageTools(
      artifacts,
      ledger,
      async (prompt) => {
        const result = await generateImage({
          model: gateway.image(modelId),
          prompt,
          n: 1,
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(90_000),
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

  async generate(prompt: string, taskId?: string) {
    if (!prompt.trim() || prompt.length > 4000)
      throw new AuxError("invalid_params", "Image prompt must be 1–4000 characters.");
    const reservation = this.ledger.reserve("aux-image", this.modelId, IMAGE_RESERVATION_USD);
    let settled = false;
    try {
      const image = await this.generator(prompt);
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
      if (image.costUsd !== undefined && image.costUsd > IMAGE_RESERVATION_USD) {
        this.ledger.settle(reservation, image.costUsd);
        settled = true;
        throw new AuxError(
          "conflict",
          "Image provider cost exceeded the reserved limit; the image was not saved.",
        );
      }
      const artifact = this.artifacts.save({
        label: "agent-generated-image",
        buffer: Buffer.from(image.data),
        mediaType: image.mediaType,
        ...(taskId ? { subdir: `task-${taskId}` } : {}),
      });
      this.ledger.settle(reservation, image.costUsd);
      settled = true;
      return {
        artifactId: artifact.artifactId,
        mediaType: image.mediaType,
        size: image.data.length,
        modelId: this.modelId,
      };
    } catch (error) {
      // Failed/unknown provider usage retains the full reservation, matching model calls.
      if (!settled) this.ledger.settle(reservation);
      throw error;
    }
  }
}
