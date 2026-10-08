import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { openDb, Repo, SettingsService, chatgptAccountId } from "@aux/runtime";
import {
  PrivateProviderConnection,
  registerPrivateProviderBroker,
} from "../../apps/runtime/dist/services/private-provider.js";
import type {
  PrivateProviderDescriptor,
  PrivateProviderRequest,
  PrivateProviderResult,
} from "@aux/contracts/private-provider";
const cleanups: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanups.splice(0).reverse()) await close();
  vi.unstubAllGlobals();
});
function settings(env: NodeJS.ProcessEnv = {}) {
  const dir = mkdtempSync(join(tmpdir(), "aux-private-provider-")),
    db = openDb(":memory:"),
    repo = new Repo(db),
    path = join(dir, "settings.json");
  const service = new SettingsService(repo, path, env);
  cleanups.push(
    () => rmSync(dir, { recursive: true, force: true }),
    () => db.close(),
    () => service.close(),
  );
  return { service, repo, db, path };
}
const descriptor: PrivateProviderDescriptor = {
  revision: "original",
  provider: "openai",
  authentication: "api-key",
  credentialSource: "environment",
  endpoint: "https://api.openai.com/v1",
  plannerModel: "fixture-model",
  agentModelRoutes: {},
  models: [{ id: "fixture-model", source: "configured" }],
  localModelsOnly: false,
};
it("adopts the selected loaded environment connection without persisting its key or changing normal preferences", async () => {
  const normal = settings({
    AI_GATEWAY_API_KEY: "synthetic-environment-key",
    AUX_PLANNER_MODEL: "selected-model",
  });
  writeFileSync(normal.path, '{"plannerModel":"saved-file-model"}');
  const privateSettings = settings({ AUX_PRIVATE_SESSION: randomUUID() });
  const requests: PrivateProviderRequest[] = [];
  await privateSettings.service.attachPrivateProvider(async (request) => {
    requests.push(request);
    return normal.service.privateProviderRequest(request);
  });
  expect(privateSettings.service.all()).toMatchObject({
    modelConfigured: true,
    modelProvider: "gateway",
    plannerModel: "selected-model",
    modelCredentialSource: "environment",
  });
  expect(privateSettings.service.all().modelConnections.find((c) => c.selected)?.credentialSource).toBe(
    "environment",
  );
  expect(existsSync(privateSettings.path)).toBe(false);
  expect(JSON.stringify(privateSettings.db.prepare("SELECT * FROM kv").all())).not.toContain(
    "synthetic-environment-key",
  );
  expect(readFileSync(normal.path, "utf8")).toBe('{"plannerModel":"saved-file-model"}');
  expect(requests).toEqual([{ operation: "describe" }]);
  const described = await normal.service.privateProviderRequest({ operation: "describe" });
  if (described.operation !== "describe" || !described.connection)
    throw new Error("Missing fixture connection");
  normal.repo.setSetting("modelCacheGeneration", randomUUID());
  await expect(
    normal.service.privateProviderRequest({
      operation: "credential",
      revision: described.connection.revision,
    }),
  ).rejects.toMatchObject({ code: "cancelled" });
});
it("sends private content only to the actual provider and drops a credential returned after cancellation", async () => {
  const requests: PrivateProviderRequest[] = [];
  const network = vi.fn<typeof fetch>(async (_input, init) => {
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer actual-owner-key");
    expect(String(init?.body)).toContain("private prompt sentinel");
    expect(init?.redirect).toBe("error");
    return Response.json({ error: { message: "Fixture refuses inference" } }, { status: 401 });
  });
  const connection = new PrivateProviderConnection(
    descriptor,
    async (request) => {
      requests.push(request);
      return { operation: "credential", revision: descriptor.revision, accessToken: "actual-owner-key" };
    },
    network,
  );
  cleanups.push(() => connection.close());
  await expect(
    connection.model(() => {}).generateText({ modelId: "fixture-model", prompt: "private prompt sentinel" }),
  ).rejects.toThrow();
  expect(network).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(requests)).not.toContain("private prompt sentinel");
  let release!: (value: PrivateProviderResult) => void, entered!: () => void;
  const entering = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const waiting = new PrivateProviderConnection(
    descriptor,
    async () => {
      entered();
      return new Promise((resolve) => {
        release = resolve;
      });
    },
    network,
  );
  const pending = waiting
    .model(() => {})
    .generateText({ modelId: "fixture-model", prompt: "cancelled private prompt" });
  await entering;
  await waiting.close();
  release({ operation: "credential", revision: descriptor.revision, accessToken: "late-key" });
  await expect(pending).rejects.toThrow();
  expect(network).toHaveBeenCalledTimes(1);
});
it("refreshes the selected ChatGPT account only in the normal owner and exports no rotating refresh token", async () => {
  const normal = settings(),
    privateSettings = settings({ AUX_PRIVATE_SESSION: randomUUID() }),
    hostId = randomUUID(),
    accountId = chatgptAccountId("oaiapp_aux_fixture", "fixture-account");
  normal.repo.setSetting("modelProvider", "openai");
  normal.repo.setSetting("providerModels", { openai: { plannerModel: "account-model" } });
  normal.repo.setSetting("chatgptHostId", hostId);
  normal.repo.setSetting("chatgptActiveAccount", accountId);
  let vault = JSON.stringify({
    version: 1,
    hostId,
    selected: accountId,
    accounts: [
      {
        accountId,
        clientId: "oaiapp_aux_fixture",
        subject: "fixture-account",
        accessToken: "expired-access",
        refreshToken: "original-refresh",
        expiresAt: 0,
        scopes: ["chatgpt.tokens.use.direct", "resource.invoke"],
      },
    ],
  });
  const store = vi.fn(async (_key: string, value: string) => {
    vault = value;
    return { ok: true as const };
  });
  normal.service.attachNative({
    available: () => true,
    readSecret: async (name: string) => ({ value: name === "model-chatgpt-accounts" ? vault : undefined }),
    storeSecret: store,
  } as never);
  let refreshedWith: string | null = null;
  const network = vi.fn<typeof fetch>(async (input, init) => {
    if (String(input).endsWith("/oauth/token")) {
      refreshedWith = new URLSearchParams(String(init?.body)).get("refresh_token");
      return Response.json({
        access_token: "fresh-access",
        refresh_token: "rotated-refresh",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "resource.invoke chatgpt.tokens.use.direct",
      });
    }
    return Response.json({ models: [{ slug: "account-model", visibility: "list" }] });
  });
  vi.stubGlobal("fetch", network);
  const replies: PrivateProviderResult[] = [];
  await privateSettings.service.attachPrivateProvider(async (request) => {
    const result = await normal.service.privateProviderRequest(request);
    replies.push(result);
    return result;
  });
  const reply = replies[0]!;
  if (reply.operation !== "describe" || !reply.connection) throw new Error("Missing account connection");
  const credentials = await Promise.all([
    normal.service.privateProviderRequest({ operation: "credential", revision: reply.connection.revision }),
    normal.service.privateProviderRequest({ operation: "credential", revision: reply.connection.revision }),
  ]);
  expect(credentials).toEqual(
    Array(2).fill({
      operation: "credential",
      revision: reply.connection.revision,
      accessToken: "fresh-access",
    }),
  );
  expect(refreshedWith).toBe("original-refresh");
  expect(network.mock.calls.filter(([input]) => String(input).endsWith("/oauth/token"))).toHaveLength(1);
  expect(network.mock.calls.filter(([input]) => String(input).endsWith("/models"))).toHaveLength(1);
  expect(store).toHaveBeenCalledTimes(1);
  expect(vault).toContain("rotated-refresh");
  expect(JSON.stringify([...replies, ...credentials])).not.toContain("refresh");
  expect(JSON.stringify(privateSettings.db.prepare("SELECT * FROM kv").all())).not.toContain("fresh-access");
  expect(privateSettings.service.all()).toMatchObject({
    modelAuthentication: "chatgpt",
    modelConfigured: true,
    modelEndpoint: reply.connection.endpoint,
  });
});
it("rejects content or arbitrary account selectors at the host-only credential boundary and retires late replies", async () => {
  let handler!: (input: unknown) => Promise<unknown>, release!: (value: PrivateProviderResult) => void;
  const request = vi.fn(
    async () =>
      new Promise<PrivateProviderResult>((resolve) => {
        release = resolve;
      }),
  );
  const close = registerPrivateProviderBroker(
    {
      onMethod: (_name: string, fn: (input: unknown) => Promise<unknown>) => {
        handler = fn as typeof handler;
      },
    } as never,
    { current: () => true, request },
  );
  await expect(
    handler({ sessionId: randomUUID(), request: { operation: "describe", prompt: "private" } }),
  ).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
  const pending = handler({ sessionId: randomUUID(), request: { operation: "describe" } });
  await Promise.resolve();
  close();
  release({ operation: "describe", connection: null });
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
});
