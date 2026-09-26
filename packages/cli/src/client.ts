import { join } from "node:path";
import type { AuxEvent } from "@aux/contracts";
import { resolveDataDirectory, resolveRuntimeDescriptor } from "@aux/contracts/installation";
import { AuxClient, readRuntimeDescriptor, type AuxConnection } from "@aux/sdk";

export type RuntimeDescriptor = AuxConnection & { pid: number };

export function descriptorPath(): string {
  return join(resolveDataDirectory(), "runtime.json");
}
export function readDescriptor(): RuntimeDescriptor {
  return readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;
}

export async function rpc<T = unknown>(method: string, params: unknown = {}): Promise<T> {
  const client = new AuxClient(readDescriptor());
  return client.call(method as never, params as never) as Promise<T>;
}

/** Durable event stream (D9): the SDK's `/ws` resume stream — resync continues at the stream head. */
export async function* events(lastSeq = 0): AsyncGenerator<AuxEvent> {
  const client = new AuxClient(readDescriptor());
  yield* client.events(lastSeq);
}
