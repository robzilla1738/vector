import { describe, expect, it } from "vitest";
import { engineModeLabel, readEngineMode } from "./engine";

describe("desktop engine mode — Mac product default", () => {
  it("treats an unset setting as Vector Engine always, not Chromium off", () => {
    expect(readEngineMode({})).toBe("always");
    expect(readEngineMode({ engineMode: "auto" })).toBe("auto");
    expect(readEngineMode({ engineMode: "off" })).toBe("off");
    expect(readEngineMode({ engineMode: "always" })).toBe("always");
    expect(engineModeLabel(readEngineMode({}))).toMatch(/Vector Engine only/);
  });
});
