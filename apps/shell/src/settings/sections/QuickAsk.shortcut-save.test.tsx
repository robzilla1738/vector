// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { ShortcutOverrides } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { QuickAskSettings } from "./QuickAsk";

vi.mock("../../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../bridge")>()),
  inNativeHost: true,
}));

it("keeps newer authoritative shortcuts when an earlier Quick Ask save finishes late", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const original = useStore.getState();
  const initial: ShortcutOverrides = { "quick-ask": [{ key: "j", command: true, shift: true }] };
  const newer: ShortcutOverrides = {
    "quick-ask": [{ key: "y", command: true, shift: true }],
    sidebar: [{ key: "s", command: true, alt: true }],
  };
  let nativeBindings: unknown = initial;
  vi.spyOn(bridge, "setShortcutOverrides").mockImplementation(async (bindings) => {
    nativeBindings = bindings;
    return true;
  });
  vi.spyOn(bridge, "quickAskShortcut").mockResolvedValue({ enabled: true, registered: true, error: "" });
  let finishSave!: (saved: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finishSave = resolve;
      }),
  );
  function Settings() {
    const settings = useStore((state) => state.settings);
    return <QuickAskSettings active settings={settings} onSave={save} />;
  }
  useStore.setState({ settings: { shortcutOverrides: initial }, connected: false });
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () => root.render(<Settings />));
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Reset Quick Ask shortcut"]')!.click(),
    );
    expect(save).toHaveBeenCalledWith({ shortcutOverrides: {} });

    await act(async () =>
      useStore.getState().applyEvent({
        seq: 1,
        streamId: "shortcut-save",
        ts: Date.now(),
        type: "settings.changed",
        payload: { settings: { shortcutOverrides: newer } },
      }),
    );
    expect(nativeBindings).toEqual(newer);
    await act(async () => finishSave(true));

    expect(nativeBindings).toEqual(newer);
    expect(bridge.setShortcutOverrides).toHaveBeenCalledTimes(1);
    expect(useStore.getState().settings.shortcutOverrides).toEqual(newer);
    expect(bridge.quickAskShortcut).toHaveBeenCalledTimes(2);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.querySelector<HTMLInputElement>('[aria-label="Change Quick Ask shortcut"]')!.disabled).toBe(
      false,
    );
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(original);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
