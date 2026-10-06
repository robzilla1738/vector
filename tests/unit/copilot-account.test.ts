import { describe, expect, it, vi } from "vitest";
import { CopilotAccounts } from "../../apps/runtime/dist/services/copilot-account.js";
import { copilotGrant } from "../../apps/runtime/dist/services/copilot-protocol.js";

const host = "78cf26de-9d82-469d-9dbc-7f6a55cb1b8e";
const registration = {
  clientId: "auxownedclient123",
  revision: "244f66be-ef10-4b0b-adab-38d49b15ad79",
};
const token = (suffix: string) => `gho_${suffix.repeat(40)}`;
const rotated = {
  token_type: "bearer",
  access_token: token("b"),
  refresh_token: `ghr_${"c".repeat(40)}`,
  expires_in: 28800,
  refresh_token_expires_in: 15897600,
  scope: "",
};
function vault(network: typeof fetch) {
  let secret: string | undefined;
  const native = {
    readSecret: vi.fn(async () => ({ value: secret })),
    storeSecret: vi.fn(async (_key: string, value: string) => {
      secret = value;
      return { ok: true as const };
    }),
  };
  const retire = vi.fn(async () => {});
  return {
    native,
    retire,
    read: () => secret,
    accounts: new CopilotAccounts(
      native,
      host,
      async () => registration,
      retire,
      network,
    ),
  };
}
function response(value: unknown) {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
}
const check = async () => {};
const eligible = async () => {};

describe("owned Copilot account vault", () => {
  it("fails closed on malformed saved credentials and clears them only through explicit original-human recovery", async () => {
    const v = vault(vi.fn<typeof fetch>());
    await v.native.storeSecret(
      "model-copilot-accounts",
      "fixture-corrupt-vault",
    );
    v.native.storeSecret.mockClear();
    await expect(v.accounts.initialize()).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(v.native.storeSecret).not.toHaveBeenCalled();
    await expect(
      v.accounts.clearSaved(async () => {
        throw new Error("original owner retired");
      }),
    ).rejects.toThrow("original owner retired");
    expect(v.read()).toBe("fixture-corrupt-vault");
    await v.accounts.clearSaved(check);
    expect(v.accounts.summaries()).toEqual([]);
    expect(v.retire).toHaveBeenCalledTimes(1);
    await v.accounts.close();
  });
  it("joins one rotating refresh and preserves exact GitHub identity and token lease", async () => {
    const network = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      if (String(input) === "https://api.github.com/user")
        return response({ id: 7, login: "fixture-person" });
      return response(rotated);
    });
    const v = vault(network);
    const grant = copilotGrant({
      ...rotated,
      access_token: token("a"),
      expires_in: 1,
    });
    const original = await v.accounts.install(
      grant,
      registration,
      check,
      eligible,
    );
    const [a, b] = await Promise.all([
      v.accounts.lease(original.account.accountId),
      v.accounts.lease(original.account.accountId),
    ]);
    expect(a.accessToken).toBe(rotated.access_token);
    expect(a.credentialRevision).toBe(b.credentialRevision);
    expect(a.authorizationGeneration).toBe(
      original.account.authorizationGeneration,
    );
    expect(
      network.mock.calls.filter(
        ([input]) =>
          String(input) === "https://github.com/login/oauth/access_token",
      ),
    ).toHaveLength(1);
    const sent = network.mock.calls.find(([input]) =>
      String(input).endsWith("/login/oauth/access_token"),
    )?.[1];
    expect(new URLSearchParams(String(sent?.body)).has("client_secret")).toBe(
      false,
    );
    await v.accounts.close();
    expect(a.signal.aborted).toBe(true);
  });
  it("refuses a different refreshed user while retaining only the protected unselected rotated grant", async () => {
    let identities = 0;
    const network = vi.fn<typeof fetch>().mockImplementation(async (input) =>
      String(input).endsWith("/user")
        ? response({
            id: ++identities === 1 ? 7 : 8,
            login: "fixture-person",
          })
        : response(rotated),
    );
    const v = vault(network);
    const original = await v.accounts.install(
      copilotGrant({ ...rotated, access_token: token("a"), expires_in: 1 }),
      registration,
      check,
      eligible,
    );
    await expect(
      v.accounts.lease(original.account.accountId),
    ).rejects.toMatchObject({ code: "permission_denied" });
    expect(JSON.parse(v.read()!)).toMatchObject({
      accounts: [
        { accessToken: rotated.access_token, reconciliation: "rotated-grant" },
      ],
    });
    expect(JSON.parse(v.read()!).selected).toBeUndefined();
    expect(v.accounts.summaries()[0]).toMatchObject({
      selected: false,
      connected: false,
      needsReauthentication: true,
    });
    await v.accounts.close();
  });
  it("does not roll back a later accepted account with an earlier cancelled receipt", async () => {
    const network = vi
      .fn<typeof fetch>()
      .mockImplementation(async () =>
        response({ id: 7, login: "fixture-person" }),
      );
    const v = vault(network);
    const a = await v.accounts.install(
      copilotGrant(rotated),
      registration,
      check,
      eligible,
    );
    const b = await v.accounts.install(
      copilotGrant({ ...rotated, access_token: token("d") }),
      registration,
      check,
      eligible,
    );
    expect(await a.rollback()).toBe(false);
    expect((await v.accounts.lease(b.account.accountId)).accessToken).toBe(
      token("d"),
    );
    await v.accounts.close();
  });
  it("keeps a failed actual SDK retirement unauthorized and retries that same sign-out", async () => {
    const v = vault(
      vi
        .fn<typeof fetch>()
        .mockImplementation(async () =>
          response({ id: 7, login: "fixture-person" }),
        ),
    );
    const installed = await v.accounts.install(
      copilotGrant(rotated),
      registration,
      check,
      eligible,
    );
    v.retire.mockRejectedValueOnce(new Error("fixture unjoined helper"));
    await expect(
      v.accounts.disconnect(installed.account.accountId, check),
    ).rejects.toThrow("fixture unjoined helper");
    await expect(
      v.accounts.lease(installed.account.accountId),
    ).rejects.toMatchObject({ code: "cancelled" });
    expect(
      await v.accounts.disconnect(installed.account.accountId, check),
    ).toEqual({ disconnected: true, revocationConfirmed: false });
    expect(v.accounts.summaries()).toEqual([]);
    await v.accounts.close();
  });
});

it("keeps a refused rotated grant protected across restart and never restores or leases its revoked original pair", async () => {
  const network = vi
    .fn<typeof fetch>()
    .mockImplementation(async (input) =>
      String(input).endsWith("/user")
        ? response({ id: 7, login: "fixture-person" })
        : response(rotated),
    );
  const v = vault(network);
  const original = await v.accounts.install(
    copilotGrant({ ...rotated, access_token: token("a"), expires_in: 1 }),
    registration,
    check,
    eligible,
  );
  const store = v.native.storeSecret.getMockImplementation();
  if (!store) throw new Error("Missing actual fixture store");
  v.native.storeSecret.mockImplementation(async (key, value) => {
    const next = JSON.parse(value);
    if (
      next.selected === original.account.accountId &&
      next.accounts[0]?.accessToken === rotated.access_token
    )
      throw new Error("fixture refused final rotated acceptance");
    return store(key, value);
  });
  await expect(v.accounts.lease(original.account.accountId)).rejects.toThrow(
    "fixture refused final rotated acceptance",
  );
  const saved = v.read();
  expect(saved).toContain(rotated.access_token);
  expect(saved).not.toContain(token("a"));
  expect(JSON.parse(saved!).selected).toBeUndefined();
  expect(v.accounts.summaries()[0]).toMatchObject({
    connected: false,
    selected: false,
    needsReauthentication: true,
  });
  await v.accounts.close();
  const restarted = new CopilotAccounts(
    v.native,
    host,
    async () => registration,
    v.retire,
    network,
  );
  await restarted.initialize();
  await expect(
    restarted.lease(original.account.accountId),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(
    network.mock.calls.filter(([input]) =>
      String(input).endsWith("/login/oauth/access_token"),
    ),
  ).toHaveLength(1);
  expect(v.read()).toBe(saved);
  await restarted.close();
});

it("poisons unexpected native-vault mutation on rollback and immediately retires original token leases", async () => {
  const network = vi
    .fn<typeof fetch>()
    .mockImplementation(async () =>
      response({ id: 7, login: "fixture-person" }),
    );
  const v = vault(network);
  const original = await v.accounts.install(
    copilotGrant(rotated),
    registration,
    check,
    eligible,
  );
  const lease = await v.accounts.lease(original.account.accountId);
  await v.native.storeSecret(
    "model-copilot-accounts",
    "fixture unexpected outside writer",
  );
  const writes = v.native.storeSecret.mock.calls.length;
  await expect(original.rollback()).rejects.toMatchObject({ code: "conflict" });
  expect(lease.signal.aborted).toBe(true);
  await expect(
    v.accounts.lease(original.account.accountId),
  ).rejects.toMatchObject({ code: "cancelled" });
  expect(v.native.storeSecret.mock.calls).toHaveLength(writes);
  expect(v.read()).toBe("fixture unexpected outside writer");
  await v.accounts.close();
});

it("retires selected authority before a refresh dispatch whose successful response is malformed", async () => {
  let inspectDispatch: (() => void) | undefined;
  const network = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    if (String(input).endsWith("/user"))
      return response({ id: 7, login: "fixture-person" });
    inspectDispatch?.();
    return response({
      token_type: "bearer",
      access_token: "malformed rotated grant",
    });
  });
  const v = vault(network);
  const original = await v.accounts.install(
    copilotGrant({ ...rotated, access_token: token("a"), expires_in: 1 }),
    registration,
    check,
    eligible,
  );
  inspectDispatch = () => {
    expect(JSON.parse(v.read()!).selected).toBeUndefined();
    expect(v.accounts.summaries()[0]).toMatchObject({
      connected: false,
      needsReauthentication: true,
    });
    expect(v.retire).toHaveBeenCalledWith(original.account.accountId);
  };
  await expect(v.accounts.lease(original.account.accountId)).rejects.toThrow();
  const saved = v.read();
  expect(JSON.parse(saved!).accounts[0].reconciliation).toBe(
    "refresh-uncertain",
  );
  await v.accounts.close();
  const restarted = new CopilotAccounts(
    v.native,
    host,
    async () => registration,
    v.retire,
    network,
  );
  await restarted.initialize();
  await expect(
    restarted.lease(original.account.accountId),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(
    network.mock.calls.filter(([input]) =>
      String(input).endsWith("/login/oauth/access_token"),
    ),
  ).toHaveLength(1);
  expect(v.read()).toBe(saved);
  await restarted.close();
});
