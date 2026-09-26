import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_connectors_catalog(ctx: MethodCtx): Promise<unknown> {
  const { client, connectorCatalog, params } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Connector accounts and grants are reviewed in Aux.");
  return connectorCatalog.list(params);
}

export const connectorsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "connectors.catalog": h_connectors_catalog,
};
