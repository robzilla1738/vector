import { describe, expect, it } from "vitest";
import { desktopRuntimeEnv } from "../../apps/desktop/main/runtime-env";

describe("desktop runtime env", () => {
  it("points the forked runtime at the shell data dir and CDP endpoint", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/aux-data",
      profileId: "work-profile",
      cdpPort: 9333,
      electronVersion: "43.0.0",
      env: { PATH: "/usr/bin", HOME: "/tmp" },
    });
    expect(env.AUX_DATA_DIR).toBe("/tmp/aux-data");
    expect(env.AUX_BROWSER_PROFILE_ID).toBe("work-profile");
    expect(env.AUX_ELECTRON_CDP).toBe("http://127.0.0.1:9333");
    expect(env.AUX_ELECTRON_VERSION).toBe("43.0.0");
    expect(env.ELECTRON_RUN_AS_NODE).toBe("1");
    expect(env.AUX_IPC).toBe("1");
  });

  it("lets shell-owned coordinates win over inherited environment values", () => {
    const env = desktopRuntimeEnv({
      dataDir: "/tmp/aux-data",
      profileId: "work-profile",
      cdpPort: 1,
      env: { AUX_DATA_DIR: "/elsewhere", AUX_BROWSER_PROFILE_ID: "wrong-profile", AUX_API_TOKEN: "tok", VECTOR_DATA_DIR: "/legacy" },
    });
    expect(env.AUX_DATA_DIR).toBe("/tmp/aux-data");
    expect(env.AUX_BROWSER_PROFILE_ID).toBe("work-profile");
    expect(env.AUX_API_TOKEN).toBe("tok");
  });
});
