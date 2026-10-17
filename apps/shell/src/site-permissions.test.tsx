import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { ContentBlockingSettings } from "./settings/sections/ContentBlocking";
import { SitePermissions } from "./components/SitePermissions";
import { useStore } from "./store";
const featureFlags = vi.hoisted(() => ({ contentBlocking: false }));
vi.mock("./use-feature", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./use-feature")>()),
  useFeature: (feature: string) => featureFlags[feature as keyof typeof featureFlags] ?? false,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("loads site permissions without calling preview privacy methods", async () => {
  const permissions = vi
    .spyOn(bridge, "sitePermissions")
    .mockResolvedValue({ "https://example.com": { notifications: "allow" } });
  const privacy = vi.spyOn(bridge, "privacy").mockRejectedValue(new Error("contentBlocking is preview"));
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<SitePermissions />));
    expect(permissions).toHaveBeenCalledOnce();
    expect(privacy).not.toHaveBeenCalled();
    expect(host.textContent).toContain("https://example.com");
    expect(host.textContent).not.toContain("contentBlocking is preview");
    expect(host.querySelector('[aria-label="Privacy"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});
it("keeps a confirmed reset successful when refreshing permissions fails", async () => {
  vi.spyOn(bridge, "sitePermissions")
    .mockResolvedValueOnce({ "https://example.com": { notifications: "allow" } })
    .mockRejectedValue(new Error("Refresh unavailable"));
  const clear = vi.spyOn(bridge, "clearSitePermission").mockResolvedValue(true);
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<SitePermissions />));
    const reset = Array.from(host.querySelectorAll("button")).find(
      (button) => button.textContent === "Reset site",
    )!;
    await act(async () => {
      reset.click();
      reset.click();
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll(".site-permission-group")).toHaveLength(0);
    expect(host.querySelector("output")?.textContent).toContain("Decision reset");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Couldn’t refresh permissions");
    expect(host.textContent).not.toContain("No saved website permissions");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});
it("shows a failed website data clear without claiming the data was removed", async () => {
  const initial = useStore.getState();
  useStore.setState({
    pages: normalizePages([{ pageId: "site", url: "https://example.com/path", backend: "aux" }] as never),
  });
  vi.spyOn(bridge, "sitePermissions").mockResolvedValue({});
  vi.spyOn(bridge, "siteDataCount").mockResolvedValue({ domain: "example.com", cookies: 1 });
  vi.spyOn(bridge, "clearSiteData").mockResolvedValue(false);
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<SitePermissions />));
    const clear = Array.from(host.querySelectorAll("button")).find(
      (button) => button.textContent === "Clear website data…",
    )!;
    await act(async () => clear.click());
    expect(bridge.clearSiteData).not.toHaveBeenCalled();
    const confirm = Array.from(host.querySelectorAll("button")).find(
      (button) => button.textContent === "Clear cookies and storage",
    )!;
    await act(async () => confirm.click());
    expect(bridge.clearSiteData).toHaveBeenCalledWith("site");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Website data could not be cleared");
    expect(host.textContent).not.toContain("Cookies and stored website data cleared");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    useStore.setState(initial, true);
  }
});
it("previews a site cookie count and lets the user cancel without deletion", async () => {
  const initial = useStore.getState();
  useStore.setState({
    pages: normalizePages([{ pageId: "site", url: "https://example.com/path", backend: "aux" }] as never),
  });
  vi.spyOn(bridge, "sitePermissions").mockResolvedValue({});
  vi.spyOn(bridge, "siteDataCount").mockResolvedValue({ domain: "example.com", cookies: 2 });
  const clear = vi.spyOn(bridge, "clearSiteData");
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<SitePermissions />));
    expect(host.textContent).toContain("2 cookies in example.com");
    await act(async () =>
      Array.from(host.querySelectorAll("button"))
        .find((button) => button.textContent === "Clear website data…")!
        .click(),
    );
    expect(host.textContent).toContain("Remove 2 cookies");
    await act(async () =>
      Array.from(host.querySelectorAll("button"))
        .find((button) => button.textContent === "Cancel")!
        .click(),
    );
    expect(host.textContent).not.toContain("Clear cookies and storage");
    expect(clear).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    useStore.setState(initial, true);
  }
});
it("does not change privacy settings when their current state is unavailable", async () => {
  featureFlags.contentBlocking = true;
  vi.spyOn(bridge, "sitePermissions").mockResolvedValue({});
  vi.spyOn(bridge, "privacy").mockRejectedValue(new Error("Profile unavailable"));
  const tracker = vi.spyOn(bridge, "setTrackerBlock");
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<ContentBlockingSettings active />));
    expect(host.querySelectorAll('input[role="switch"]:disabled')).toHaveLength(1);
    expect(tracker).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    featureFlags.contentBlocking = false;
    vi.restoreAllMocks();
  }
});
