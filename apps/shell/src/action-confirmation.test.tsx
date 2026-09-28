// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ActionConfirmation } from "./components/ActionConfirmation";
import { bridge } from "./bridge";
import { reduceRunEvent } from "./store/events";
import { useStore } from "./store";
import type { Workspace } from "./store/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("shows one Allow button for a confirmation event and decides the approval once", async () => {
  const original = useStore.getState();
  const event = {
    seq: 1, streamId: "test", ts: 1, type: "safety.confirmation",
    payload: {
      approvalId: "ap-1", turnId: "turn-1", instruction: "Allow this action before it runs.",
      action: "click", origin: "http://127.0.0.1:9",
    },
  };
  const next = reduceRunEvent({} as Workspace, event);
  expect(next?.confirmation).toMatchObject({ approvalId: "ap-1", turnId: "turn-1" });
  useStore.setState({ confirmation: next!.confirmation });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => { root.render(<ActionConfirmation />); });
    const allow = document.body.querySelector<HTMLButtonElement>('[aria-label="Allow"]');
    expect(allow?.textContent).toBe("Allow");
    expect(document.body.textContent).toContain("Allow this action before it runs.");
    await act(async () => { allow!.click(); allow!.click(); });
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("safety.approvals.decide", {
      decision: { decision: "accept", approvalId: "ap-1" },
      expectedTurnId: "turn-1",
    });
    expect(useStore.getState().confirmation).toBeNull();
  } finally {
    await act(async () => { root.unmount(); });
    invoke.mockRestore();
    useStore.setState(original, true);
  }
});

it("treats native dialog cancellation as a declined approval", async () => {
  const original = useStore.getState();
  useStore.setState({ confirmation: {
    approvalId: "ap-cancel", turnId: "turn-cancel", instruction: "Confirm fixture action",
    action: "click", origin: "http://127.0.0.1:9",
  } as never });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const root = createRoot(document.createElement("div"));
  try {
    await act(async () => root.render(<ActionConfirmation />));
    const dialog = document.body.querySelector('dialog[aria-label="Allow this action"]')!;
    await act(async () => dialog.dispatchEvent(new Event("cancel", { bubbles: false, cancelable: true })));
    expect(invoke).toHaveBeenCalledWith("safety.approvals.decide", {
      decision: { decision: "decline", approvalId: "ap-cancel" },
      expectedTurnId: "turn-cancel",
    });
  } finally {
    await act(async () => root.unmount());
    useStore.setState(original, true);
    vi.restoreAllMocks();
  }
});
