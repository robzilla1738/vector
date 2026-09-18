import { describe, expect, it } from "vitest";
import { desktopRuntimeEnv } from "../../apps/desktop/main/runtime-env";

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
});
