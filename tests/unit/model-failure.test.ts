import { describe, expect, it } from "vitest";
import { APICallError, JSONParseError } from "ai";
import { AuxError } from "@aux/contracts";
import { classifyModelFailure } from "../../apps/runtime/src/agent/model-failure.js";

const apiError = (statusCode: number, message: string) =>
  new APICallError({ message, url: "https://provider.test", requestBodyValues: {}, statusCode });

describe("model failure classification", () => {
  it("maps provider failures to stable recovery actions without exposing their bodies", async () => {
    const secret = "invalid api key sk-private-provider-body";
    const auth = await classifyModelFailure(apiError(401, secret));
    expect(auth).toMatchObject({
      category: "authentication",
      retryable: false,
      action: "model_settings",
      automaticRetry: false,
    });
    expect(JSON.stringify(auth)).not.toContain(secret);
    expect(JSON.stringify(auth)).not.toContain("sk-private");

    expect(await classifyModelFailure(apiError(429, "too many requests"))).toMatchObject({
      category: "rate_limit",
      retryable: true,
      action: "retry",
      automaticRetry: false,
    });
    expect(await classifyModelFailure(apiError(503, "upstream unavailable"))).toMatchObject({
      category: "provider",
      retryable: true,
      action: "retry",
      automaticRetry: false,
    });
    expect(await classifyModelFailure(new TypeError("fetch failed at private-host.internal"))).toMatchObject({
      category: "network",
      retryable: true,
      action: "retry",
    });
  });

  it("reserves bounded automatic repair for malformed model output", async () => {
    const parsed = await classifyModelFailure(new JSONParseError({ text: "{", cause: new Error("bad") }));
    expect(parsed).toMatchObject({
      category: "model_output",
      retryable: true,
      action: "retry",
      automaticRetry: true,
    });
    expect(
      await classifyModelFailure(new AuxError("capability_unsupported", "raw provider detail")),
    ).toMatchObject({
      category: "capability",
      retryable: false,
      action: "model_settings",
      automaticRetry: false,
    });
  });
});
