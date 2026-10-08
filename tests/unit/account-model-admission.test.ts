import { expect, it, vi } from "vitest";
import { AuxError } from "@aux/contracts";
import { vercelModelClient } from "../../apps/runtime/dist/agent/vercel-model.js";
import { copilotModelClient, type CopilotInference } from "../../apps/runtime/dist/agent/copilot-model.js";
import { modelUndispatched, type ModelCallSource } from "../../apps/runtime/dist/agent/model-client.js";

it.each(["vercel", "copilot"] as const)(
  "preserves %s admission errors without trusting network error text",
  async (provider) => {
    const refusal = new AuxError("needs_input", "Review the explicit account rule.");
    let review = true;
    const source: ModelCallSource = {
      runId: "original-run",
      nativeTurnContext: "original-document",
      checkOriginal: () => {},
      authorizeDestination: async () => {
        if (review) throw refusal;
      },
    };
    const network = vi.fn<typeof fetch>(async () =>
      Response.json(
        {
          error: { message: "Review the explicit account rule.", code: "needs_input" },
        },
        { status: 401 },
      ),
    );
    const models = () => [{ id: "fixture-model", source: "configured" as const }];
    const session = {
      rpc: {
        provider: {
          getEndpoint: async () => ({
            baseUrl: "https://api.githubcopilot.com/v1",
            transport: "http",
            type: "openai",
            wireApi: "completions",
            headers: {},
            apiKey: "synthetic-account-key",
          }),
        },
      },
    };
    const inference: CopilotInference = {
      inference: (_account, _source, _model, signal, use) => use(session as never, async () => {}, signal),
    };
    const model =
      provider === "vercel"
        ? vercelModelClient(
            async () => ({
              account: () => ({ teamId: "original-team" }),
              accessToken: async () => "synthetic-account-key",
            }),
            "original-account",
            models,
            () => {},
            async () => {},
            network,
          )
        : copilotModelClient(
            inference,
            "original-account",
            models,
            (original, origin) => original.authorizeDestination(origin),
            network,
          );
    const request = { modelId: "fixture-model", prompt: "Original question", maxAttempts: 1, source };
    await expect(model.generateText(request)).rejects.toBe(refusal);
    expect(modelUndispatched(refusal)).toBe(true);
    expect(network).not.toHaveBeenCalled();

    review = false;
    const result = await model.generateText(request).then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(result).toBeInstanceOf(Error);
    expect(result).not.toBe(refusal);
    expect(modelUndispatched(result)).toBe(false);
    expect(network).toHaveBeenCalledTimes(1);
  },
);
