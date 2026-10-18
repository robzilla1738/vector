import { expect, it, vi } from "vitest";
import { McpOAuthService } from "../../apps/runtime/src/services/mcp-oauth.js";

type Tokens = { access_token: string; refresh_token: string; token_type: string; expires_in?: number };
type Provider = {
  tokens(): Tokens | undefined | Promise<Tokens | undefined>;
  saveTokens(tokens: Tokens): void | Promise<void>;
};

function fixture(discover?: ConstructorParameters<typeof McpOAuthService>[3]) {
  const server = {
    serverId: "55555555-5555-4555-8555-555555555555",
    workspaceId: "workspace",
    name: "Retirement fixture",
    source: { kind: "remote" as const, url: "https://mcp.example.test/mcp", auth: "oauth" as const },
    state: "active" as const,
    toolsRevision: 0,
    disabledTools: [],
    toolNames: [],
    sourceDigest: "a".repeat(64),
    createdAt: 1,
    updatedAt: 1,
  };
  const secrets = new Map<string, string>();
  const seed = (source = server) => {
    secrets.set(
      `mcp-oauth-${source.serverId}`,
      JSON.stringify({
        serverId: source.serverId,
        sourceDigest: source.sourceDigest,
        issuer: "https://auth.example.test",
        tokenEndpoint: "https://auth.example.test/token",
        clients: {},
        tokens: { access_token: "expired-access", refresh_token: source.serverId, token_type: "Bearer" },
        expiresAt: 1,
      }),
    );
  };
  seed();
  const native = {
    readSecret: vi.fn(async (name: string) => ({ value: secrets.get(name) })),
    storeSecret: vi.fn(async (name: string, value: string) => {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    }),
  };
  const requests: { signal: AbortSignal; refreshToken: string; finish(response: Response): void }[] = [];
  const network = vi.fn<typeof fetch>(
    async (_url, init) =>
      new Promise<Response>((finish) => {
        requests.push({
          signal: init!.signal!,
          refreshToken: new URLSearchParams(init?.body as URLSearchParams).get("refresh_token")!,
          finish,
        });
      }),
  );
  const runAuth = vi.fn(async (provider: Provider, options: { fetchFn: typeof fetch }) => {
    const response = await options.fetchFn("https://auth.example.test/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: (await provider.tokens())?.refresh_token ?? "setup",
      }),
    });
    const tokens = (await response.json()) as Tokens;
    await provider.saveTokens(tokens);
    return "AUTHORIZED";
  });
  const service = new McpOAuthService(native, network, runAuth as never, discover);
  const finish = (index: number) =>
    requests[index]!.finish(
      Response.json({
        access_token: `new-access-${index}`,
        refresh_token: `new-refresh-${index}`,
        token_type: "Bearer",
        expires_in: 3600,
      }),
    );
  return { server, secrets, seed, native, requests, network, runAuth, service, finish };
}

it.each(["disconnect", "close"] as const)(
  "%s aborts and joins the one original refresh shared by multiple waiters",
  async (action) => {
    const f = fixture();
    const first = f.service.token(f.server).catch((error: unknown) => error),
      second = f.service.token(f.server).catch((error: unknown) => error);
    await vi.waitFor(() => expect(f.requests).toHaveLength(1));
    let settled = false;
    const retirement = Promise.resolve(
      action === "disconnect" ? f.service.clear(f.server) : f.service.close(),
    ).then(() => {
      settled = true;
    });
    try {
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(f.requests[0]!.signal.aborted).toBe(true);
      expect(settled).toBe(false);
      f.finish(0);
      await retirement;
      for (const outcome of await Promise.all([first, second])) expect(outcome).toBeInstanceOf(Error);
      expect(f.network).toHaveBeenCalledTimes(1);
      expect(f.native.storeSecret.mock.calls.some(([, value]) => value.includes("new-access"))).toBe(false);
      expect(f.secrets.size).toBe(action === "disconnect" ? 0 : 1);
    } finally {
      f.finish(0);
      await Promise.allSettled([first, second, retirement]);
      await f.service.close();
    }
  },
);

it("disconnecting one server does not abort another server's original refresh", async () => {
  const f = fixture(),
    other = { ...f.server, serverId: "66666666-6666-4666-8666-666666666666" };
  f.seed(other);
  const first = f.service.token(f.server).catch((error: unknown) => error),
    second = f.service.token(other);
  await vi.waitFor(() => expect(f.requests).toHaveLength(2));
  const firstIndex = f.requests.findIndex((request) => request.refreshToken === f.server.serverId),
    otherIndex = f.requests.findIndex((request) => request.refreshToken === other.serverId),
    retirement = f.service.clear(f.server);
  try {
    expect(f.requests[firstIndex]!.signal.aborted).toBe(true);
    expect(f.requests[otherIndex]!.signal.aborted).toBe(false);
    f.finish(firstIndex);
    await retirement;
    expect(await first).toBeInstanceOf(Error);
    f.finish(otherIndex);
    expect(await second).toBe(`new-access-${otherIndex}`);
    expect(f.secrets.has(`mcp-oauth-${f.server.serverId}`)).toBe(false);
    expect(f.secrets.has(`mcp-oauth-${other.serverId}`)).toBe(true);
  } finally {
    for (let index = 0; index < f.requests.length; index++) f.finish(index);
    await Promise.allSettled([first, second, retirement]);
    await f.service.close();
  }
});

it.each(["disconnect", "close"] as const)(
  "%s reports an unjoined original request at its fixed deadline",
  async (action) => {
    const f = fixture();
    const original = f.service.token(f.server).catch((error: unknown) => error);
    await vi.waitFor(() => expect(f.requests).toHaveLength(1));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    let originalSettled = false;
    void original.then(() => {
      originalSettled = true;
    });
    const retirement = Promise.resolve(
      action === "disconnect" ? f.service.clear(f.server) : f.service.close(),
    ).catch((error: unknown) => error);
    try {
      expect(f.requests[0]!.signal.aborted).toBe(true);
      await vi.advanceTimersByTimeAsync(5000);
      expect(await retirement).toMatchObject({ code: "backend_unavailable" });
      expect(originalSettled).toBe(false);
      await expect(f.service.token(f.server)).rejects.toBeInstanceOf(Error);
      expect(f.network).toHaveBeenCalledTimes(1);
    } finally {
      f.finish(0);
      await Promise.allSettled([original, retirement]);
      vi.useRealTimers();
      if (action === "disconnect") await f.service.clear(f.server);
      await Promise.resolve(f.service.close()).catch(() => {});
    }
  },
);

it("close joins an already admitted native credential read before acknowledging retirement", async () => {
  const f = fixture();
  const value = f.secrets.get(`mcp-oauth-${f.server.serverId}`);
  let finish!: () => void;
  const held = new Promise<void>((resolve) => (finish = resolve));
  f.native.readSecret.mockImplementation(async () => {
    await held;
    return { value };
  });
  const original = f.service.token(f.server).catch((error: unknown) => error);
  await vi.waitFor(() => expect(f.native.readSecret).toHaveBeenCalledTimes(1));
  let settled = false;
  const retirement = Promise.resolve(f.service.close()).then(() => {
    settled = true;
  });
  try {
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(settled).toBe(false);
    finish();
    await retirement;
    expect(await original).toBeInstanceOf(Error);
    expect(f.network).not.toHaveBeenCalled();
  } finally {
    finish();
    await Promise.allSettled([original, retirement]);
  }
});

it("a failed discovery branch does not detach its held original credential read", async () => {
  const f = fixture(async () => {
    throw new Error("fixture discovery refused");
  });
  let finish!: () => void;
  const held = new Promise<void>((resolve) => {
    finish = resolve;
  });
  f.native.readSecret.mockImplementation(async () => {
    await held;
    return { value: undefined };
  });
  const original = f.service.requirements(f.server).catch((error: unknown) => error);
  let settled = false;
  const retirement = f.service.close().then(() => {
    settled = true;
  });
  try {
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(settled).toBe(false);
    finish();
    await retirement;
    expect(await original).toBeInstanceOf(Error);
    expect(f.network).not.toHaveBeenCalled();
  } finally {
    finish();
    await Promise.allSettled([original, retirement]);
  }
});

it.each(["disconnect", "close"] as const)(
  "%s joins an already admitted native credential write",
  async (action) => {
    const f = fixture();
    let finish!: () => void;
    const held = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const store = f.native.storeSecret.getMockImplementation()!;
    f.native.storeSecret.mockImplementation(async (name, value) => {
      if (value) await held;
      return store(name, value);
    });
    const original = f.service.token(f.server).catch((error: unknown) => error);
    await vi.waitFor(() => expect(f.requests).toHaveLength(1));
    f.finish(0);
    await vi.waitFor(() => expect(f.native.storeSecret).toHaveBeenCalledTimes(1));
    let settled = false;
    const retirement = (action === "disconnect" ? f.service.clear(f.server) : f.service.close()).then(() => {
      settled = true;
    });
    try {
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(settled).toBe(false);
      expect(f.native.storeSecret).toHaveBeenCalledTimes(1);
      finish();
      await retirement;
      expect(await original).toBeInstanceOf(Error);
      expect(f.secrets.size).toBe(action === "disconnect" ? 0 : 1);
      expect(f.network).toHaveBeenCalledTimes(1);
    } finally {
      finish();
      await Promise.allSettled([original, retirement]);
      await f.service.close();
    }
  },
);

it("coalesces disconnect and admits a different source only after the original request joins", async () => {
  const f = fixture();
  const original = f.service.token(f.server).catch((error: unknown) => error);
  await vi.waitFor(() => expect(f.requests).toHaveLength(1));
  const first = f.service.clear(f.server),
    second = f.service.clear(f.server);
  const replacement = { ...f.server, sourceDigest: "b".repeat(64) };
  try {
    await expect(f.service.token(replacement)).rejects.toMatchObject({ code: "cancelled" });
    await expect(f.service.start(replacement)).rejects.toMatchObject({ code: "cancelled" });
    expect(f.network).toHaveBeenCalledTimes(1);
    f.finish(0);
    await Promise.all([first, second]);
    expect(await original).toBeInstanceOf(Error);
    expect(f.native.storeSecret.mock.calls.filter(([, value]) => !value)).toHaveLength(1);
    f.seed(replacement);
    const current = f.service.token(replacement);
    await vi.waitFor(() => expect(f.requests).toHaveLength(2));
    f.finish(1);
    expect(await current).toBe("new-access-1");
    expect(JSON.parse(f.secrets.get(`mcp-oauth-${f.server.serverId}`)!)).toMatchObject({
      sourceDigest: replacement.sourceDigest,
      tokens: { access_token: "new-access-1" },
    });
  } finally {
    for (let index = 0; index < f.requests.length; index++) f.finish(index);
    await Promise.allSettled([original, first, second]);
    await f.service.close();
  }
});

it("retains failed credential-removal debt until an explicit successful disconnect retry", async () => {
  const f = fixture();
  f.native.storeSecret.mockRejectedValueOnce(new Error("fixture keychain failure"));
  try {
    await expect(f.service.clear(f.server)).rejects.toThrow("fixture keychain failure");
    await expect(f.service.token(f.server)).rejects.toMatchObject({ code: "cancelled" });
    await expect(f.service.start(f.server)).rejects.toMatchObject({ code: "cancelled" });
    expect(f.secrets.size).toBe(1);
    expect(f.network).not.toHaveBeenCalled();
    expect(await f.service.clear(f.server)).toEqual({ connected: false });
    expect(f.secrets.size).toBe(0);
    expect(await f.service.status(f.server)).toMatchObject({ connected: false });
  } finally {
    await f.service.close();
  }
});
