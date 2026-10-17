import { modelUndispatched } from "../../apps/runtime/dist/agent/model-client.js";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError } from "@aux/contracts";
import { openDb, Repo, SettingsService, chatgptAccountId } from "@aux/runtime";
import {
  PrivateProviderConnection,
  registerPrivateProviderBroker,
} from "../../apps/runtime/dist/services/private-provider.js";
import { PrivateProviderDescriptorSchema } from "@aux/contracts/private-provider";
import { CustomModelApiSchema } from "@aux/contracts";
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
for (const api of CustomModelApiSchema.options) {
  it.each([true, false])(
    `preserves custom ${api} protocol and authentication=%s in private inference`,
    async (authHeader) => {
      const selected = PrivateProviderDescriptorSchema.parse({
        ...descriptor,
        provider: "openai-compatible",
        customApi: api,
        customAuthHeader: authHeader,
        endpoint: "https://custom.example.test/v1",
      });
      const requests: PrivateProviderRequest[] = [];
      const network = vi.fn<typeof fetch>(async (input, init) => {
        const url = new URL(input instanceof Request ? input.url : String(input));
        expect(url.origin).toBe("https://custom.example.test");
        expect(url.pathname).toBe(
          {
            "openai-completions": "/v1/chat/completions",
            "openai-responses": "/v1/responses",
            "anthropic-messages": "/v1/messages",
            "google-generative-ai": "/v1/models/fixture-model:streamGenerateContent",
          }[api],
        );
        const headers = new Headers(init?.headers);
        const header =
          api === "anthropic-messages"
            ? "x-api-key"
            : api === "google-generative-ai"
              ? "x-goog-api-key"
              : "authorization";
        expect(headers.get(header)).toBe(
          authHeader
            ? header === "authorization"
              ? "Bearer synthetic-private-key"
              : "synthetic-private-key"
            : null,
        );
        expect(["authorization", "x-api-key", "x-goog-api-key"].filter((name) => headers.has(name))).toEqual(
          authHeader ? [header] : [],
        );
        expect(init?.redirect).toBe("error");
        expect(String(init?.body)).toContain("Private content stays at the endpoint");
        return Response.json({ error: { message: "Synthetic inference refusal" } }, { status: 401 });
      });
      const connection = new PrivateProviderConnection(
        selected,
        async (request) => {
          requests.push(request);
          return {
            operation: "credential",
            revision: selected.revision,
            accessToken: "synthetic-private-key",
          };
        },
        network,
      );
      cleanups.push(() => connection.close());
      await expect(
        connection
          .model(() => {})
          .generateText({
            modelId: "fixture-model",
            maxAttempts: 1,
            prompt: "Private content stays at the endpoint",
          }),
      ).rejects.toThrow();
      expect(network).toHaveBeenCalledTimes(1);
      expect(requests).toEqual([{ operation: "credential", revision: selected.revision }]);
    },
  );
}
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
  expect(privateSettings.service.all().modelConnectionRevision).toBe(described.connection.revision);
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
  let refusal: unknown;
  try {
    await pending;
  } catch (error) {
    refusal = error;
  }
  expect(modelUndispatched(refusal)).toBe(true);
  expect(network).toHaveBeenCalledTimes(1);
});
it.each([
  descriptor,
  { ...descriptor, provider: "gateway" as const, endpoint: "https://ai-gateway.vercel.sh" },
  { ...descriptor, authentication: "chatgpt" as const, accountId: "original-account" },
])("uses the selected $provider/$authentication route without a website-action review", async (selected) => {
  const checkOriginal = vi.fn(),
    authorizeDestination = vi.fn(async () => {
      throw new Error("An agent-selected website action would need review.");
    }),
    network = vi.fn<typeof fetch>(async (input, init) => {
      expect(new URL(input instanceof Request ? input.url : String(input)).origin).toBe(
        new URL(selected.endpoint).origin,
      );
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer original-key");
      expect(init?.redirect).toBe("error");
      return Response.json({ error: { message: "Fixture refuses inference" } }, { status: 401 });
    });
  const connection = new PrivateProviderConnection(
    selected,
    async () => ({ operation: "credential", revision: selected.revision, accessToken: "original-key" }),
    network,
  );
  cleanups.push(() => connection.close());
  await expect(
    connection
      .model(() => {})
      .generateText({
        modelId: "fixture-model",
        prompt: "Private question",
        maxAttempts: 1,
        source: {
          runId: "original-run",
          nativeTurnContext: "original-document",
          checkOriginal,
          authorizeDestination,
        },
      }),
  ).rejects.toThrow();
  expect(network).toHaveBeenCalledTimes(1);
  expect(checkOriginal).toHaveBeenCalled();
  expect(authorizeDestination).not.toHaveBeenCalled();
});
it("refuses a transport outside the authenticated provider destination before requesting credentials", async () => {
  const credentials = vi.fn(async () => ({
    operation: "credential" as const,
    revision: descriptor.revision,
    accessToken: "original-key",
  }));
  const network = vi.fn<typeof fetch>();
  const connection = new PrivateProviderConnection(
    { ...descriptor, endpoint: "https://different.example/v1" },
    credentials,
    network,
  );
  cleanups.push(() => connection.close());
  await expect(
    connection
      .model(() => {})
      .generateText({ modelId: "fixture-model", prompt: "Private question", maxAttempts: 1 }),
  ).rejects.toThrow();
  expect(credentials).not.toHaveBeenCalled();
  expect(network).not.toHaveBeenCalled();
});
it("preserves the original local suspension through SDK wrapping before any network dispatch", async () => {
  const suspension = new AuxError("needs_input", "Reconnect the original account.", { original: true });
  const network = vi.fn<typeof fetch>();
  const connection = new PrivateProviderConnection(
    descriptor,
    async () => {
      throw suspension;
    },
    network,
  );
  cleanups.push(() => connection.close());
  await expect(
    connection
      .model(() => {})
      .generateText({ modelId: "fixture-model", prompt: "Private question", maxAttempts: 1 }),
  ).rejects.toBe(suspension);
  expect(modelUndispatched(suspension)).toBe(true);
  expect(network).not.toHaveBeenCalled();
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
  expect(network.mock.calls.filter(([input]) => String(input).endsWith("/models"))).toHaveLength(0);
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
  let revision = "one",
    changed = () => {};
  const notify = vi.fn();
  const close = registerPrivateProviderBroker(
    {
      notify,
      onMethod: (_name: string, fn: (input: unknown) => Promise<unknown>) => {
        handler = fn as typeof handler;
      },
    } as never,
    {
      current: () => true,
      revision: () => revision,
      subscribe: (fn) => {
        changed = fn;
        return () => {};
      },
      request,
    },
  );
  await expect(
    handler({ sessionId: randomUUID(), request: { operation: "describe", prompt: "private" } }),
  ).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
  changed();
  expect(notify).not.toHaveBeenCalled();
  revision = "two";
  changed();
  expect(notify).toHaveBeenCalledWith("privateProviderChanged", {});
  const pending = handler({ sessionId: randomUUID(), request: { operation: "describe" } });
  await Promise.resolve();
  close();
  release({ operation: "describe", connection: null });
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
});

it("aborts an already dispatched private provider stream on original-owner revocation", async () => {
  const normal = settings({ OPENAI_API_KEY: "original-key" });
  normal.repo.setSetting("modelProvider", "openai");
  const privateSettings = settings({ AUX_PRIVATE_SESSION: randomUUID() });
  let entered!: () => void, dispatchedSignal: AbortSignal | undefined;
  const dispatch = new Promise<void>((resolve) => {
    entered = resolve;
  });
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (_input, init) => {
      dispatchedSignal = init!.signal!;
      entered();
      return new Promise<Response>((_resolve, reject) => {
        dispatchedSignal!.addEventListener("abort", () => reject(dispatchedSignal!.reason), { once: true });
      });
    }),
  );
  await privateSettings.service.attachPrivateProvider((request) =>
    normal.service.privateProviderRequest(request),
  );
  const pending = privateSettings.service
    .model()!
    .generateText({ modelId: "gpt-5.4", prompt: "private stream" });
  const stopped = expect(pending).rejects.toThrow();
  await dispatch;
  const stop = normal.service.subscribeConnectionChanges(() => {
    void privateSettings.service.invalidatePrivateProvider();
  });
  cleanups.push(stop);
  await normal.service.set({ modelConnection: { provider: "openai", enabled: false } });
  await stopped;
  expect(dispatchedSignal?.aborted).toBe(true);
  expect(privateSettings.service.all().modelConfigured).toBe(false);
});

it("accepts the owner's full selected catalog without an unrelated model-count cutoff", () => {
  expect(
    PrivateProviderDescriptorSchema.parse({
      ...descriptor,
      models: Array.from({ length: 1001 }, (_, index) => ({
        id: `configured-${index}`,
        source: "configured",
      })),
    }).models,
  ).toHaveLength(1001);
});

it("notifies only committed provider changes, including Copilot acceptance, rollback and disconnect", async () => {
  const normal = settings({ OPENAI_API_KEY: "original-key" });
  const changes: Array<{ active: unknown; generation: string }> = [];
  const stop = normal.service.subscribeConnectionChanges(() =>
    changes.push({
      active: normal.repo.getSetting("copilotActiveAccount"),
      generation: normal.service.copilotGeneration(),
    }),
  );
  await normal.service.set({ toolbarAutoHide: true });
  normal.service.registryModels();
  expect(changes).toEqual([]);
  const accountId = "a".repeat(64);
  const accepted = await normal.service.activateCopilotAccount({ accountId } as never, async () => {});
  expect(changes).toEqual([{ active: accountId, generation: accepted.generation }]);
  await accepted.rollback();
  expect(changes.at(-1)?.active).toBeUndefined();
  await normal.service.activateCopilotAccount({ accountId } as never, async () => {});
  await normal.service.deactivateCopilotAccount(accountId, async () => {});
  expect(changes).toHaveLength(4);
  expect(changes.at(-1)?.active).toBeUndefined();
  stop();
  await normal.service.set({ modelProvider: "openai" });
  expect(changes).toHaveLength(4);
});
