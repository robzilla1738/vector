import { APICallError, JSONParseError, NoObjectGeneratedError, TypeValidationError } from "ai";
import { VectorError, type RunFailure } from "@vector/contracts";

export type ClassifiedModelFailure = RunFailure & { automaticRetry: boolean };

const failure = (
  category: RunFailure["category"],
  message: string,
  retryable: boolean,
  action: RunFailure["action"],
  automaticRetry = false,
): ClassifiedModelFailure => ({ category, message, retryable, action, automaticRetry });

/** Convert provider errors into stable, nonsecret UI state. Never return a provider response body. */
export function classifyModelFailure(error: unknown): ClassifiedModelFailure {
  if (error instanceof VectorError) {
    if (error.code === "capability_unsupported") {
      return failure("capability", "This model doesn’t support what this task needs. Choose another model in Settings.", false, "model_settings");
    }
    if (error.code === "model_output_invalid") {
      return failure("model_output", "The model returned an unusable response. Retry this turn or choose another model.", true, "retry", true);
    }
  }
  if (NoObjectGeneratedError.isInstance(error) || TypeValidationError.isInstance(error) || JSONParseError.isInstance(error)) {
    return failure("model_output", "The model returned an unusable response. Retry this turn or choose another model.", true, "retry", true);
  }

  const message = error instanceof Error ? error.message : String(error);
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 401 || status === 403 || /invalid (?:api )?key|unauthori[sz]ed|authentication|credentials?/i.test(message)) {
    return failure("authentication", "The model connection needs attention. Check the provider and credentials in Settings.", false, "model_settings");
  }
  if (status === 402 || /(?:insufficient|exceeded).*(?:quota|credit)|billing|payment required/i.test(message)) {
    return failure("quota", "The provider’s quota or billing limit was reached. Check the provider account or model connection.", false, "model_settings");
  }
  if (status === 429 || /rate.?limit|too many requests/i.test(message)) {
    return failure("rate_limit", "The provider is rate limiting requests. Wait a moment, then retry this turn.", true, "retry");
  }
  if (status != null && status >= 500) {
    return failure("provider", "The model provider is temporarily unavailable. Retry this turn in a moment.", true, "retry");
  }
  if (error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return failure("timeout", "The model provider took too long to respond. Retry this turn.", true, "retry");
  }
  if (error instanceof TypeError || /fetch failed|network|econnreset|econnrefused|enotfound|socket hang up/i.test(message)) {
    return failure("network", "Aux couldn’t reach the model provider. Check the connection and retry this turn.", true, "retry");
  }
  if (/unsupported|not support/i.test(message)) {
    return failure("capability", "This model doesn’t support what this task needs. Choose another model in Settings.", false, "model_settings");
  }
  return failure("unknown", "The model request failed. Retry this turn or check the model connection in Settings.", true, "retry");
}

export class ModelFailureError extends Error {
  constructor(readonly failure: ClassifiedModelFailure) {
    super(failure.message);
    this.name = "ModelFailureError";
  }
}
