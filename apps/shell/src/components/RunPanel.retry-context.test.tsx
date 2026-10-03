// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { RunPanel } from "./RunPanel";

const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const retry = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  retry.mockClear();
  useStore.setState({ pages: [makePage(0, { pageId: "selected", title: "Selected website" })],
    runs: [{ runId: "original", goal: "Hello", status: "completed", pageIds: [], createdAt: 1, endedAt: 2, result: { answer: "Hello back" }, config: { chatId: "chat" } }],
    steps: { original: [] }, retryRun: retry });
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); vi.unstubAllGlobals();
});
it("retries a page-free turn without offering to attach a subsequently selected website", async () => {
  await act(async () => root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />));
  expect(host.textContent).not.toContain("The original tab is unavailable");
  expect(host.textContent).not.toContain("Retry in selected tab");
  const button = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original");
});
it("retains explicit selected-tab recovery when a genuine original website is missing", async () => {
  useStore.setState(state => ({ runs: state.runs.map(run => ({ ...run, pageIds: ["missing"] })) }));
  await act(async () => root.render(<RunPanel runId="original" conversation latest retryPageId="selected" controlsInComposer />));
  expect(host.textContent).toContain("The original tab is unavailable");
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find(item => item.textContent === "Retry in selected tab")!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(retry).toHaveBeenCalledExactlyOnceWith("original", "selected");
});
