import { describe, expect, it } from "vitest";
import { engineModeLabel, readEngineMode } from "./engine";

describe("desktop engine mode — product default", () => {
  it("treats an unset setting as compatibility-first hybrid", () => {
    expect(readEngineMode({})).toBe("auto");
    expect(readEngineMode({ engineMode: "auto" })).toBe("auto");
    expect(readEngineMode({ engineMode: "off" })).toBe("off");
    expect(readEngineMode({ engineMode: "always" })).toBe("always");
    expect(engineModeLabel(readEngineMode({}))).toMatch(/Hybrid/);
  });
});
