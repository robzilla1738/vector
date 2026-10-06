// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { SuspensionPrompt } from "./features/permissions/SuspensionPrompt";
import { bridge } from "./bridge";
import { reduceRunEvent } from "./store/events";
import { useStore } from "./store";
import type { TrustConfirmation } from "./features/trust/confirmation";
const request: TrustConfirmation = {
  approvalId: "ap-1",
  turnId: "turn-1",
  threadId: "thread-1",
  instruction: "Send the requested message.",
  action: "send",
  origin: "https://fixture.test",
  site: "https://fixture.test",
  category: "send",
  policyCategory: "send",
  kind: "approval",
  confirmation: "action",
};
let initial: ReturnType<typeof useStore.getState>, host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  initial = useStore.getState();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({ confirmation: { ...request } });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (label: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((value) =>
    value.textContent?.startsWith(label),
  )!;
it("shares one pending decision between composer card and page pill without moving focus", async () => {
  let resolve!: () => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((done) => {
        resolve = () => done({ ok: true });
      }),
  );
  const input = document.createElement("textarea");
  document.body.append(input);
  input.focus();
  try {
    await act(async () =>
      root.render(
        <>
          <SuspensionPrompt />
          <SuspensionPrompt pill />
        </>,
      ),
    );
    expect(host.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(input);
    await act(async () => {
      button("Allow once").click();
      button("Always allow").click();
    });
    expect(invoke).toHaveBeenCalledExactlyOnceWith("safety.approvals.decide", {
      decision: { decision: "accept", approvalId: request.approvalId },
      expectedTurnId: request.turnId,
    });
    expect([...host.querySelectorAll("button")].every((value) => value.disabled)).toBe(true);
    await act(async () => resolve());
    expect(useStore.getState().confirmation).toBeNull();
  } finally {
    input.remove();
  }
});
it("declines the exact request on Escape", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true });
  await act(async () => root.render(<SuspensionPrompt />));
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(invoke).toHaveBeenCalledExactlyOnceWith("safety.approvals.decide", {
    decision: { decision: "decline", approvalId: request.approvalId },
    expectedTurnId: request.turnId,
  });
});
it("uses native device authentication rather than an ordinary acceptance", async () => {
  const auth = vi
    .spyOn(bridge, "auth.confirm")
    .mockResolvedValue({ ok: true, approvalId: request.approvalId!, turnId: request.turnId });
  const invoke = vi.spyOn(bridge, "invoke");
  useStore.setState({
    confirmation: { ...request, kind: "touch-id", category: "payment", policyCategory: "money" },
  });
  await act(async () => root.render(<SuspensionPrompt />));
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true, cancelable: true }),
    ),
  );
  expect(auth).toHaveBeenCalledExactlyOnceWith({
    reason: request.instruction,
    approvalId: request.approvalId,
    expectedTurnId: request.turnId,
  });
  expect(invoke).not.toHaveBeenCalled();
  expect(useStore.getState().confirmation).toBeNull();
});
it("saves a touch-authenticated site rule only after native acknowledgement", async () => {
  let acknowledge!: () => void;
  vi.spyOn(bridge, "auth.confirm").mockImplementation(
    () =>
      new Promise((done) => {
        acknowledge = () => done({ ok: true, approvalId: request.approvalId!, turnId: request.turnId });
      }),
  );
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation(async (method) =>
      method === "settings.get"
        ? { agentMode: "auto", agentPolicyRevision: 3, agentPolicies: [] }
        : { ok: true },
    );
  useStore.setState({
    confirmation: { ...request, kind: "touch-id", category: "payment", policyCategory: "money" },
  });
  await act(async () => root.render(<SuspensionPrompt />));
  await act(async () => button("Always allow").click());
  expect(invoke).not.toHaveBeenCalled();
  await act(async () => {
    acknowledge();
    await vi.waitFor(() => expect(invoke).toHaveBeenCalledWith("settings.set", expect.anything()));
  });
  expect(invoke).toHaveBeenCalledWith("settings.set", {
    agentPolicyRevision: 3,
    agentPolicies: [{ category: "money", site: request.site, access: "allow" }],
  });
  expect(invoke.mock.calls.some(([method]) => method === "safety.approvals.decide")).toBe(false);
});
it("keeps canceled native authentication pending and does not write a rule", async () => {
  vi.spyOn(bridge, "auth.confirm").mockRejectedValue(new Error("Device authentication canceled"));
  const invoke = vi.spyOn(bridge, "invoke");
  useStore.setState({
    confirmation: { ...request, kind: "touch-id", category: "payment", policyCategory: "money" },
  });
  await act(async () => root.render(<SuspensionPrompt />));
  await act(async () => button("Always allow").click());
  expect(invoke).not.toHaveBeenCalled();
  expect(useStore.getState().confirmation?.approvalId).toBe(request.approvalId);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("canceled");
});
it("uses the exact requested page for handoff even when another tab is selected", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ ok: true }),
    activate = vi.fn();
  useStore.setState({
    activePageId: "other",
    activate,
    confirmation: {
      ...request,
      approvalId: undefined,
      kind: "handoff",
      confirmation: "handoff",
      pageId: "requested",
    },
  });
  await act(async () => root.render(<SuspensionPrompt />));
  await act(async () => button("Take over").click());
  expect(invoke).toHaveBeenCalledExactlyOnceWith("pages.takeover", { pageId: "requested" });
  expect(activate).toHaveBeenCalledExactlyOnceWith("requested");
});
it("requires explicit suspension metadata and rejects malformed policy sites", () => {
  const event = { seq: 1, ts: 1, streamId: "test", type: "safety.confirmation", payload: { ...request } };
  expect(reduceRunEvent(useStore.getState(), event)?.confirmation).toMatchObject({
    kind: "approval",
    policyCategory: "send",
  });
  expect(reduceRunEvent(useStore.getState(), { ...event, payload: { ...request, kind: undefined } })).toEqual(
    {},
  );
  expect(
    reduceRunEvent(useStore.getState(), {
      ...event,
      payload: { ...request, site: "https://fixture.test/path" },
    }),
  ).toEqual({});
});
