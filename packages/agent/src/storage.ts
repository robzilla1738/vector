import type { DatabaseSync } from 'node:sqlite';
import { TRPCError } from '@trpc/server';

export interface AgentStorage {
  home: string;
  requireAccount(id: number): unknown;
  accountHome(id: number): string;
  accountDb(id: number): DatabaseSync;
  get(id: number, namespace: string, key: string): unknown | null;
  set(id: number, namespace: string, key: string, value: unknown): unknown;
  all(id: number, namespace: string): Record<string, unknown>;
}
export function fail(
  code:
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'FORBIDDEN'
    | 'BAD_REQUEST'
    | 'PRECONDITION_FAILED'
    | 'NOT_IMPLEMENTED',
  message: string,
): never {
  throw new TRPCError({ code, message });
}
