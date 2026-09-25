export type AuxErrorCode =
  | "not_found"
  | "invalid_params"
  | "target_detached"
  | "ref_stale"
  | "target_ambiguous"
  | "backend_unavailable"
  | "capability_unsupported"
  | "feature_unavailable"
  | "step_failed"
  | "condition_timeout"
  | "cancelled"
  | "model_error"
  | "model_output_invalid"
  | "needs_input"
  | "conflict"
  | "permission_denied"
  | "assertion_failed"
  | "operation_not_found"
  | "internal";

export class AuxError extends Error {
  readonly code: AuxErrorCode;
  readonly detail?: unknown;
  constructor(code: AuxErrorCode, message: string, detail?: unknown) {
    super(message);
    this.name = "AuxError";
    this.code = code;
    this.detail = detail;
  }
  toJSON() {
    return { code: this.code, message: this.message, detail: this.detail };
  }
}

export const isAuxError = (e: unknown): e is AuxError => e instanceof AuxError;

export function toErrorPayload(e: unknown): { code: AuxErrorCode; message: string; detail?: unknown } {
  if (isAuxError(e)) return { code: e.code, message: e.message, detail: e.detail };
  const message = e instanceof Error ? e.message : String(e);
  return { code: "internal", message };
}

/** MCP `{retryable, hint}` for a closed error code (H0-C2). */
export function errorAdvice(code: AuxErrorCode): { retryable: boolean; hint: string | null } {
  switch (code) {
    case "ref_stale":
      return { retryable: true, hint: "re-observe and retry with a fresh ref" };
    case "target_detached":
      return { retryable: true, hint: "observe a live page and retry" };
    case "condition_timeout":
      return { retryable: true, hint: "widen the wait condition or timeout" };
    case "backend_unavailable":
      return { retryable: true, hint: "retry when the backend is attached" };
    case "model_error":
      return { retryable: true, hint: "retry the model call" };
    case "conflict":
      return { retryable: true, hint: "re-observe and retry the write" };
    case "target_ambiguous":
      return { retryable: false, hint: "narrow the locator" };
    case "permission_denied":
      return { retryable: false, hint: "the user must grant the effect" };
    case "needs_input":
      return { retryable: false, hint: "answer the human prompt and resume" };
    case "capability_unsupported":
      return { retryable: false, hint: "this page needs a different backend" };
    case "feature_unavailable":
      return { retryable: false, hint: "this feature is not enabled for this browser Profile" };
    case "cancelled":
      return { retryable: false, hint: null };
    default:
      return { retryable: false, hint: null };
  }
}
