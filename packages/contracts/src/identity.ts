import { AuxError } from "./errors.js";

/** Session partitions used by the Aux browser profile. Do not retarget silently. */
export const SESSION_PARTITIONS = {
  browsing: "persist:aux-default",
} as const;

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
  if (PROFILE_CREDENTIAL_BASENAMES.some((name) => base === name || base.startsWith(`${name}-`)))
    return "refuse";
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
  throw new AuxError(
    "permission_denied",
    `${detail} Encrypted credentials, cookies and password stores stay in place. Re-enter keys in Connections.`,
  );
}

/** Aux MCP exposes only scoped `aux_*` names and always requires a generated token. */
export function requireScopedAuxMcpCatalog(env: NodeJS.ProcessEnv = process.env): void {
  if (!env.AUX_MCP_TOKEN) {
    throw new AuxError(
      "permission_denied",
      "Aux MCP requires a generated scoped AUX_MCP_TOKEN. Create the connection in Aux Settings.",
    );
  }
}
