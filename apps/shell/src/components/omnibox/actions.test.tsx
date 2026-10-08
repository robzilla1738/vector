// @vitest-environment jsdom
import { act, useLayoutEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { Run } from "@aux/contracts";
import type { Intent } from "../../intent";
import { useOmniboxActions } from "./actions";

const fake = vi.hoisted(() => ({
  call: vi.fn(),
  state: {
    settings: { modelConfigured: true, searchEngine: "https://www.google.com/search?q=%s" },
    catalogVersion: 1,
  },
}));
vi.mock("../../store", () => ({ call: fake.call, useStore: { getState: () => fake.state } }));
vi.mock("../../bridge", () => ({
  inNativeHost: false,
  bridge: { windowId: "original-window", privateMode: false },
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  fake.call.mockReset();
  vi.useRealTimers();
});
function fixture() {
  const startRun = vi.fn(async (): Promise<Run> => ({
    runId: "actual-request",
    goal: "Summarize this page",
    status: "running",
    pageIds: [],
    createdAt: Date.now(),
  }));
  const newTab = vi.fn(async () => ({ pageId: "new-page" }) as never);
  let execute: (intent: Intent, alt?: boolean, typed?: boolean) => Promise<void> = async () => {};
  function Harness() {
    const [, setBreakerVersion] = useState(0);
    const action = useOmniboxActions({
      startRun,
      newTab,
      hero: false,
      browserAutocomplete: false,
      nativeOmnibox: { openInput: async () => {} },
      setBreakerVersion,
    });
    useLayoutEffect(() => {
      execute = action;
    }, [action]);
    return null;
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const render = () => act(async () => root!.render(<Harness />));
  return {
    startRun,
    newTab,
    render,
    accept: (intent: Intent) => execute(intent),
  };
}
it("executes the displayed search immediately without waiting for AI", async () => {
  const f = fixture();
  fake.call.mockImplementation(() => new Promise(() => {}));
  await f.render();
  await act(async () => {
    await f.accept({
      kind: "search",
      query: "Summarize this page",
      url: "https://www.google.com/search?q=summarize",
    });
  });
  expect(f.newTab).toHaveBeenCalledWith("https://www.google.com/search?q=summarize");
  expect(f.startRun).not.toHaveBeenCalled();
  expect(fake.call).not.toHaveBeenCalled();
});
it("executes the displayed Ask using its selected page scope", async () => {
  const f = fixture();
  await f.render();
  await act(async () => {
    await f.accept({ kind: "run", goal: "Summarize this page", scope: "page" });
  });
  expect(f.startRun).toHaveBeenCalledWith("Summarize this page", { scope: "page" });
  expect(f.newTab).not.toHaveBeenCalled();
  expect(fake.call).not.toHaveBeenCalled();
});
