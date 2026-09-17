export type VectorErrorCode =
  | "not_found"
  | "invalid_params"
  | "target_detached"
  | "target_ambiguous"
  | "backend_unavailable"
  | "capability_unsupported"
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

export class VectorError extends Error {
  readonly code: VectorErrorCode;
  readonly detail?: unknown;
  constructor(code: VectorErrorCode, message: string, detail?: unknown) {
    super(message);
    this.name = "VectorError";
    this.code = code;
    this.detail = detail;
  }
  toJSON() {
    return { code: this.code, message: this.message, detail: this.detail };
  }
}

export const isVectorError = (e: unknown): e is VectorError => e instanceof VectorError;

export function toErrorPayload(e: unknown): { code: VectorErrorCode; message: string; detail?: unknown } {
  if (isVectorError(e)) return { code: e.code, message: e.message, detail: e.detail };
  const message = e instanceof Error ? e.message : String(e);
  return { code: "internal", message };
}
