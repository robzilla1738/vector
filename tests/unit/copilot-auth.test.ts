import { expect, it, vi } from "vitest";
import { CopilotAuthService } from "../../apps/runtime/dist/services/copilot-auth.js";
import { CopilotAccounts } from "../../apps/runtime/dist/services/copilot-account.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
const registration = {
  clientId: "auxownedclient123",
  revision: "244f66be-ef10-4b0b-adab-38d49b15ad79",
};
function fixture(
  checkOwner: (owner: string, requester?: string) => Promise<void>,
) {
  let value: string | undefined;
  const network = vi.fn<typeof fetch>().mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          device_code: "fixture-held-original-device-code",
          user_code: "ABCD-EFGH",
          verification_uri: "https://github.com/login/device",
          expires_in: 900,
          interval: 5,
        }),
      ),
  );
  const accounts = new CopilotAccounts(
    {
      readSecret: async () => ({ value }),
      storeSecret: async (_name, next) => {
        value = next;
        return { ok: true };
      },
    },
    "78cf26de-9d82-469d-9dbc-7f6a55cb1b8e",
    async () => registration,
    async () => {},
    network,
  );
  const activate = vi.fn(async () => ({
    generation: "generation-1",
    rollback: async () => {},
  }));
  return {
    network,
    accounts,
    activate,
    auth: new CopilotAuthService({
      accounts,
      generation: () => "generation-1",
      registration: async () => registration,
      checkOwner,
      eligible: async () => {},
      activate,
      network,
    }),
  };
}
it("joins a pending original native owner lookup on close and never late-starts a device request", async () => {
  const owner = deferred<void>(),
    entered = deferred<void>();
  const f = fixture(async () => {
    entered.resolve();
    await owner.promise;
  });
  const started = f.auth.start("original-native-document").then(
    () => "accepted",
    (error: unknown) => error,
  );
  await entered.promise;
  let closed = false;
  const closing = f.auth.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(closed).toBe(false);
  owner.resolve();
  await closing;
  expect(await started).toMatchObject({ code: "cancelled" });
  expect(f.network).not.toHaveBeenCalled();
  expect(f.activate).not.toHaveBeenCalled();
  await f.accounts.close();
});
it("returns only the human challenge and cancellation joins the original unredeemed device code", async () => {
  const f = fixture(async (owner, requester) => {
    if (requester && requester !== owner)
      throw new Error("wrong native document");
  });
  const challenge = await f.auth.start("original-native-document");
  expect(challenge).toMatchObject({
    provider: "copilot",
    phase: "pending",
    userCode: "ABCD-EFGH",
    authorizationUrl: "https://github.com/login/device",
  });
  expect(challenge).not.toHaveProperty("deviceCode");
  await expect(
    f.auth.cancel(challenge.attemptId, "other-native-document"),
  ).rejects.toThrow("wrong native document");
  expect(
    (await f.auth.cancel(challenge.attemptId, "original-native-document"))
      .phase,
  ).toBe("cancelled");
  expect(f.network).toHaveBeenCalledTimes(1);
  expect(f.activate).not.toHaveBeenCalled();
  await f.auth.close();
  await f.accounts.close();
});
