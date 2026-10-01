import type { AuxEvent } from "@aux/contracts";
import { resolveRuntimeDescriptor } from "@aux/contracts/installation";
import { AuxClient, readRuntimeDescriptor, requireLiveRuntime, type AuxConnection } from "@aux/sdk";

export type RuntimeDescriptor = AuxConnection & { pid: number };

export function descriptorPath(): string {
  return resolveRuntimeDescriptor();
}
export async function readDescriptor(): Promise<RuntimeDescriptor> {
  const descriptor = readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;
  await requireLiveRuntime(descriptor);
  return descriptor;
}

export async function rpc<T = unknown>(method: string, params: unknown = {}): Promise<T> {
  const client = new AuxClient(await readDescriptor());
  return client.call(method as never, params as never) as Promise<T>;
}

/** Durable event stream (D9): the SDK's `/ws` resume stream — resync continues at the stream head. */
export async function* events(lastSeq = 0): AsyncGenerator<AuxEvent> {
  const client = new AuxClient(await readDescriptor());
  yield* client.events(lastSeq);
}
