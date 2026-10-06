import { createHash, randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import type { NativeBridge } from "../native.js";

export const CHATGPT_ISSUER = "https://auth.openai.com";
export const CHATGPT_RESOURCE = "https://api.openai.com/v1";
export const CHATGPT_TOKEN_ENDPOINT = `${CHATGPT_ISSUER}/api/accounts/oauth/token`;
const token = z
  .string()
  .min(1)
  .max(32768)
  .regex(/^[^\r\n]+$/);
export const ChatgptAccountSchema = z
  .object({
    accountId: z.string().regex(/^[a-f0-9]{64}$/),
    clientId: z
      .string()
      .regex(/^oaiapp_[A-Za-z0-9_-]+$/)
      .max(500),
    subject: z.string().min(1).max(500),
    email: z.string().max(500).optional(),
    accessToken: token.optional(),
    refreshToken: token.optional(),
    idToken: token.optional(),
    expiresAt: z.number().int().nonnegative().optional(),
    scopes: z.array(z.string().max(200)).max(32),
  })
  .strict();
export type ChatgptAccount = z.infer<typeof ChatgptAccountSchema>;
const VaultSchema = z
  .object({
    version: z.literal(1),
    hostId: z.string().uuid(),
    selected: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    accounts: z.array(ChatgptAccountSchema).max(16),
  })
  .strict();
type Vault = z.infer<typeof VaultSchema>;
type CredentialMutation = { previous: string | undefined; next: string };
export type ChatgptAccountSummary = {
  accountId: string;
  email?: string;
  selected: boolean;
  connected: boolean;
};

export async function authJson(response: Response): Promise<unknown> {
  if (!response.ok || !response.body)
    throw new AuxError("backend_unavailable", "The account server refused the request.");
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 1_048_576) throw new AuxError("backend_unavailable", "The account response is too large.");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AuxError("backend_unavailable", "The account server returned invalid JSON.");
  }
}

/** Tokens and the issued-client/account mapping stay together in the OS credential store. */
export class ChatgptAccounts {
  private vault: Vault | undefined;
  private writes: Promise<unknown> = Promise.resolve();
  private refreshes = new Map<string, Promise<string>>();
  private signingOut = new Set<string>();
  private controller = new AbortController();
  private epoch = 0;
  private initialized?: Promise<void>;
  private stored: string | undefined;
  private mutation?: CredentialMutation;
  private credentialFailure?: AggregateError;
  private disconnects = new Set<Promise<boolean>>();
  private closing?: Promise<void>;
  constructor(
    private native: Pick<NativeBridge, "readSecret" | "storeSecret">,
    private hostId: string,
    private networkFetch: typeof fetch = fetch,
  ) {}
  initialize(): Promise<void> {
    return (this.initialized ??= Promise.resolve().then(() => this.load()));
  }
  private async load(): Promise<void> {
    if (this.controller.signal.aborted) throw new AuxError("cancelled", "ChatGPT accounts are closed.");
    const generation = this.epoch;
    const value = (await this.native.readSecret("model-chatgpt-accounts")).value;
    if (this.controller.signal.aborted || generation !== this.epoch)
      throw new AuxError("cancelled", "ChatGPT accounts are closed.");
    let parsed: Vault;
    try {
      parsed = value
        ? VaultSchema.parse(JSON.parse(value))
        : { version: 1 as const, hostId: this.hostId, accounts: [] };
    } catch {
      throw new AuxError(
        "permission_denied",
        "Saved ChatGPT credentials are invalid. Sign in again or clear this account.",
      );
    }
    if (parsed.hostId !== this.hostId)
      throw new AuxError("permission_denied", "ChatGPT registration belongs to a different host.");
    if (
      new Set(parsed.accounts.map((a) => a.accountId)).size !== parsed.accounts.length ||
      parsed.accounts.some((a) => a.accountId !== chatgptAccountId(a.clientId, a.subject))
    )
      throw new AuxError("permission_denied", "The saved ChatGPT registration is invalid.");
    this.vault = parsed;
    this.stored = value || undefined;
  }
  private saved(): Vault {
    if (this.credentialFailure) throw this.credentialFailure;
    if (this.controller.signal.aborted || !this.vault)
      throw new AuxError("permission_denied", "ChatGPT credential storage is unavailable.");
    return this.vault;
  }
  selected(): ChatgptAccount | undefined {
    const v = this.saved();
    return v.accounts.find((a) => a.accountId === v.selected);
  }
  account(id: string): ChatgptAccount {
    const account = this.saved().accounts.find((a) => a.accountId === id);
    if (!account) throw new AuxError("invalid_params", "Choose a saved ChatGPT account.");
    return account;
  }
  summaries(): ChatgptAccountSummary[] {
    const v = this.saved();
    return v.accounts.map((a) => ({
      accountId: a.accountId,
      ...(a.email ? { email: a.email } : {}),
      selected: a.accountId === v.selected,
      connected: !!a.accessToken && a.scopes.includes("chatgpt.tokens.use.direct"),
    }));
  }
  private mutate(
    update: (v: Vault) => Vault,
    check: () => Promise<void>,
    after?: () => Promise<void>,
  ): Promise<void> {
    const epoch = this.epoch;
    const task = this.writes.then(async () => {
      await check();
      if (this.controller.signal.aborted || epoch !== this.epoch)
        throw new AuxError("cancelled", "ChatGPT account changed.");
      const nextVault = VaultSchema.parse(update(this.saved()));
      const next = JSON.stringify(nextVault);
      const stored = (await this.native.readSecret("model-chatgpt-accounts")).value || undefined;
      if (stored !== this.stored) {
        this.credentialFailure = new AggregateError(
          [new AuxError("conflict", "The protected ChatGPT account changed outside this original writer.")],
          "ChatGPT credential state requires reconciliation.",
        );
        throw this.credentialFailure;
      }
      await check();
      if (this.controller.signal.aborted || epoch !== this.epoch)
        throw new AuxError("cancelled", "ChatGPT account changed.");
      const original = { previous: this.stored, next };
      // Retain the exact write identity before IPC; a lost write ACK is not proof of no mutation.
      this.mutation = original;
      try {
        await this.native.storeSecret("model-chatgpt-accounts", next);
        await check();
        if (this.controller.signal.aborted || epoch !== this.epoch)
          throw new AuxError("cancelled", "ChatGPT account changed.");
        await after?.();
        this.vault = nextVault;
        this.stored = next;
        this.mutation = undefined;
      } catch (error) {
        try {
          await this.restore(original);
        } catch (cleanup) {
          this.credentialFailure = new AggregateError(
            [error, cleanup],
            "The original ChatGPT credential write requires reconciliation.",
          );
          throw this.credentialFailure;
        }
        throw error;
      }
    });
    this.writes = task.catch(() => {});
    return task;
  }
  /** Reduction-only: never adopts or overwrites a different protected credential blob. */
  private async restore(original: CredentialMutation): Promise<void> {
    if (this.mutation !== original)
      throw new AuxError("conflict", "The original ChatGPT credential write changed.");
    const current = (await this.native.readSecret("model-chatgpt-accounts")).value || undefined;
    if (current !== original.previous && current !== original.next)
      throw new AuxError("conflict", "A later protected account prevents original ChatGPT rollback.");
    if (current !== original.previous)
      await this.native.storeSecret("model-chatgpt-accounts", original.previous ?? "");
    const restored = (await this.native.readSecret("model-chatgpt-accounts")).value || undefined;
    if (restored !== original.previous)
      throw new AuxError("conflict", "The original ChatGPT credential rollback was not confirmed.");
    this.stored = original.previous;
    this.mutation = undefined;
    this.credentialFailure = undefined;
  }
  install(account: ChatgptAccount, check: () => Promise<void>, activate: () => Promise<void>): Promise<void> {
    const next = ChatgptAccountSchema.parse(account);
    return this.mutate(
      (v) => ({
        ...v,
        selected: next.accountId,
        accounts: [...v.accounts.filter((a) => a.accountId !== next.accountId), next],
      }),
      check,
      activate,
    );
  }
  async accessToken(accountId: string, signal?: AbortSignal): Promise<string> {
    if (this.signingOut.has(accountId))
      throw new AuxError("cancelled", "This ChatGPT account is signing out.");
    const original = this.account(accountId),
      epoch = this.epoch;
    const current = () => {
      if (this.controller.signal.aborted || epoch !== this.epoch || this.saved().selected !== accountId)
        throw new AuxError("cancelled", "The selected ChatGPT account changed.");
    };
    current();
    signal?.throwIfAborted();
    if (original.accessToken && original.expiresAt && original.expiresAt > Date.now() + 60_000)
      return original.accessToken;
    let pending = this.refreshes.get(accountId);
    if (!pending) {
      pending = (async () => {
        if (!original.refreshToken) throw new AuxError("permission_denied", "Sign in to ChatGPT again.");
        const response = await this.networkFetch(CHATGPT_TOKEN_ENDPOINT, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(15_000)]),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: original.clientId,
            refresh_token: original.refreshToken,
            resource: CHATGPT_RESOURCE,
          }),
        });
        const fresh = chatgptTokens(await authJson(response));
        current();
        await this.mutate(
          (v) => {
            const account = v.accounts.find((a) => a.accountId === accountId);
            if (!account || account.refreshToken !== original.refreshToken)
              throw new AuxError("conflict", "ChatGPT credentials changed during refresh.");
            return {
              ...v,
              accounts: v.accounts.map((a) =>
                a.accountId === accountId ? { ...a, ...fresh, idToken: fresh.idToken ?? a.idToken } : a,
              ),
            };
          },
          async () => current(),
        );
        return fresh.accessToken;
      })().finally(() => {
        if (this.refreshes.get(accountId) === pending) this.refreshes.delete(accountId);
      });
      this.refreshes.set(accountId, pending);
    }
    const value = await pending;
    current();
    signal?.throwIfAborted();
    return value;
  }
  disconnect(accountId: string, check: () => Promise<void>): Promise<boolean> {
    if (this.controller.signal.aborted)
      return Promise.reject(new AuxError("cancelled", "ChatGPT accounts are closed."));
    const work = Promise.resolve().then(() => this.disconnectOriginal(accountId, check));
    this.disconnects.add(work);
    void work.then(
      () => this.disconnects.delete(work),
      () => this.disconnects.delete(work),
    );
    return work;
  }
  private async disconnectOriginal(accountId: string, check: () => Promise<void>): Promise<boolean> {
    if (this.controller.signal.aborted) throw new AuxError("cancelled", "ChatGPT accounts are closed.");
    await check();
    this.account(accountId);
    if (this.signingOut.has(accountId))
      throw new AuxError("conflict", "This ChatGPT account is already signing out.");
    this.signingOut.add(accountId);
    try {
      await this.refreshes.get(accountId)?.catch(() => {});
      await check();
      const account = this.account(accountId);
      let confirmed = false;
      if (account.refreshToken) {
        try {
          const discovery = z
            .object({ issuer: z.literal(CHATGPT_ISSUER), revocation_endpoint: z.string().url() })
            .parse(
              await authJson(
                await this.networkFetch(`${CHATGPT_ISSUER}/.well-known/openid-configuration`, {
                  redirect: "error",
                  signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(15_000)]),
                }),
              ),
            );
          const endpoint = new URL(discovery.revocation_endpoint);
          if (endpoint.origin !== CHATGPT_ISSUER) throw new Error("Unexpected account endpoint.");
          const result = await this.networkFetch(endpoint, {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(15_000)]),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              token: account.refreshToken,
              token_type_hint: "refresh_token",
              client_id: account.clientId,
            }),
          });
          confirmed = result.status === 200;
        } catch {
          /* Local sign-out still removes tokens; the UI reports unconfirmed remote revocation. */
        }
      }
      await this.mutate(
        (v) => ({
          ...v,
          ...(v.selected === accountId ? { selected: undefined } : {}),
          accounts: v.accounts.map((a) =>
            a.accountId === accountId
              ? {
                  accountId: a.accountId,
                  clientId: a.clientId,
                  subject: a.subject,
                  ...(a.email ? { email: a.email } : {}),
                  scopes: [],
                }
              : a,
          ),
        }),
        check,
      );
      this.epoch++;
      return confirmed;
    } finally {
      this.signingOut.delete(accountId);
    }
  }
  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.epoch++;
    this.controller.abort();
    const work = (async () => {
      await Promise.allSettled([
        this.initialized,
        ...this.disconnects,
        ...this.refreshes.values(),
        this.writes,
      ]);
      if (this.mutation) {
        try {
          await this.restore(this.mutation);
        } catch (cleanup) {
          this.credentialFailure = new AggregateError(
            [this.credentialFailure, cleanup].filter((error) => error !== undefined),
            "The original ChatGPT credential cleanup remains unresolved.",
          );
        }
      }
      if (this.credentialFailure) throw this.credentialFailure;
    })();
    this.closing = work;
    void work.catch(() => {
      if (this.closing === work) this.closing = undefined;
    });
    return work;
  }
}

export function chatgptAccountId(clientId: string, subject: string): string {
  return createHash("sha256")
    .update(JSON.stringify([CHATGPT_ISSUER, clientId, subject]))
    .digest("hex");
}
export function newChatgptHostId(): string {
  return randomUUID();
}
const TokenResponse = z.object({
  access_token: token,
  refresh_token: token,
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive().max(86400),
  scope: z.string().max(8192),
  id_token: token.optional(),
});
export function chatgptTokens(value: unknown) {
  const t = TokenResponse.parse(value),
    scopes = t.scope.split(/\s+/).filter(Boolean);
  if (!scopes.includes("chatgpt.tokens.use.direct") || !scopes.includes("resource.invoke"))
    throw new AuxError("permission_denied", "ChatGPT plan use was not authorized.");
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    ...(t.id_token ? { idToken: t.id_token } : {}),
    expiresAt: Date.now() + t.expires_in * 1000,
    scopes,
  };
}
