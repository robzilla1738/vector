import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import type { NativeBridge } from "../native.js";

export const VERCEL_ISSUER = "https://vercel.com";
export const VERCEL_TOKEN_ENDPOINT = "https://api.vercel.com/login/oauth/token";
const token = z
  .string()
  .min(1)
  .max(32768)
  .regex(/^[^\r\n]+$/);
export const VercelAccountSchema = z
  .object({
    accountId: z.string().regex(/^[a-f0-9]{64}$/),
    clientId: z
      .string()
      .regex(/^[A-Za-z0-9_-]+$/)
      .max(500),
    subject: z.string().min(1).max(500),
    teamId: z.string().min(1).max(500),
    email: z.string().max(500).optional(),
    accessToken: token.optional(),
    refreshToken: token.optional(),
    idToken: token.optional(),
    expiresAt: z.number().int().nonnegative().optional(),
    scopes: z.array(z.string().max(200)).max(32),
  })
  .strict();
export type VercelAccount = z.infer<typeof VercelAccountSchema>;
const VaultSchema = z
  .object({
    version: z.literal(1),
    hostId: z.string().uuid(),
    selected: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    accounts: z.array(VercelAccountSchema).max(16),
  })
  .strict();
type Vault = z.infer<typeof VaultSchema>;
type CredentialMutation = {
  previous: string | undefined;
  next: string;
  rotation: boolean;
};
export type VercelAccountSummary = {
  accountId: string;
  email?: string;
  selected: boolean;
  connected: boolean;
};

export async function authJson(response: Response): Promise<unknown> {
  if (!response.ok || !response.body)
    throw new AuxError(
      "backend_unavailable",
      "The account server refused the request.",
    );
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 1_048_576)
        throw new AuxError(
          "backend_unavailable",
          "The account response is too large.",
        );
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AuxError(
      "backend_unavailable",
      "The account server returned invalid JSON.",
    );
  }
}

/** Tokens and the issued-client/account mapping stay together in the OS credential store. */
export class VercelAccounts {
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
    if (this.controller.signal.aborted)
      throw new AuxError("cancelled", "Vercel accounts are closed.");
    const generation = this.epoch;
    const value = (await this.native.readSecret("model-vercel-accounts")).value;
    if (this.controller.signal.aborted || generation !== this.epoch)
      throw new AuxError("cancelled", "Vercel accounts are closed.");
    let parsed: Vault;
    try {
      parsed = value
        ? VaultSchema.parse(JSON.parse(value))
        : { version: 1 as const, hostId: this.hostId, accounts: [] };
    } catch {
      throw new AuxError(
        "permission_denied",
        "Saved Vercel credentials are invalid. Sign in again or clear this account.",
      );
    }
    if (parsed.hostId !== this.hostId)
      throw new AuxError(
        "permission_denied",
        "Vercel registration belongs to a different host.",
      );
    if (
      new Set(parsed.accounts.map((a) => a.accountId)).size !==
        parsed.accounts.length ||
      parsed.accounts.some(
        (a) => a.accountId !== vercelAccountId(a.clientId, a.subject, a.teamId),
      )
    )
      throw new AuxError(
        "permission_denied",
        "The saved Vercel registration is invalid.",
      );
    this.vault = parsed;
    this.stored = value || undefined;
  }
  private saved(): Vault {
    if (this.credentialFailure) throw this.credentialFailure;
    if (this.controller.signal.aborted || !this.vault)
      throw new AuxError(
        "permission_denied",
        "Vercel credential storage is unavailable.",
      );
    return this.vault;
  }
  selected(): VercelAccount | undefined {
    const v = this.saved();
    return v.accounts.find((a) => a.accountId === v.selected);
  }
  account(id: string): VercelAccount {
    const account = this.saved().accounts.find((a) => a.accountId === id);
    if (!account)
      throw new AuxError("invalid_params", "Choose a saved Vercel account.");
    return account;
  }
  summaries(): VercelAccountSummary[] {
    const v = this.saved();
    return v.accounts.map((a) => ({
      accountId: a.accountId,
      ...(a.email ? { email: a.email } : {}),
      selected: a.accountId === v.selected,
      connected: !!a.accessToken && a.scopes.includes("openid"),
    }));
  }
  private mutate(
    update: (v: Vault) => Vault,
    check: () => Promise<void>,
    after?: () => Promise<void>,
    rotation = false,
  ): Promise<void> {
    const epoch = this.epoch;
    const task = this.writes.then(async () => {
      await check();
      if (!rotation && (this.controller.signal.aborted || epoch !== this.epoch))
        throw new AuxError("cancelled", "Vercel account changed.");
      const originalVault = rotation ? this.vault : this.saved();
      if (!originalVault || this.credentialFailure)
        throw new AuxError(
          "operation_uncertain",
          "Vercel credential state requires reconciliation.",
        );
      const nextVault = VaultSchema.parse(update(originalVault));
      const next = JSON.stringify(nextVault);
      const stored =
        (await this.native.readSecret("model-vercel-accounts")).value ||
        undefined;
      if (stored !== this.stored) {
        this.credentialFailure = new AggregateError(
          [
            new AuxError(
              "conflict",
              "The protected Vercel account changed outside this original writer.",
            ),
          ],
          "Vercel credential state requires reconciliation.",
        );
        throw this.credentialFailure;
      }
      await check();
      if (!rotation && (this.controller.signal.aborted || epoch !== this.epoch))
        throw new AuxError("cancelled", "Vercel account changed.");
      const original = { previous: this.stored, next, rotation };
      // Retain the exact write identity before IPC; a lost write ACK is not proof of no mutation.
      this.mutation = original;
      try {
        await this.native.storeSecret("model-vercel-accounts", next);
        await check();
        if (
          !rotation &&
          (this.controller.signal.aborted || epoch !== this.epoch)
        )
          throw new AuxError("cancelled", "Vercel account changed.");
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
            "The original Vercel credential write requires reconciliation.",
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
      throw new AuxError(
        "conflict",
        "The original Vercel credential write changed.",
      );
    const current =
      (await this.native.readSecret("model-vercel-accounts")).value ||
      undefined;
    if (current !== original.previous && current !== original.next)
      throw new AuxError(
        "conflict",
        "A later protected account prevents original Vercel rollback.",
      );
    if (original.rotation) {
      // A single-use refresh token is consumed remotely. Retain the exact fresh grant;
      // never "restore" its now-invalid predecessor after a local ACK/source failure.
      if (current !== original.next)
        await this.native.storeSecret("model-vercel-accounts", original.next);
      if (
        (await this.native.readSecret("model-vercel-accounts")).value !==
        original.next
      )
        throw new AuxError(
          "operation_uncertain",
          "Rotated Vercel credentials still await durable acknowledgement.",
        );
      this.vault = VaultSchema.parse(JSON.parse(original.next));
      this.stored = original.next;
      this.mutation = undefined;
      this.credentialFailure = undefined;
      return;
    }
    if (current !== original.previous)
      await this.native.storeSecret(
        "model-vercel-accounts",
        original.previous ?? "",
      );
    const restored =
      (await this.native.readSecret("model-vercel-accounts")).value ||
      undefined;
    if (restored !== original.previous)
      throw new AuxError(
        "conflict",
        "The original Vercel credential rollback was not confirmed.",
      );
    this.stored = original.previous;
    this.mutation = undefined;
    this.credentialFailure = undefined;
  }
  install(
    account: VercelAccount,
    check: () => Promise<void>,
    activate: () => Promise<void>,
  ): Promise<void> {
    const next = VercelAccountSchema.parse(account);
    return this.mutate(
      (v) => ({
        ...v,
        selected: next.accountId,
        accounts: [
          ...v.accounts.filter((a) => a.accountId !== next.accountId),
          next,
        ],
      }),
      check,
      activate,
    );
  }
  async accessToken(accountId: string, signal?: AbortSignal): Promise<string> {
    if (this.signingOut.has(accountId))
      throw new AuxError("cancelled", "This Vercel account is signing out.");
    const original = this.account(accountId),
      epoch = this.epoch;
    const current = () => {
      if (
        this.controller.signal.aborted ||
        epoch !== this.epoch ||
        this.saved().selected !== accountId
      )
        throw new AuxError("cancelled", "The selected Vercel account changed.");
    };
    current();
    signal?.throwIfAborted();
    if (
      original.accessToken &&
      original.expiresAt &&
      original.expiresAt > Date.now() + 60_000
    )
      return original.accessToken;
    let pending = this.refreshes.get(accountId);
    if (!pending) {
      pending = (async () => {
        if (!original.refreshToken)
          throw new AuxError("permission_denied", "Sign in to Vercel again.");
        const response = await this.networkFetch(VERCEL_TOKEN_ENDPOINT, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.any([
            this.controller.signal,
            AbortSignal.timeout(15_000),
          ]),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: original.clientId,
            refresh_token: original.refreshToken,
          }),
        });
        const fresh = vercelTokens(await authJson(response));
        await this.mutate(
          (v) => {
            const account = v.accounts.find((a) => a.accountId === accountId);
            if (!account || account.refreshToken !== original.refreshToken)
              throw new AuxError(
                "conflict",
                "Vercel credentials changed during refresh.",
              );
            return {
              ...v,
              accounts: v.accounts.map((a) =>
                a.accountId === accountId
                  ? { ...a, ...fresh, idToken: fresh.idToken ?? a.idToken }
                  : a,
              ),
            };
          },
          async () => {
            // Original rotating grant may be durably retained during shutdown, but
            // cannot replace a later writer or authorize a retired model request.
            const account = this.vault?.accounts.find(
              (a) => a.accountId === accountId,
            );
            if (!account || account.refreshToken !== original.refreshToken)
              throw new AuxError(
                "conflict",
                "The original rotating Vercel grant changed.",
              );
          },
          undefined,
          true,
        );
        return fresh.accessToken;
      })().finally(() => {
        if (this.refreshes.get(accountId) === pending)
          this.refreshes.delete(accountId);
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
      return Promise.reject(
        new AuxError("cancelled", "Vercel accounts are closed."),
      );
    const work = Promise.resolve().then(() =>
      this.disconnectOriginal(accountId, check),
    );
    this.disconnects.add(work);
    void work.then(
      () => this.disconnects.delete(work),
      () => this.disconnects.delete(work),
    );
    return work;
  }
  private async disconnectOriginal(
    accountId: string,
    check: () => Promise<void>,
  ): Promise<boolean> {
    if (this.controller.signal.aborted)
      throw new AuxError("cancelled", "Vercel accounts are closed.");
    await check();
    this.account(accountId);
    if (this.signingOut.has(accountId))
      throw new AuxError(
        "conflict",
        "This Vercel account is already signing out.",
      );
    this.signingOut.add(accountId);
    try {
      await this.refreshes.get(accountId)?.catch(() => {});
      await check();
      const account = this.account(accountId);
      let confirmed = false;
      if (account.refreshToken) {
        try {
          const endpoint = new URL(
            "https://api.vercel.com/login/oauth/token/revoke",
          );
          const result = await this.networkFetch(endpoint, {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.any([
              this.controller.signal,
              AbortSignal.timeout(15_000),
            ]),
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
                  teamId: a.teamId,
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
            [this.credentialFailure, cleanup].filter(
              (error) => error !== undefined,
            ),
            "The original Vercel credential cleanup remains unresolved.",
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

export function vercelAccountId(
  clientId: string,
  subject: string,
  teamId: string,
): string {
  return createHash("sha256")
    .update(JSON.stringify([VERCEL_ISSUER, clientId, subject, teamId]))
    .digest("hex");
}
const TokenResponse = z.object({
  access_token: token,
  refresh_token: token,
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive().max(86400),
  scope: z.string().max(8192),
  id_token: token.optional(),
});
export function vercelTokens(value: unknown) {
  const t = TokenResponse.parse(value),
    scopes = t.scope.split(/\s+/).filter(Boolean);
  if (!scopes.includes("openid") || !scopes.includes("offline_access"))
    throw new AuxError(
      "permission_denied",
      "Vercel identity and refresh access were not authorized.",
    );
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    ...(t.id_token ? { idToken: t.id_token } : {}),
    expiresAt: Date.now() + t.expires_in * 1000,
    scopes,
  };
}

export const VercelRegistrationSchema = z
  .object({
    clientId: z
      .string()
      .min(1)
      .max(500)
      .regex(/^[A-Za-z0-9_-]+$/),
    redirectUri: z
      .string()
      .url()
      .refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === "http:" &&
          url.hostname === "127.0.0.1" &&
          !!url.port &&
          Number(url.port) > 0 &&
          !url.username &&
          !url.password &&
          !url.search &&
          !url.hash
        );
      }, "Register an exact native loopback callback URL."),
    teamId: z
      .string()
      .min(1)
      .max(500)
      .regex(/^[A-Za-z0-9_-]+$/),
  })
  .strict();
export type VercelRegistration = z.infer<typeof VercelRegistrationSchema>;
