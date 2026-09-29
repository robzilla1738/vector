import { expect, it } from "vitest";
import { auxShellPathFromUrl, settingsPath, settingsRouteFromPath } from "./routes";

it("maps current Settings panels to stable section URLs", () => {
  expect(settingsPath("Appearance")).toBe("/settings/appearance");
  expect(settingsPath("Profiles")).toBe("/settings/profiles");
  expect(settingsPath("Passwords & Autofill")).toBe("/settings/passwords-autofill");
  expect(settingsPath("Connections", "Plugins")).toBe("/settings/skills-plugins");
  expect(settingsPath("Models")).toBe("/settings/models");
  expect(settingsPath("Usage & Budgets")).toBe("/settings/usage-budgets");
  expect(settingsPath("Automations")).toBe("/settings/automations");
  expect(settingsPath("Quick Ask")).toBe("/settings/quick-ask");
  expect(settingsPath("Selection & Capture")).toBe("/settings/selection-capture");
  expect(settingsPath("Archived chats")).toBe("/settings/archived-chats");
  expect(settingsRouteFromPath("/settings/mcp-connectors")).toEqual({
    slug: "mcp-connectors", category: "Connections", connectionTab: "Services",
  });
  expect(settingsRouteFromPath("/settings/appearance/")?.category).toBe("Appearance");
  expect(settingsRouteFromPath("/settings/unknown")).toBeNull();
  expect(settingsRouteFromPath("/elsewhere/settings/appearance")).toBeNull();
});

it("keeps internal Settings URLs in the browser shell", () => {
  expect(auxShellPathFromUrl("chrome://aux/settings/appearance")).toBe("/settings/appearance");
  expect(auxShellPathFromUrl("chrome://aux/")).toBe("/");
  expect(auxShellPathFromUrl("https://example.com/settings/appearance")).toBeNull();
  expect(() => auxShellPathFromUrl("chrome://aux/settings/unknown")).toThrow("isn't available");
});
