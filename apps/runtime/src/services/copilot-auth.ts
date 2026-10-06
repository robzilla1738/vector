import { randomBytes } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import {
  CopilotAccounts,
  type CopilotAccount,
  type CopilotAccountCommit,
} from "./copilot-account.js";
import {
  copilotGrant,
  copilotPost,
  CopilotRegistrationSchema,
  type CopilotRegistration,
} from "./copilot-protocol.js";

type Phase =
  | "pending"
  | "authenticating"
  | "connected"
  | "cancelled"
  | "expired"
  | "failed";
export type CopilotAuthStatus = {
  attemptId: string;
  provider: "copilot";
  phase: Phase;
  expiresAt: number;
};
export type CopilotDeviceChallenge = CopilotAuthStatus & {
  authorizationUrl: "https://github.com/login/device";
  userCode: string;
};
interface Attempt extends CopilotAuthStatus {
  owner: string;
  generation: string;
  registration?: CopilotRegistration;
  controller: AbortController;
  deviceCode?: string;
  intervalMs: number;
  start?: Promise<CopilotDeviceChallenge>;
  work?: Promise<void>;
  settled: boolean;
  cleanupFailure?: unknown;
}
export interface CopilotAuthDeps {
  accounts: CopilotAccounts;
  generation(): string;
  /** Must resolve the currently reviewed Aux-owned registration, not an ambient or renderer client ID. */
  registration(): Promise<CopilotRegistration>;
  /** Resolve/revalidate the saved native token's original WeakDocument and window; compare requester's real window. */
  checkOwner(original: string, requester?: string): Promise<void>;
  /** Inspect the selected account's actual SDK catalog without sending a prompt. */
  eligible(account: CopilotAccount, signal: AbortSignal): Promise<void>;
  /** Settings owns its own serialized CAS receipt, including rollback on a later original-owner refusal. */
  activate(
    account: CopilotAccount,
    check: () => Promise<void>,
  ): Promise<{
    generation: string;
    rollback(): Promise<void>;
  }>;
  network?: typeof fetch;
}
const DeviceSchema = z.object({
  device_code: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[A-Za-z0-9_-]+$/),
  user_code: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9-]+$/),
  verification_uri: z.literal("https://github.com/login/device"),
  expires_in: z.number().int().positive().max(900),
  interval: z.number().int().positive().max(900),
});
const PollSchema = z.object({
  error: z.string().min(1).max(100),
  interval: z.number().int().positive().max(900).optional(),
});

/** Device codes stay private; only a human challenge and opaque attempt identity reach the renderer. */
export class CopilotAuthService {
  private readonly attempts = new Map<string, Attempt>();
  private starts: Promise<unknown> = Promise.resolve();
  private closed = false;
  constructor(private readonly deps: CopilotAuthDeps) {}
  private statusOf(a: Attempt): CopilotAuthStatus {
    return {
      attemptId: a.attemptId,
      provider: "copilot",
      phase: a.phase,
      expiresAt: a.expiresAt,
    };
  }
  private live(a: Attempt) {
    if (
      this.closed ||
      a.controller.signal.aborted ||
      this.attempts.get(a.attemptId) !== a ||
      a.generation !== this.deps.generation()
    )
      throw new AuxError("cancelled", "The original Copilot sign-in retired.");
    if (Date.now() >= a.expiresAt) {
      a.phase = "expired";
      a.controller.abort();
      throw new AuxError("cancelled", "Copilot sign-in expired.");
    }
  }
  private async current(a: Attempt) {
    this.live(a);
    await this.deps.checkOwner(a.owner);
    this.live(a);
    const registration = CopilotRegistrationSchema.parse(
      await this.deps.registration(),
    );
    this.live(a);
    if (
      a.registration &&
      (registration.clientId !== a.registration.clientId ||
        registration.revision !== a.registration.revision)
    )
      throw new AuxError(
        "cancelled",
        "The original Copilot OAuth App registration changed.",
      );
    return registration;
  }
  private retire(a: Attempt, phase: "cancelled" | "expired") {
    if (a.phase === "connected" || a.settled) return;
    a.phase = phase;
    a.controller.abort();
  }
  start(owner: string): Promise<CopilotDeviceChallenge> {
    if (this.closed)
      return Promise.reject(
        new AuxError("cancelled", "Provider sign-in is closed."),
      );
    if ([...this.attempts.values()].some((a) => a.cleanupFailure))
      return Promise.reject(
        new AuxError(
          "operation_uncertain",
          "Join the original account cleanup before signing in again.",
        ),
      );
    // Insert before the first await so close/status/cancel own even a pending owner lookup.
    const old = [...this.attempts.values()].filter((a) => !a.settled);
    for (const a of old) this.retire(a, "cancelled");
    for (const [id, a] of this.attempts)
      if (this.attempts.size >= 32 && a.settled) this.attempts.delete(id);
    if (this.attempts.size >= 32)
      return Promise.reject(
        new AuxError(
          "backend_unavailable",
          "Finish the original pending sign-in first.",
        ),
      );
    const a: Attempt = {
      attemptId: randomBytes(32).toString("base64url"),
      provider: "copilot",
      phase: "pending",
      expiresAt: Date.now() + 900000,
      owner,
      generation: this.deps.generation(),
      controller: new AbortController(),
      intervalMs: 5000,
      settled: false,
    };
    this.attempts.set(a.attemptId, a);
    const start = this.starts.then(async () => {
      // Joined retirement before another attempt can obtain/persist credentials.
      await Promise.all(
        old.map(
          (o) =>
            o.work ??
            o.start?.then(
              () => {},
              () => {},
            ),
        ),
      );
      if (old.some((o) => o.cleanupFailure))
        throw new AuxError(
          "operation_uncertain",
          "Original account cleanup remains unconfirmed.",
        );
      return this.begin(a);
    });
    a.start = start;
    this.starts = start.then(
      () => {},
      () => {},
    );
    return start;
  }
  private fail(a: Attempt) {
    if (a.phase !== "cancelled" && a.phase !== "expired")
      a.phase = Date.now() >= a.expiresAt ? "expired" : "failed";
    a.controller.abort();
    a.deviceCode = undefined;
    a.settled = true;
  }
  private async begin(a: Attempt): Promise<CopilotDeviceChallenge> {
    try {
      a.registration = await this.current(a);
      const device = DeviceSchema.safeParse(
        await copilotPost(
          this.deps.network ?? fetch,
          "/login/device/code",
          { client_id: a.registration.clientId, scope: "offline_access" },
          a.controller.signal,
        ),
      );
      await this.current(a);
      if (!device.success)
        throw new AuxError(
          "backend_unavailable",
          "GitHub returned an invalid device challenge.",
        );
      a.deviceCode = device.data.device_code;
      a.expiresAt = Date.now() + device.data.expires_in * 1000;
      a.intervalMs = device.data.interval * 1000;
      a.work = this.poll(a)
        .catch((error: unknown) => {
          if (error instanceof AggregateError) a.cleanupFailure = error;
          this.fail(a);
        })
        .finally(() => {
          a.deviceCode = undefined;
          a.settled = true;
        });
      return {
        ...this.statusOf(a),
        authorizationUrl: device.data.verification_uri,
        userCode: device.data.user_code,
      };
    } catch (error) {
      this.fail(a);
      throw error;
    }
  }
  private async poll(a: Attempt): Promise<void> {
    for (;;) {
      const remaining = a.expiresAt - Date.now();
      if (remaining <= a.intervalMs) {
        if (remaining > 0)
          await wait(remaining, undefined, { signal: a.controller.signal });
        this.retire(a, "expired");
        return;
      }
      await wait(a.intervalMs, undefined, { signal: a.controller.signal });
      const registration = await this.current(a);
      if (!a.deviceCode)
        throw new AuxError(
          "cancelled",
          "The original device challenge retired.",
        );
      const value = await copilotPost(
        this.deps.network ?? fetch,
        "/login/oauth/access_token",
        {
          client_id: registration.clientId,
          device_code: a.deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
        a.controller.signal,
      );
      await this.current(a);
      const pending = PollSchema.safeParse(value);
      if (pending.success) {
        if (pending.data.error === "authorization_pending") continue;
        if (pending.data.error === "slow_down") {
          a.intervalMs = Math.max(
            a.intervalMs + 5000,
            (pending.data.interval ?? 0) * 1000,
          );
          continue;
        }
        if (
          pending.data.error === "expired_token" ||
          pending.data.error === "token_expired"
        ) {
          this.retire(a, "expired");
          return;
        }
        throw new AuxError(
          "permission_denied",
          "GitHub refused this device sign-in. Start a new request.",
        );
      }
      const grant = copilotGrant(value);
      a.phase = "authenticating";
      let account: CopilotAccountCommit | undefined;
      let activation:
        Awaited<ReturnType<CopilotAuthDeps["activate"]>> | undefined;
      try {
        account = await this.deps.accounts.install(
          grant,
          registration,
          () => this.current(a).then(() => {}),
          this.deps.eligible,
          a.controller.signal,
        );
        await this.current(a);
        activation = await this.deps.activate(account.account, () =>
          this.current(a).then(() => {}),
        );
        // Advance only with the exact application-owned Settings write receipt, never a provider response.
        a.generation = activation.generation;
        await this.current(a);
        a.phase = "connected";
        return;
      } catch (error) {
        const errors: unknown[] = [error];
        if (activation)
          try {
            await activation.rollback();
          } catch (cleanup) {
            errors.push(cleanup);
          }
        if (account)
          try {
            await account.rollback();
          } catch (cleanup) {
            errors.push(cleanup);
          }
        if (errors.length > 1)
          throw new AggregateError(
            errors,
            "Copilot sign-in retirement requires reconciliation.",
          );
        throw error;
      }
    }
  }
  private get(id: string): Attempt {
    const a = this.attempts.get(id);
    if (!a)
      throw new AuxError(
        "not_found",
        "The original Copilot sign-in is no longer available.",
      );
    return a;
  }
  async status(id: string, requester: string): Promise<CopilotAuthStatus> {
    const a = this.get(id);
    await this.deps.checkOwner(a.owner, requester);
    if (!a.settled) {
      try {
        await this.current(a);
      } catch {
        this.retire(a, Date.now() >= a.expiresAt ? "expired" : "cancelled");
      }
    }
    return this.statusOf(a);
  }
  async cancel(id: string, requester: string): Promise<CopilotAuthStatus> {
    const a = this.get(id);
    await this.deps.checkOwner(a.owner, requester);
    this.retire(a, "cancelled");
    await a.start?.then(
      () => {},
      () => {},
    );
    await a.work;
    if (a.cleanupFailure) throw a.cleanupFailure;
    return this.statusOf(a);
  }
  async close(): Promise<void> {
    this.closed = true;
    this.invalidate();
    await this.starts;
    await Promise.all([...this.attempts.values()].map((a) => a.work));
    const failures = [...this.attempts.values()].flatMap((a) =>
      a.cleanupFailure ? [a.cleanupFailure] : [],
    );
    if (failures.length)
      throw new AggregateError(
        failures,
        "Original Copilot sign-in cleanup is unconfirmed.",
      );
    this.attempts.clear();
  }
  invalidate(): void {
    for (const a of this.attempts.values()) this.retire(a, "cancelled");
  }
}
