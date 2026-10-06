import { afterEach, expect, it, vi } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import type { PageTarget } from "@aux/contracts";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";
import { pageDerivativeCache } from "../../apps/runtime/src/services/ai-result-cache.js";
import { suggestTabName } from "../../apps/runtime/src/agent/tab-name.js";
import { proposeTabTidy } from "../../apps/runtime/src/agent/tidy.js";
import { TranslateService } from "../../apps/runtime/src/services/translate.js";
import type { Services } from "../../apps/runtime/src/api/methods/context.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import type { SettingsService } from "../../apps/runtime/src/services/settings.js";
import { omitDerivedAndSpaceMemory } from "../../apps/runtime/src/services/space-memory-backup.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

async function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Research");
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      secrets.set(name, value);
      return { ok: true as const };
    },
    profileStorageRoot: async () => {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
    captureReadablePage: async (id: string) => ({
      url: pages.get(id)!.url,
      title: pages.get(id)!.title,
      text: "Browser research and careful citations.",
    }),
  };
  const memory = new ContentMemoryStore(repo, native, "profile-one");
  await memory.setPolicy(workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const pages = new Map<string, PageTarget>(
    ["p1", "p2", "p3"].map((id) => [
      id,
      {
        pageId: id,
        windowId: "main",
        windowKind: "normal",
        workspaceId: workspace.workspaceId,
        backend: "aux",
        targetId: id,
        url: `https://example.test/${id}`,
        title: "Browser research",
        documentEpoch: 3,
        lastRevision: 0,
        viewStatus: "visible",
        controller: "none",
        controllerEpoch: 0,
        ownedByRuntime: false,
        createdAt: 1,
        lastActiveAt: 1,
      },
    ]),
  );
  let object: unknown = { name: "Browser research" };
  let servedModel: string | undefined;
  const generateStructured = vi.fn(async () => ({
    object,
    resolvedModelId: servedModel,
    durationMs: 50,
    inputTokens: 100,
    outputTokens: 20,
    providerMetadata: { gateway: { cost: "0.01" } },
  }));
  const model = { generateStructured } as unknown as ModelClient;
  let generation = "connection-one";
  const settings = {
    model: () => model,
    plannerModel: () => "fixture-model",
    modelCacheGeneration: () => generation,
  } as unknown as SettingsService;
  const s = {
    repo,
    settings,
    contentMemory: memory,
    native,
    pages: { get: (id: string) => pages.get(id)! },
  } as unknown as Services;
  return {
    db,
    repo,
    memory,
    native,
    pages,
    s,
    settings,
    model,
    generateStructured,
    secrets,
    workspace,
    setObject: (value: unknown) => {
      object = value;
    },
    serveModel: (id: string) => {
      servedModel = id;
    },
    reconnect: () => {
      generation = "connection-two";
    },
  };
}
const route = { modelId: "fixture-model", reasoning: "low" as const };

it("reuses encrypted naming and Tidy derivatives with fresh provenance and no provider replay", async () => {
  const f = await fixture();
  const name = () =>
    suggestTabName(
      { pageId: "p1", expectedUrl: f.pages.get("p1")!.url, expectedDocumentEpoch: 3 },
      f.pages.get("p1"),
      f.model,
      route,
      pageDerivativeCache(f.s, ["p1"]),
    );
  expect((await name()).name).toBe("Browser research");
  expect((await name()).pageId).toBe("p1");
  expect(f.generateStructured).toHaveBeenCalledTimes(1);
  f.setObject({ groups: [{ name: "Research", pageIds: ["p1", "p2"] }] });
  const tidy = () =>
    proposeTabTidy(
      { pageIds: ["p1", "p2", "p3"] },
      [...f.pages.values()],
      f.model,
      route,
      pageDerivativeCache(f.s, ["p1", "p2", "p3"]),
    );
  expect((await tidy()).groups[0]!.name).toBe("Research");
  await tidy();
  expect(f.generateStructured).toHaveBeenCalledTimes(2);
  const raw = JSON.stringify(f.db.prepare("SELECT * FROM ai_result_cache").all());
  expect(raw).not.toContain("Browser research");
  expect(raw).not.toContain("https://example.test");
  expect(raw).not.toContain("providerMetadata");
  f.setObject({ name: "Browser research" });
  f.reconnect();
  await name();
  expect(f.generateStructured).toHaveBeenCalledTimes(3);
  omitDerivedAndSpaceMemory(f.db);
  expect(f.db.prepare("SELECT COUNT(*) AS n FROM ai_result_cache").get()).toMatchObject({ n: 0 });
});

it("caches bound translations only for verified inert text and bypasses private, unknown, and secret content", async () => {
  const f = await fixture();
  f.setObject({ lang: "English", translation: "Recherche" });
  const translator = new TranslateService(f.settings);
  const translate = (text = "Browser research") =>
    translator.text(text, "French", undefined, pageDerivativeCache(f.s, ["p1"]));
  await translate();
  await translate();
  expect(f.generateStructured).toHaveBeenCalledTimes(1);
  await translate("not present in the captured page");
  await translate("not present in the captured page");
  expect(f.generateStructured).toHaveBeenCalledTimes(3);
  f.pages.get("p1")!.windowKind = "private";
  await translate();
  await translate();
  f.pages.get("p1")!.windowKind = undefined;
  await translate();
  expect(f.generateStructured).toHaveBeenCalledTimes(6);
  f.pages.get("p1")!.windowKind = "normal";
  await translate("api_key=sk-abcdefghijklmnopqrstuvwxyz");
  await translate("api_key=sk-abcdefghijklmnopqrstuvwxyz");
  expect(f.generateStructured).toHaveBeenCalledTimes(8);
});

it("retires derivative-only factors on Forget and prevents an in-flight model from republishing", async () => {
  const f = await fixture();
  const input = {
    workspaceId: f.workspace.workspaceId,
    signature: "test",
    eligible: () => true,
    parse: (value: unknown) => String(value),
    compute: async () => "result",
  };
  await f.memory.cachedDerivative(input);
  const factor = [...f.secrets.keys()].find((key) => key.startsWith("pageMemoryFactorV2_"))!;
  let release!: (value: string) => void;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    started = resolve;
  });
  const work = f.memory.cachedDerivative({
    ...input,
    signature: "in-flight",
    compute: () => {
      started();
      return new Promise<string>((resolve) => {
        release = resolve;
      });
    },
  });
  await pending;
  await f.memory.forget(f.workspace.workspaceId);
  release("late");
  await work;
  expect(f.secrets.get(factor)).toBe("");
  expect(f.db.prepare("SELECT COUNT(*) AS n FROM ai_result_cache").get()).toMatchObject({ n: 0 });
});

it("rejects oversized ciphertext before materialization and detects live identity changes after capture", async () => {
  const f = await fixture();
  const input = {
    workspaceId: f.workspace.workspaceId,
    signature: "size",
    eligible: () => true,
    parse: (value: unknown) => String(value),
    compute: async () => "result",
  };
  await f.memory.cachedDerivative(input);
  f.db.prepare("UPDATE ai_result_cache SET ciphertext=zeroblob(?)").run(1024 * 1024 + 1);
  await expect(f.memory.cachedDerivative(input)).rejects.toThrow("reviewed size cap");
  f.native.captureReadablePage = async (id) => {
    const page = f.pages.get(id)!;
    const body = { url: page.url, title: page.title, text: "Browser research" };
    page.documentEpoch++;
    return body;
  };
  await expect(
    suggestTabName(
      { pageId: "p1", expectedUrl: f.pages.get("p1")!.url, expectedDocumentEpoch: 3 },
      f.pages.get("p1"),
      f.model,
      route,
      pageDerivativeCache(f.s, ["p1"]),
    ),
  ).rejects.toThrow("source page");
});

it("does not publish translation derivatives served by a fallback model", async () => {
  const f = await fixture();
  f.setObject({ lang: "English", translation: "Recherche" });
  f.serveModel("fallback-model");
  const translator = new TranslateService(f.settings);
  const translate = () =>
    translator.text("Browser research", "French", undefined, pageDerivativeCache(f.s, ["p1"]));
  await translate();
  await translate();
  expect(f.generateStructured).toHaveBeenCalledTimes(2);
  expect(f.db.prepare("SELECT COUNT(*) AS n FROM ai_result_cache").get()).toMatchObject({ n: 0 });
});

it("reuses pure naming content after a reload while rebuilding its live envelope, and misses changed content", async () => {
  const f = await fixture();
  const name = () => {
    const page = f.pages.get("p1")!;
    return suggestTabName(
      { pageId: page.pageId, expectedUrl: page.url, expectedDocumentEpoch: page.documentEpoch },
      page,
      f.model,
      route,
      pageDerivativeCache(f.s, [page.pageId]),
    );
  };
  await name();
  const page = f.pages.get("p1")!;
  page.documentEpoch++;
  page.sessionId = "reloaded-session";
  page.controllerEpoch++;
  expect((await name()).documentEpoch).toBe(4);
  expect(f.generateStructured).toHaveBeenCalledTimes(1);
  page.title = "Browser science";
  f.setObject({ name: "Browser science" });
  expect((await name()).name).toBe("Browser science");
  expect(f.generateStructured).toHaveBeenCalledTimes(2);
});
