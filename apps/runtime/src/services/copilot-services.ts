import type { CopilotSession } from "@github/copilot-sdk";
import type { ModelCallSource } from "../agent/model-client.js";
import { AuxError } from "@aux/contracts";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NativeBridge } from "../native.js";
import { CopilotAccounts } from "./copilot-account.js";
import { CopilotAuthService, type CopilotAuthDeps } from "./copilot-auth.js";
import {
  CopilotRegistrationSchema,
  type CopilotRegistration,
} from "./copilot-protocol.js";
import { CopilotRuntime } from "./copilot-runtime.js";
import {
  COPILOT_RELEASE,
  CopilotRuntimeInstaller,
} from "./copilot-runtime-install.js";

/** Settings supplies real reviewed registration, original-owner checks and
 * serialized selection receipts. Selecting an account does not select an
 * inference route; this service exposes installation/account/catalog only. */
export interface CopilotServicesDeps {
  native: NativeBridge;
  dataDir: string;
  hostId: string;
  registration(): Promise<CopilotRegistration | undefined>;
  generation: CopilotAuthDeps["generation"];
  checkOwner: CopilotAuthDeps["checkOwner"];
  activate: CopilotAuthDeps["activate"];
  /** Clear only this actual current account, preserving newer selection. */
  deactivate(accountId: string, check: () => Promise<void>): Promise<void>;
}

/** One lazy app-owned lifetime; no CLI/SDK work happens in its constructor. */
export class CopilotServices {
  private readonly installer: CopilotRuntimeInstaller;
  private readonly accountService: CopilotAccounts;
  private readonly runtime: CopilotRuntime;
  private readonly auth: CopilotAuthService;
  private readonly controller = new AbortController();
  private readonly operations = new Set<Promise<unknown>>();
  private accountReady?: Promise<void>;
  private installation?: Promise<{
    installed: true;
    sdkVersion: typeof COPILOT_RELEASE.sdkVersion;
    runtimeVersion: typeof COPILOT_RELEASE.runtimeVersion;
  }>;
  private closing?: Promise<void>;
  private closed = false;

  constructor(private readonly deps: CopilotServicesDeps) {
    if (!isAbsolute(deps.dataDir))
      throw new AuxError(
        "invalid_params",
        "Copilot requires original Profile-owned storage.",
      );
    const { copilotStart, copilotEndpoint, copilotStop } = deps.native;
    if (!copilotStart || !copilotEndpoint || !copilotStop)
      throw new AuxError(
        "capability_unsupported",
        "Owned Copilot helpers require the native desktop host.",
      );
    const registration = async () => {
      this.assertOpen();
      const configured = await deps.registration();
      this.assertOpen();
      if (!configured)
        throw new AuxError(
          "needs_input",
          "Configure the reviewed Aux-owned GitHub OAuth App first.",
        );
      return CopilotRegistrationSchema.parse(configured);
    };
    this.installer = new CopilotRuntimeInstaller({
      root: join(deps.dataDir, "provider-runtimes"),
      workerPath: fileURLToPath(
        import.meta.resolve("#aux-copilot-install-worker"),
      ),
      checkOwner: (original, requester) => this.checkOwner(original, requester),
    });
    this.accountService = new CopilotAccounts(
      deps.native,
      deps.hostId,
      registration,
      (accountId) => this.runtime.retire(accountId),
    );
    this.runtime = new CopilotRuntime({
      dataDir: deps.dataDir,
      native: {
        start: (input) => copilotStart.call(deps.native, input),
        endpoint: (input) => copilotEndpoint.call(deps.native, input),
        stop: (input) => copilotStop.call(deps.native, input),
      },
      accounts: this.accountService,
      installer: this.installer,
      checkOwner: (owner) => this.checkOwner(owner),
    });
    this.auth = new CopilotAuthService({
      accounts: this.accountService,
      registration,
      generation: deps.generation,
      checkOwner: (original, requester) => this.checkOwner(original, requester),
      eligible: async (account, signal, owner, checkOriginal) => {
        this.assertInspectionAvailable();
        await this.requireRuntime();
        await this.runtime.eligible(account, signal, owner, checkOriginal);
      },
      activate: deps.activate,
    });
  }

  private assertOpen() {
    if (this.closed)
      throw new AuxError("cancelled", "Copilot services are closed.");
  }
  private assertInspectionAvailable() {
    this.assertOpen();
    if (this.installation)
      throw new AuxError(
        "conflict",
        "Wait for the original Copilot installation to finish.",
      );
  }
  private async checkOwner(original: string, requester?: string) {
    this.assertOpen();
    await this.deps.checkOwner(original, requester);
    this.assertOpen();
  }
  private operation<T>(owner: string, run: () => Promise<T>): Promise<T> {
    this.assertOpen();
    const work = Promise.resolve().then(async () => {
      await this.checkOwner(owner);
      const result = await run();
      await this.checkOwner(owner);
      return result;
    });
    this.operations.add(work);
    void work.then(
      () => this.operations.delete(work),
      () => this.operations.delete(work),
    );
    return work;
  }
  private async runtimeSupported() {
    if (
      process.platform !== "darwin" ||
      process.arch !== "arm64" ||
      !this.deps.native.capabilities
    )
      return false;
    const capabilities = await this.deps.native.capabilities();
    return [
      "native.copilotStart",
      "native.copilotEndpoint",
      "native.copilotStop",
    ].every((method) => capabilities.methods.includes(method));
  }
  private async requireRuntime() {
    if (!(await this.runtimeSupported()))
      throw new AuxError(
        "capability_unsupported",
        "The native host does not implement owned Copilot helpers.",
      );
    this.assertInspectionAvailable();
  }
  private async initializeAccounts() {
    this.assertOpen();
    await (this.accountReady ??= this.accountService.initialize());
    this.assertOpen();
  }

  setup(owner: string) {
    return this.operation(owner, async () => {
      const registration = await this.deps.registration();
      if (registration) CopilotRegistrationSchema.parse(registration);
      const runtime = await this.installer.status();
      const runtimeSupported = await this.runtimeSupported();
      return {
        registrationConfigured: !!registration,
        runtimeInstalled: !!runtime,
        runtimeSupported,
      };
    });
  }
  install(owner: string) {
    if (this.installation)
      return Promise.reject(
        new AuxError("conflict", "Copilot installation is already pending."),
      );
    const work = this.operation(owner, async () => {
      // Asset replacement cannot race a temporary eligibility/catalog helper.
      this.auth.invalidate();
      await this.runtime.retire();
      await this.checkOwner(owner);
      const installed = await this.installer.install(owner);
      await installed.assertCurrent();
      return {
        installed: true as const,
        sdkVersion: COPILOT_RELEASE.sdkVersion,
        runtimeVersion: COPILOT_RELEASE.runtimeVersion,
      };
    });
    this.installation = work;
    void work.then(
      () => {
        if (this.installation === work) this.installation = undefined;
      },
      () => {
        if (this.installation === work) this.installation = undefined;
      },
    );
    return work;
  }
  start(owner: string) {
    return this.operation(owner, async () => {
      this.assertInspectionAvailable();
      await this.requireRuntime();
      if (!(await this.installer.status()))
        throw new AuxError(
          "needs_input",
          "Install the reviewed Copilot runtime first.",
        );
      await this.initializeAccounts();
      await this.checkOwner(owner);
      return this.auth.start(owner);
    });
  }
  status(id: string, owner: string) {
    return this.operation(owner, () => this.auth.status(id, owner));
  }
  cancel(id: string, owner: string) {
    return this.operation(owner, () => this.auth.cancel(id, owner));
  }
  accounts(owner: string) {
    return this.operation(owner, async () => {
      await this.initializeAccounts();
      return this.accountService.summaries();
    });
  }
  disconnect(accountId: string, owner: string) {
    return this.operation(owner, async () => {
      await this.initializeAccounts();
      const check = () => this.checkOwner(owner);
      const result = await this.accountService.disconnect(accountId, check);
      // Credential removal is real and cannot be rolled back to repair UI state.
      await this.deps.deactivate(accountId, check);
      return result;
    });
  }
  catalog(accountId: string, owner: string) {
    return this.operation(owner, async () => {
      this.assertInspectionAvailable();
      await this.requireRuntime();
      await this.initializeAccounts();
      await this.checkOwner(owner);
      return this.runtime.catalog(accountId, owner, this.controller.signal);
    });
  }

  inference<T>(
    accountId: string,
    source: ModelCallSource,
    modelId: string,
    signal: AbortSignal,
    use: (session: CopilotSession, current: () => Promise<void>, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    return this.operation(source.nativeTurnContext, async () => {
      await source.checkOriginal();
      await this.requireRuntime();
      await this.initializeAccounts();
      await source.checkOriginal();
      return this.runtime.inference(
        accountId,
        source.nativeTurnContext,
        AbortSignal.any([signal, this.controller.signal]),
        async () => {
          await source.checkOriginal();
        },
        modelId,
        use,
      );
    });
  }

  close(): Promise<void> {
    this.closed = true;
    this.controller.abort();
    this.installer.retireAdmission();
    if (this.closing) return this.closing;
    const work = this.closeOriginals();
    this.closing = work;
    // A failed close keeps these exact owners available for reduction retry.
    void work.catch(() => {
      if (this.closing === work) this.closing = undefined;
    });
    return work;
  }
  private async closeOriginals() {
    const failures: unknown[] = [];
    const attempt = async (close: () => Promise<void>) => {
      try {
        await close();
        return true;
      } catch (error) {
        failures.push(error);
        return false;
      }
    };
    // Auth joins poll/install/temporary eligibility work before account shutdown.
    await attempt(() => this.auth.close());
    await attempt(() => this.accountService.close());
    const joined = await attempt(() => this.runtime.close());
    const operations = await Promise.allSettled(this.operations);
    for (const result of operations) {
      if (
        result.status === "rejected" &&
        !(
          result.reason instanceof AuxError &&
          result.reason.code === "cancelled"
        ) &&
        !(
          result.reason instanceof DOMException &&
          result.reason.name === "AbortError"
        )
      )
        failures.push(result.reason);
    }
    if (joined) await attempt(() => this.installer.close());
    if (failures.length)
      throw new AggregateError(
        failures,
        "Original Copilot service cleanup is unconfirmed.",
      );
  }
}
