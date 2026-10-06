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
  | "operation_uncertain"
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

function errorDefinition<
  const I extends number,
  const D extends AuxErrorDomain,
  const R extends boolean,
  const P extends readonly string[],
  const O extends AuxErrorOrigin,
  const U extends string,
  const M extends string,
  const S extends string,
>(
  id: I,
  domain: D,
  retryable: R,
  payloadAllowlist: P,
  origin: O,
  userRecovery: U,
  modelGuidance: M,
  publicMessage: S,
) {
  return {
    id: `AUX-E${id}` as const,
    domain,
    retryable,
    payloadAllowlist,
    origin,
    userRecovery,
    modelGuidance,
    publicMessage,
  } as const;
}

const errorFor =
  <const D extends AuxErrorDomain, const O extends AuxErrorOrigin>(domain: D, origin: O) =>
  <
    const I extends number,
    const R extends boolean,
    const P extends readonly string[],
    const U extends string,
    const M extends string,
    const S extends string,
  >(
    id: I,
    retryable: R,
    payloadAllowlist: P,
    userRecovery: U,
    modelGuidance: M,
    publicMessage: S,
  ) =>
    errorDefinition(
      id,
      domain,
      retryable,
      payloadAllowlist,
      origin,
      userRecovery,
      modelGuidance,
      publicMessage,
    );
const runtimeError = errorFor("runtime", "runtime"),
  browserError = errorFor("browser", "browser");

/** Stable, exhaustive error catalog. Only allowlisted detail fields cross an emit boundary. */
export const AUX_ERROR_REGISTRY = {
  not_found: errorDefinition(
    1001,
    "input",
    false,
    ["id"],
    "client",
    "Choose an existing item.",
    "Re-list available items before continuing.",
    "The requested item was not found.",
  ),
  invalid_params: errorDefinition(
    1002,
    "input",
    false,
    ["field"],
    "client",
    "Check the request and try again.",
    "Correct the input; do not repeat it unchanged.",
    "The request contains invalid input.",
  ),
  target_detached: browserError(
    2001,
    true,
    ["pageId"],
    "Reopen or reselect the page.",
    "Observe a live page before retrying.",
    "The page is no longer attached.",
  ),
  ref_stale: browserError(
    2002,
    true,
    ["pageId", "revision"],
    "Refresh the page observation.",
    "Re-observe and use a fresh element reference.",
    "The page reference is stale.",
  ),
  target_ambiguous: browserError(
    2003,
    false,
    ["matchCount"],
    "Choose a more specific target.",
    "Narrow the locator; do not guess.",
    "The target matches more than one element.",
  ),
  backend_unavailable: runtimeError(
    5001,
    true,
    [],
    "Reconnect the browser backend.",
    "Wait for the backend to return before retrying.",
    "The browser backend is unavailable.",
  ),
  capability_unsupported: browserError(
    2004,
    false,
    ["capability"],
    "Use a supported page or browser capability.",
    "Choose a different supported method.",
    "This browser capability is unsupported.",
  ),
  feature_unavailable: runtimeError(
    5002,
    false,
    ["feature", "stage", "host"],
    "Enable the feature in a supported host.",
    "Do not retry until the feature is enabled.",
    "This feature is unavailable.",
  ),
  step_failed: browserError(
    2005,
    false,
    ["stepId"],
    "Review the page and action result.",
    "Observe the page before deciding whether another action is safe.",
    "The browser action failed.",
  ),
  condition_timeout: browserError(
    2006,
    true,
    ["timeoutMs"],
    "Wait or adjust the condition.",
    "Check the current page and use a bounded wait.",
    "The page condition timed out.",
  ),
  cancelled: errorDefinition(
    5003,
    "runtime",
    false,
    [],
    "client",
    "Start a new action if needed.",
    "Respect the cancellation.",
    "The action was cancelled.",
  ),
  model_error: errorDefinition(
    3001,
    "model",
    true,
    ["status"],
    "provider",
    "Check the model connection and retry.",
    "Retry only after the provider is available.",
    "The model request failed.",
  ),
  model_output_invalid: errorDefinition(
    3002,
    "model",
    false,
    [],
    "provider",
    "Try a new request.",
    "Produce a valid structured response.",
    "The model response was invalid.",
  ),
  needs_input: errorDefinition(
    4001,
    "authorization",
    false,
    ["requestId", "suspensionKind"],
    "runtime",
    "Answer the pending request in Aux.",
    "Do not retry until the user responds.",
    "Your input is needed to continue.",
  ),
  conflict: runtimeError(
    5004,
    true,
    ["revision"],
    "Refresh the current state.",
    "Read current state before another write.",
    "The state changed before this action completed.",
  ),
  permission_denied: errorDefinition(
    4002,
    "authorization",
    false,
    ["effect", "origin"],
    "runtime",
    "Review the denied action and its permission.",
    "Do not retry while denied; request authorization or use a permitted path.",
    "The action is not authorized.",
  ),
  assertion_failed: errorDefinition(
    6001,
    "operation",
    false,
    ["assertion"],
    "runtime",
    "Review the expected result.",
    "Observe and report the unmet condition.",
    "The expected result was not observed.",
  ),
  operation_uncertain: errorDefinition(
    6003,
    "operation",
    false,
    [],
    "browser",
    "Review the original operation's status before starting another action.",
    "Do not repeat the request. Its effects may have been accepted; reconcile the original operation first.",
    "The operation was sent, but its completion is unconfirmed.",
  ),
  operation_not_found: errorDefinition(
    6002,
    "operation",
    false,
    ["operationId"],
    "runtime",
    "Choose an available operation.",
    "List operations and choose an existing one.",
    "The operation was not found.",
  ),
  recovery_stale: runtimeError(
    5005,
    false,
    [],
    "Create a fresh recovery package. Copied files and phrases cannot be revoked.",
    "Do not retry this restore. Say that copied files and phrases cannot be revoked and a new recovery package is required.",
    "This managed backup predates the current recovery generation and cannot be restored. Copied files and phrases cannot be revoked.",
  ),
  internal: runtimeError(
    5000,
    false,
    [],
    "Try again or report this error.",
    "Stop and report the runtime error.",
    "An internal error occurred.",
  ),
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

export function toErrorPayload(e: unknown): {
  code: AuxErrorCode;
  errorId: string;
  message: string;
  detail?: Record<string, unknown>;
} {
  const code = isAuxError(e) ? e.code : "internal";
  const definition = AUX_ERROR_REGISTRY[code];
  const raw =
    isAuxError(e) && e.detail && typeof e.detail === "object" && !Array.isArray(e.detail)
      ? (e.detail as Record<string, unknown>)
      : {};
  const safeValue = (key: string, value: unknown): boolean => {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0;
    if (typeof value !== "string" || value.length > 100 || /[\r\n]/.test(value)) return false;
    if (key === "origin") {
      try {
        const url = new URL(value);
        return (
          ["http:", "https:"].includes(url.protocol) &&
          !url.username &&
          !url.password &&
          url.href === `${url.origin}/`
        );
      } catch {
        return false;
      }
    }
    if (key === "effect")
      return ["read", "write", "destructive", "egress", "credential", "external_tool"].includes(value);
    if (key === "stage") return ["off", "preview", "on"].includes(value);
    if (key === "suspensionKind")
      return ["ask-user-question", "approval", "action-confirmation", "handoff"].includes(value);
    if (key === "host") return value === "chromium-fork";
    if (key === "feature") return /^[a-z][A-Za-z0-9]{0,50}$/.test(value);
    // Opaque IDs may be user supplied. Do not include them in a public error.
    return false;
  };
  const detail = Object.fromEntries(
    definition.payloadAllowlist.flatMap((key) => {
      const value = raw[key];
      return safeValue(key, value) ? [[key, value]] : [];
    }),
  );
  return {
    code,
    errorId: definition.id,
    message: definition.publicMessage,
    ...(Object.keys(detail).length ? { detail } : {}),
  };
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
    case "operation_uncertain":
      return { retryable: false, hint: "reconcile the original operation; do not repeat the request" };
    case "recovery_stale":
      return {
        retryable: false,
        hint: "create a fresh recovery package; copied files and phrases cannot be revoked",
      };
    default:
      return { retryable: false, hint: null };
  }
}
