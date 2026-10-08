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
  function Harness({ text, generation }: { text: string; generation: number }) {
    const [, setBreakerVersion] = useState(0);
    const action = useOmniboxActions({
      startRun,
      newTab,
      hero: false,
      browserAutocomplete: false,
      nativeOmnibox: { openInput: async () => {} },
      setBreakerVersion,
      committedInput: { text, generation, classify: true },
    });
    useLayoutEffect(() => {
      execute = action;
    }, [action]);
    return null;
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const render = (text: string, generation: number) =>
    act(async () => root!.render(<Harness text={text} generation={generation} />));
  return {
    startRun,
    newTab,
    render,
    accept: () =>
      execute(
        { kind: "search", query: "Summarize this page", url: "https://www.google.com/search?q=summarize" },
        false,
        true,
      ),
  };
}
it("classifies only committed acceptance and starts the actual chosen chat", async () => {
  const f = fixture();
  fake.call.mockResolvedValue({ kind: "chat", source: "model" });
  await f.render("Summarize this page", 0);
  expect(fake.call).not.toHaveBeenCalled();
  await act(async () => {
    await f.accept();
  });
  expect(fake.call).toHaveBeenCalledWith("agent.utility.intent", { text: "Summarize this page" });
  expect(f.startRun).toHaveBeenCalledWith("Summarize this page", { scope: "new" });
  expect(f.newTab).not.toHaveBeenCalled();
});
it("retires an awaited classification when the person edits the committed input", async () => {
  const f = fixture();
  let resolve!: (value: { kind: "chat"; source: "model" }) => void;
  fake.call.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await f.render("Summarize this page", 0);
  const accepted = f.accept().then(
    () => null,
    (error: unknown) => error,
  );
  await f.render("Find another source", 1);
  await act(async () => resolve({ kind: "chat", source: "model" }));
  expect(await accepted).toMatchObject({
    message: "The committed input changed. Choose the current input again.",
  });
  expect(f.startRun).not.toHaveBeenCalled();
  expect(f.newTab).not.toHaveBeenCalled();
});

it("opens the native search fallback promptly and ignores late AI classification", async () => {
  vi.useFakeTimers();
  const f = fixture();
  let resolve!: (value: { kind: "chat"; source: "model" }) => void;
  fake.call.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await f.render("Summarize this page", 0);
  const accepted = f.accept();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(150);
    await accepted;
  });
  expect(f.newTab).toHaveBeenCalledOnce();
  expect(f.startRun).not.toHaveBeenCalled();
  await act(async () => resolve({ kind: "chat", source: "model" }));
  expect(f.startRun).not.toHaveBeenCalled();
  expect(f.newTab).toHaveBeenCalledOnce();
});
