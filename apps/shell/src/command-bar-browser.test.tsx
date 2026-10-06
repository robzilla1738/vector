// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("./bridge", async (original) => ({
  ...(await original<typeof import("./bridge")>()),
  inNativeHost: true,
}));
import { bridge } from "./bridge";
import { CommandBar } from "./components/CommandBar";
import { useStore } from "./store";
import { normalizePages } from "./store/pages";
import { nativeOmniboxFixture } from "./test-native-omnibox";

const initial = useStore.getState();
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
  useStore.setState(
    {
      ...initial,
      pages: normalizePages([]),
      activePageId: null,
      bookmarks: [],
      runs: [],
      programs: [],
      settings: {},
      toasts: [],
    },
    true,
  );
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount() {
  await act(async () => root.render(<CommandBar />));
  const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  await act(async () => input.focus());
  return input;
}
async function type(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const match = (title: string, index = 3) => ({
  id: title,
  index,
  type: "history" as const,
  title,
  url: `https://example.test/${encodeURIComponent(title)}`,
});

it("keeps native zero-suggest providers available on focus", async () => {
  const fixture = nativeOmniboxFixture([match("Recent page")]);
  await mount();
  expect(fixture.start).toHaveBeenLastCalledWith(expect.objectContaining({ input: "", onFocus: true }));
  expect(host.textContent).toContain("Recent page");
});
it("keeps late native updates and their order instead of finishing at the first local result", async () => {
  const fixture = nativeOmniboxFixture();
  fixture.start.mockResolvedValue(true);
  const input = await mount();
  await type(input, "release");
  const queryId = fixture.start.mock.calls.at(-1)![0].queryId;
  await act(async () =>
    fixture.emit({ queryId, sequenceId: 10, input: "release", done: false, items: [match("Local result")] }),
  );
  expect(host.textContent).toContain("Local result");
  await act(async () =>
    fixture.emit({
      queryId,
      sequenceId: 11,
      input: "release",
      done: true,
      items: [match("Default search", 0), match("Late network result", 1), match("Local result", 2)],
    }),
  );
  const titles = [...host.querySelectorAll(".cb-opt.browser")].map((node) => node.textContent);
  expect(titles[0]).toContain("Default search");
  expect(titles[1]).toContain("Late network result");
  expect(titles[2]).toContain("Local result");
  await act(async () =>
    fixture.emit({
      queryId,
      sequenceId: 10,
      input: "release",
      done: true,
      items: [match("Obsolete sequence")],
    }),
  );
  expect(host.textContent).not.toContain("Obsolete sequence");
});
it("refuses older query generations when text returns through A B A", async () => {
  const fixture = nativeOmniboxFixture();
  fixture.start.mockResolvedValue(true);
  const input = await mount();
  await type(input, "alpha");
  const old = fixture.start.mock.calls.at(-1)![0].queryId;
  await type(input, "beta");
  await type(input, "alpha");
  const current = fixture.start.mock.calls.at(-1)![0].queryId;
  expect(current).toBeGreaterThan(old);
  await act(async () =>
    fixture.emit({
      queryId: old,
      sequenceId: 80,
      input: "alpha",
      done: true,
      items: [match("Old protected result")],
    }),
  );
  expect(host.textContent).not.toContain("Old protected result");
  await act(async () =>
    fixture.emit({
      queryId: current,
      sequenceId: 81,
      input: "alpha",
      done: true,
      items: [match("Current result")],
    }),
  );
  expect(host.textContent).toContain("Current result");
  expect(fixture.stop).toHaveBeenCalledWith(old);
});
it("accepts the native selection identity and disposition without Node browser ranking or history", async () => {
  const fixture = nativeOmniboxFixture([match("Native bookmark", 4)]);
  const input = await mount();
  await type(input, "bookmark");
  const queryId = fixture.start.mock.calls.at(-1)![0].queryId;
  await act(async () => {
    host
      .querySelector<HTMLElement>(".cb-opt.browser")!
      .dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  });
  await act(async () => {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }));
  });
  expect(fixture.open).toHaveBeenLastCalledWith({
    queryId,
    disposition: "new-foreground-tab",
    match: { sequenceId: queryId, index: 4, url: "https://example.test/Native%20bookmark" },
  });
  const methods = vi.mocked(bridge.invoke).mock.calls.map(([method]) => method);
  expect(methods).not.toContain("history.list");
  expect(methods).not.toContain("command.ranking.list");
  expect(methods).not.toContain("command.ranking.record");
});
it("uses Chromium's current default match or classifier for typed Enter", async () => {
  const fixture = nativeOmniboxFixture();
  const resolve = vi.spyOn(bridge, "resolveSearch").mockResolvedValue("https://wrong.test/");
  const input = await mount();
  await type(input, "aux browser");
  const queryId = fixture.start.mock.calls.at(-1)![0].queryId;
  await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(fixture.open).toHaveBeenLastCalledWith({ queryId, disposition: "current-tab" });
  expect(resolve).not.toHaveBeenCalled();
});
it("stops the native query when the field closes", async () => {
  const fixture = nativeOmniboxFixture([match("Result")]);
  const input = await mount();
  await type(input, "example");
  const queryId = fixture.start.mock.calls.at(-1)![0].queryId;
  await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 1)));
  expect(fixture.stop).toHaveBeenCalledWith(queryId);
});
