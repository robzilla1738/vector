// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { makePage, makeRun } from "../mock/fixtures";
import { useStore } from "../store";
import { AgentOverlay } from "./AgentOverlay";
import {
  EMPTY_HANDOFF_CUTOUT,
  handoffSnapshotFromObservation,
  reduceHandoffCutout,
  type HandoffCutoutState,
  type HandoffObservationSnapshot,
  type HandoffObservationSource,
} from "./handoff-cutout";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const INSTRUCTION = "Finish this step in the page.";
const URL = "https://pay.example/checkout";

function observation(
  input: { scrollX?: number; scrollY?: number; value?: string; epoch?: number; url?: string } = {},
): HandoffObservationSource {
  return {
    pageId: "page-1",
    documentEpoch: input.epoch ?? 4,
    content: {
      url: input.url ?? URL,
      scroll: { x: input.scrollX ?? 0, y: input.scrollY ?? 0, maxY: 900 },
      elements: [
        { ref: "r1", rect: { x: 0, y: 0, w: 80, h: 20 } },
        { ref: "otp", rect: { x: 40, y: 120, w: 180, h: 36 }, value: input.value ?? "", focused: true },
      ],
    },
  };
}

function snap(
  input: { scrollX?: number; scrollY?: number; value?: string; epoch?: number; url?: string } = {},
  options?: { submitted?: boolean; suspensionId?: string },
): HandoffObservationSnapshot {
  const snapshot = handoffSnapshotFromObservation(options?.suspensionId ?? "susp-1", observation(input), {
    submitted: options?.submitted,
  });
  if (!snapshot) throw new Error("expected a handoff snapshot");
  return snapshot;
}

function apply(state: HandoffCutoutState, snapshot: HandoffObservationSnapshot): HandoffCutoutState {
  return reduceHandoffCutout(state, { type: "snapshot", snapshot });
}

it("shifts the cutout from an observation scroll snapshot, keeps it while typing, and closes on submit or navigation", () => {
  const anchor = snap();
  expect(anchor.rect).toEqual({ x: 40, y: 120, w: 180, h: 36 });
  expect(anchor.scroll).toEqual({ x: 0, y: 0, maxY: 900 });
  const ambiguous = handoffSnapshotFromObservation("susp-1", {
    pageId: "page-1",
    documentEpoch: 4,
    content: {
      url: URL,
      scroll: { x: 0, y: 0, maxY: 900 },
      elements: [
        { ref: "a", rect: { x: 1, y: 1, w: 2, h: 2 } },
        { ref: "b", rect: { x: 3, y: 3, w: 4, h: 4 } },
      ],
    },
  });
  if (!ambiguous) throw new Error("expected an ambiguous snapshot");
  expect(ambiguous.rect).toBeNull();
  expect(
    reduceHandoffCutout(EMPTY_HANDOFF_CUTOUT, { type: "snapshot", snapshot: ambiguous }).cutout,
  ).toBeNull();

  let state = apply(EMPTY_HANDOFF_CUTOUT, anchor);
  expect(state.cutout).toEqual({ x: 40, y: 120, w: 180, h: 36 });
  state = apply(state, snap({ scrollX: 12, scrollY: 30 }));
  expect(state.cutout).toEqual({ x: 28, y: 90, w: 180, h: 36 });
  state = apply(state, snap({ scrollX: 12, scrollY: 42 }));
  expect(state.cutout).toEqual({ x: 28, y: 78, w: 180, h: 36 });
  state = apply(state, snap({ scrollX: 0, scrollY: 0 }));
  expect(state.cutout).toEqual({ x: 40, y: 120, w: 180, h: 36 });
  state = apply(state, snap({ scrollX: 12, scrollY: 42, value: "123456" }));
  expect(state.cutout).toEqual({ x: 28, y: 78, w: 180, h: 36 });
  expect(
    apply(state, snap({ scrollX: 12, scrollY: 42, value: "123456" }, { submitted: true })).cutout,
  ).toBeNull();
  expect(apply(state, snap({ scrollX: 12, scrollY: 42, value: "123456", epoch: 5 })).cutout).toBeNull();
  expect(
    apply(state, snap({ scrollX: 12, scrollY: 42, value: "123456", url: "https://pay.example/done" })).cutout,
  ).toBeNull();
  expect(
    reduceHandoffCutout(state, { type: "navigate", pageId: "page-1", documentEpoch: 5, url: URL }).cutout,
  ).toBeNull();
});

it("paints that hole for a pending handoff whose tool turn is not the run id", async () => {
  const run = makeRun({
    runId: "run-1",
    status: "needs_input",
    pageIds: ["page-1"],
    statusMessage: INSTRUCTION,
    createdAt: 10,
  });
  const suspension = {
    suspensionId: "susp-1",
    runId: "run-1",
    threadId: "thread-1",
    turnId: "tool-turn",
    kind: "handoff" as const,
    request: { kind: "handoff" as const, instruction: INSTRUCTION, guidance: "Wait for the person." },
    state: "pending" as const,
    createdAt: 1,
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, suspension, steps: [], modelCalls: 0 } as never;
    throw new Error(`unexpected ${String(method)}`);
  });
  const page = makePage(0, {
    pageId: "page-1",
    url: URL,
    documentEpoch: 4,
    viewStatus: "visible",
    title: "Checkout",
  });
  const original = useStore.getState();
  useStore.setState({ runs: [run], pages: [page], activePageId: "page-1" });
  const host = document.createElement("div");
  document.body.append(host);
  let root: Root = createRoot(host);
  const paint = (snapshot: HandoffObservationSnapshot | null) =>
    act(async () => {
      root.render(<AgentOverlay pageId="page-1" snapshot={snapshot} />);
    });
  try {
    await paint(snap());
    expect(host.querySelector(".agent-handoff")?.getAttribute("data-cutout-y")).toBe("120");
    await paint(snap({ scrollX: 12, scrollY: 30 }));
    const hole = host.querySelector(".agent-handoff");
    expect(hole?.getAttribute("data-cutout-x")).toBe("28");
    expect(hole?.getAttribute("data-cutout-y")).toBe("90");
    expect(hole?.querySelector(".agent-handoff-shield")?.getAttribute("style")).toContain("28px 90px");
    await paint(snap({ scrollX: 12, scrollY: 30, value: "123456" }));
    expect(host.querySelector(".agent-handoff")?.getAttribute("data-cutout-y")).toBe("90");
    expect(host.textContent).not.toContain("123456");
    await paint(snap({ scrollX: 12, scrollY: 30, value: "123456" }, { submitted: true }));
    expect(host.querySelector(".agent-handoff")).toBeNull();

    await act(async () => root.unmount());
    root = createRoot(host);
    await paint(snap());
    expect(host.querySelector(".agent-handoff")?.getAttribute("data-cutout-y")).toBe("120");
    await act(async () => {
      useStore.setState({ pages: [{ ...page, documentEpoch: 5 }] });
    });
    expect(host.querySelector(".agent-handoff")).toBeNull();
    expect(invoke.mock.calls.some(([method]) => method === "runs.get")).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    invoke.mockRestore();
    useStore.setState(original, true);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});
