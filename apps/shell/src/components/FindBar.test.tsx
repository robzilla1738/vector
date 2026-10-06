// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { FindBar } from "./FindBar";

it("returns focus to the owned conversation scroll after closing Find", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const initial = useStore.getState();
  useStore.setState({ mode: "conversation", overlay: "find", findText: "" });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const scroll = createRef<HTMLDivElement>();
  try {
    await act(async () =>
      root.render(
        <>
          <div ref={scroll} tabIndex={-1} data-find-surface="conversation" />
          <FindBar returnFocusRef={scroll} />
        </>,
      ),
    );
    const input = host.querySelector<HTMLInputElement>('[aria-label="Find in conversation"]')!;
    expect(document.activeElement).toBe(input);
    await act(async () =>
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(document.activeElement).toBe(scroll.current);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    useStore.setState(initial, true);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
