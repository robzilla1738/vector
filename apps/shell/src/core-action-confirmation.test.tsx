import { normalizePages, orderedPages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { executeCommand } from "./commands";
import { ActionConfirmation } from "./components/ActionConfirmation";
import { bridge } from "./bridge";
import { useStore } from "./store";

const stages = vi.hoisted(() => ({ trust: "preview" as "preview" | "off" | "on" }));
vi.mock("./use-feature", () => ({
  featureStage: (feature: string) => (feature === "agentSitePermissions" ? stages.trust : "off"),
  useFeature: (feature: string) => feature === "agentSitePermissions" && stages.trust === "on",
}));
vi.mock("./bridge", async (original) => ({
  ...(await original<typeof import("./bridge")>()),
  inMock: false,
  inNativeHost: true,
}));
let root: ReturnType<typeof createRoot>, original: ReturnType<typeof useStore.getState>;
const confirmation = {
  approvalId: "original-approval",
  turnId: "original-turn",
  threadId: "original-thread",
  instruction: "Allow the explicitly requested destination",
  origin: "http://127.0.0.1:9",
  action: "navigate",
  category: "login" as const,
  confirmation: "preapprovable" as const,
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  original = useStore.getState();
  root = createRoot(document.createElement("div"));
  useStore.setState({ pages: normalizePages([]), confirmation });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
});
afterEach(async () => {
  await act(async () => root.unmount());
  useStore.setState(original, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
for (const stage of ["preview", "off"] as const) {
  it.each(["accept", "decline"] as const)(
    `decides one original page-free %s while site permissions are ${stage}`,
    async (decision) => {
      stages.trust = stage;
      const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
      await act(async () => root.render(<ActionConfirmation />));
      expect(document.body.querySelector('[data-command-id="allow-agent-action-for-origin"]')).toBeNull();
      const button = document.body.querySelector<HTMLButtonElement>(
        decision === "accept" ? '[aria-label="Allow once"]' : '[data-command-id="deny-agent-action"]',
      )!;
      await act(async () => {
        button.click();
        button.click();
      });
      expect(invoke).toHaveBeenCalledExactlyOnceWith("safety.approvals.decide", {
        decision: { decision, approvalId: confirmation.approvalId },
        expectedTurnId: confirmation.turnId,
      });
      expect(orderedPages(useStore.getState().pages)).toEqual([]);
      expect(useStore.getState().confirmation).toBeNull();
    },
  );
  it(`refuses changed original approval payloads before RPC while site permissions are ${stage}`, async () => {
    stages.trust = stage;
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
    await expect(
      executeCommand("approve-agent-action", {
        payload: { approvalId: "retired", turnId: confirmation.turnId },
      }),
    ).rejects.toThrow("ended or changed");
    await expect(
      executeCommand("deny-agent-action", {
        payload: { approvalId: confirmation.approvalId, turnId: "retired" },
      }),
    ).rejects.toThrow("ended or changed");
    await expect(
      executeCommand("allow-agent-action-for-origin", {
        payload: { approvalId: confirmation.approvalId, turnId: confirmation.turnId },
      }),
    ).rejects.toThrow("unavailable");
    expect(invoke).not.toHaveBeenCalled();
  });
}
it("retains a newer confirmation while an original acceptance response is held", async () => {
  stages.trust = "off";
  let release!: () => void;
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ ok: true });
      }),
  );
  const pending = executeCommand("approve-agent-action", {
    payload: { approvalId: confirmation.approvalId, turnId: confirmation.turnId },
  });
  const replacement = { ...confirmation, approvalId: "replacement", turnId: "replacement-turn" };
  useStore.setState({ confirmation: replacement });
  release();
  await pending;
  expect(useStore.getState().confirmation).toBe(replacement);
});
it("takes over the original requested page through core dispatch with site permissions off", async () => {
  stages.trust = "off";
  const activate = vi.fn(async () => {}),
    invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  useStore.setState({
    activePageId: "other",
    activate,
    confirmation: { ...confirmation, approvalId: undefined, confirmation: "handoff", pageId: "requested" },
  });
  await executeCommand("take-over-agent-action", {
    payload: { pageId: "requested", turnId: confirmation.turnId },
  });
  expect(invoke).toHaveBeenCalledExactlyOnceWith("pages.takeover", { pageId: "requested" });
  expect(activate).toHaveBeenCalledExactlyOnceWith("requested");
  expect(useStore.getState().confirmation).toBeNull();
});
