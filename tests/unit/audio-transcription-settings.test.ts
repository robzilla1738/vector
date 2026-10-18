import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { openDb, Repo, SettingsService } from "@aux/runtime";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
  vi.unstubAllGlobals();
});
function fixture(env: NodeJS.ProcessEnv = { AI_GATEWAY_API_KEY: "synthetic-voice" }) {
  const dir = mkdtempSync(join(tmpdir(), "aux-voice-settings-")),
    repo = new Repo(openDb(":memory:"));
  const settings = new SettingsService(repo, join(dir, "settings.json"), env);
  const network = vi.fn<typeof fetch>().mockImplementation(async () =>
    Response.json({
      data: [
        {
          id: "openai/whisper-1",
          type: "transcription",
          supported_specifications: ["v4"],
          pricing: { transcription_duration_cost_per_second: "0.0001" },
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", network);
  closes.push(async () => {
    await settings.close();
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { settings, repo, network };
}
it("keeps voice separately Off and makes no request when changing the setting", async () => {
  const f = fixture();
  expect(f.settings.all()).toMatchObject({
    transcriptionModel: null,
    transcriptionModels: [],
    transcriptionAvailable: false,
  });
  await f.settings.set({ transcriptionModel: "openai/whisper-1" });
  expect(f.network).not.toHaveBeenCalled();
  expect(f.settings.imageModel()).toBe("openai/gpt-image-2");
  expect(f.settings.transcriptionModel()).toBe("openai/whisper-1");
  expect(f.settings.transcriptionAvailable()).toBe(false);
  const models = await f.settings.listTranscriptionModels();
  expect(models).toHaveLength(1);
  expect(f.settings.transcriptionAvailable()).toBe(false);
  f.settings.setAudioInspectionReady(true);
  expect(f.settings.transcriptionAvailable()).toBe(true);
  f.settings.setAudioInspectionReady(false);
  expect(f.settings.transcriptionAvailable()).toBe(false);
});
it("discovers Gateway audio independently from chat provider without broadening private credentials", async () => {
  const f = fixture();
  await f.settings.set({ modelProvider: "anthropic", transcriptionModel: "openai/whisper-1" });
  expect(await f.settings.listTranscriptionModels()).toHaveLength(1);
  expect(String(f.network.mock.calls[0]![0])).toBe("https://ai-gateway.vercel.sh/v1/models");
  expect(await f.settings.gatewayTranscriptionCredential()).toEqual({ apiKey: "synthetic-voice" });
  const privateFixture = fixture({ AI_GATEWAY_API_KEY: "must-not-inherit", AUX_PRIVATE_SESSION: "1" });
  privateFixture.repo.setSetting("transcriptionModel", "openai/whisper-1");
  expect(privateFixture.settings.transcriptionModel()).toBeNull();
  expect(await privateFixture.settings.listTranscriptionModels()).toEqual([]);
  expect(await privateFixture.settings.gatewayTranscriptionCredential()).toBeUndefined();
  expect(privateFixture.network).not.toHaveBeenCalled();
});
it("rejects late original credential resolution when account generation changes", async () => {
  const f = fixture();
  await f.settings.set({ transcriptionModel: "openai/whisper-1" });
  const pending = f.settings.gatewayTranscriptionCredential();
  f.repo.setSetting("modelCacheGeneration", randomUUID());
  await expect(pending).rejects.toThrow(/changed/);
});
