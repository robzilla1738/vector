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
    const allow = host.querySelector<HTMLButtonElement>('[aria-label="Allow"]');
    expect(allow?.textContent).toBe("Allow");
    expect(host.textContent).toContain("Allow this action before it runs.");
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
