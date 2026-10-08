// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CodingProcessView } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { CloudProcessPreview } from "./CloudProcessPreview";

vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  inNativeHost: true,
  inMock: false,
}));

const process: CodingProcessView = {
  runId: "original-run",
  processId: "original-process",
  actionId: "action",
  command: "npm run dev",
  workdir: "/workspace",
  startedAt: 1,
  state: "running",
  execution: {
    backend: "cloud",
    resourceId: "original-vm",
    sandboxName: "project",
    sessionId: "session",
    root: "/workspace",
    commandId: "command",
  },
};
const preview = {
  previewId: "e62c613e-9cdc-49e0-b2a8-aa12ec878e86",
  processId: process.processId,
  contentId: "native-guest",
  url: "https://preview.example.com/",
};
const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState({ connected: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.spyOn(bridge, "capabilities").mockResolvedValue({
    buildId: "test",
    sourceCommit: "a".repeat(40),
    methods: ["native.cloudPreview", "native.cloudPreviewClose"],
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const submit = () =>
  host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
const closeButton = () =>
  [...host.querySelectorAll("button")].find((button) => button.textContent === "Close Preview")!;

it("opens the exact process and port once, retaining its native guest until close is acknowledged", async () => {
  let settleClose!: (result: unknown) => void, rejectClose!: (reason: Error) => void;
  const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "coding.preview") return preview;
    if (method === "coding.previewClose")
      return new Promise((resolve, reject) => {
        settleClose = resolve;
        rejectClose = reject;
      });
    throw new Error(`Unexpected method ${method}`);
  });
  await act(async () => root.render(<CloudProcessPreview process={process} />));
  await act(async () => {
    const input = host.querySelector("input")!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "4173");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    submit();
    submit();
  });
  expect(rpc.mock.calls.filter(([method]) => method === "coding.preview")).toEqual([
    ["coding.preview", { runId: process.runId, processId: process.processId, port: 4173 }],
  ]);
  expect(host.querySelector("embed")?.getAttribute("data-content-id")).toBe("native-guest");
  await act(async () => closeButton().click());
  expect(host.querySelector("embed")).not.toBeNull();
  await act(async () => rejectClose(new Error("Connection interrupted")));
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("Connection interrupted");
  expect(host.querySelector("embed")).not.toBeNull();
  await act(async () => closeButton().click());
  expect(rpc).toHaveBeenLastCalledWith("coding.previewClose", {
    runId: process.runId,
    previewId: preview.previewId,
  });
  expect(host.querySelector("embed")).not.toBeNull();
  await act(async () => settleClose({ closed: true }));
  expect(host.querySelector("embed")).toBeNull();
});

it("closes late guests from a retired VM and does not expose Preview without both native capabilities", async () => {
  let finishOpen!: (result: unknown) => void;
  const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "coding.preview")
      return new Promise((resolve) => {
        finishOpen = resolve;
      });
    if (method === "coding.previewClose") return { closed: true };
    throw new Error(`Unexpected method ${method}`);
  });
  await act(async () => root.render(<CloudProcessPreview process={process} />));
  await act(async () => submit());
  vi.mocked(bridge.capabilities).mockResolvedValue({
    buildId: "older",
    sourceCommit: "a".repeat(40),
    methods: ["native.cloudPreview"],
  });
  await act(async () =>
    root.render(
      <CloudProcessPreview
        process={{ ...process, execution: { ...process.execution!, resourceId: "different-vm" } }}
      />,
    ),
  );
  await act(async () => finishOpen(preview));
  expect(rpc).toHaveBeenLastCalledWith("coding.previewClose", {
    runId: process.runId,
    previewId: preview.previewId,
  });
  expect(host.querySelector("embed")).toBeNull();
  expect(host.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled).toBe(true);
  await act(async () => submit());
  expect(rpc.mock.calls.filter(([method]) => method === "coding.preview")).toHaveLength(1);
});
