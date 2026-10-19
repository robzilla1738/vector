import { sign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };
export function object(value: Json): { [key: string]: Json } {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Daemon returned an invalid object.');
  return value;
}
export function text(value: Json | undefined): string {
  if (typeof value !== 'string')
    throw new Error('Daemon returned an invalid string.');
  return value;
}
export function accountId(value: string): number {
  const normalized = value.replace(/^u/i, '');
  if (!/^\d+$/.test(normalized))
    throw new Error('Account must be a nonnegative integer or u<number>.');
  const result = Number(normalized);
  if (!Number.isSafeInteger(result))
    throw new Error('Account number is too large.');
  return result;
}

export class Client {
  readonly home: string;
  readonly origin: string;
  private token = '';
  private expiresAt = 0;
  private selectedAccount: number | undefined;

  constructor(account?: string) {
    this.home = process.env.AUX_HOME ?? join(homedir(), '.aux');
    const port = Number(process.env.AUX_PORT ?? '21520');
    if (!Number.isInteger(port) || port < 1 || port > 65535)
      throw new Error('Invalid AUX_PORT.');
    this.origin = `http://127.0.0.1:${port}`;
    if (account !== undefined) this.selectedAccount = accountId(account);
  }

  private async authorize(): Promise<void> {
    if (this.token && this.expiresAt > Date.now() + 30_000) return;
    const response = await fetch(
      `${this.origin}/auth/daemon/challenge?clientKind=cli`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!response.ok)
      throw new Error(`Daemon challenge failed (${response.status}).`);
    const challenge = object((await response.json()) as Json);
    const key = await readFile(join(this.home, 'installation-private.pem'));
    const signedChallenge = sign(
      'sha256',
      Buffer.concat([
        Buffer.from('Aux Daemon Auth v1\0'),
        Buffer.from(text(challenge.challenge), 'base64'),
      ]),
      key,
    ).toString('base64');
    const sessionResponse = await fetch(`${this.origin}/auth/daemon/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: text(challenge.challengeId),
        signedChallenge,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!sessionResponse.ok)
      throw new Error(
        `Daemon authentication failed (${sessionResponse.status}).`,
      );
    const session = object((await sessionResponse.json()) as Json);
    if (
      session.token_type !== 'AuxDaemonSessionToken' ||
      typeof session.expiresInSeconds !== 'number' ||
      session.expiresInSeconds <= 0
    ) {
      throw new Error('Daemon returned an invalid authentication session.');
    }
    this.token = text(session.access_token);
    this.expiresAt = Date.now() + session.expiresInSeconds * 1000;
  }

  async call(
    procedure: string,
    input: Json = {},
    mutation = false,
  ): Promise<Json> {
    await this.authorize();
    const url = new URL(`/trpc/${procedure}`, this.origin);
    if (!mutation) url.searchParams.set('input', JSON.stringify(input));
    const response = await fetch(url, {
      method: mutation ? 'POST' : 'GET',
      headers: {
        Authorization: `AuxDaemonSessionToken ${this.token}`,
        'Content-Type': 'application/json',
      },
      ...(mutation ? { body: JSON.stringify(input) } : {}),
      signal: AbortSignal.timeout(130_000),
    });
    const payload = object((await response.json()) as Json);
    if (!response.ok || payload.error) {
      if (response.status === 401) this.expiresAt = 0;
      const error = payload.error ? object(payload.error) : {};
      throw new Error(
        typeof error.message === 'string'
          ? error.message
          : `Daemon request failed (${response.status}).`,
      );
    }
    return object(payload.result ?? null).data ?? null;
  }

  async account(): Promise<number> {
    if (this.selectedAccount !== undefined) return this.selectedAccount;
    const current = await this.call('accounts.current');
    const value =
      typeof current === 'number' ? current : object(current).accountId;
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
      throw new Error('No local account selected.');
    this.selectedAccount = value;
    return value;
  }

  async scoped(
    procedure: string,
    input: Record<string, Json> = {},
    mutation = false,
  ): Promise<Json> {
    return this.call(
      procedure,
      { ...input, accountId: await this.account() },
      mutation,
    );
  }
}
