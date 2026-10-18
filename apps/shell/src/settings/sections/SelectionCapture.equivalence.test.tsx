// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { invokeScopedControl } from "../../scoped-control-commands";
import { SelectionCaptureSettings } from "./SelectionCapture";
import { AutofillSetting } from "../../components/AutofillSetting";
it("discards only the local action draft on editor dismissal and retires its registered controls", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as never);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const originalConnected = useStore.getState().connected;
  useStore.setState({ connected: true });
  const saved = vi.fn();
  const native = vi.spyOn(bridge, "invoke");
  try {
    await act(async () => root.render(<SelectionCaptureSettings active settings={{}} onSave={saved} />));
    expect(host.querySelector("textarea")).toBeNull();
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Edit Explain"]')!;
    await act(async () => trigger.click());
    const editor = document.querySelector<HTMLDialogElement>("dialog")!;
    const template = editor.querySelector("textarea")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(
        template,
        "Review {text}",
      );
      template.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const retired = editor.querySelector<HTMLButtonElement>('[aria-label="Remove Explain"]')!;
    await act(async () =>
      editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.activeElement).toBe(trigger);
    expect(document.querySelector("dialog")).toBeNull();
    expect(() =>
      invokeScopedControl("remove-selection-action", { nativeInputEvent: new MouseEvent("click") }),
    ).toThrow();
    await act(async () => retired.click());
    expect(host.querySelectorAll(".selection-action-row")).toHaveLength(4);
    await act(async () => trigger.click());
    expect(document.querySelector("dialog textarea")).not.toHaveProperty("value", "Review {text}");
    expect(saved).not.toHaveBeenCalled();
    expect(native).not.toHaveBeenCalled();
    await act(async () =>
      root.render(<SelectionCaptureSettings active={false} settings={{}} onSave={saved} />),
    );
    expect(document.querySelector("dialog")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState({ connected: originalConnected });
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
