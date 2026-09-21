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
