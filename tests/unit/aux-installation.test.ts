import { mkdtempSync, mkdirSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { normalizeAuxEnvironment } from "@aux/contracts";
import { resolveBrowserProfileDirectory, resolveDataDirectory, resolveDatabasePath, resolveRuntimeDescriptor } from "@aux/contracts/installation";
import { loadDotEnv, dotEnvCandidates, startRuntime } from "@aux/runtime";
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

describe("Aux configuration", () => {
  it("copies a configuration source without mutating it", () => {
    const source = { AUX_STANDALONE: "0", AUX_API_PORT: "9843", PATH: "/usr/bin" };
    const env = normalizeAuxEnvironment(source);
    expect(env).toEqual(source);
    expect(env).not.toBe(source);
  });

  it("reads canonical names from dotenv and ignores legacy VECTOR_ keys", () => {
    const root = temporaryRoot();
    const first = join(root, "first.env");
    const second = join(root, "second.env");
    writeFileSync(first, "AUX_STANDALONE=1\nVECTOR_API_PORT=9010\nVECTOR_VISION_MODEL=legacy\nAUX_VISION_MODEL=current\n");
    writeFileSync(second, "AUX_API_PORT=9020\nVECTOR_RECOVERY_MODEL=recovery\n");
    const env = loadDotEnv({ AUX_STANDALONE: "0" }, [first, second]);
    expect(env.AUX_STANDALONE).toBe("0");
    expect(env.AUX_API_PORT).toBe("9020");
    expect(env.AUX_VISION_MODEL).toBe("current");
    expect(env.AUX_RECOVERY_MODEL).toBeUndefined();
  });

  it("finds dotenv and runtime descriptors using the same selected installation", () => {
    const root = temporaryRoot();
    const env = { AUX_DATA_DIR: root };
    expect(dotEnvCandidates(env, root)[0]).toBe(join(root, ".env"));
    expect(resolveRuntimeDescriptor(env)).toBe(join(root, "runtime.json"));
    expect(resolveRuntimeDescriptor({ ...env, AUX_RUNTIME_FILE: "/explicit" })).toBe("/explicit");
  });

  it("uses shell-owned connection coordinates over inherited values", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/selected", profileId: "default", cdpPort: 9001,
      env: { AUX_DATA_DIR: "/old", AUX_ELECTRON_CDP: "http://wrong", AUX_STANDALONE: "0" },
    });
    expect(env.AUX_DATA_DIR).toBe("/selected");
    expect(env.AUX_ELECTRON_CDP).toBe("http://127.0.0.1:9001");
    expect(env.AUX_STANDALONE).toBe("0");
  });
});

describe("installation discovery", () => {
  it("selects independent browser and runtime roots without creating either", () => {
    const root = temporaryRoot();
    expect(resolveBrowserProfileDirectory(root, true, {})).toBe(join(root, "Aux Browser Profile"));
    expect(resolveBrowserProfileDirectory(root, false, {})).toBe(join(root, "Aux Browser Development Profile"));
    expect(existsSync(join(root, "Aux Browser Profile"))).toBe(false);
    expect(existsSync(join(root, "Aux Browser"))).toBe(false);
  });

  it("leaves legacy Vector profile directories untouched and unselected", () => {
    const root = temporaryRoot();
    mkdirSync(join(root, "Vector"), { recursive: true });
    mkdirSync(join(root, "@vector/desktop"), { recursive: true });
    expect(resolveBrowserProfileDirectory(root, true, {})).toBe(join(root, "Aux Browser Profile"));
    expect(existsSync(join(root, "Vector"))).toBe(true);
    expect(existsSync(join(root, "@vector/desktop"))).toBe(true);
  });

  it("honors explicit profile paths and rejects relative overrides", () => {
    const root = temporaryRoot();
    expect(resolveBrowserProfileDirectory(root, true, { AUX_PROFILE_DIR: root })).toBe(root);
    expect(() => resolveBrowserProfileDirectory(root, true, { AUX_PROFILE_DIR: "relative" })).toThrow("absolute");
  });

  it("uses portable Aux paths for new installations", () => {
    const root = temporaryRoot();
    expect(resolveDataDirectory({}, root, "darwin")).toBe(join(root, "Library", "Application Support", "Aux Browser"));
    expect(resolveDataDirectory({}, root, "win32")).toBe(join(root, "AppData", "Local", "Aux Browser"));
    expect(resolveDataDirectory({ XDG_DATA_HOME: join(root, "xdg") }, root, "linux")).toBe(join(root, "xdg", "Aux Browser"));
    expect(resolveDatabasePath(root)).toBe(join(root, "aux-state.sqlite"));
  });

  it("leaves a legacy Vector install untouched and selects the Aux root", () => {
    const root = temporaryRoot();
    const legacy = join(root, "Library", "Application Support", "Vector");
    mkdirSync(legacy, { recursive: true });
    writeFileSync(join(legacy, "vector.sqlite"), "existing");
    expect(resolveDataDirectory({}, root, "darwin")).toBe(join(root, "Library", "Application Support", "Aux Browser"));
    expect(existsSync(join(legacy, "vector.sqlite"))).toBe(true);
  });

  it("refuses a selected directory that still contains a legacy database", () => {
    const root = temporaryRoot();
    writeFileSync(join(root, "vector.sqlite"), "legacy");
    expect(() => resolveDatabasePath(root)).toThrow(/legacy Vector database/);
    expect(existsSync(join(root, "vector.sqlite"))).toBe(true);
    expect(existsSync(join(root, "artifacts"))).toBe(false);
  });

  it("starts and restarts a standalone runtime using only canonical configuration", async () => {
    const root = temporaryRoot();
    const env = { AUX_DATA_DIR: root, AUX_STANDALONE: "0", AUX_API_PORT: "0" };
    const runtime = await startRuntime(env);
    try {
      expect(runtime.port).toBeGreaterThan(0);
      expect(existsSync(join(root, "aux-state.sqlite"))).toBe(true);
      expect(await runtime.invoke("pages.list", {})).toEqual([]);
    } finally {
      await runtime.close();
    }
    const restarted = await startRuntime(env);
    await restarted.close();
    expect(existsSync(join(root, "aux-state.sqlite"))).toBe(true);
  });
});
