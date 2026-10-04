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
  | "recovery_stale"
  | "internal";

export type AuxErrorDomain = "input" | "browser" | "model" | "authorization" | "runtime" | "operation";
export type AuxErrorOrigin = "client" | "runtime" | "browser" | "provider";
export interface AuxErrorDefinition {
  id: `AUX-E${string}`;
  domain: AuxErrorDomain;
  retryable: boolean;
  payloadAllowlist: readonly string[];
  origin: AuxErrorOrigin;
  userRecovery: string;
  modelGuidance: string;
  publicMessage: string;
}

/** Stable, exhaustive error catalog. Only allowlisted detail fields cross an emit boundary. */
export const AUX_ERROR_REGISTRY = {
  not_found: { id: "AUX-E1001", domain: "input", retryable: false, payloadAllowlist: ["id"], origin: "client", userRecovery: "Choose an existing item.", modelGuidance: "Re-list available items before continuing.", publicMessage: "The requested item was not found." },
  invalid_params: { id: "AUX-E1002", domain: "input", retryable: false, payloadAllowlist: ["field"], origin: "client", userRecovery: "Check the request and try again.", modelGuidance: "Correct the input; do not repeat it unchanged.", publicMessage: "The request contains invalid input." },
  target_detached: { id: "AUX-E2001", domain: "browser", retryable: true, payloadAllowlist: ["pageId"], origin: "browser", userRecovery: "Reopen or reselect the page.", modelGuidance: "Observe a live page before retrying.", publicMessage: "The page is no longer attached." },
  ref_stale: { id: "AUX-E2002", domain: "browser", retryable: true, payloadAllowlist: ["pageId", "revision"], origin: "browser", userRecovery: "Refresh the page observation.", modelGuidance: "Re-observe and use a fresh element reference.", publicMessage: "The page reference is stale." },
  target_ambiguous: { id: "AUX-E2003", domain: "browser", retryable: false, payloadAllowlist: ["matchCount"], origin: "browser", userRecovery: "Choose a more specific target.", modelGuidance: "Narrow the locator; do not guess.", publicMessage: "The target matches more than one element." },
  backend_unavailable: { id: "AUX-E5001", domain: "runtime", retryable: true, payloadAllowlist: [], origin: "runtime", userRecovery: "Reconnect the browser backend.", modelGuidance: "Wait for the backend to return before retrying.", publicMessage: "The browser backend is unavailable." },
  capability_unsupported: { id: "AUX-E2004", domain: "browser", retryable: false, payloadAllowlist: ["capability"], origin: "browser", userRecovery: "Use a supported page or browser capability.", modelGuidance: "Choose a different supported method.", publicMessage: "This browser capability is unsupported." },
  feature_unavailable: { id: "AUX-E5002", domain: "runtime", retryable: false, payloadAllowlist: ["feature", "stage", "host"], origin: "runtime", userRecovery: "Enable the feature in a supported host.", modelGuidance: "Do not retry until the feature is enabled.", publicMessage: "This feature is unavailable." },
  step_failed: { id: "AUX-E2005", domain: "browser", retryable: false, payloadAllowlist: ["stepId"], origin: "browser", userRecovery: "Review the page and action result.", modelGuidance: "Observe the page before deciding whether another action is safe.", publicMessage: "The browser action failed." },
  condition_timeout: { id: "AUX-E2006", domain: "browser", retryable: true, payloadAllowlist: ["timeoutMs"], origin: "browser", userRecovery: "Wait or adjust the condition.", modelGuidance: "Check the current page and use a bounded wait.", publicMessage: "The page condition timed out." },
  cancelled: { id: "AUX-E5003", domain: "runtime", retryable: false, payloadAllowlist: [], origin: "client", userRecovery: "Start a new action if needed.", modelGuidance: "Respect the cancellation.", publicMessage: "The action was cancelled." },
  model_error: { id: "AUX-E3001", domain: "model", retryable: true, payloadAllowlist: ["status"], origin: "provider", userRecovery: "Check the model connection and retry.", modelGuidance: "Retry only after the provider is available.", publicMessage: "The model request failed." },
  model_output_invalid: { id: "AUX-E3002", domain: "model", retryable: false, payloadAllowlist: [], origin: "provider", userRecovery: "Try a new request.", modelGuidance: "Produce a valid structured response.", publicMessage: "The model response was invalid." },
  needs_input: { id: "AUX-E4001", domain: "authorization", retryable: false, payloadAllowlist: ["requestId", "suspensionKind"], origin: "runtime", userRecovery: "Answer the pending request in Aux.", modelGuidance: "Do not retry until the user responds.", publicMessage: "Your input is needed to continue." },
  conflict: { id: "AUX-E5004", domain: "runtime", retryable: true, payloadAllowlist: ["revision"], origin: "runtime", userRecovery: "Refresh the current state.", modelGuidance: "Read current state before another write.", publicMessage: "The state changed before this action completed." },
  permission_denied: { id: "AUX-E4002", domain: "authorization", retryable: false, payloadAllowlist: ["effect", "origin"], origin: "runtime", userRecovery: "Review the denied action and its permission.", modelGuidance: "Do not retry while denied; request authorization or use a permitted path.", publicMessage: "The action is not authorized." },
  assertion_failed: { id: "AUX-E6001", domain: "operation", retryable: false, payloadAllowlist: ["assertion"], origin: "runtime", userRecovery: "Review the expected result.", modelGuidance: "Observe and report the unmet condition.", publicMessage: "The expected result was not observed." },
  operation_not_found: { id: "AUX-E6002", domain: "operation", retryable: false, payloadAllowlist: ["operationId"], origin: "runtime", userRecovery: "Choose an available operation.", modelGuidance: "List operations and choose an existing one.", publicMessage: "The operation was not found." },
  recovery_stale: { id: "AUX-E5005", domain: "runtime", retryable: false, payloadAllowlist: [], origin: "runtime", userRecovery: "Create a fresh recovery package. Copied files and phrases cannot be revoked.", modelGuidance: "Do not retry this restore. Say that copied files and phrases cannot be revoked and a new recovery package is required.", publicMessage: "This managed backup predates the current recovery generation and cannot be restored. Copied files and phrases cannot be revoked." },
  internal: { id: "AUX-E5000", domain: "runtime", retryable: false, payloadAllowlist: [], origin: "runtime", userRecovery: "Try again or report this error.", modelGuidance: "Stop and report the runtime error.", publicMessage: "An internal error occurred." },
} as const satisfies Record<AuxErrorCode, AuxErrorDefinition>;

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
    return toErrorPayload(this);
  }
}

export const isAuxError = (e: unknown): e is AuxError => e instanceof AuxError;

export function toErrorPayload(e: unknown): { code: AuxErrorCode; errorId: string; message: string; detail?: Record<string, unknown> } {
  const code = isAuxError(e) ? e.code : "internal";
  const definition = AUX_ERROR_REGISTRY[code];
  const raw = isAuxError(e) && e.detail && typeof e.detail === "object" && !Array.isArray(e.detail)
    ? e.detail as Record<string, unknown> : {};
  const safeValue = (key: string, value: unknown): boolean => {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0;
    if (typeof value !== "string" || value.length > 100 || /[\r\n]/.test(value)) return false;
    if (key === "origin") {
      try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.href === `${url.origin}/`; }
      catch { return false; }
    }
    if (key === "effect") return ["read", "write", "destructive", "egress", "credential", "external_tool"].includes(value);
    if (key === "stage") return ["off", "preview", "on"].includes(value);
    if (key === "suspensionKind") return ["ask-user-question", "approval", "action-confirmation", "handoff"].includes(value);
    if (key === "host") return ["electron", "chromium-fork"].includes(value);
    if (key === "feature") return /^[a-z][A-Za-z0-9]{0,50}$/.test(value);
    // Opaque IDs may be user supplied. Do not include them in a public error.
    return false;
  };
  const detail = Object.fromEntries(definition.payloadAllowlist.flatMap(key => {
    const value = raw[key];
    return safeValue(key, value) ? [[key, value]] : [];
  }));
  return { code, errorId: definition.id, message: definition.publicMessage, ...(Object.keys(detail).length ? { detail } : {}) };
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
    case "recovery_stale":
      return { retryable: false, hint: "create a fresh recovery package; copied files and phrases cannot be revoked" };
    default:
      return { retryable: false, hint: null };
  }
}
