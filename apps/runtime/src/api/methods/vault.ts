import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, originOfAddress } from "@aux/contracts";

async function h_vault_status(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, vault } = ctx;
  const vaultRead =
    method === "vault.status" ||
    method === "vault.list" ||
    method === "vault.history" ||
    method === "vault.grants" ||
    method === "vault.expiredGrants" ||
    method === "vault.generate" ||
    method === "vault.itemsForOrigin";
  if (client.external && (client.scope || !vaultRead))
    throw new AuxError("permission_denied", "The agent vault can only be managed in Aux.");
  if (method === "vault.status") return vault.status();
  if (method === "vault.list") return vault.list(params.includeRevoked);
  if (method === "vault.save") return vault.save(params);
  if (method === "vault.lock") return vault.lock(params.passphrase);
  if (method === "vault.unlock") return vault.unlock(params.passphrase, params.ttlMs);
  if (method === "vault.grant") return vault.grant(params);
  if (method === "vault.renewGrant") return vault.renewGrant(params);
  if (method === "vault.expiredGrants") return vault.expiredGrants();
  if (method === "vault.revoke") return vault.revoke(params);
  if (method === "vault.history") return vault.history(params.itemId, params.limit);
  if (method === "vault.generate") return { password: vault.generate(params.length) };
  if (method === "vault.itemsForOrigin") return vault.itemsForOrigin(params.origin);
  if (method === "vault.fill") return vault.revealForHumanFill(params.itemId, params);
  if (method === "vault.export") return vault.exportEncrypted(params.passphrase);
  if (method === "vault.import") return vault.importEncrypted(params);
  if (method === "vault.update") return vault.updateSecret(params.itemId, params.secret);
  if (method === "vault.secretMatches")
    return { matches: await vault.secretMatches(params.itemId, params.secret) };
  const origin = params.origin ? originOfAddress(params.origin) : undefined;
  if (params.origin && !origin)
    throw new AuxError("invalid_params", "Grants must name an http(s) origin without credentials.");
  return vault.grants({ taskId: params.taskId, origin });
}

export const vaultMethods: Partial<Record<MethodName, MethodHandler>> = {
  "vault.status": h_vault_status,
  "vault.list": h_vault_status,
  "vault.save": h_vault_status,
  "vault.lock": h_vault_status,
  "vault.unlock": h_vault_status,
  "vault.grant": h_vault_status,
  "vault.renewGrant": h_vault_status,
  "vault.expiredGrants": h_vault_status,
  "vault.revoke": h_vault_status,
  "vault.history": h_vault_status,
  "vault.grants": h_vault_status,
  "vault.generate": h_vault_status,
  "vault.itemsForOrigin": h_vault_status,
  "vault.fill": h_vault_status,
  "vault.export": h_vault_status,
  "vault.import": h_vault_status,
  "vault.update": h_vault_status,
  "vault.secretMatches": h_vault_status,
};
