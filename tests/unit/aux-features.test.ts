import { describe, expect, it } from "vitest";
import { AUX_FEATURES, AuxError, auxFeatureEnabled, auxFeatureForBridgeMethod, auxFeatureForMethod, auxFeatureStage, requireAuxFeature, requireAuxMethod } from "@aux/contracts";
import { AUX_FEATURE_REQUIREMENTS, deriveAuxFeatureStages } from "../../packages/contracts/src/feature-requirements";

describe("AuxFeature staging", () => {
  it("registers every product feature with an owning batch", () => {
    expect(Object.keys(AUX_FEATURES).length).toBeGreaterThan(70);
    expect(new Set(Object.values(AUX_FEATURES))).toEqual(new Set(["B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11"]));
  });

  it("keeps unqualified native features closed", () => {
    expect(auxFeatureStage("spaces", "chromium-fork")).toBe("off");
    expect(() => requireAuxMethod("spaces.create", "chromium-fork")).toThrowError(AuxError);
    expect(() => requireAuxMethod("spaces.import", "chromium-fork")).not.toThrow();
    expect(auxFeatureStage("passwordManager", "chromium-fork")).toBe("off");
    expect(auxFeatureStage("vault", "electron")).toBe("on");
    expect(auxFeatureStage("vault", "chromium-fork")).toBe("off");
    expect(auxFeatureStage("spaces", "electron")).toBe("on");
    expect(auxFeatureEnabled("spaces", "chromium-fork", { spaces: "preview" })).toBe(false);
    expect(auxFeatureEnabled("spaces", "chromium-fork", { spaces: "on" })).toBe(true);
  });

  it("derives stages from implemented methods and the exact passing commit", () => {
    const methods = AUX_FEATURE_REQUIREMENTS.spaces.requires;
    const journey = AUX_FEATURE_REQUIREMENTS.spaces.journey;
    expect(deriveAuxFeatureStages([], {}, "a").spaces).toBe("off");
    expect(deriveAuxFeatureStages(methods, {}, "a").spaces).toBe("preview");
    expect(deriveAuxFeatureStages(methods, { [journey]: "b" }, "a").spaces).toBe("preview");
    expect(deriveAuxFeatureStages(methods, { [journey]: "a" }, "a").spaces).toBe("on");
    expect(AUX_FEATURE_REQUIREMENTS.layouts.requires).toContain("setAppearance");
    expect(deriveAuxFeatureStages([], {}, "a").layouts).toBe("off");
    expect(deriveAuxFeatureStages(["setAppearance"], {}, "a").layouts).toBe("preview");
  });

  it("returns a typed registry error for disabled runtime and bridge features", () => {
    expect(auxFeatureForMethod("vault.fill")).toBe("vault");
    expect(auxFeatureForBridgeMethod("vaultFill")).toBe("vault");
    for (const method of ["dictationStatus", "startDictation", "stopDictation", "cancelDictation"]) {
      expect(auxFeatureForBridgeMethod(method)).toBe("dictation");
    }
    expect(() => requireAuxFeature("dictation", "chromium-fork")).toThrowError(AuxError);
    expect(() => requireAuxFeature("dictation", "chromium-fork", { dictation: "on" })).not.toThrow();
    expect(() => requireAuxMethod("vault.fill", "chromium-fork")).toThrowError(AuxError);
    expect(() => requireAuxFeature("spaces", "chromium-fork", { spaces: "preview" })).toThrowError(/preview/);
    expect(() => requireAuxMethod("pages.list", "chromium-fork")).not.toThrow();
  });
});
