import { describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo, SettingsService, type NativeBridge } from "@aux/runtime";

describe("fixed disposable credential boot/configuration order", () => {
  it("initializes only original credential cache then uses explicit local endpoint for catalog", async () => {
    const directory = mkdtempSync(join(tmpdir(), "aux-credential-config-"));
    const repo = new Repo(openDb(":memory:"));
    const settings = new SettingsService(repo, join(directory, "settings.json"), {});
    const reads: string[] = [];
    const fetch = vi.fn(async (_url: string, _options?: RequestInit) => new Response(JSON.stringify({ data: [{ id: "aux-disposable-credential-appearance" }] }),
      { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);
    settings.attachNative({ available: () => true, readSecret: async (name: string) => {
      reads.push(name);
      return { value: name === "modelKey-openai-compatible" ? "aux-disposable-loopback-appearance-synthetic-key-v1" : undefined };
    } } as unknown as NativeBridge);
    try {
      await settings.initializeCredentials();
      expect(reads[0]).toBe("gatewayApiKey");
      expect(reads.filter(name => name === "modelKey-openai-compatible")).toHaveLength(1);
      expect(reads.every(name => name === "gatewayApiKey" || name.startsWith("modelKey-"))).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
      expect(settings.all().modelProvider).toBe("gateway");
      expect(settings.all().gatewayCredentialSource).toBe("none");
      expect(settings.model()).toBeNull();
      await settings.listModels();
      expect(fetch).not.toHaveBeenCalled();
      await settings.set({ modelProvider: "openai-compatible", compatibleEndpoint: "http://127.0.0.1:3210/v1", plannerModel: "aux-disposable-credential-appearance" });
      expect(fetch).not.toHaveBeenCalled();
      expect(settings.all()).toMatchObject({ modelProvider: "openai-compatible", compatibleEndpoint: "http://127.0.0.1:3210/v1", modelApiKey: "••••••••", modelCredentialSource: "saved" });
      await settings.listModels();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0]?.[0]).toBe("http://127.0.0.1:3210/v1/models");
      expect(fetch.mock.calls[0]?.[1]).toMatchObject({ headers: { Authorization: "Bearer aux-disposable-loopback-appearance-synthetic-key-v1" }, redirect: "error" });
    } finally {
      vi.unstubAllGlobals(); repo.db.close(); rmSync(directory, { recursive: true, force: true });
    }
  });
});
