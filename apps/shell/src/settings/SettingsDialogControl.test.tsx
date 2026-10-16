// @vitest-environment jsdom
import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SettingsDialogControl } from "./SettingsDialogControl";

it("opens the editor on demand, returns focus on Escape, and retires it when the settings route changes", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  const mounted = vi.fn(),
    retired = vi.fn();
  function Editor() {
    useEffect(() => {
      mounted();
      return retired;
    }, []);
    return <input aria-label="Editor value" />;
  }
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = (active: boolean) =>
    act(async () =>
      root.render(
        <SettingsDialogControl active={active} label="Preferred languages" action="Configure">
          <Editor />
        </SettingsDialogControl>,
      ),
    );
  try {
    await render(true);
    expect(mounted).not.toHaveBeenCalled();
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    trigger.focus();
    await act(async () => trigger.click());
    expect(mounted).toHaveBeenCalledTimes(1);
    const dialog = document.querySelector<HTMLDialogElement>(
      '[role="dialog"][aria-label="Preferred languages"]',
    )!;
    expect(dialog).not.toBeNull();
    await act(async () =>
      dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(retired).toHaveBeenCalledTimes(1);
    await act(async () => trigger.click());
    await render(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(retired).toHaveBeenCalledTimes(2);
    await render(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
