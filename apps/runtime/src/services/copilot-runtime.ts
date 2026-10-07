import {
  NativeCopilotPreparedSchema as prepared,
  NativeCopilotStartedSchema as started,
  NativeCopilotEndpointSchema as endpoint,
  NativeCopilotStoppedSchema as stopped,
  type CopilotNativeStart,
  type CopilotNativeStartResult,
  type CopilotNativeEndpointResult,
  type CopilotNativeStopResult,
} from "@aux/contracts/native-copilot";
import { randomBytes, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, realpath, rm, type FileHandle } from "node:fs/promises";
import { createConnection } from "node:net";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import type { CopilotClient, ModelInfo, CopilotSession } from "@github/copilot-sdk";
import { attemptsOf, withAttempts } from "../agent/model-client.js";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import type { CopilotAccount, CopilotAccounts } from "./copilot-account.js";
import { COPILOT_RELEASE, type CopilotInstalledRuntime } from "./copilot-runtime-install.js";

const uuid = z.string().uuid();
const uint64 = z
  .string()
  .regex(/^(0|[1-9][0-9]*)$/)
  .refine((v) => BigInt(v) <= 18446744073709551615n);
export interface CopilotNativeOwner {
  start(input: CopilotNativeStart): Promise<CopilotNativeStartResult>;
  endpoint(input: {
    token: string;
    requestId: string;
    helperId: string;
  }): Promise<CopilotNativeEndpointResult>;
  /** Reduction-only: saved requestId is usable even after Start ACK/source loss. */
  stop(input: {
    token: string;
    requestId: string;
    helperId?: string;
    reconcile?: true;
  }): Promise<CopilotNativeStopResult>;
}

export interface CopilotRuntimeDeps {
  /** Internal config.dataDir, matching native AUX_DATA_DIR. Never an API path. */
  dataDir: string;
  native: CopilotNativeOwner;
  accounts: Pick<CopilotAccounts, "lease" | "assertCurrent">;
  installer: {
    status(): Promise<InstalledPayload | undefined>;
  };
  checkOwner(token: string): Promise<void>;
}
type InstalledPayload = Pick<CopilotInstalledRuntime, "path" | "supportDirectory" | "assertCurrent">;
type AccountAuthority = Pick<
  CopilotAccount,
  "accountId" | "authorizationGeneration" | "credentialRevision" | "accessToken"
>;
interface Original {
  requestId: string;
  owner: string;
  account: AccountAuthority;
  controller: AbortController;
  signal: AbortSignal;
  current: () => Promise<void>;
  work: Promise<unknown>;
  sent: boolean;
  prepared: boolean;
  prepareSent: boolean;
  helperId?: string;
  client?: CopilotClient;
  runtime?: InstalledPayload;
  home?: string;
  pins: FileHandle[];
  homeIdentity?: { dev: bigint; ino: bigint };
  nativeJoin?: Promise<void>;
  joined: boolean;
  sdkStopped: boolean;
  sdkCleanup?: Promise<void>;
  sdkCleanupPoisoned: boolean;
  cleanupDebt: boolean;
  retirement?: Promise<void>;
}

/** Strict public JSON-RPC proof on a separate socket; never an SDK-private receipt. */
async function authenticateOriginalListener(uri: string, token: string, signal: AbortSignal): Promise<3> {
  const match = /^127\.0\.0\.1:([1-9][0-9]{0,4})$/.exec(uri);
  if (!match || Number(match[1]) > 65535)
    throw new AuxError("permission_denied", "The original Copilot listener is invalid.");
  signal.throwIfAborted();
  const socket = createConnection({
    host: "127.0.0.1",
    port: Number(match[1]),
  });
  const closed = new Promise<void>((resolve) => socket.once("close", () => resolve()));
  const id = randomUUID();
  try {
    return await new Promise<3>((resolve, reject) => {
      let buffer = Buffer.alloc(0),
        length: number | undefined;
      let done = false;
      const finish = (error?: Error) => {
        if (done) return;
        done = true;
        if (error) reject(error);
        else resolve(3);
      };
      const abort = () => finish(new AuxError("cancelled", "Original Copilot connection retired."));
      signal.addEventListener("abort", abort, { once: true });
      socket.once("close", () => {
        signal.removeEventListener("abort", abort);
        finish(
          new AuxError("backend_unavailable", "Original Copilot connection closed before authentication."),
        );
      });
      socket.once("error", () =>
        finish(new AuxError("backend_unavailable", "Original Copilot connection failed.")),
      );
      socket.setTimeout(15000, () =>
        finish(new AuxError("backend_unavailable", "Original Copilot authentication did not complete.")),
      );
      socket.once("connect", () => {
        if (signal.aborted) {
          abort();
          return;
        }
        const body = JSON.stringify({
          jsonrpc: "2.0",
          id,
          method: "connect",
          params: { token, supportedTaskKinds: ["agent", "client", "shell"] },
        });
        socket.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
      });
      socket.on("data", (chunk) => {
        if (done) return;
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length > 65536) {
          finish(new AuxError("permission_denied", "Copilot authentication response exceeded its bound."));
          return;
        }
        if (length === undefined) {
          const split = buffer.indexOf("\r\n\r\n");
          if (split < 0) {
            if (buffer.length > 4096)
              finish(new AuxError("permission_denied", "Invalid Copilot authentication frame."));
            return;
          }
          const lengths = [
            ...buffer
              .subarray(0, split)
              .toString("ascii")
              .matchAll(/^Content-Length: ([0-9]+)\r?$/gim),
          ];
          if (lengths.length !== 1) {
            finish(new AuxError("permission_denied", "Invalid Copilot authentication frame."));
            return;
          }
          length = Number(lengths[0]?.[1]);
          if (!Number.isSafeInteger(length) || length <= 0 || length > 32768) {
            finish(new AuxError("permission_denied", "Invalid Copilot authentication length."));
            return;
          }
          buffer = buffer.subarray(split + 4);
        }
        if (buffer.length < length) return;
        try {
          const reply = z
            .object({
              jsonrpc: z.literal("2.0"),
              id: z.literal(id),
              result: z.object({ protocolVersion: z.literal(3) }),
            })
            .parse(JSON.parse(buffer.subarray(0, length).toString("utf8")));
          finish(
            reply.result.protocolVersion === 3
              ? undefined
              : new AuxError("permission_denied", "Copilot connect authentication was refused."),
          );
        } catch {
          finish(
            new AuxError(
              "permission_denied",
              "Copilot connect authentication was refused; no legacy ping is accepted.",
            ),
          );
        }
      });
    });
  } finally {
    socket.destroy();
    await closed;
  }
}

/** Catalog/eligibility only. No provider inference, SDK process spawn or ambient account. */
export class CopilotRuntime {
  private closed = false;
  private readonly originals = new Map<string, Original>();
  constructor(private readonly deps: CopilotRuntimeDeps) {}
  private admit() {
    if (this.closed) throw new AuxError("cancelled", "Copilot runtime is closed.");
    if ([...this.originals.values()].some((o) => o.cleanupDebt || o.sdkCleanupPoisoned || o.signal.aborted))
      throw new AuxError(
        "operation_uncertain",
        "Join the original Copilot cleanup before replacing its runtime.",
      );
  }
  async catalog(accountId: string, owner: string, signal: AbortSignal): Promise<readonly ModelInfo[]> {
    this.admit();
    const lease = await this.deps.accounts.lease(accountId, signal);
    return this.inspect(
      {
        accountId: lease.accountId,
        authorizationGeneration: lease.authorizationGeneration,
        credentialRevision: lease.credentialRevision,
        accessToken: lease.accessToken,
      },
      owner,
      AbortSignal.any([signal, lease.signal]),
      async () => {
        this.deps.accounts.assertCurrent(accountId, lease.authorizationGeneration);
        lease.signal.throwIfAborted();
      },
    );
  }
  async eligible(
    account: CopilotAccount,
    signal: AbortSignal,
    owner: string,
    checkOriginal: () => Promise<void>,
  ): Promise<void> {
    const models = await this.inspect(account, owner, signal, checkOriginal);
    if (models.length === 0)
      throw new AuxError("permission_denied", "The selected account exposes no Copilot models.");
  }
  async inference<T>(
    accountId: string,
    owner: string,
    signal: AbortSignal,
    checkOriginal: () => Promise<void>,
    modelId: string,
    use: (session: CopilotSession, current: () => Promise<void>, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    this.admit();
    await checkOriginal();
    const lease = await this.deps.accounts.lease(accountId, signal);
    await checkOriginal();
    const current = async () => {
      await checkOriginal();
      this.deps.accounts.assertCurrent(accountId, lease.authorizationGeneration);
      lease.signal.throwIfAborted();
    };
    return this.withOriginal(
      lease,
      owner,
      AbortSignal.any([signal, lease.signal]),
      current,
      async (client, check, models, originalSignal) => {
        if (!models.some((model) => model.id === modelId && model.policy?.state !== "disabled"))
          throw new AuxError("permission_denied", "Choose a model advertised for this Copilot account.");
        await check();
        const session = await client.createSession({
          model: modelId,
          gitHubToken: lease.accessToken,
          availableTools: [],
          capi: { enableWebSocketResponses: false },
          infiniteSessions: { enabled: false },
          onPermissionRequest: () => ({ kind: "denied-by-rules", rules: [] }),
        });
        await check();
        // No SDK send: Aux alone supplies history and dispatches admitted tools.
        return use(session, check, originalSignal);
      },
    );
  }
  private inspect(
    account: AccountAuthority,
    owner: string,
    signal: AbortSignal,
    current: () => Promise<void>,
  ): Promise<readonly ModelInfo[]> {
    return this.withOriginal(account, owner, signal, current, async (_client, _check, models) => models);
  }
  private withOriginal<T>(
    account: AccountAuthority,
    owner: string,
    signal: AbortSignal,
    current: () => Promise<void>,
    use: (
      client: CopilotClient,
      check: () => Promise<void>,
      models: readonly ModelInfo[],
      signal: AbortSignal,
    ) => Promise<T>,
  ): Promise<T> {
    this.admit();
    uuid.parse(owner);
    z.string()
      .regex(/^[a-f0-9]{64}$/)
      .parse(account.accountId);
    uuid.parse(account.authorizationGeneration);
    uuid.parse(account.credentialRevision);
    z.string()
      .regex(/^gho_[A-Za-z0-9_]{16,500}$/)
      .parse(account.accessToken);
    const controller = new AbortController();
    const original: Original = {
      requestId: randomUUID(),
      owner,
      account: {
        accountId: account.accountId,
        authorizationGeneration: account.authorizationGeneration,
        credentialRevision: account.credentialRevision,
        accessToken: account.accessToken,
      },
      controller,
      signal: AbortSignal.any([signal, controller.signal]),
      current,
      work: Promise.resolve([]),
      sent: false,
      prepared: false,
      prepareSent: false,
      pins: [],
      joined: false,
      sdkStopped: false,
      sdkCleanupPoisoned: false,
      cleanupDebt: false,
    };
    this.originals.set(original.requestId, original);
    const abort = () => {
      void this.stopSdk(original).catch(() => {});
      if (original.prepared) void this.joinNative(original).catch(() => {});
    };
    original.signal.addEventListener("abort", abort, { once: true });
    let failure: unknown;
    const work = Promise.resolve()
      .then(() => this.run(original, use))
      .catch((error) => {
        failure = error;
        if (error instanceof AuxError) throw error;
        if (original.signal.aborted && !original.sdkCleanupPoisoned)
          throw withAttempts(
            new AuxError("cancelled", "Original Copilot request retired."),
            attemptsOf(error),
          );
        throw withAttempts(
          new AuxError("backend_unavailable", "Original Copilot request failed."),
          attemptsOf(error),
        );
      })
      .finally(async () => {
        original.signal.removeEventListener("abort", abort);
        try {
          await this.retireOriginal(original);
        } catch (cleanup) {
          if (failure !== undefined)
            throw withAttempts(
              new AggregateError([failure, cleanup], "Original Copilot request and cleanup failed."),
              attemptsOf(failure),
            );
          throw cleanup;
        }
      });
    original.work = work;
    return work;
  }
  private async check(o: Original) {
    if (this.closed || this.originals.get(o.requestId) !== o)
      throw new AuxError("cancelled", "Original Copilot owner retired.");
    o.signal.throwIfAborted();
    await o.current();
    await this.deps.checkOwner(o.owner);
    o.signal.throwIfAborted();
    if (this.closed || this.originals.get(o.requestId) !== o)
      throw new AuxError("cancelled", "Original Copilot owner retired.");
  }
  private async pin(o: Original, path: string, directory: boolean) {
    const fd = await open(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW | (directory ? constants.O_DIRECTORY : 0),
    );
    o.pins.push(fd);
    const s = await fd.stat({ bigint: true });
    if (
      (directory ? !s.isDirectory() : !s.isFile()) ||
      s.uid !== BigInt(process.getuid?.() ?? -1) ||
      (s.mode & 0o022n) !== 0n ||
      (await realpath(path)) !== path
    )
      throw new AuxError("permission_denied", "Copilot owned path identity is invalid.");
    uint64.parse(String(s.dev));
    uint64.parse(String(s.ino));
    return s;
  }
  private async run<T>(
    o: Original,
    use: (
      client: CopilotClient,
      check: () => Promise<void>,
      models: readonly ModelInfo[],
      signal: AbortSignal,
    ) => Promise<T>,
  ): Promise<T> {
    await this.check(o);
    const runtime = await this.deps.installer.status();
    await this.check(o);
    if (!runtime) throw new AuxError("needs_input", "Install the reviewed Copilot runtime first.");
    o.runtime = runtime;
    await runtime.assertCurrent();
    await this.check(o);
    const data = await realpath(this.deps.dataDir);
    await this.check(o);
    const fixedRuntime = join(
      data,
      "provider-runtimes",
      `copilot-${COPILOT_RELEASE.sdkVersion}-${COPILOT_RELEASE.platform}`,
    );
    if (
      runtime.supportDirectory !== fixedRuntime ||
      runtime.path !== join(fixedRuntime, COPILOT_RELEASE.wrapper)
    )
      throw new AuxError("permission_denied", "Copilot installation does not match native fixed storage.");
    const root = await this.pin(o, fixedRuntime, true),
      executable = await this.pin(o, runtime.path, false);
    await this.check(o);
    const homes = join(data, "copilot-homes");
    await mkdir(homes, { recursive: true, mode: 0o700 });
    await this.check(o);
    const homeRoot = await this.pin(o, homes, true);
    if ((homeRoot.mode & 0o077n) !== 0n)
      throw new AuxError("permission_denied", "Copilot Homes storage is not private.");
    await this.check(o);
    const home = join(homes, o.requestId);
    await mkdir(home, { mode: 0o700 });
    o.home = home;
    const createdHome = await lstat(home, { bigint: true });
    o.homeIdentity = { dev: createdHome.dev, ino: createdHome.ino };
    const homeStat = await this.pin(o, home, true);
    if (homeStat.dev !== createdHome.dev || homeStat.ino !== createdHome.ino)
      throw new AuxError("permission_denied", "Original Copilot Home changed before pinning.");
    if ((homeStat.mode & 0o077n) !== 0n)
      throw new AuxError("permission_denied", "Copilot Home is not private.");
    await this.check(o);
    await runtime.assertCurrent();
    await this.check(o);
    const connectionToken = randomBytes(32).toString("base64url");
    o.prepareSent = true;
    const reservation = prepared.parse(
      await this.deps.native.start({
        prepare: true,
        token: o.owner,
        requestId: o.requestId,
        accountId: o.account.accountId,
        authorizationGeneration: o.account.authorizationGeneration,
        credentialRevision: o.account.credentialRevision,
      }),
    );
    if (reservation.requestId !== o.requestId)
      throw new AuxError("permission_denied", "Original Copilot preparation receipt does not match.");
    o.helperId = reservation.helperId;
    o.prepared = true;
    await this.check(o);
    o.sent = true;
    const result = started.parse(
      await this.deps.native.start({
        token: o.owner,
        requestId: o.requestId,
        helperId: o.helperId,
        accountId: o.account.accountId,
        authorizationGeneration: o.account.authorizationGeneration,
        credentialRevision: o.account.credentialRevision,
        runtimeDevice: String(root.dev),
        runtimeInode: String(root.ino),
        executableDevice: String(executable.dev),
        executableInode: String(executable.ino),
        homeDevice: String(homeStat.dev),
        homeInode: String(homeStat.ino),
        accessToken: o.account.accessToken,
        connectionToken,
      }),
    );
    if (result.requestId !== o.requestId || result.helperId !== o.helperId)
      throw new AuxError("permission_denied", "Copilot Start receipt belongs to another request.");
    o.helperId = result.helperId;
    if (result.state !== "started" || result.joined)
      throw new AuxError("backend_unavailable", "Original Copilot helper did not start.");
    await this.check(o);
    const startedAt = Date.now();
    let uri: string | undefined;
    while (!uri) {
      const e = endpoint.parse(
        await this.deps.native.endpoint({
          token: o.owner,
          requestId: o.requestId,
          helperId: o.helperId,
        }),
      );
      if (e.requestId !== o.requestId || e.helperId !== o.helperId)
        throw new AuxError("permission_denied", "Copilot listener belongs to another helper.");
      await this.check(o);
      if (e.ready) uri = e.uri;
      else {
        if (Date.now() - startedAt > 30000)
          throw new AuxError("backend_unavailable", "Original Copilot listener did not become ready.");
        await delay(100, undefined, { signal: o.signal });
      }
    }
    const sameEndpoint = async () => {
      const e = endpoint.parse(
        await this.deps.native.endpoint({
          token: o.owner,
          requestId: o.requestId,
          helperId: o.helperId!,
        }),
      );
      if (!e.ready || e.uri !== uri || e.requestId !== o.requestId || e.helperId !== o.helperId)
        throw new AuxError("cancelled", "Original Copilot listener changed.");
      await this.check(o);
    };
    await sameEndpoint();
    await authenticateOriginalListener(uri, connectionToken, o.signal);
    await sameEndpoint();
    const sdk = await import("@github/copilot-sdk");
    await this.check(o);
    o.client = new sdk.CopilotClient({
      connection: sdk.RuntimeConnection.forUri(uri, { connectionToken }),
      mode: "empty",
      env: {},
      logLevel: "none",
      telemetry: { captureContent: false },
    });
    try {
      await o.client.start();
    } catch {
      // Public start() force-stops on failure, discarding transport references
      // while swallowing disposal failures. A later blank stop isn't its ACK.
      if (!o.sdkCleanup) o.sdkCleanupPoisoned = true;
      throw new AuxError(
        o.sdkCleanupPoisoned ? "operation_uncertain" : "cancelled",
        o.sdkCleanupPoisoned
          ? "Original Copilot SDK startup cleanup could not be confirmed."
          : "Original Copilot SDK startup retired with its original cleanup pending.",
      );
    }
    await sameEndpoint();
    const auth = await o.client.getAuthStatus();
    await sameEndpoint();
    if (!auth.isAuthenticated)
      throw new AuxError("permission_denied", "The selected Copilot account is not authenticated.");
    const models = await o.client.listModels();
    await sameEndpoint();
    await runtime.assertCurrent();
    await this.check(o);
    return use(
      o.client,
      async () => {
        await sameEndpoint();
        await runtime.assertCurrent();
        await this.check(o);
      },
      models,
      o.signal,
    );
  }
  private async joinNative(o: Original): Promise<void> {
    if (!o.prepared || o.joined) return;
    if (!o.nativeJoin)
      o.nativeJoin = (async () => {
        const result = stopped.parse(
          await this.deps.native.stop({
            token: o.owner,
            requestId: o.requestId,
            helperId: o.helperId,
          }),
        );
        if (result.requestId !== o.requestId || (o.helperId !== undefined && result.helperId !== o.helperId))
          throw new AuxError("operation_uncertain", "Original Copilot join receipt does not match.");
        o.helperId = result.helperId;
        if (!o.sent && result.launched)
          throw new AuxError(
            "operation_uncertain",
            "An unexecuted Copilot reservation unexpectedly launched.",
          );
        o.joined = true;
        // The first receipt is the process proof. This second reduction only
        // consumes bookkeeping; failure cannot undo the actual join ACK.
        await this.deps.native
          .stop({
            token: o.owner,
            requestId: o.requestId,
            helperId: o.helperId,
            reconcile: true,
          })
          .catch(() => {});
      })().finally(() => {
        o.nativeJoin = undefined;
      });
    await o.nativeJoin;
  }
  private stopSdk(o: Original): Promise<void> {
    if (o.sdkCleanup) return o.sdkCleanup;
    if (!o.client) {
      o.sdkStopped = true;
      return Promise.resolve();
    }
    // Invoke immediately: the public SDK captures its original socket before
    // its first await. Deferring this call can lose it to startup forceStop.
    const originalStop = o.client.stop();
    o.sdkCleanup = originalStop
      .then((errors) => {
        if (errors.length || o.sdkCleanupPoisoned)
          throw new AuxError("operation_uncertain", "Original Copilot SDK cleanup could not be confirmed.");
        o.sdkStopped = true;
      })
      .catch(() => {
        o.sdkCleanupPoisoned = true;
        throw new AuxError(
          "operation_uncertain",
          "Original Copilot SDK cleanup is unresolved; later empty stops cannot prove it.",
        );
      });
    return o.sdkCleanup;
  }
  private async retireLostPreparation(o: Original): Promise<void> {
    if (!o.prepareSent || o.prepared || o.sent) return;
    // No execute nonce was acknowledged, so this can only reduce bookkeeping.
    // Unknown/refused Stop is not a process join and creates no execution debt.
    try {
      const result = stopped.parse(
        await this.deps.native.stop({
          token: o.owner,
          requestId: o.requestId,
        }),
      );
      if (result.requestId !== o.requestId || result.launched) return;
      await this.deps.native
        .stop({
          token: o.owner,
          requestId: o.requestId,
          helperId: result.helperId,
          reconcile: true,
        })
        .catch(() => {});
    } catch {
      // A missing Prepare ACK cannot authorize execution. Preserve uncertainty
      // about reservation bookkeeping without inventing a process receipt.
    }
  }
  private retireOriginal(o: Original): Promise<void> {
    return (o.retirement ??= this.finishRetirement(o).catch((error) => {
      o.retirement = undefined;
      throw error;
    }));
  }
  private async finishRetirement(o: Original): Promise<void> {
    o.cleanupDebt = true;
    o.controller.abort();
    const sdkStop = this.stopSdk(o);
    // Native retirement is started regardless of SDK rejection or a pending SDK stop.
    const results = await Promise.allSettled([sdkStop, this.joinNative(o), this.retireLostPreparation(o)]);
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (o.sdkStopped && (!o.prepared || o.joined)) {
      while (o.pins[0]) {
        const pin = o.pins[0];
        await pin.close();
        o.pins.shift();
      }
      if (o.home && !o.homeIdentity)
        throw new AuxError("operation_uncertain", "Original Copilot Home identity was not confirmed.");
      if (o.home && o.homeIdentity) {
        const s = await lstat(o.home, { bigint: true });
        if (
          !s.isDirectory() ||
          s.isSymbolicLink() ||
          s.dev !== o.homeIdentity.dev ||
          s.ino !== o.homeIdentity.ino ||
          (await realpath(o.home)) !== o.home
        )
          throw new AuxError("operation_uncertain", "Original Copilot Home cleanup identity changed.");
        await rm(o.home, { recursive: true });
        o.home = undefined;
      }
      this.originals.delete(o.requestId);
    }
    if (failures.length)
      throw new AuxError(
        "operation_uncertain",
        "Original Copilot SDK or native cleanup remains unconfirmed; original ownership is retained.",
      );
  }
  async retire(accountId?: string): Promise<void> {
    const owned = [...this.originals.values()].filter(
      (o) => accountId === undefined || o.account.accountId === accountId,
    );
    for (const o of owned) o.controller.abort();
    await Promise.allSettled(owned.map((o) => o.work));
    const results = await Promise.allSettled(
      owned.filter((o) => this.originals.has(o.requestId)).map((o) => this.retireOriginal(o)),
    );
    if (results.some((r) => r.status === "rejected"))
      throw new AuxError("operation_uncertain", "Original Copilot helpers have unacknowledged cleanup.");
  }
  async close(): Promise<void> {
    this.closed = true;
    await this.retire();
  }
}
