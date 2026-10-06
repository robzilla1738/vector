import { it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo, SettingsService, NullNativeBridge } from "@aux/runtime";
import { createFixture, readDisposableModelCredentialEndpoint } from "../support/fixture.mjs";
it("actual compiled SettingsService catalog uses the original branded HTTP endpoint and synthetic saved credential only after configuration", async () => {
  const fixture = await createFixture(),
    lease = fixture.claimDisposableModelCredentialEndpoint(),
    endpoint = readDisposableModelCredentialEndpoint(lease);
  const directory = mkdtempSync(join(tmpdir(), "aux-saved-catalog-source-")),
    repo = new Repo(openDb(":memory:"));
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  settings.attachNative(
    Object.assign(new NullNativeBridge(), {
      available: () => true,
      readSecret: async (name: string) => ({
        value:
          name === "modelKey-openai-compatible"
            ? "aux-disposable-loopback-appearance-synthetic-key-v1"
            : undefined,
      }),
    }),
  );
  try {
    await settings.initializeCredentials();
    expect(fixture.requests).toEqual([]);
    expect(readDisposableModelCredentialEndpoint(lease).observations).toEqual([]);
    await settings.set({
      modelProvider: "openai-compatible",
      compatibleEndpoint: endpoint.endpoint,
      plannerModel: endpoint.model,
    });
    expect(fixture.requests).toEqual([]);
    expect(settings.all()).toMatchObject({
      modelApiKey: "••••••••",
      modelCredentialSource: "saved",
      modelConfigured: true,
    });
    for (let i = 0; i < 2; i++) {
      const result = await settings.listModels();
      expect(result.models).toContainEqual({ id: endpoint.model, source: "configured" });
    }
    expect(readDisposableModelCredentialEndpoint(lease).observations).toEqual(
      Array.from({ length: 2 }, () => ({ method: "GET", path: "/v1/models", syntheticAuthorization: true })),
    );
    expect(fixture.requests).toEqual(
      Array.from({ length: 2 }, () => ({ method: "GET", path: "/v1/models" })),
    );
    expect(settings.all()).toMatchObject({
      compatibleEndpoint: endpoint.endpoint,
      plannerModel: endpoint.model,
      modelApiKey: "••••••••",
      modelCredentialSource: "saved",
    });
  } finally {
    repo.db.close();
    rmSync(directory, { recursive: true, force: true });
    lease.dispose();
    await fixture.close();
  }
});
