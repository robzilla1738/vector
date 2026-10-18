// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { defaultSelectionCaptureSettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { SelectionCaptureSettings } from "./SelectionCapture";
import type { SelectionActionEditor } from "./SelectionActionEditor";

const editors = vi.hoisted(() => [] as ComponentProps<typeof SelectionActionEditor>[]);
vi.mock("./SelectionActionEditor", async (original) => {
  const actual = await original<typeof import("./SelectionActionEditor")>();
  return {
    ...actual,
    SelectionActionEditor: (props: ComponentProps<typeof SelectionActionEditor>) => {
      editors.push(props);
      return <actual.SelectionActionEditor {...props} />;
    },
  };
});

it.each(["Cancel", "reload"] as const)(
  "ignores a retained original %s callback after the real editor is replaced and can cancel the current conflicted draft",
  async (callback) => {
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
    const originalConnected = useStore.getState().connected;
    useStore.setState({ connected: true });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host),
      save = vi.fn();
    let settings = defaultSelectionCaptureSettings();
    const render = () =>
      act(async () =>
        root.render(
          <SelectionCaptureSettings active settings={{ selectionCapture: settings }} onSave={save} />,
        ),
      );
    const button = (text: string) =>
      [...document.querySelectorAll<HTMLButtonElement>("button")].find(
        (node) => node.textContent?.trim() === text,
      )!;
    try {
      await render();
      const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Edit Explain"]')!;
      await act(async () => trigger.click());
      const old = editors.at(-1)!;
      settings = {
        ...settings,
        revision: 1,
        actions: settings.actions.map((action) =>
          action.id === "explain" ? { ...action, template: "Replacement {text}" } : action,
        ),
      };
      await render();
      await act(async () => button("Reload saved action").click());
      const replacement = editors.at(-1)!;
      expect(replacement.edit).not.toBe(old.edit);
      expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(
        "Replacement {text}",
      );
      await act(async () => {
        if (callback === "Cancel") old.onClose();
        else
          old.onReload({
            action: { ...old.edit.action, template: "Retired callback {text}" },
            position: old.edit.position,
          });
      });
      expect(editors.at(-1)!.edit).toBe(replacement.edit);
      expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(
        "Replacement {text}",
      );
      expect(save).not.toHaveBeenCalled();
      const beforeReconnect = editors.at(-1)!;
      await act(async () => useStore.setState({ connected: false }));
      await act(async () => useStore.setState({ connected: true }));
      await act(async () => button("Resume editing").click());
      const resumed = editors.at(-1)!;
      expect(resumed.edit).not.toBe(beforeReconnect.edit);
      expect(resumed.edit.key).toBe(beforeReconnect.edit.key);
      await act(async () => {
        if (callback === "Cancel") beforeReconnect.onClose();
        else
          beforeReconnect.onReload({
            action: beforeReconnect.edit.action,
            position: beforeReconnect.edit.position,
          });
      });
      expect(editors.at(-1)!.edit).toBe(resumed.edit);
      expect(document.querySelector<HTMLTextAreaElement>("dialog textarea")!.value).toBe(
        "Replacement {text}",
      );
      expect(save).not.toHaveBeenCalled();
      settings = { ...settings, revision: 2 };
      await render();
      expect(document.querySelector<HTMLButtonElement>('dialog [type="submit"]')!.disabled).toBe(true);
      await act(async () => button("Cancel").click());
      expect(document.querySelector("dialog")).toBeNull();
      expect(document.activeElement).toBe(trigger);
      expect(save).not.toHaveBeenCalled();
    } finally {
      await act(async () => root.unmount());
      host.remove();
      Object.assign(bridge, original);
      useStore.setState({ connected: originalConnected });
      editors.length = 0;
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  },
);
