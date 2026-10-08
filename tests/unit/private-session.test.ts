import { afterEach, expect, it } from "vitest";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrivateRuntimeSession } from "../../apps/runtime/src/services/private-session.js";
import { loadConfig, openDb, Repo } from "@aux/runtime";
const id = "a830f4d9-629c-40e1-93a4-f9e981c8a8d3";
const directories: string[] = [];
const fixture = () => {
  const root = mkdtempSync("/tmp/aux-private-tests-");
  directories.push(root);
  chmodSync(root, 0o700);
  const normal = join(root, "original", "Aux Runtime Data");
  mkdirSync(normal, { recursive: true });
  const settingsPath = join(normal, "settings.json");
  writeFileSync(
    settingsPath,
    JSON.stringify({
      plannerModel: "selected-model",
      localModelsOnly: true,
      gatewayApiKey: "legacy-secret-sentinel",
      modelCredential: { provider: "openai", key: "secret-sentinel" },
      autofill: { email: "personal-sentinel" },
      providerModels: { "openai-compatible": { plannerModel: "local-model" } },
    }),
  );
  const env = {
    AUX_PRIVATE_SESSION: id,
    AUX_BROWSER_PROFILE_ID: `private:${id}`,
    AUX_LOAD_DOTENV: "0",
    AUX_HOST_SOCKET: "/tmp/owned-host.sock",
    AUX_HOST_TOKEN: "original-native-token",
    AUX_HOST_GENERATION: "1",
    AUX_DATA_DIR: join(root, "Aux Runtime Data"),
    AUX_PRIVATE_SETTINGS_PATH: settingsPath,
  };
  return { root, settingsPath, env };
};
afterEach(() => {
  for (const root of directories.splice(0)) rmSync(root, { recursive: true, force: true });
});
it("leaves normal runtimes on their existing storage path", () => {
  expect(PrivateRuntimeSession.fromEnvironment({})).toBeUndefined();
  expect(PrivateRuntimeSession.fromEnvironment({ AUX_PRIVATE_SESSION: "" })).toBeUndefined();
});
it("requires the actual authenticated session identity and native OTR proof", () => {
  const { env } = fixture();
  expect(() => PrivateRuntimeSession.fromEnvironment({ ...env, AUX_BROWSER_PROFILE_ID: "Default" })).toThrow(
    /authenticated/,
  );
  expect(() => PrivateRuntimeSession.fromEnvironment({ ...env, AUX_LOAD_DOTENV: "1" })).toThrow(
    /authenticated/,
  );
  const session = PrivateRuntimeSession.fromEnvironment(env)!;
  expect(() => session.admit({ buildId: "build", sourceCommit: "a".repeat(40), methods: [] })).toThrow(
    /original private session/,
  );
  expect(() =>
    session.admit({
      buildId: "build",
      sourceCommit: "a".repeat(40),
      methods: [],
      privateSession: { id: "b830f4d9-629c-40e1-93a4-f9e981c8a8d3" },
    }),
  ).toThrow(/original private session/);
});
it("refuses shared or aliased temporary storage", () => {
  const { root, env } = fixture();
  chmodSync(root, 0o755);
  expect(() => PrivateRuntimeSession.fromEnvironment(env)).toThrow(/temporary directory/);
  chmodSync(root, 0o700);
  const alias = `${root}-alias`;
  directories.push(alias);
  symlinkSync(root, alias);
  expect(() =>
    PrivateRuntimeSession.fromEnvironment({ ...env, AUX_DATA_DIR: join(alias, "Aux Runtime Data") }),
  ).toThrow(/temporary directory/);
});
it("keeps private chats in SQLite memory and copies only nonsecret preferences without changing their source", () => {
  const { env, settingsPath } = fixture();
  const original = readFileSync(settingsPath, "utf8");
  const session = PrivateRuntimeSession.fromEnvironment(env)!;
  const config = loadConfig(env, { ephemeral: true });
  expect(config.dbPath).toBe(":memory:");
  const db = openDb(config.dbPath),
    repo = new Repo(db);
  try {
    expect(() => session.seedSettings(repo)).toThrow(/not been admitted/);
    session.admit({ buildId: "build", sourceCommit: "a".repeat(40), methods: [], privateSession: { id } });
    session.seedSettings(repo);
    expect(repo.getSetting("plannerModel")).toBe("selected-model");
    expect(repo.getSetting("providerModels")).toEqual({
      "openai-compatible": { plannerModel: "local-model" },
    });
    for (const key of ["gatewayApiKey", "modelCredential", "autofill"])
      expect(repo.getSetting(key)).toBeUndefined();
    expect(readFileSync(settingsPath, "utf8")).toBe(original);
    expect(db.prepare("PRAGMA database_list").get()?.file).toBe("");
  } finally {
    db.close();
  }
});
