// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RunControls } from "./RunControls";
import { bridge } from "../bridge";
import { invokeRunControlCommand, type RunControlCommand } from "../run-control-commands";
vi.mock("../commands", () => ({ executeCommand: (id: RunControlCommand, context: Parameters<typeof invokeRunControlCommand>[1]) => {
  try { return Promise.resolve(invokeRunControlCommand(id, context)); } catch (error) { return Promise.reject(error); }
} }));

const mock = vi.hoisted(() => ({
  call: vi.fn(),
  state: {
    runs: [] as unknown[], pages: [] as unknown[], activePageId: "page", mode: "focus",
    overlay: null, conversationId: null, railOpen: true, railView: "chat", activate: vi.fn(),
  },
}));
vi.mock("../store", () => ({
  call: mock.call,
  isLive: (run: { status: string }) => ["queued", "planning", "running", "paused", "needs_input"].includes(run.status),
  useStore: Object.assign((selector: (state: typeof mock.state) => unknown) => selector(mock.state),
    { getState: () => mock.state }),
}));

beforeEach(() => {
  mock.call.mockReset(); mock.state.activate.mockReset();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 30 }] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

it("shows an inspectable takeover checkpoint and returns only the held page", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mock.state.runs = [{ runId: "run", status: "paused", pageIds: ["page"],
    statusMessage: "You took control of a page. Active agent input stopped.",
    config: { checkpoint: { planBoundary: "paused", unresolvedEffects: ["intent"] } } }];
  mock.state.pages = [{ pageId: "page", controller: "human", viewStatus: "visible" }];
  mock.call.mockResolvedValue({ pageId: "page", controller: "none" });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunControls runId="run" />));
    expect(host.textContent).toContain("Aux is paused while you use this page.");
    expect(host.textContent).toContain("1 action may have taken effect and need review.");
    expect(host.querySelector("details")?.textContent).toContain("1 uncertain action requires review");
    const returnButton = [...host.querySelectorAll("button")].find(button => button.textContent?.includes("Return and resume"));
    expect(returnButton).toBeTruthy();
    await act(async () => returnButton!.click());
    expect(mock.call).toHaveBeenCalledWith("pages.resume", { pageId: "page" });
  } finally { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("keeps a stopped program checkpoint visible after the page is returned", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mock.state.runs = [{ runId: "run", status: "interrupted", pageIds: ["page"],
    statusMessage: "You took control. This saved program stopped.",
    config: { checkpoint: { planBoundary: "takeover", unresolvedEffects: [] } } }];
  mock.state.pages = [{ pageId: "page", controller: "none", viewStatus: "visible" }];
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunControls runId="run" />));
    expect(host.querySelector("details")?.textContent).toContain("This stopped program will not replay");
    expect(host.querySelector("button")).toBeNull();
  } finally { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});


it("explains separate sign-in and opens only this run’s controlled tab", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mock.state.runs = [{ runId: "run", status: "running", pageIds: [] }];
  mock.state.pages = [
    { pageId: "owner", controller: "none", viewStatus: "visible" },
    { pageId: "other", controller: "none", viewStatus: "background", agentIsolation: { runId: "other" } },
    { pageId: "controlled", windowId: bridge.windowId, controller: "agent", viewStatus: "background", agentIsolation: { runId: "run" } },
  ];
  mock.call.mockResolvedValue({ ok: true });
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<RunControls runId="run" />));
    expect(host.textContent).toContain("Sign in there if needed");
    expect(host.textContent).toContain("cookie transfer is unavailable");
    const open = [...host.querySelectorAll("button")].find(button => button.textContent === "Open temporary tab");
    expect(open).toBeTruthy(); await act(async () => open!.click());
    expect(mock.state.activate).toHaveBeenCalledWith("controlled");
    expect(mock.call).not.toHaveBeenCalled();
  } finally { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});


it("registered Stop supersedes an original pending pause without losing its control owner", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mock.state.runs = [{ runId: "run", status: "running", pageIds: [] }]; mock.state.pages = [];
  let finishPause!: (value: unknown) => void, finishStop!: (value: unknown) => void;
  mock.call.mockImplementation(method => new Promise(done => { if (method === "runs.pause") finishPause = done; else if (method === "runs.cancel") finishStop = done; }));
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(<RunControls runId="run" />));
    await act(async () => host.querySelector<HTMLButtonElement>('[data-command-id="pause-run"]')!.click());
    await act(async () => host.querySelector<HTMLButtonElement>('[data-command-id="stop-run"]')!.click());
    expect(mock.call.mock.calls.map(([method]) => method)).toEqual(["runs.pause", "runs.cancel"]);
    expect(host.querySelector<HTMLButtonElement>('[data-command-id="stop-run"]')!.disabled).toBe(true);
    await act(async () => finishPause({}));
    expect(host.querySelector<HTMLButtonElement>('[data-command-id="stop-run"]')!.disabled).toBe(true);
    await act(async () => finishStop({}));
    expect(host.querySelector<HTMLButtonElement>('[data-command-id="stop-run"]')!.disabled).toBe(false);
  } finally { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

it("unmount retires registered run commands and cannot cancel a different run", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mock.state.runs = [{ runId: "run", status: "running", pageIds: [] }]; mock.state.pages = [];
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  await act(async () => root.render(<RunControls runId="run" />));
  await act(async () => root.unmount()); host.remove();
  expect(() => invokeRunControlCommand("stop-run", { payload: { runId: "run" } })).toThrow("Choose the run’s controls");
  expect(mock.call).not.toHaveBeenCalled(); vi.unstubAllGlobals();
});
