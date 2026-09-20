import { mkdtempSync, mkdirSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { normalizeAuxEnvironment } from "@vector/contracts";
import { resolveBrowserProfileDirectory, resolveDataDirectory, resolveDatabasePath, resolveRuntimeDescriptor } from "@vector/contracts/installation";
import { loadConfig, loadDotEnv, dotEnvCandidates, startRuntime } from "@vector/runtime";
import { desktopRuntimeEnv } from "../../apps/desktop/main/runtime-env";

const roots: string[] = [];
function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), "aux-installation-"));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("Aux configuration compatibility", () => {
  it("prefers canonical values, preserves zero flags and does not mutate the source", () => {
    const source = { AUX_ENGINE: "0", VECTOR_ENGINE: "1", VECTOR_API_PORT: "9843", PATH: "/usr/bin" };
    expect(normalizeAuxEnvironment(source)).toEqual({
      AUX_ENGINE: "0", VECTOR_ENGINE: "0", AUX_API_PORT: "9843", VECTOR_API_PORT: "9843", PATH: "/usr/bin",
    });
    expect(source.VECTOR_ENGINE).toBe("1");
    expect(normalizeAuxEnvironment({ AUX_ENGINE: "", VECTOR_ENGINE: "0" }).AUX_ENGINE).toBe("0");
  });

  it("keeps real environment precedence even when dotenv uses the newer spelling", () => {
    const root = temporaryRoot();
    const first = join(root, "first.env");
    const second = join(root, "second.env");
    writeFileSync(first, "AUX_ENGINE_MODE=always\nVECTOR_API_PORT=9010\nVECTOR_VISION_MODEL=legacy\nAUX_VISION_MODEL=current\n");
    writeFileSync(second, "AUX_API_PORT=9020\nVECTOR_RECOVERY_MODEL=recovery\n");
    const env = loadDotEnv({ VECTOR_ENGINE_MODE: "off" }, [first, second]);
    expect(env.AUX_ENGINE_MODE).toBe("off");
    expect(env.VECTOR_ENGINE_MODE).toBe("off");
    expect(env.AUX_API_PORT).toBe("9010");
    expect(env.VECTOR_VISION_MODEL).toBe("current");
    expect(env.AUX_RECOVERY_MODEL).toBe("recovery");
  });

  it("finds dotenv and runtime descriptors using the same selected installation", () => {
    const root = temporaryRoot();
    const env = { AUX_DATA_DIR: root, VECTOR_DATA_DIR: "/wrong" };
    expect(dotEnvCandidates(env, root)[0]).toBe(join(root, ".env"));
    expect(resolveRuntimeDescriptor(env)).toBe(join(root, "runtime.json"));
    expect(resolveRuntimeDescriptor({ ...env, AUX_RUNTIME_FILE: "/explicit", VECTOR_RUNTIME_FILE: "/wrong-file" })).toBe("/explicit");
  });

  it("uses shell-owned connection coordinates over inherited canonical and legacy values", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/selected", cdpPort: 9001, packaged: true,
      env: { AUX_DATA_DIR: "/old", VECTOR_DATA_DIR: "/older", AUX_ELECTRON_CDP: "http://wrong", AUX_ENGINE_MODE: "off", VECTOR_ENGINE_MODE: "always" },
    });
    expect(env.AUX_DATA_DIR).toBe("/selected");
    expect(env.VECTOR_DATA_DIR).toBe("/selected");
    expect(env.AUX_ELECTRON_CDP).toBe("http://127.0.0.1:9001");
    expect(env.VECTOR_ELECTRON_CDP).toBe(env.AUX_ELECTRON_CDP);
    expect(env.VECTOR_ENGINE_MODE).toBe("off");
    expect(env.AUX_ENGINE_PROFILE).toBe("production");
  });
});

describe("installation discovery without destructive migration", () => {
  it("selects independent browser and runtime roots without creating either", () => {
    const root = temporaryRoot();
    expect(resolveBrowserProfileDirectory(root, true, {})).toBe(join(root, "Aux Browser Profile"));
    expect(resolveBrowserProfileDirectory(root, false, {})).toBe(join(root, "Aux Browser Development Profile"));
    expect(existsSync(join(root, "Aux Browser Profile"))).toBe(false);
    expect(existsSync(join(root, "Aux Browser"))).toBe(false);
  });

  it("preserves legacy desktop profiles without reading or changing their files", () => {
    const root = temporaryRoot();
    const legacy = join(root, "Vector");
    const development = join(root, "@vector/desktop");
    mkdirSync(legacy, { recursive: true });
    mkdirSync(development, { recursive: true });
    expect(resolveBrowserProfileDirectory(root, true, {})).toBe(development);
    expect(resolveBrowserProfileDirectory(root, false, {})).toBe(development);
    mkdirSync(join(legacy, "Partitions"));
    expect(() => resolveBrowserProfileDirectory(root, true, {})).toThrow("AUX_PROFILE_DIR");
    rmSync(development, { recursive: true });
    expect(resolveBrowserProfileDirectory(root, true, {})).toBe(legacy);
    mkdirSync(join(root, "Aux Browser Profile"));
    expect(() => resolveBrowserProfileDirectory(root, true, {})).toThrow("AUX_PROFILE_DIR");
    expect(resolveBrowserProfileDirectory(root, true, { AUX_PROFILE_DIR: legacy })).toBe(legacy);
  });

  it("honors explicit canonical profile paths and rejects relative overrides", () => {
    const root = temporaryRoot();
    expect(resolveBrowserProfileDirectory(root, true, { AUX_PROFILE_DIR: root, VECTOR_PROFILE_DIR: "/wrong" })).toBe(root);
    expect(resolveBrowserProfileDirectory(root, true, { VECTOR_PROFILE_DIR: root })).toBe(root);
    expect(() => resolveBrowserProfileDirectory(root, true, { AUX_PROFILE_DIR: "relative" })).toThrow("absolute");
  });

  it("uses portable Aux paths for new installations", () => {
    const root = temporaryRoot();
    expect(resolveDataDirectory({}, root, "darwin")).toBe(join(root, "Library", "Application Support", "Aux Browser"));
    expect(resolveDataDirectory({}, root, "win32")).toBe(join(root, "AppData", "Local", "Aux Browser"));
    expect(resolveDataDirectory({ XDG_DATA_HOME: join(root, "xdg") }, root, "linux")).toBe(join(root, "xdg", "Aux Browser"));
    expect(resolveDatabasePath(root)).toBe(join(root, "aux-state.sqlite"));
  });

  it("keeps existing legacy data and databases in place", () => {
    const root = temporaryRoot();
    const legacy = join(root, "Library", "Application Support", "Vector");
    mkdirSync(legacy, { recursive: true });
    writeFileSync(join(legacy, "vector.sqlite"), "existing");
    expect(resolveDataDirectory({}, root, "darwin")).toBe(legacy);
    expect(resolveDatabasePath(legacy)).toBe(join(legacy, "vector.sqlite"));
    expect(existsSync(join(root, "Library", "Application Support", "Aux Browser"))).toBe(false);
  });

  it("requires an explicit directory when installations are ambiguous", () => {
    const root = temporaryRoot();
    const current = join(root, "Library", "Application Support", "Aux Browser");
    mkdirSync(current, { recursive: true });
    mkdirSync(join(root, "Library", "Application Support", "Vector"), { recursive: true });
    expect(() => resolveDataDirectory({}, root, "darwin")).toThrow("AUX_DATA_DIR");
    expect(resolveDataDirectory({ AUX_DATA_DIR: current }, root, "darwin")).toBe(current);
  });

  it("does not silently choose between two databases", () => {
    const root = temporaryRoot();
    writeFileSync(join(root, "vector.sqlite"), "legacy");
    writeFileSync(join(root, "aux-state.sqlite"), "current");
    expect(() => loadConfig({ AUX_DATA_DIR: root })).toThrow("Both Aux and legacy Vector databases");
    expect(existsSync(join(root, "artifacts"))).toBe(false);
  });

  it("starts and restarts a standalone runtime using only canonical configuration", async () => {
    const root = temporaryRoot();
    const env = { AUX_DATA_DIR: root, AUX_STANDALONE: "0", AUX_ENGINE: "0", AUX_API_PORT: "0" };
    const runtime = await startRuntime(env);
    try {
      expect(runtime.port).toBeGreaterThan(0);
      expect(existsSync(join(root, "aux-state.sqlite"))).toBe(true);
      expect(existsSync(join(root, "vector.sqlite"))).toBe(false);
      expect(await runtime.invoke("pages.list", {})).toEqual([]);
    } finally {
      await runtime.close();
    }
    const restarted = await startRuntime(env);
    await restarted.close();
    expect(existsSync(join(root, "aux-state.sqlite"))).toBe(true);
  });
});
