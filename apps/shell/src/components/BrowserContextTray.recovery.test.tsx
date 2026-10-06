import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage } from "../mock/fixtures";
import { BrowserContextTray } from "./BrowserContextTray";
const initial = useStore.getState();
const before = makePage(0, {
  pageId: "original",
  windowId: "main",
  backend: "aux",
  title: "Reference",
  url: "https://saved.test/",
  documentEpoch: 1,
  sessionId: "old-session",
});
const recovered = {
  ...before,
  url: "https://saved.test/redirect",
  documentEpoch: 2,
  sessionId: "restored-session",
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const onSources = vi.fn();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100, height: 30 },
  ] as unknown as DOMRectList);
  useStore.setState({ pages: normalizePages([before]), toasts: [] });
  onSources.mockReset();
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
const render = (disabled = false) =>
  act(async () =>
    root.render(
      <BrowserContextTray
        primary="none"
        sources={[]}
        onPrimary={vi.fn()}
        onSources={onSources}
        disabled={disabled}
      />,
    ),
  );
async function select() {
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  await act(async () => document.querySelector<HTMLInputElement>('dialog input[type="checkbox"]')!.click());
}
function setup(list: () => unknown, retry: () => unknown, pages: () => unknown) {
  return vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "browser.recovery.list") return list();
    if (method === "browser.recovery.retry") return retry();
    if (method === "pages.list") return pages();
    throw new Error(method);
  });
}
const pending = () => [
  {
    pageId: before.pageId,
    url: recovered.url,
    title: before.title,
    windowId: before.windowId,
    retrying: false,
  },
];
const ack = () => ({ ok: true, pageId: before.pageId, page: recovered, restored: true });
it("only the exact restored ACK permits the fresh document and session", async () => {
  setup(pending, ack, () => [recovered]);
  await render();
  await select();
  expect(onSources).toHaveBeenCalledExactlyOnceWith([
    expect.objectContaining({
      pageId: before.pageId,
      url: recovered.url,
      documentEpoch: 2,
      sessionId: "restored-session",
    }),
  ]);
});
it.each(["url", "documentEpoch", "sessionId", "windowId"] as const)(
  "refuses external %s replacement after original recovery ACK",
  async (field) => {
    const foreign = { ...recovered, [field]: field === "documentEpoch" ? 3 : "foreign" };
    setup(pending, ack, () => [foreign]);
    await render();
    await select();
    expect(onSources).not.toHaveBeenCalled();
  },
);
it("late restoration cannot publish after the original owner retires", async () => {
  let finish!: (value: ReturnType<typeof ack>) => void;
  setup(
    pending,
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    () => [recovered],
  );
  await render();
  await select();
  await render(true);
  await render(false);
  await act(async () => finish(ack()));
  expect(onSources).not.toHaveBeenCalled();
});
it("external navigation while recovery list is held cannot trigger recovery", async () => {
  let finish!: (value: ReturnType<typeof pending>) => void;
  const invoke = setup(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    ack,
    () => [recovered],
  );
  await render();
  await select();
  await act(async () => {
    useStore.setState({ pages: normalizePages([{ ...before, documentEpoch: 9 }]) });
    finish(pending());
  });
  expect(invoke.mock.calls.some(([method]) => method === "browser.recovery.retry")).toBe(false);
  expect(onSources).not.toHaveBeenCalled();
});
it("duplicate recovery cannot confer a fresh source", async () => {
  const retry = vi.fn(ack);
  setup(
    () => [...pending(), ...pending()],
    retry,
    () => [recovered],
  );
  await render();
  await select();
  expect(retry).not.toHaveBeenCalled();
  expect(onSources).not.toHaveBeenCalled();
});

it("foreign recovery owner and original refused ACK cannot select a source", async () => {
  const retry = vi.fn(ack);
  setup(
    () => pending().map((row) => ({ ...row, windowId: "foreign" })),
    retry,
    () => [recovered],
  );
  await render();
  await select();
  expect(retry).not.toHaveBeenCalled();
  expect(onSources).not.toHaveBeenCalled();
});
it("refused original recovery ACK cannot be converted to page-list acceptance", async () => {
  setup(
    pending,
    () => ({ ...ack(), ok: false }),
    () => [recovered],
  );
  await render();
  await select();
  expect(onSources).not.toHaveBeenCalled();
});
it("already-live ACK cannot bless an external document with the same original page ID", async () => {
  setup(
    pending,
    () => ({ ...ack(), restored: false }),
    () => [recovered],
  );
  await render();
  await select();
  expect(onSources).not.toHaveBeenCalled();
});
it("already-live unchanged original document retains its explicit original selection", async () => {
  setup(
    pending,
    () => ({ ...ack(), page: before, restored: false }),
    () => [before],
  );
  await render();
  await select();
  expect(onSources).toHaveBeenCalledExactlyOnceWith([
    expect.objectContaining({
      pageId: before.pageId,
      url: before.url,
      documentEpoch: before.documentEpoch,
      sessionId: before.sessionId,
    }),
  ]);
});
