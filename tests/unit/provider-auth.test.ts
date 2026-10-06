import { afterEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProviderAuthService, parseModelCatalog, SettingsService, openDb, Repo } from "@aux/runtime";

const services: ProviderAuthService[] = [];
const dispose: (() => Promise<void>)[] = [];
afterEach(async () => {
  await Promise.all(services.splice(0).map((service) => service.close()));
  for (const close of dispose.splice(0)) await close();
  vi.unstubAllGlobals();
});
function fixture(exchange: typeof fetch) {
  let generation = "original";
  const commit = vi.fn(async (_key: string, check: () => Promise<void>) => {
    await check();
  });
  const checkOwner = vi.fn(async (owner: string, requester?: string) => {
    if (owner !== "original-window" || (requester && requester !== owner)) throw new Error("Wrong window.");
  });
  const service = new ProviderAuthService({
    generation: () => generation,
    checkOwner,
    commit,
    fetch: exchange,
  });
  services.push(service);
  return {
    service,
    commit,
    replace: () => {
      generation = "replacement";
      service.invalidate();
    },
  };
}
function callback(authorizationUrl: string, state?: string) {
  const auth = new URL(authorizationUrl);
  const result = new URL(auth.searchParams.get("callback_url")!);
  result.searchParams.set("state", state ?? auth.searchParams.get("state")!);
  result.searchParams.set("code", "one-use-code");
  return result.href;
}

it("uses the official S256 exchange and exposes no credential in its receipt", async () => {
  let exchanged: Record<string, string> | undefined;
  const request = vi.fn<typeof fetch>(async (url, init) => {
    expect(url).toBe("https://openrouter.ai/api/v1/auth/keys");
    expect(init?.redirect).toBe("error");
    exchanged = JSON.parse(String(init?.body));
    return Response.json({ key: "fixture-account-key" });
  });
  const f = fixture(request);
  const attempt = await f.service.start("original-window");
  const auth = new URL(attempt.authorizationUrl);
  expect(auth.searchParams.get("code_challenge_method")).toBe("S256");
  expect((await fetch(callback(attempt.authorizationUrl))).status).toBe(200);
  await vi.waitFor(async () =>
    expect((await f.service.status(attempt.attemptId, "original-window")).phase).toBe("connected"),
  );
  expect(exchanged?.code).toBe("one-use-code");
  expect(createHash("sha256").update(exchanged!.code_verifier!).digest("base64url")).toBe(
    auth.searchParams.get("code_challenge"),
  );
  expect(request).toHaveBeenCalledTimes(1);
  expect(f.commit).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(await f.service.status(attempt.attemptId, "original-window"))).not.toContain(
    "fixture-account-key",
  );
});

it("refuses invalid state and a different original window without consuming the callback", async () => {
  const request = vi.fn<typeof fetch>(async () => Response.json({ key: "fixture-key" }));
  const f = fixture(request);
  const attempt = await f.service.start("original-window");
  expect((await fetch(callback(attempt.authorizationUrl, "é".repeat(43)))).status).toBe(400);
  await expect(f.service.cancel(attempt.attemptId, "replacement-window")).rejects.toThrow("Wrong window");
  expect(request).not.toHaveBeenCalled();
  expect((await f.service.status(attempt.attemptId, "original-window")).phase).toBe("pending");
});

it("cancels an in-flight exchange on account replacement and never saves its late key", async () => {
  let deliver!: (response: Response) => void;
  const request = vi.fn<typeof fetch>(
    () =>
      new Promise((resolve) => {
        deliver = resolve;
      }),
  );
  const f = fixture(request);
  const attempt = await f.service.start("original-window");
  await fetch(callback(attempt.authorizationUrl));
  await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
  f.replace();
  deliver(Response.json({ key: "late-key" }));
  await f.service.close();
  expect(f.commit).not.toHaveBeenCalled();
});

it("reads OpenRouter native capability and per-token price fields", () => {
  const [model] = parseModelCatalog(
    {
      data: [
        {
          id: "anthropic/claude-sonnet-5.5",
          context_length: 1000000,
          architecture: { input_modalities: ["text", "image"] },
          top_provider: { max_completion_tokens: 128000 },
          pricing: { prompt: "0.000003", completion: "0.000015" },
        },
      ],
    },
    "openrouter",
  );
  expect(model).toMatchObject({
    contextTokens: 1000000,
    maxOutputTokens: 128000,
    modalities: ["text", "image"],
    inputUsdPerMTok: 3,
    outputUsdPerMTok: 15,
  });
});

it("rolls back only the cancelled secret write before a later queued user replacement", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-provider-auth-"));
  const db = openDb(":memory:");
  const settings = new SettingsService(new Repo(db), join(dir, "settings.json"), {});
  dispose.push(async () => {
    acknowledge?.();
    await settings.close();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const writes: string[] = [];
  let secret = "";
  let acknowledge!: () => void;
  const heldAck = new Promise<void>((resolve) => {
    acknowledge = resolve;
  });
  settings.attachNative({
    available: () => true,
    turnSourceContext: async () => ({ windowId: "original-window", activePageId: null }),
    storeSecret: async (_name: string, key: string) => {
      secret = key;
      writes.push(key);
      if (key === "account-key") await heldAck;
      return { ok: true };
    },
  } as never);
  await settings.set({ modelCredential: { provider: "openrouter", key: "previous-key" } });
  const realFetch = fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>((url, init) =>
      String(url) === "https://openrouter.ai/api/v1/auth/keys"
        ? Promise.resolve(Response.json({ key: "account-key" }))
        : realFetch(url, init),
    ),
  );
  const attempt = await settings.startProviderAuth("original-token");
  await fetch(callback(attempt.authorizationUrl));
  await vi.waitFor(() => expect(secret).toBe("account-key"));
  const cancelled = settings.cancelProviderAuth(attempt.attemptId, "original-token");
  // Let the native owner readback cancel the exact in-flight receipt first.
  await vi.waitFor(async () =>
    expect((await settings.providerAuthStatus(attempt.attemptId, "original-token")).phase).toBe("cancelled"),
  );
  const replacement = settings.set({ modelCredential: { provider: "openrouter", key: "later-user-key" } });
  acknowledge();
  await cancelled;
  await replacement;
  expect(writes).toEqual(["previous-key", "account-key", "previous-key", "later-user-key"]);
  expect(secret).toBe("later-user-key");
  expect(settings.modelProvider()).toBe("gateway");
});
