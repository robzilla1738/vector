import { expect, it, vi } from "vitest";
import { openDb, Repo, type NativeBridge } from "@aux/runtime";
import { CloudSettingsService } from "../../apps/runtime/dist/services/cloud-settings.js";

it("joins a pending owner lookup at shutdown without committing its late configuration change", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db);
    let began!: () => void;
    const started = new Promise<void>((resolve) => {
      began = resolve;
    });
    let finish!: (owner: { windowId: string; activePageId: null }) => void;
    const source = new Promise<{ windowId: string; activePageId: null }>((resolve) => {
      finish = resolve;
    });
    const storeSecret = vi.fn();
    const settings = new CloudSettingsService(repo, {
      turnSourceContext: () => {
        began();
        return source;
      },
      storeSecret,
    } as unknown as NativeBridge);
    const mutation = settings.clear(0, "original-window-token");
    const rejected = expect(mutation).rejects.toMatchObject({ code: "cancelled" });
    await started;
    const closed = settings.close();
    finish({ windowId: "original-window", activePageId: null });
    await rejected;
    await closed;
    expect(repo.hasSetting("cloudExecutionRevision")).toBe(false);
    expect(settings.status()).toEqual({ configured: false, revision: 0 });
    expect(storeSecret).not.toHaveBeenCalled();
  } finally {
    db.close();
  }
});

it("leases configured Sandbox access from the original owner without copying credentials or adopting a stale reply", async () => {
  const normalDb = openDb(":memory:"),
    privateDb = openDb(":memory:");
  const vault = new Map<string, string>();
  const normal = new CloudSettingsService(new Repo(normalDb), {
    turnSourceContext: async () => ({ windowId: "original", activePageId: null }),
    storeSecret: async (key: string, value: string) => {
      vault.set(key, value);
      return { ok: true };
    },
    readSecret: async (key: string) => ({ value: vault.get(key) }),
  } as unknown as NativeBridge);
  const privateSettings = new CloudSettingsService(new Repo(privateDb), {} as NativeBridge);
  try {
    await normal.configure(
      {
        expectedRevision: 0,
        token: "original-sandbox-token",
        teamId: "fixture-team",
        projectId: "fixture-project",
        quote: {
          region: "iad1",
          vcpus: 1,
          timeoutMs: 60_000,
          rateBasis: "public-estimate",
          rateSource: "https://vercel.com/docs/vercel-sandbox/pricing",
          rates: { cpuUsdPerCoreHour: 0.1, memoryUsdPerGBHour: 0.01, outboundUsdPerGB: 0.1, creationUsd: 0 },
        },
      },
      "original",
    );
    const requests: unknown[] = [];
    let retire = false;
    await privateSettings.attachPrivate(async (request) => {
      requests.push(request);
      const result = await normal.privateRequest(request);
      if (retire) privateSettings.invalidatePrivateConnection();
      return result;
    });
    expect(privateSettings.status()).toMatchObject({ configured: true, teamId: "fixture-team" });
    expect(await privateSettings.configuration()).toMatchObject({
      token: "original-sandbox-token",
      teamId: "fixture-team",
      projectId: "fixture-project",
    });
    expect(JSON.stringify(privateDb.prepare("SELECT * FROM kv").all())).not.toContain(
      "original-sandbox-token",
    );
    expect(requests).toHaveLength(2);
    retire = true;
    await expect(privateSettings.configuration()).rejects.toMatchObject({ code: "cancelled" });
    expect(normal.status().configured).toBe(true);
  } finally {
    await privateSettings.close();
    await normal.close();
    privateDb.close();
    normalDb.close();
  }
});
