import { describe, expect, it } from "vitest";
import {
  FEATURES,
  AuxError,
  auxFeatureStage,
  featureAvailabilityFor,
  featureEnabled,
  requireAuxFeature,
  SettingsSetParams,
} from "@aux/contracts";
import { HostMethods } from "@aux/contracts/host-methods";

describe("feature availability", () => {
  it("enables shipped features without commit qualification", () => {
    expect(FEATURES.every((feature) => feature.default === "on")).toBe(true);
    expect(auxFeatureStage("spaces", "chromium-fork")).toBe("on");
    expect(featureAvailabilityFor([]).memory).toBe("on");
  });

  it("requires native capabilities and honors a user opt-out", () => {
    expect(featureAvailabilityFor([]).layouts).toBe("off");
    expect(featureAvailabilityFor(["setAppearance"]).layouts).toBe("on");
    expect(featureEnabled("memory", { memory: false })).toBe(false);
    expect(featureEnabled("memory", { memory: true })).toBe(true);
    expect(() => requireAuxFeature("layouts", "chromium-fork", featureAvailabilityFor([]))).toThrowError(
      AuxError,
    );
  });

  it("persists only known boolean feature overrides", () => {
    expect(SettingsSetParams.parse({ featureOverrides: { memory: false } }).featureOverrides).toEqual({
      memory: false,
    });
    expect(SettingsSetParams.safeParse({ featureOverrides: { memory: "off" } }).success).toBe(false);
    expect(SettingsSetParams.safeParse({ featureOverrides: { unknown: false } }).success).toBe(false);
  });

  it("keeps persistence-dependent boots unavailable in an ephemeral native Profile", () => {
    const methods = Object.keys(HostMethods);
    const normal = featureAvailabilityFor(methods);
    expect(normal.demonstrationSkills).toBe("on");
    expect(normal.overnightReview).toBe("on");
    const privateProfile = featureAvailabilityFor(
      methods.filter((method) => method !== "native.profileStorageRoot"),
    );
    expect(privateProfile.demonstrationSkills).toBe("off");
    expect(privateProfile.overnightReview).toBe("off");
    expect(privateProfile.layouts).toBe("on");
  });
});
