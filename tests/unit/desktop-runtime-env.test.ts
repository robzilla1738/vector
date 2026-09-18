import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { desktopRuntimeEnv, resolveDesktopEngineBins } from "../../apps/desktop/main/runtime-env";

function fakeBin(dir: string, name: string): string {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, "#!/bin/sh\n");
  return path;
}

describe("Mac desktop runtime env — Gate B / A (macOS)", () => {
  it("defaults pages to Vector Engine always, without a v* Release", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/vector-data",
      cdpPort: 9333,
      packaged: false,
      electronVersion: "43.0.0",
      env: { PATH: "/usr/bin", HOME: "/tmp" },
    });
    expect(env.VECTOR_ENGINE_MODE).toBe("always");
    expect(env.VECTOR_DATA_DIR).toBe("/tmp/vector-data");
    expect(env.VECTOR_ELECTRON_CDP).toBe("http://127.0.0.1:9333");
    expect(env.VECTOR_ENGINE_PROFILE).toBeUndefined();
  });

  it("does not override an explicit engine mode or profile", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/vector-data",
      cdpPort: 1,
      packaged: true,
      env: { VECTOR_ENGINE_MODE: "auto", VECTOR_ENGINE_PROFILE: "developer" },
    });
    expect(env.VECTOR_ENGINE_MODE).toBe("auto");
    expect(env.VECTOR_ENGINE_PROFILE).toBe("developer");
  });

  it("uses production containment for a packaged Mac build", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/vector-data",
      cdpPort: 1,
      packaged: true,
      env: {},
    });
    expect(env.VECTOR_ENGINE_MODE).toBe("always");
    expect(env.VECTOR_ENGINE_PROFILE).toBe("production");
  });

  it("points the forked runtime at packaged ve-shell and ve-host", () => {
    const resources = mkdtempSync(join(tmpdir(), "vector-res-"));
    const engineDir = join(resources, "engine");
    const shell = fakeBin(engineDir, "ve-shell");
    const host = fakeBin(engineDir, "ve-host");
    const found = resolveDesktopEngineBins({
      packaged: true,
      resourcesPath: resources,
      env: {},
    });
    expect(found).toEqual({ shell, host, resources });
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/vector-data",
      cdpPort: 1,
      packaged: true,
      resourcesPath: resources,
      env: { PATH: "/usr/bin" },
    });
    expect(env.VECTOR_SHELL).toBe(shell);
    expect(env.VECTOR_ENGINE_HOST).toBe(host);
    expect(env.VECTOR_RESOURCES).toBe(resources);
    expect(env.VECTOR_ENGINE_PROFILE).toBe("production");
    expect(env.VECTOR_ENGINE_MODE).toBe("always");
  });

  it("does not override an explicit VECTOR_SHELL", () => {
    const resources = mkdtempSync(join(tmpdir(), "vector-res-"));
    fakeBin(join(resources, "engine"), "ve-shell");
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/d",
      cdpPort: 1,
      packaged: true,
      resourcesPath: resources,
      env: { VECTOR_SHELL: "/explicit/ve-shell" },
    });
    expect(env.VECTOR_SHELL).toBe("/explicit/ve-shell");
  });
});
