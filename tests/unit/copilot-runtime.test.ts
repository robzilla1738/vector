import { randomUUID } from "node:crypto";
import { lstat, mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import type { CopilotNativeStart } from "@aux/contracts/native-copilot";
import type { CopilotAccount } from "../../apps/runtime/dist/services/copilot-account.js";
import {
  CopilotRuntime,
  type CopilotNativeOwner,
  type CopilotRuntimeDeps,
} from "../../apps/runtime/dist/services/copilot-runtime.js";

function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it("joins one original native retirement before concurrent close and retire release the volatile eligibility Home", async () => {
  const dataDir = await realpath(await mkdtemp(join(tmpdir(), "aux-copilot-runtime-lifecycle-")));
  const supportDirectory = join(dataDir, "provider-runtimes", "copilot-1.0.16-darwin-arm64");
  const executable = join(supportDirectory, "prebuilds/darwin-arm64/copilot-runtime");
  await mkdir(join(supportDirectory, "prebuilds/darwin-arm64"), {
    recursive: true,
    mode: 0o700,
  });
  // Filesystem identity fixture only: this file is never executed or accepted as a provider payload.
  await writeFile(executable, "Synthetic executable identity fixture; never execute.\n", { mode: 0o700 });
  const owner = randomUUID(),
    helperId = randomUUID();
  const account: CopilotAccount = {
    accountId: "a".repeat(64),
    clientId: "auxfixtureclient123",
    registrationRevision: randomUUID(),
    userId: "7",
    login: "fixture-person",
    authorizationGeneration: randomUUID(),
    credentialRevision: randomUUID(),
    accessToken: `gho_${"a".repeat(40)}`,
    scopes: [],
  };
  const endpointEntered = gate(),
    stopEntered = gate(),
    nativeJoined = gate();
  let preparedRequest: string | undefined;
  let preparation: CopilotNativeStart | undefined;
  let home: string | undefined;
  const start: CopilotNativeOwner["start"] = vi.fn(async (input: CopilotNativeStart) => {
    expect(input.token).toBe(owner);
    expect(input.accountId).toBe(account.accountId);
    expect(input.authorizationGeneration).toBe(account.authorizationGeneration);
    expect(input.credentialRevision).toBe(account.credentialRevision);
    if ("prepare" in input) {
      preparation = input;
      preparedRequest = input.requestId;
      return {
        requestId: input.requestId,
        helperId,
        state: "prepared" as const,
        launched: false as const,
      };
    }
    expect(input.requestId).toBe(preparedRequest);
    expect(input.helperId).toBe(helperId);
    home = join(dataDir, "copilot-homes", input.requestId);
    const rootStat = await lstat(supportDirectory, { bigint: true });
    const executableStat = await lstat(executable, { bigint: true });
    const homeStat = await lstat(home, { bigint: true });
    expect([input.runtimeDevice, input.runtimeInode]).toEqual([String(rootStat.dev), String(rootStat.ino)]);
    expect([input.executableDevice, input.executableInode]).toEqual([
      String(executableStat.dev),
      String(executableStat.ino),
    ]);
    expect([input.homeDevice, input.homeInode]).toEqual([String(homeStat.dev), String(homeStat.ino)]);
    expect(homeStat.mode & 0o777n).toBe(0o700n);
    expect(input.connectionToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    return {
      requestId: input.requestId,
      helperId,
      state: "started" as const,
      joined: false,
    };
  });
  const stop = vi.fn<CopilotNativeOwner["stop"]>(async (input) => {
    expect(input.token).toBe(owner);
    expect(input.requestId).toBe(preparedRequest);
    expect(input.helperId).toBe(helperId);
    if (!input.reconcile) {
      stopEntered.resolve();
      await nativeJoined.promise;
    }
    return {
      requestId: input.requestId,
      helperId,
      joined: true,
      launched: true,
      exitCode: 0,
      exitSignal: 0,
    };
  });
  const native: CopilotNativeOwner = {
    start,
    stop,
    endpoint: vi.fn(async (input) => {
      expect(input.token).toBe(owner);
      expect(input.requestId).toBe(preparedRequest);
      expect(input.helperId).toBe(helperId);
      endpointEntered.resolve();
      // No listener means no TCP preflight, SDK import, CLI, or provider operation.
      return { requestId: input.requestId, helperId, ready: false as const };
    }),
  };
  const accounts: CopilotRuntimeDeps["accounts"] = {
    lease: vi.fn(async () => {
      throw new Error("Volatile eligibility must not lease an unsaved account");
    }),
    assertCurrent: vi.fn(() => {
      throw new Error("Volatile eligibility must not assert a nonexistent saved account");
    }),
  };
  const current = vi.fn(async () => {});
  const runtime = new CopilotRuntime({
    dataDir,
    native,
    accounts,
    installer: {
      status: async () => ({
        path: executable,
        supportDirectory,
        assertCurrent: async () => {
          expect((await lstat(executable)).isFile()).toBe(true);
        },
      }),
    },
    checkOwner: async (token) => {
      expect(token).toBe(owner);
    },
  });
  const signal = new AbortController();
  let closeFinished = false,
    retireFinished = false;
  let closeWork: Promise<void> | undefined, retireWork: Promise<void> | undefined;
  const eligibility = runtime.eligible(account, signal.signal, owner, current).then(
    () => ({ completed: true }),
    (error: unknown) => ({ completed: false, error }),
  );
  try {
    await endpointEntered.promise;
    expect(preparation).toMatchObject({ prepare: true });
    expect(Object.keys(preparation!).sort()).toEqual([
      "accountId",
      "authorizationGeneration",
      "credentialRevision",
      "prepare",
      "requestId",
      "token",
    ]);
    expect(home).toBeDefined();
    const actualHome = home!;
    closeWork = runtime.close().then(() => {
      closeFinished = true;
    });
    retireWork = runtime.retire(account.accountId).then(() => {
      retireFinished = true;
    });
    await stopEntered.promise;
    await Promise.resolve();
    expect(closeFinished).toBe(false);
    expect(retireFinished).toBe(false);
    expect((await lstat(actualHome)).isDirectory()).toBe(true);
    expect(stop.mock.calls.filter(([input]) => !input.reconcile)).toHaveLength(1);
    nativeJoined.resolve();
    await Promise.all([closeWork, retireWork]);
    expect(closeFinished).toBe(true);
    expect(retireFinished).toBe(true);
    await expect(lstat(actualHome)).rejects.toMatchObject({ code: "ENOENT" });
    expect(stop.mock.calls.filter(([input]) => !input.reconcile)).toHaveLength(1);
    expect(await eligibility).toMatchObject({
      completed: false,
      error: { code: "cancelled" },
    });
    expect(accounts.lease).not.toHaveBeenCalled();
    expect(accounts.assertCurrent).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalled();
  } finally {
    nativeJoined.resolve();
    await Promise.allSettled([closeWork, retireWork, eligibility]);
    await runtime.close();
    await rm(dataDir, { recursive: true });
  }
});
