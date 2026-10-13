// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultSelectionCaptureSettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { invokeScopedControl } from "../../scoped-control-commands";
import { SelectionCaptureSettings } from "./SelectionCapture";
import { AutofillSetting } from "../../components/AutofillSetting";
/** Mounted DOM/control ledger from pinned before source, with the duplicate category
 * heading removed because the Settings shell supplies it. This checks section content
 * and control equivalence, never native pixel or hit geometry proof. */
it("keeps the section hierarchy, full copy, attributes and local action results", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 160, height: 36 },
  ] as unknown as DOMRectList);
  const previous = {
    windowId: bridge.windowId,
    windowKind: bridge.windowKind,
    privateMode: bridge.privateMode,
    connected: useStore.getState().connected,
  };
  bridge.windowId = "original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  useStore.setState({ connected: true });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const settings = { selectionCapture: defaultSelectionCaptureSettings() };
  const saved = vi.fn().mockResolvedValue(false);
  const native = vi.spyOn(bridge, "invoke");
  const button = (text: string) =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (node) => node.textContent?.trim() === text,
    )!;
  async function invoke(command: string, target: HTMLElement) {
    await act(async () => {
      target.focus();
      await invokeScopedControl(command);
    });
  }
  const states: unknown[] = [];
  function record() {
    const ids = new Map(
      [...host.querySelectorAll<HTMLElement>("[id]")].map((node, index) => [node.id, `original-id-${index}`]),
    );
    function node(value: Node): unknown {
      if (value.nodeType === Node.TEXT_NODE) return { text: value.textContent };
      if (!(value instanceof Element)) return null;
      const attrs = [...value.attributes]
        .map((attr) => [
          attr.name,
          attr.value
            .split(" ")
            .map((part) => ids.get(part) ?? part)
            .join(" "),
        ])
        .sort(([a], [b]) => a!.localeCompare(b!));
      const state =
        value instanceof HTMLInputElement
          ? { value: value.value, checked: value.checked }
          : value instanceof HTMLTextAreaElement
            ? { value: value.value }
            : {};
      return { tag: value.tagName, attrs, state, children: [...value.childNodes].map(node) };
    }
    states.push({
      tree: node(host),
      focused: [...host.querySelectorAll("*")].indexOf(document.activeElement!),
      saved: saved.mock.calls.map((call) => call[0]),
    });
  }
  try {
    await act(async () =>
      root.render(<SelectionCaptureSettings active settings={settings} onSave={saved} />),
    );
    record();
    await invoke("move-selection-action-up", host.querySelector('[aria-label="Move Explain up"]')!);
    record();
    await invoke("preview-selection-action", button("Preview Explain"));
    record();
    await invoke("close-selection-action-preview", button("Close preview"));
    await invoke("remove-selection-action", host.querySelector('[aria-label="Remove Explain"]')!);
    record();
    await invoke("toggle-selection-action", host.querySelector('input[type="checkbox"]')!);
    await invoke("save-selection-capture-settings", button("Save Selection & Capture"));
    record();
    expect(native).not.toHaveBeenCalled();
    const fixture = resolve("apps/shell/src/settings/sections/SelectionCapture.original-dom.json");
    // Text-node boundaries are an output-format detail; full text, hierarchy and controls remain checked.
    const isText = (value: unknown): value is { text: string } =>
      !!value &&
      typeof value === "object" &&
      Object.keys(value).length === 1 &&
      "text" in value &&
      typeof value.text === "string";
    function canonical(value: unknown): unknown {
      if (Array.isArray(value))
        return value.map(canonical).reduce<unknown[]>((items, current) => {
          const previous = items.at(-1);
          if (isText(previous) && isText(current))
            items[items.length - 1] = { text: previous.text + current.text };
          else items.push(current);
          return items;
        }, []);
      if (value && typeof value === "object")
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));
      return value;
    }
    expect(canonical(states)).toEqual(canonical(JSON.parse(readFileSync(fixture, "utf8"))));
  } finally {
    await act(async () => root.unmount());
    host.remove();
    Object.assign(bridge, {
      windowId: previous.windowId,
      windowKind: previous.windowKind,
      privateMode: previous.privateMode,
    });
    useStore.setState({ connected: previous.connected });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});

it("keeps the actual Autofill primitive rejection identity and caller-owned String diagnostic", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as never);
  const original = {
    windowId: bridge.windowId,
    windowKind: bridge.windowKind,
    privateMode: bridge.privateMode,
  };
  bridge.windowId = "original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const reason = "Original primitive Autofill failure";
  const save = vi.fn().mockRejectedValue(reason);
  try {
    await act(async () => root.render(<AutofillSetting value={undefined} onSave={save} />));
    const buttons = () => [...host.querySelectorAll<HTMLButtonElement>("button")];
    await act(async () => {
      buttons()
        .find((node) => node.textContent === "Add personal info")!
        .focus();
      invokeScopedControl("edit-personal-info");
    });
    const name = host.querySelector<HTMLInputElement>('input[autocomplete="name"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        name,
        "Original synthetic author",
      );
      name.dispatchEvent(new Event("input", { bubbles: true }));
    });
    let result!: Promise<unknown>;
    await act(async () => {
      buttons()
        .find((node) => node.textContent === "Save")!
        .focus();
      result = invokeScopedControl("save-personal-info") as Promise<unknown>;
      await expect(result).rejects.toBe(reason);
    });
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(reason);
    expect(name.value).toBe("Original synthetic author");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    Object.assign(bridge, original);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
