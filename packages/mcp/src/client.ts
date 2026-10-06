import { resolveRuntimeDescriptor } from "@aux/contracts/installation";
import { AUX_ERROR_REGISTRY, AuxError, type AuxErrorCode } from "@aux/contracts";
import { AuxClient, AuxRpcError, readRuntimeDescriptor, type AuxConnection } from "@aux/sdk";

export type RuntimeDescriptor = AuxConnection & { pid: number };
export function readDescriptor(): RuntimeDescriptor {
  return readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;
}

let cached: RuntimeDescriptor | null = null;
function descriptor(): RuntimeDescriptor {
  if (!cached) cached = readDescriptor();
  return cached;
}
export function resetDescriptorCache() {
  cached = null;
}

export async function rpc<T = unknown>(method: string, params: unknown = {}): Promise<T> {
  const scopedToken = process.env.AUX_MCP_TOKEN;
  if (!scopedToken)
    throw new Error(
      "Aux MCP requires a generated scoped AUX_MCP_TOKEN. Create the connection in Aux Settings.",
    );
  const connection = descriptor();
  const client = new AuxClient({ ...connection, token: scopedToken });
  try {
    return (await client.call(method as never, params as never)) as T;
  } catch (error) {
    if (error instanceof AuxRpcError && error.code === "transport_error") cached = null;
    if (error instanceof AuxRpcError && (error.status === 401 || error.code === "unauthorized"))
      throw new AuxError(
        "permission_denied",
        "This Aux connection is no longer authorized. Recreate it in Aux Settings.",
      );
    if (error instanceof AuxRpcError)
      throw Object.hasOwn(AUX_ERROR_REGISTRY, error.code)
        ? new AuxError(error.code as AuxErrorCode, error.message, error.detail)
        : new AuxError("backend_unavailable", `${error.code}: ${error.message}`);
    throw error;
  }
}
