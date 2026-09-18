/**
 * Passive response capture policy (speed P1-5). Metadata is reported for
 * every response; bodies are fetched only for data responses — xhr/fetch
 * with JSON/text content types — and never for scripts, stylesheets, or
 * documents unless a driver option opts them in. Bodies over the cap are
 * not read at all (Network.getResponseBody would pull the whole thing).
 */
export interface ResponseCaptureOptions {
  /** Playwright resource types whose bodies are captured. Default xhr, fetch. */
  bodyResourceTypes: ReadonlySet<string>;
  /** Content types (regex on the header) whose bodies are captured. */
  bodyContentTypes: RegExp;
  /** Bodies larger than this are recorded by size only. */
  bodyCapBytes: number;
}

export const DEFAULT_BODY_RESOURCE_TYPES: readonly string[] = ["xhr", "fetch"];
export const DEFAULT_BODY_CONTENT_TYPES = /json|text\/|xml|x-www-form-urlencoded|csv/i;
export const DEFAULT_BODY_CAP = 256 * 1024;

/** Env override for the resource types (`VECTOR_CAPTURE_BODY_TYPES=xhr,fetch,document`). */
export function defaultResponseCaptureOptions(env: NodeJS.ProcessEnv = process.env): ResponseCaptureOptions {
  const fromEnv = env.VECTOR_CAPTURE_BODY_TYPES?.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return {
    bodyResourceTypes: new Set(fromEnv?.length ? fromEnv : DEFAULT_BODY_RESOURCE_TYPES),
    bodyContentTypes: DEFAULT_BODY_CONTENT_TYPES,
    bodyCapBytes: DEFAULT_BODY_CAP,
  };
}

export type BodyDecision = "capture" | "skip" | "too-large";

/**
 * Decide whether a response body should be fetched. `contentLength` comes
 * from the header when present (-1 when unknown); the cap is re-checked
 * after the read for chunked responses.
 */
export function bodyCapturePolicy(
  info: { resourceType: string; contentType?: string; contentLength?: number },
  opts: ResponseCaptureOptions,
): BodyDecision {
  if (!opts.bodyResourceTypes.has(info.resourceType.toLowerCase())) return "skip";
  if (!opts.bodyContentTypes.test(info.contentType ?? "")) return "skip";
  if (info.contentLength !== undefined && info.contentLength > opts.bodyCapBytes) return "too-large";
  return "capture";
}
