// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Extensions } from "./Extensions";
import { bridge } from "../bridge";
import { extensionInventory } from "../features/extensions/extension-inventory";
vi.mock("../bridge", () => ({
  bridge: {
    windowKind: "normal",
    privateMode: false,
    extensions: vi.fn(),
    onExtensionActionsChanged: vi.fn(() => () => {}),
  },
  inNativeHost: true,
}));
vi.mock("../use-feature", () => ({ useFeature: () => true }));
vi.mock("../commands", () => ({ executeCommand: vi.fn(), runCommand: vi.fn() }));
it("retains the focused native permission disclosure and complete text inside the established hit target", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const original = extensionInventory.getState();
  const permission = "https://permission.fixture.invalid/" + "account".repeat(90);
  vi.mocked(bridge.extensions).mockResolvedValue([
    {
      key: "owned-test-extension",
      name: "Owned fixture",
      version: "1.0",
      permissions: ["storage", permission],
      enabled: true,
      loaded: true,
      managed: false,
      source: "environment",
    },
  ]);
  extensionInventory.setState({ items: [], loading: true, busy: false, error: "", message: "" });
  const host = document.createElement("div"),
    style = document.createElement("style");
  document.body.append(host);
  document.head.append(style);
  const root = createRoot(host);
  const css = readFileSync("apps/shell/src/components/Settings.css", "utf8");
  const target = css.match(/\.extension-compatibility summary, \.extension-details summary\s*\{[^}]+\}/)?.[0];
  const hit = readFileSync("apps/shell/src/tokens.css", "utf8").match(/--hit:\s*(\d+px)/)?.[1];
  expect(target).toBeTruthy();
  expect(hit).toBe("32px");
  style.textContent = target!.replaceAll("var(--hit)", hit!);
  try {
    await act(async () => root.render(<Extensions />));
    const details = host.querySelector<HTMLDetailsElement>(".extension-details")!,
      summary = details.querySelector("summary")!;
    expect(summary.textContent).toBe("Permissions");
    expect(details.open).toBe(false);
    expect(getComputedStyle(summary).minHeight).toBe(hit);
    expect((style.sheet!.cssRules[0] as CSSStyleRule).style.getPropertyValue("padding")).toBe(
      "var(--space-1) 0",
    );
    summary.focus();
    expect(document.activeElement).toBe(summary);
    const key = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    summary.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(false);
    // jsdom cannot execute the browser's keyboard activation default. Its real summary click default remains usable.
    await act(async () => summary.click());
    expect(details.open).toBe(true);
    expect(details.querySelector("p")!.textContent).toBe("storage, " + permission);
    expect(document.activeElement).toBe(summary);
    await act(async () => summary.click());
    expect(details.open).toBe(false);
    expect(details.querySelector("p")!.textContent).toBe("storage, " + permission);
    expect(bridge.extensions).toHaveBeenCalledTimes(1);
    const unrelated = document.createElement("summary");
    host.append(unrelated);
    expect(getComputedStyle(unrelated).minHeight).not.toBe(hit);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    extensionInventory.setState(original);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
