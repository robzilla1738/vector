import { randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import type { NativeBridge } from "../native.js";
import {
  copilotAccountId,
  copilotGrant,
  copilotPost,
  copilotUser,
  CopilotRegistrationSchema,
  type CopilotGrant,
  type CopilotRegistration,
} from "./copilot-protocol.js";

const AccountSchema = z
  .object({
    accountId: z.string().regex(/^[a-f0-9]{64}$/),
    clientId: CopilotRegistrationSchema.shape.clientId,
    registrationRevision: z.string().uuid(),
    userId: z.string().regex(/^[1-9][0-9]{0,19}$/),
    login: z.string().min(1).max(100),
    authorizationGeneration: z.string().uuid(),
    credentialRevision: z.string().uuid(),
    // A remote refresh already revoked the previous pair. These protected new
    // credentials remain unusable until original acceptance completes or a new sign-in.
    reconciliation: z.enum(["refresh-uncertain", "rotated-grant"]).optional(),
    accessToken: z.string().regex(/^gho_[A-Za-z0-9_]{16,500}$/),
    refreshToken: z
      .string()
      .regex(/^ghr_[A-Za-z0-9_]{16,500}$/)
      .optional(),
    expiresAt: z.number().int().nonnegative().optional(),
    refreshExpiresAt: z.number().int().nonnegative().optional(),
    scopes: z.array(z.string().min(1).max(200)).max(32),
  })
  .strict();
export type CopilotAccount = z.infer<typeof AccountSchema>;
const VaultSchema = z
  .object({
    version: z.literal(1),
    hostId: z.string().uuid(),
    revision: z.string().uuid(),
    selected: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    accounts: z.array(AccountSchema).max(16),
  })
  .strict();
type Vault = z.infer<typeof VaultSchema>;
export type CopilotAccountSummary = {
  accountId: string;
  login: string;
  selected: boolean;
  connected: boolean;
  needsReauthentication: boolean;
};
export type CopilotAccountLease = Pick<
  CopilotAccount,
  "accountId" | "authorizationGeneration" | "credentialRevision" | "accessToken"
> & { signal: AbortSignal };
export interface CopilotAccountCommit {
  account: CopilotAccount;
  /** Only the exact installed vault revision can be rolled back; later writes are never restored over. */
  rollback(): Promise<boolean>;
}
const KEY = "model-copilot-accounts";

/** Sole in-process writer of a host-bound OS credential vault. No Profile plaintext tokens. */
export class CopilotAccounts {
  private vault: Vault | undefined;
  private raw: string | undefined;
  private initialization: Promise<void> | undefined;
  private writes: Promise<unknown> = Promise.resolve();
  private readonly controller = new AbortController();
  private readonly refreshes = new Map<string, Promise<void>>();
  private readonly retiring = new Set<string>();
  private readonly disconnecting = new Set<string>();
  private readonly owners = new Map<string, AbortController>();
  private poisoned = false;
  private authorizationRevision = 0;
  constructor(
    private readonly native: Pick<NativeBridge, "readSecret" | "storeSecret">,
    private readonly hostId: string,
    private readonly registration: () => Promise<CopilotRegistration>,
    private readonly retireRuntime: (accountId?: string) => Promise<void>,
    private readonly network: typeof fetch = fetch,
  ) {
    z.string().uuid().parse(hostId);
  }
  initialize(): Promise<void> {
    return (this.initialization ??= (async () => {
      const raw = (await this.native.readSecret(KEY)).value;
      this.assertOpen();
      let vault: Vault;
      try {
        vault = raw
          ? VaultSchema.parse(JSON.parse(raw))
          : {
              version: 1,
              hostId: this.hostId,
              revision: randomUUID(),
              accounts: [],
            };
      } catch {
        throw new AuxError(
          "permission_denied",
          "Saved Copilot credentials are invalid and were not used.",
        );
      }
      if (
        vault.hostId !== this.hostId ||
        new Set(vault.accounts.map((a) => a.accountId)).size !==
          vault.accounts.length ||
        vault.accounts.some(
          (a) =>
            a.accountId !== copilotAccountId(this.hostId, a.clientId, a.userId),
        ) ||
        (vault.selected !== undefined &&
          !vault.accounts.some((a) => a.accountId === vault.selected))
      )
        throw new AuxError(
          "permission_denied",
          "The Copilot account vault belongs to another identity.",
        );
      this.raw = raw;
      this.vault = vault;
    })());
  }
  private poison() {
    this.poisoned = true;
    this.invalidateAuthorization();
  }
  private assertOpen() {
    if (this.controller.signal.aborted || this.poisoned)
      throw new AuxError(
        "cancelled",
        "Copilot account storage is closed or requires reconciliation.",
      );
  }
  private saved(): Vault {
    this.assertOpen();
    if (!this.vault)
      throw new AuxError(
        "backend_unavailable",
        "Copilot account storage is not initialized.",
      );
    return this.vault;
  }
  private account(id: string): CopilotAccount {
    const a = this.saved().accounts.find((a) => a.accountId === id);
    if (!a) throw new AuxError("not_found", "Choose a saved Copilot account.");
    return a;
  }
  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const task = this.writes.then(work);
    this.writes = task.catch(() => {});
    return task;
  }
  private invalidate(id: string) {
    this.owners.get(id)?.abort();
    this.owners.delete(id);
  }
  private owner(id: string) {
    let owner = this.owners.get(id);
    if (!owner) {
      owner = new AbortController();
      this.owners.set(id, owner);
    }
    return owner;
  }
  private async verifyRegistration(original: CopilotRegistration) {
    const current = CopilotRegistrationSchema.parse(await this.registration());
    this.assertOpen();
    if (
      current.clientId !== original.clientId ||
      current.revision !== original.revision
    )
      throw new AuxError(
        "cancelled",
        "The original Copilot OAuth App registration changed.",
      );
  }
  /** Serialized compare/write/check with an exact written-value rollback, following the NativeBridge vault contract. */
  private async write(
    next: Vault,
    check: () => Promise<void>,
  ): Promise<{ previous: Vault; previousRaw?: string; nextRaw: string }> {
    await check();
    this.assertOpen();
    const previous = this.saved(),
      previousRaw = this.raw,
      nextRaw = JSON.stringify(VaultSchema.parse(next));
    if ((await this.native.readSecret(KEY)).value !== previousRaw) {
      this.poison();
      throw new AuxError(
        "conflict",
        "Copilot credentials changed outside their original writer.",
      );
    }
    await check();
    this.assertOpen();
    try {
      await this.native.storeSecret(KEY, nextRaw);
      await check();
      this.assertOpen();
      if ((await this.native.readSecret(KEY)).value !== nextRaw)
        throw new AuxError(
          "conflict",
          "The issued Copilot credential write changed.",
        );
      await check();
      this.assertOpen();
      this.vault = next;
      this.raw = nextRaw;
      return { previous, previousRaw, nextRaw };
    } catch (error) {
      try {
        const current = (await this.native.readSecret(KEY)).value;
        if (current === nextRaw) {
          // NativeBridge has no delete-secret operation: an initialized empty host vault is the exact initial rollback.
          const restored = previousRaw ?? JSON.stringify(previous);
          await this.native.storeSecret(KEY, restored);
          if ((await this.native.readSecret(KEY)).value !== restored)
            throw new AuxError(
              "operation_uncertain",
              "Copilot credential rollback could not be confirmed.",
            );
          this.raw = restored;
          this.vault = previous;
        } else if (current !== previousRaw) {
          this.poison();
          throw new AuxError(
            "conflict",
            "A later credential write prevents original rollback.",
          );
        }
      } catch (cleanup) {
        this.poison();
        throw new AggregateError(
          [error, cleanup],
          "Copilot credential write and reconciliation failed.",
        );
      }
      throw error;
    }
  }
  summaries(): CopilotAccountSummary[] {
    const v = this.saved();
    return v.accounts.map((a) => ({
      accountId: a.accountId,
      login: a.login,
      selected: v.selected === a.accountId,
      needsReauthentication: a.reconciliation !== undefined,
      connected:
        a.reconciliation === undefined &&
        !this.retiring.has(a.accountId) &&
        (!a.expiresAt ||
          a.expiresAt > Date.now() ||
          (!!a.refreshToken &&
            !!a.refreshExpiresAt &&
            a.refreshExpiresAt > Date.now())),
    }));
  }
  /** Identity and subscription eligibility are verified before any protected installation. */
  async install(
    grant: CopilotGrant,
    registration: CopilotRegistration,
    check: () => Promise<void>,
    eligible: (account: CopilotAccount, signal: AbortSignal) => Promise<void>,
    originalSignal?: AbortSignal,
  ): Promise<CopilotAccountCommit> {
    await this.initialize();
    await check();
    await this.verifyRegistration(registration);
    const signal = AbortSignal.any([
      this.controller.signal,
      ...(originalSignal ? [originalSignal] : []),
    ]);
    const identity = await copilotUser(this.network, grant.accessToken, signal);
    await check();
    await this.verifyRegistration(registration);
    const account = AccountSchema.parse({
      ...grant,
      ...identity,
      clientId: registration.clientId,
      registrationRevision: registration.revision,
      accountId: copilotAccountId(
        this.hostId,
        registration.clientId,
        identity.userId,
      ),
      authorizationGeneration: randomUUID(),
      credentialRevision: randomUUID(),
    });
    await eligible(account, signal);
    await check();
    await this.verifyRegistration(registration);
    return this.enqueue(async () => {
      if (this.retiring.has(account.accountId))
        throw new AuxError(
          "conflict",
          "Finish the original Copilot runtime retirement before signing in again.",
        );
      const before = this.saved();
      let stopped = false;
      if (before.selected) this.retiring.add(before.selected);
      let receipt: Awaited<ReturnType<CopilotAccounts["write"]>>;
      try {
        if (before.selected) {
          this.invalidate(before.selected);
          await this.retireRuntime(before.selected);
        }
        stopped = true;
        await check();
        await this.verifyRegistration(registration);
        receipt = await this.write(
          {
            ...this.saved(),
            revision: randomUUID(),
            selected: account.accountId,
            accounts: [
              ...this.saved().accounts.filter(
                (a) => a.accountId !== account.accountId,
              ),
              account,
            ],
          },
          async () => {
            await check();
            await this.verifyRegistration(registration);
          },
        );
      } finally {
        if (stopped && before.selected) this.retiring.delete(before.selected);
      }
      return {
        account,
        rollback: () =>
          this.enqueue(async () => {
            // A later user/account write is not ours to restore. This receipt never reopens a retired service.
            if (this.raw !== receipt.nextRaw) return false;
            if ((await this.native.readSecret(KEY)).value !== receipt.nextRaw) {
              this.poison();
              throw new AuxError(
                "conflict",
                "The original Copilot vault changed outside its accepted writer; sign in again after reconciliation.",
              );
            }
            this.retiring.add(account.accountId);
            this.invalidate(account.accountId);
            await this.retireRuntime(account.accountId);
            if ((await this.native.readSecret(KEY)).value !== receipt.nextRaw) {
              this.poison();
              throw new AuxError(
                "conflict",
                "The original vault changed during runtime retirement; reconciliation is required.",
              );
            }
            const restore =
              receipt.previousRaw ?? JSON.stringify(receipt.previous);
            await this.native.storeSecret(KEY, restore);
            if ((await this.native.readSecret(KEY)).value !== restore) {
              this.poison();
              throw new AuxError(
                "operation_uncertain",
                "Original account rollback was not confirmed.",
              );
            }
            this.raw = restore;
            this.vault = receipt.previous;
            this.retiring.delete(account.accountId);
            return true;
          }),
      };
    });
  }
  assertCurrent(id: string, authorizationGeneration: string) {
    const v = this.saved(),
      a = this.account(id);
    if (a.reconciliation)
      throw new AuxError(
        "permission_denied",
        "Sign in to Copilot again; credential refresh was not accepted.",
      );
    if (
      v.selected !== id ||
      this.retiring.has(id) ||
      a.authorizationGeneration !== authorizationGeneration
    )
      throw new AuxError(
        "cancelled",
        "The original selected Copilot account retired.",
      );
  }
  async lease(id: string, signal?: AbortSignal): Promise<CopilotAccountLease> {
    await this.initialize();
    signal?.throwIfAborted();
    let original = this.account(id);
    const shared = this.refreshes.get(id);
    if (shared) {
      await shared;
      signal?.throwIfAborted();
      original = this.account(id);
    }
    await this.verifyRegistration({
      clientId: original.clientId,
      revision: original.registrationRevision,
    });
    signal?.throwIfAborted();
    this.assertCurrent(id, original.authorizationGeneration);
    if (
      original.expiresAt !== undefined &&
      original.expiresAt <= Date.now() + 60000
    ) {
      let pending = this.refreshes.get(id);
      if (!pending) {
        pending = this.refresh(original).finally(() => {
          if (this.refreshes.get(id) === pending) this.refreshes.delete(id);
        });
        this.refreshes.set(id, pending);
      }
      await pending;
    }
    signal?.throwIfAborted();
    this.assertCurrent(id, original.authorizationGeneration);
    const a = this.account(id);
    return {
      accountId: id,
      authorizationGeneration: a.authorizationGeneration,
      credentialRevision: a.credentialRevision,
      accessToken: a.accessToken,
      signal: AbortSignal.any([this.controller.signal, this.owner(id).signal]),
    };
  }
  /**
   * A reduction-only write after an actual provider rotation. It never rolls
   * back to the remotely revoked pair and can finish during joined shutdown.
   * No selected authority is issued by this protected reconciliation receipt.
   */
  private async recordRotation(
    original: CopilotAccount,
    grant: CopilotGrant,
  ): Promise<string> {
    return this.enqueue(async () => {
      const before = this.vault;
      const current = before?.accounts.find(
        (a) => a.accountId === original.accountId,
      );
      if (
        !before ||
        !current ||
        current.authorizationGeneration !== original.authorizationGeneration ||
        current.credentialRevision !== original.credentialRevision
      )
        throw new AuxError(
          "cancelled",
          "The original account already retired before its rotation receipt.",
        );
      this.invalidate(original.accountId);
      const nextCredential = randomUUID();
      const next = VaultSchema.parse({
        ...before,
        revision: randomUUID(),
        selected:
          before.selected === original.accountId ? undefined : before.selected,
        accounts: before.accounts.map((a) =>
          a.accountId === original.accountId
            ? {
                ...a,
                ...grant,
                refreshToken: grant.refreshToken,
                expiresAt: grant.expiresAt,
                refreshExpiresAt: grant.refreshExpiresAt,
                credentialRevision: nextCredential,
                reconciliation: "rotated-grant",
              }
            : a,
        ),
      });
      const beforeRaw = this.raw;
      const nextRaw = JSON.stringify(next);
      // Mark the in-memory account unavailable before any storage await. The
      // vault keeps the exact real rotated grant even when acceptance is refused.
      this.vault = next;
      try {
        if ((await this.native.readSecret(KEY)).value !== beforeRaw)
          throw new AuxError(
            "conflict",
            "Original rotation storage changed outside its accepted writer.",
          );
        await this.native.storeSecret(KEY, nextRaw);
        if ((await this.native.readSecret(KEY)).value !== nextRaw)
          throw new AuxError(
            "operation_uncertain",
            "Protected rotated credential storage was not confirmed.",
          );
        this.raw = nextRaw;
        return nextCredential;
      } catch (error) {
        this.poison();
        // Storage failure cannot be claimed as durable preservation. Keep the
        // real next grant in unavailable memory and require explicit recovery.
        throw new AggregateError(
          [error],
          "Rotated Copilot credentials require reconciliation; previous tokens are revoked.",
        );
      }
    });
  }
  private async refresh(original: CopilotAccount) {
    if (
      !original.refreshToken ||
      !original.refreshExpiresAt ||
      original.refreshExpiresAt <= Date.now()
    )
      throw new AuxError(
        "permission_denied",
        "Sign in to Copilot again; its refresh token expired.",
      );
    const registration = {
      clientId: original.clientId,
      revision: original.registrationRevision,
    };
    const authorizationRevision = this.authorizationRevision;
    this.assertCurrent(original.accountId, original.authorizationGeneration);
    await this.verifyRegistration(registration);
    if (
      this.account(original.accountId).credentialRevision !==
      original.credentialRevision
    )
      throw new AuxError(
        "conflict",
        "Copilot credentials rotated before this refresh.",
      );
    // A dispatched refresh may revoke the old pair even if its response is
    // lost or malformed. Persist unavailable authority before sending it.
    this.invalidate(original.accountId);
    this.retiring.add(original.accountId);
    const beforeDispatch = async () => {
      this.assertOpen();
      await this.verifyRegistration(registration);
      const account = this.account(original.accountId);
      if (
        this.authorizationRevision !== authorizationRevision ||
        (this.saved().selected !== undefined &&
          this.saved().selected !== original.accountId) ||
        this.disconnecting.has(original.accountId) ||
        account.authorizationGeneration !== original.authorizationGeneration ||
        account.credentialRevision !== original.credentialRevision
      )
        throw new AuxError(
          "cancelled",
          "The original refresh dispatch retired.",
        );
    };
    await this.enqueue(async () => {
      await beforeDispatch();
      const saved = this.saved();
      await this.write(
        {
          ...saved,
          revision: randomUUID(),
          selected:
            saved.selected === original.accountId ? undefined : saved.selected,
          accounts: saved.accounts.map((a) =>
            a.accountId === original.accountId
              ? AccountSchema.parse({
                  ...a,
                  reconciliation: "refresh-uncertain",
                })
              : a,
          ),
        },
        beforeDispatch,
      );
    });
    await this.retireRuntime(original.accountId);
    if (
      this.authorizationRevision === authorizationRevision &&
      !this.disconnecting.has(original.accountId)
    )
      this.retiring.delete(original.accountId);
    await beforeDispatch();
    // The revoked original lease is intentionally absent from this signal.
    // Shutdown still cancels and joins the real request and its response body.
    const signal = this.controller.signal;
    const grant = copilotGrant(
      await copilotPost(
        this.network,
        "/login/oauth/access_token",
        {
          client_id: original.clientId,
          grant_type: "refresh_token",
          refresh_token: original.refreshToken,
        },
        signal,
      ),
    );
    // GitHub revoked the previous pair already. Persist only the next pair,
    // unselected/unusable, before identity checks or original-owner acceptance.
    const nextCredential = await this.recordRotation(original, grant);
    if (
      this.authorizationRevision === authorizationRevision &&
      !this.disconnecting.has(original.accountId)
    )
      this.retiring.delete(original.accountId);
    const check = async () => {
      this.assertOpen();
      await this.verifyRegistration(registration);
      const saved = this.saved(),
        account = this.account(original.accountId);
      if (
        this.authorizationRevision !== authorizationRevision ||
        saved.selected !== undefined ||
        this.retiring.has(original.accountId) ||
        this.disconnecting.has(original.accountId) ||
        account.authorizationGeneration !== original.authorizationGeneration ||
        account.credentialRevision !== nextCredential ||
        account.reconciliation !== "rotated-grant"
      )
        throw new AuxError(
          "cancelled",
          "The original rotated account acceptance retired.",
        );
    };
    await check();
    if (!grant.refreshToken)
      throw new AuxError(
        "backend_unavailable",
        "GitHub did not rotate its refresh token; sign in again.",
      );
    const identity = await copilotUser(
      this.network,
      grant.accessToken,
      this.controller.signal,
    );
    await check();
    if (identity.userId !== original.userId)
      throw new AuxError(
        "permission_denied",
        "Refreshed Copilot credentials belong to another GitHub account; sign in again.",
      );
    if (
      JSON.stringify([...grant.scopes].sort()) !==
      JSON.stringify([...original.scopes].sort())
    )
      throw new AuxError(
        "permission_denied",
        "Refreshed Copilot credentials changed their original scopes; sign in again.",
      );
    await this.enqueue(async () => {
      await check();
      const v = this.saved();
      await this.write(
        {
          ...v,
          revision: randomUUID(),
          selected: original.accountId,
          accounts: v.accounts.map((a) =>
            a.accountId === original.accountId
              ? AccountSchema.parse({
                  ...a,
                  login: identity.login,
                  reconciliation: undefined,
                })
              : a,
          ),
        },
        check,
      );
      // write() rollback can restore only the protected reconciliation state,
      // never the remotely revoked original credentials.
    });
  }
  async disconnect(
    id: string,
    check: () => Promise<void>,
  ): Promise<{ disconnected: true; revocationConfirmed: false }> {
    await this.initialize();
    await check();
    this.account(id);
    if (this.disconnecting.has(id))
      throw new AuxError("conflict", "Copilot sign-out is already pending.");
    this.disconnecting.add(id);
    this.retiring.add(id);
    this.invalidate(id);
    try {
      await this.refreshes.get(id)?.catch(() => {});
      await this.retireRuntime(id);
      await this.enqueue(async () => {
        const v = this.saved();
        await this.write(
          {
            ...v,
            revision: randomUUID(),
            selected: v.selected === id ? undefined : v.selected,
            accounts: v.accounts.filter((a) => a.accountId !== id),
          },
          check,
        );
      });
      this.retiring.delete(id);
      return { disconnected: true, revocationConfirmed: false };
    } finally {
      this.disconnecting.delete(id);
    }
  }
  async close(): Promise<void> {
    this.controller.abort();
    for (const owner of this.owners.values()) owner.abort();
    await Promise.allSettled([
      ...(this.initialization ? [this.initialization] : []),
      ...this.refreshes.values(),
    ]);
    await this.writes;
    const results = await Promise.allSettled(
      (this.vault?.accounts ?? []).map((a) => this.retireRuntime(a.accountId)),
    );
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    if (failures.length)
      throw new AggregateError(
        failures.map((r) => r.reason),
        "Copilot runtime retirement is unconfirmed.",
      );
  }
  /** Settings calls this synchronously on original account/registration mutation before any await. */
  invalidateAuthorization(): void {
    ++this.authorizationRevision;
    for (const account of this.vault?.accounts ?? []) {
      this.retiring.add(account.accountId);
      this.invalidate(account.accountId);
    }
  }
  /** Reopens no account until every original SDK helper has a real stop ACK. */
  async retireAuthorization(): Promise<void> {
    this.invalidateAuthorization();
    await Promise.allSettled(this.refreshes.values());
    for (const account of this.vault?.accounts ?? []) {
      await this.retireRuntime(account.accountId);
      this.retiring.delete(account.accountId);
    }
  }
  /** Explicit original-human recovery; malformed vaults are never silently dropped during initialization. */
  async clearSaved(check: () => Promise<void>): Promise<void> {
    if (this.controller.signal.aborted)
      throw new AuxError("cancelled", "Copilot account storage is closed.");
    await check();
    this.invalidateAuthorization();
    await this.initialization?.catch(() => {});
    await Promise.allSettled(this.refreshes.values());
    await this.enqueue(async () => {
      await check();
      if (this.controller.signal.aborted)
        throw new AuxError("cancelled", "Copilot account storage is closed.");
      await this.retireRuntime();
      await check();
      const previous = (await this.native.readSecret(KEY)).value;
      const next: Vault = {
        version: 1,
        hostId: this.hostId,
        revision: randomUUID(),
        accounts: [],
      };
      const raw = JSON.stringify(next);
      await check();
      if (
        this.controller.signal.aborted ||
        (await this.native.readSecret(KEY)).value !== previous
      )
        throw new AuxError(
          "conflict",
          "The original account-clear receipt changed.",
        );
      try {
        await this.native.storeSecret(KEY, raw);
        await check();
        if (
          this.controller.signal.aborted ||
          (await this.native.readSecret(KEY)).value !== raw
        )
          throw new AuxError(
            "conflict",
            "Original account clear was not confirmed.",
          );
        this.vault = next;
        this.raw = raw;
        this.poisoned = false;
        this.initialization = Promise.resolve();
        this.retiring.clear();
      } catch (error) {
        try {
          if ((await this.native.readSecret(KEY)).value === raw) {
            const restored = previous ?? raw;
            await this.native.storeSecret(KEY, restored);
            if ((await this.native.readSecret(KEY)).value !== restored)
              throw new AuxError(
                "operation_uncertain",
                "Original account-clear rollback was not confirmed.",
              );
          }
        } catch (cleanup) {
          this.poison();
          throw new AggregateError(
            [error, cleanup],
            "Original account-clear reconciliation is unconfirmed.",
          );
        }
        throw error;
      }
    });
  }
}
