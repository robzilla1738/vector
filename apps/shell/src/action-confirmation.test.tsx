// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ActionConfirmation } from "./components/ActionConfirmation";
import { bridge } from "./bridge";
import { reduceRunEvent } from "./store/events";
import { useStore } from "./store";
import type { Workspace } from "./store/types";

vi.mock("./bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./bridge")>()),
  inMock: true,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("shows one Allow once button for a confirmation event and decides the approval once", async () => {
  const original = useStore.getState();
  const event = {
    seq: 1,
    streamId: "test",
    ts: 1,
    type: "safety.confirmation",
    payload: {
      approvalId: "ap-1",
      turnId: "turn-1",
      instruction: "Allow this action before it runs.",
      category: "interact",
      confirmation: "action",
      threadId: "thread-1",
      action: "click",
      origin: "http://127.0.0.1:9",
    },
  };
  const next = reduceRunEvent({ runs: [] } as unknown as Workspace, event);
  expect(next?.confirmation).toMatchObject({ approvalId: "ap-1", turnId: "turn-1" });
  useStore.setState({ confirmation: next!.confirmation });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(<ActionConfirmation />);
    });
    const allow = document.body.querySelector<HTMLButtonElement>('[aria-label="Allow once"]');
    expect(allow?.textContent).toBe("Allow once");
    expect(document.activeElement?.textContent).toBe("Deny");
    expect(document.body.textContent).toContain("Allow this action before it runs.");
    await act(async () => {
      allow!.click();
      allow!.click();
    });
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("safety.approvals.decide", {
      decision: { decision: "accept", approvalId: "ap-1" },
      expectedTurnId: "turn-1",
    });
    expect(useStore.getState().confirmation).toBeNull();
  } finally {
    await act(async () => {
      root.unmount();
    });
    invoke.mockRestore();
    useStore.setState(original, true);
  }
});

it("treats native dialog cancellation as a declined approval", async () => {
  const original = useStore.getState();
  useStore.setState({
    confirmation: {
      approvalId: "ap-cancel",
      turnId: "turn-cancel",
      instruction: "Confirm fixture action",
      category: "interact",
      confirmation: "action",
      threadId: "thread-1",
      action: "click",
      origin: "http://127.0.0.1:9",
    },
  });
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

it("offers durable origin consent only for the final preapprovable tier", async () => {
  const original = useStore.getState();
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const root = createRoot(document.createElement("div"));
  const base = {
    approvalId: "ap-login",
    turnId: "turn-login",
    threadId: "thread-login",
    instruction: "Allow fixture login",
    action: "submit",
    origin: "http://127.0.0.1:9",
    category: "login" as const,
    confirmation: "preapprovable" as const,
  };
  try {
    useStore.setState({ confirmation: base });
    await act(async () => root.render(<ActionConfirmation />));
    const always = document.body.querySelector<HTMLButtonElement>(
      '[data-command-id="allow-agent-action-for-origin"]',
    );
    expect(always?.textContent).toBe("Always allow on 127.0.0.1:9");
    await act(async () => always!.click());
    expect(invoke).toHaveBeenCalledWith("safety.approvals.decide", {
      decision: { decision: "acceptForOrigin", approvalId: "ap-login" },
      expectedTurnId: "turn-login",
    });
    await act(async () =>
      useStore.setState({ confirmation: { ...base, approvalId: "ap-sensitive", confirmation: "action" } }),
    );
    expect(document.body.querySelector('[data-command-id="allow-agent-action-for-origin"]')).toBeNull();
    expect(document.body.querySelector('[aria-label="Allow once"]')).not.toBeNull();
  } finally {
    await act(async () => root.unmount());
    useStore.setState(original, true);
    vi.restoreAllMocks();
  }
});

it("hands off the actual requested page even when another tab is selected", async () => {
  const original = useStore.getState();
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  const activate = vi.fn(async () => {});
  const root = createRoot(document.createElement("div"));
  useStore.setState({
    activePageId: "unrelated-tab",
    activate,
    confirmation: {
      turnId: "turn-handoff",
      threadId: "thread-handoff",
      instruction: "Complete this directly in the site.",
      action: "submit",
      category: "password_change",
      confirmation: "handoff",
      pageId: "requested-tab",
      origin: "http://127.0.0.1:9",
    },
  });
  try {
    await act(async () => root.render(<ActionConfirmation />));
    expect(document.body.querySelector('[data-command-id="allow-agent-action-for-origin"]')).toBeNull();
    expect(document.body.querySelector('[aria-label="Allow once"]')).toBeNull();
    await act(async () =>
      document.body.querySelector<HTMLButtonElement>('[aria-label="Take over"]')!.click(),
    );
    expect(invoke).toHaveBeenCalledWith("pages.takeover", { pageId: "requested-tab" });
    expect(activate).toHaveBeenCalledWith("requested-tab");
    expect(invoke).not.toHaveBeenCalledWith("pages.resume", expect.anything());
    expect(useStore.getState().confirmation).toBeNull();
  } finally {
    await act(async () => root.unmount());
    useStore.setState(original, true);
    vi.restoreAllMocks();
  }
});
