import { VectorError } from "./errors.js";

/** Session partitions retained from the Vector rename. Do not retarget silently. */
export const RETAINED_SESSION_PARTITIONS = {
  browsing: "persist:vector-default",
  enginePaint: "persist:vector-engine-paint",
} as const;

export const LEGACY_MCP_TOOL_PREFIX = "vector_";
export const CANONICAL_MCP_TOOL_PREFIX = "aux_";
export const LEGACY_MCP_RESOURCE_SCHEME = "vector://";
export const CANONICAL_MCP_RESOURCE_SCHEME = "aux://";

/** Wire IDs that remain compatibility surfaces until an explicit M1 rename. */
export const RETAINED_WIRE_IDS = ["vector", "chrome", "vector-engine"] as const;

/** npm/workspace package scope stays `@vector` until an explicit M1 rename. */
export const RETAINED_PACKAGE_SCOPE = "@vector";

/**
 * Chromium profile basenames that may hold cookies, passwords or other secrets.
 * Whole-profile backup must refuse these instead of copying them.
 */
export const PROFILE_CREDENTIAL_BASENAMES = [
  "Cookies",
  "Cookies-journal",
  "Login Data",
  "Login Data-journal",
  "Login Data For Account",
  "Web Data",
  "Web Data-journal",
  "Account Password",
  "Affiliation Database",
] as const;

const PROFILE_CREDENTIAL_PATH =
  /(?:^|[/\\])(?:Cookies|Login Data|Web Data|Trust Tokens|GCM Store|QuotaManager|Local Storage|IndexedDB|Session Storage|Service Worker)(?:$|[/\\-])/i;

/** Copy non-secret organization files only. Never move credentials. */
export function profileBackupAction(relativePath: string): "copy" | "refuse" {
  const normalized = relativePath.replaceAll("\\", "/");
  const base = normalized.split("/").pop() ?? normalized;
  if (PROFILE_CREDENTIAL_BASENAMES.some(name => base === name || base.startsWith(`${name}-`))) return "refuse";
  if (PROFILE_CREDENTIAL_PATH.test(normalized)) return "refuse";
  return "copy";
}

export function assertProfileBackupAllowed(relativePath: string): void {
  if (profileBackupAction(relativePath) === "refuse") {
    refuseSilentCredentialMove(`Profile path ${relativePath}.`);
  }
}

/**
 * Encrypted credentials, cookies and password stores are never copied by
 * identity adapters. Callers must fail closed instead of moving secrets.
 */
export function refuseSilentCredentialMove(detail: string): never {
  throw new VectorError(
    "permission_denied",
    `${detail} Encrypted credentials, cookies and password stores stay in place. Re-enter keys in Connections.`,
  );
}

/** Canonical Aux MCP names require a generated scoped token; broad configs fail closed. */
export function mcpNamesAreCanonical(prefix = process.env.AUX_MCP_TOOL_PREFIX): boolean {
  return prefix === "aux";
}

export function requireScopedAuxMcpCatalog(env: NodeJS.ProcessEnv = process.env): void {
  if (mcpNamesAreCanonical(env.AUX_MCP_TOOL_PREFIX) && !env.AUX_MCP_TOKEN) {
    throw new VectorError(
      "permission_denied",
      "AUX_MCP_TOOL_PREFIX=aux requires a generated scoped AUX_MCP_TOKEN. Broad vector_* clients stay on the legacy names.",
    );
  }
}
