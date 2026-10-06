import { nativeOmniboxFixture } from "./test-native-omnibox";
import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const nativeFlag = vi.hoisted(() => ({ value: true }));
vi.mock("./bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./bridge")>()),
  get inNativeHost() {
    return nativeFlag.value;
  },
}));
import { bridge } from "./bridge";
import { CommandBar } from "./components/CommandBar";
import { Toasts } from "./components/Toasts";
import { useStore } from "./store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= () => {};

const page = {
  pageId: "p1",
  url: "https://github.com/aux",
  title: "Aux repo",
  favicon: "",
  loading: false,
  ownedByRuntime: false,
  viewStatus: "visible" as const,
  canGoBack: true,
  canGoForward: false,
  muted: false,
  backend: "aux",
  navigationError: null,
  showBlankDocument: false,
};

const ack = { commandId: "c1", status: "applied" as const, catalogVersion: 1 };

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  return { host, root };
}

function type(input: HTMLInputElement, text: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

const key = (input: HTMLInputElement, name: string, init: KeyboardEventInit = {}) =>
  input.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...init }));

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let native: ReturnType<typeof nativeOmniboxFixture>;

beforeEach(() => {
  nativeFlag.value = true;
  native = nativeOmniboxFixture();
  useStore.setState({
    pages: normalizePages([{ ...page }] as never),
    activePageId: "p1",
    bookmarks: [],
    closedTabs: [],
    programs: [],
    runs: [],
    settings: {},
  } as never);
  ({ host, root } = mount());
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 20)));

describe("CommandBar keyboard contract", () => {
  it("Escape blurs the field", async () => {
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "half-typed query"));
    await act(async () => key(input, "Escape"));
    expect(document.activeElement).not.toBe(input);
  });

  it("Enter on typed search uses the native input classifier", async () => {
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "browser session restore"));
    await act(async () => key(input, "Enter"));
    expect(native.open).toHaveBeenCalledWith(
      expect.objectContaining({
        queryId: native.start.mock.calls.at(-1)![0].queryId,
        disposition: "current-tab",
      }),
    );
  });

  it("ArrowDown + Enter opens the highlighted native match", async () => {
    native = nativeOmniboxFixture([
      { id: "default", index: 0, type: "search", title: "Search git", url: "https://search.test/?q=git" },
      { id: "gitlab", index: 7, type: "history", title: "GitLab other", url: "https://gitlab.com/other" },
    ]);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "git"));
    for (let step = 0; step < 3; step++) await act(async () => key(input, "ArrowDown"));
    await act(async () => key(input, "Enter"));
    expect(native.open).toHaveBeenCalledWith(
      expect.objectContaining({
        match: expect.objectContaining({ index: 7, url: "https://gitlab.com/other" }),
      }),
    );
  });

  it("updates bookmark suggestions from the current native stream", async () => {
    native = nativeOmniboxFixture([
      { id: "guide", index: 4, type: "bookmark", title: "Original guide", url: "https://example.com/guide" },
    ]);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "guide"));
    expect(host.textContent).toContain("Original guide");
    const { queryId } = native.start.mock.calls.at(-1)![0];
    await act(async () =>
      native.emit({
        queryId,
        sequenceId: queryId + 1,
        input: "guide",
        done: true,
        items: [
          {
            id: "guide",
            index: 4,
            type: "bookmark",
            title: "Updated guide",
            url: "https://example.com/guide",
          },
        ],
      }),
    );
    expect(host.textContent).toContain("Updated guide");
    expect(host.textContent).not.toContain("Original guide");
  });

  it("IME composition keys never trigger submission", async () => {
    const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "nihongo"));
    await act(async () => {
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      Object.defineProperty(event, "isComposing", { get: () => true });
      input.dispatchEvent(event);
    });
    expect(command.mock.calls.filter(([c]) => c.kind === "navigate")).toHaveLength(0);
    expect(native.open).not.toHaveBeenCalled();
  });

  it("keyword engines route Enter to the engine, not the default search", async () => {
    const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "gh aux browser"));
    await act(async () => key(input, "Enter"));
    await settle();
    expect(
      command.mock.calls.some(
        ([c]) =>
          c.kind === "navigate" &&
          (c as { url?: string }).url === "https://github.com/search?q=aux%20browser",
      ),
    ).toBe(true);
  });

  it("starts native autocomplete without fetching Node history", async () => {
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "gi"));
    expect(native.start).toHaveBeenLastCalledWith(expect.objectContaining({ input: "gi" }));
    expect(invoke.mock.calls.some(([method]) => method === "history.list")).toBe(false);
  });

  it("delegates provider queries to native autocomplete without renderer network fetches", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    useStore.setState({ settings: { searchSuggestions: true } } as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    for (const query of ["192.168.1.1", "public question"]) {
      await act(async () => type(input, query));
      expect(native.start).toHaveBeenLastCalledWith(expect.objectContaining({ input: query }));
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never paints a late native suggestion for an earlier query", async () => {
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "first query"));
    const first = native.start.mock.calls.at(-1)![0].queryId;
    await act(async () => type(input, "second query"));
    const second = native.start.mock.calls.at(-1)![0].queryId;
    await act(async () =>
      native.emit({
        queryId: first,
        sequenceId: first,
        input: "first query",
        done: true,
        items: [
          {
            id: "stale",
            index: 0,
            type: "search",
            title: "stale suggestion",
            url: "https://search.test/stale",
          },
        ],
      }),
    );
    expect(host.textContent).not.toContain("stale suggestion");
    await act(async () =>
      native.emit({
        queryId: second,
        sequenceId: second + 1,
        input: "second query",
        done: true,
        items: [
          {
            id: "current",
            index: 0,
            type: "search",
            title: "current suggestion",
            url: "https://search.test/current",
          },
        ],
      }),
    );
    expect(host.textContent).toContain("current suggestion");
  });

  it("finds saved results from the address field and ignores an older work query", async () => {
    let releaseOld: ((value: unknown) => void) | undefined;
    vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
      if (method === "results.search") {
        const query = (params as { query: string }).query;
        if (query === "old")
          return (await new Promise<unknown>((resolve) => {
            releaseOld = resolve;
          })) as never;
        return [
          {
            artifactId: "artifact-new",
            chatId: "chat-new",
            filename: "current-report.md",
            conversationTitle: "Research",
            mediaType: "text/markdown",
            byteLength: 128,
            createdAt: Date.now(),
            runId: "run-new",
            turnGoal: "Research",
          },
        ] as never;
      }
      return [] as never;
    });
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "old"));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 130)));
    await act(async () => type(input, "new"));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 130)));
    expect(host.textContent).toContain("current-report.md");
    await act(async () => releaseOld?.([{ artifactId: "artifact-old", filename: "stale-report.md" }]));
    expect(host.textContent).not.toContain("stale-report.md");
    await act(async () => host.querySelector<HTMLElement>(".cb-opt.results")!.click());
    expect(useStore.getState().resultPreview).toBe("artifact-new");
  });

  it("keeps scoped pills keyboard reachable and opens a native tab match", async () => {
    native = nativeOmniboxFixture([
      { id: "tab-p2", index: 5, type: "tab", title: "GitLab project", url: "https://gitlab.com/project" },
    ]);
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "git"));
    await act(async () => key(input, "2", { altKey: true }));
    expect(
      host.querySelector<HTMLButtonElement>('.cb-provider-scopes button[aria-pressed="true"]')?.textContent,
    ).toBe("Open Tabs");
    expect(host.textContent).toContain("GitLab project");
    expect(host.textContent).not.toContain("Search for “git”");
    await act(async () => key(input, "Enter"));
    expect(native.open).toHaveBeenCalledWith(
      expect.objectContaining({
        match: expect.objectContaining({ index: 5, url: "https://gitlab.com/project" }),
      }),
    );
    expect(invoke.mock.calls.some(([method]) => method === "command.ranking.record")).toBe(false);
  });

  it("reopens a closed tab from its scope and returns to all results with Escape", async () => {
    useStore.setState({
      closedTabs: [
        { pageId: "closed-guide", title: "Guide", url: "https://example.com/guide", closedAt: Date.now() },
      ],
    } as never);
    const reopen = vi.spyOn(useStore.getState(), "reopenClosedTab").mockResolvedValue(undefined);
    nativeOmniboxFixture([]);
    vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "guide"));
    await settle();
    await act(async () => key(input, "3", { altKey: true }));
    expect(host.querySelector(".cb-opt.closed")?.textContent).toContain("Guide");
    expect(host.querySelector(".cb-search-keys")?.textContent).toContain("all results");
    await act(async () => key(input, "Escape"));
    expect(document.activeElement).toBe(input);
    expect(
      host.querySelector<HTMLButtonElement>('.cb-provider-scopes button[aria-pressed="true"]')?.textContent,
    ).toBe("All");
    await act(async () => key(input, "3", { altKey: true }));
    await act(async () => key(input, "Enter"));
    await settle();
    expect(reopen).toHaveBeenCalledWith("closed-guide");
  });

  it("opens a bookmarked page from its scope even when a matching tab is open", async () => {
    useStore.setState({
      pages: normalizePages([
        { ...page },
        { ...page, pageId: "p2", title: "Guide", url: "https://example.com/guide" },
      ] as never),
      bookmarks: [{ url: "https://example.com/guide", title: "Guide", folderPath: ["Reading"] }],
    } as never);
    const navigate = vi.spyOn(useStore.getState(), "navigatePage").mockResolvedValue(undefined);
    native = nativeOmniboxFixture([
      {
        id: "guide",
        index: 6,
        type: "bookmark",
        title: "Guide",
        description: "Reading",
        url: "https://example.com/guide",
      },
    ]);
    vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "guide"));
    await settle();
    await act(async () => key(input, "4", { altKey: true }));
    expect(host.querySelector(".cb-opt.browser")?.textContent).toContain("Reading");
    await act(async () => key(input, "Enter"));
    await settle();
    expect(native.open).toHaveBeenCalledWith(
      expect.objectContaining({
        match: expect.objectContaining({ index: 6, url: "https://example.com/guide" }),
      }),
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it("finds a browser history match in History and opens an extension action", async () => {
    nativeFlag.value = true;
    const nativeWindow = window as Window & { auxChromiumHost?: { featureStages?: { extensions: "on" } } };
    const priorHost = nativeWindow.auxChromiumHost;
    nativeWindow.auxChromiumHost = { featureStages: { extensions: "on" } };
    try {
      const fixture = nativeOmniboxFixture([
        { id: "visit", type: "history", title: "Guide visit", url: "https://example.com/guide" },
      ]);
      vi.spyOn(bridge, "extensions").mockResolvedValue([
        {
          key: "guide",
          name: "Guide tools",
          version: "1",
          permissions: [],
          enabled: true,
          loaded: true,
          managed: false,
          source: "store",
        },
      ]);
      const showAction = vi.spyOn(bridge, "showExtensionAction").mockResolvedValue(true);
      vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
      const navigate = vi.spyOn(useStore.getState(), "navigatePage").mockResolvedValue(undefined);
      await act(async () => root.render(<CommandBar />));
      const input = host.querySelector("input")!;
      await act(async () => input.focus());
      await act(async () => type(input, "guide"));
      await settle();
      await act(async () => key(input, "5", { altKey: true }));
      expect(host.querySelector(".cb-opt.browser")?.textContent).toContain("Guide visit");
      await act(async () => key(input, "Enter"));
      await settle();
      expect(fixture.open).toHaveBeenCalledWith(
        expect.objectContaining({
          disposition: "current-tab",
          match: expect.objectContaining({ url: "https://example.com/guide" }),
        }),
      );
      expect(navigate).not.toHaveBeenCalled();
      await act(async () => input.focus());
      await act(async () => type(input, "guide"));
      await settle();
      await act(async () => key(input, "6", { altKey: true }));
      expect(host.querySelector(".cb-opt.extensions")?.textContent).toContain("Guide tools");
      await act(async () => key(input, "Enter"));
      await settle();
      expect(showAction).toHaveBeenCalledWith("guide");
    } finally {
      nativeWindow.auxChromiumHost = priorHost;
    }
  });

  it("keeps the provider picker open while keyboard focus moves through its pills", async () => {
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "unmatched"));
    const sites = [...host.querySelectorAll<HTMLButtonElement>(".cb-provider-scopes button")].find(
      (button) => button.textContent === "Sites",
    )!;
    await act(async () => sites.focus());
    await settle();
    expect(host.querySelector(".cb-provider-scopes")).not.toBeNull();
    await act(async () => sites.click());
    expect(
      host.querySelector<HTMLButtonElement>('.cb-provider-scopes button[aria-pressed="true"]')?.textContent,
    ).toBe("Sites");
  });
});

it("new-tab mode starts empty and Escape never creates a tab", async () => {
  const create = vi.spyOn(useStore.getState(), "newTab");
  const close = vi.fn();
  await act(async () => root.render(<CommandBar surfaceMode="new-tab" onClose={close} />));
  expect(host.querySelector("input")!.value).toBe("");
  await act(async () => key(host.querySelector("input")!, "Escape"));
  expect(close).toHaveBeenCalledOnce();
  expect(create).not.toHaveBeenCalled();
});

it("edit mode selects the current URL without creating a page", async () => {
  await act(async () => root.render(<CommandBar surfaceMode="edit" />));
  const input = host.querySelector("input")!;
  expect(input.value).toBe(page.url);
  expect(input.selectionStart).toBe(0);
  expect(input.selectionEnd).toBe(page.url.length);
});

it("new-tab CmdEnter uses a background native open acknowledgement", async () => {
  nativeFlag.value = true;
  const fixture = nativeOmniboxFixture();
  const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue({ ...ack, pageId: "new" });
  const close = vi.fn();
  await act(async () => root.render(<CommandBar surfaceMode="new-tab" onClose={close} />));
  const input = host.querySelector("input")!;
  await act(async () => type(input, "https://example.com/new"));
  await act(async () => key(input, "Enter", { metaKey: true }));
  await settle();
  expect(fixture.open).toHaveBeenCalledWith(expect.objectContaining({ disposition: "new-background-tab" }));
  expect(command).not.toHaveBeenCalled();
  expect(close).toHaveBeenCalledOnce();
});

it("command mode runs its registered provider rather than navigating", async () => {
  const run = vi.fn().mockResolvedValue(undefined);
  const rows = () => [{ id: "split-add", title: "Split view", icon: null, section: "intent" as const, run }];
  await act(async () => root.render(<CommandBar surfaceMode="command" commandRows={rows} />));
  expect(host.textContent).toContain("Split view");
  await act(async () => key(host.querySelector("input")!, "Enter"));
  await settle();
  expect(run).toHaveBeenCalledOnce();
});

it("scope markers become pills and empty Backspace clears the scope", async () => {
  await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
  const input = host.querySelector("input")!;
  await act(async () => type(input, "@"));
  expect(input.value).toBe("");
  expect(host.querySelector(".cb-scope-pill")?.textContent).toBe("Tabs");
  await act(async () => key(input, "Backspace"));
  expect(host.querySelector(".cb-scope-pill")).toBeNull();
});

it("keeps a refused native navigation open and closes only after acceptance", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  native.open.mockResolvedValueOnce(false).mockResolvedValue(true);
  const close = vi.fn();
  await act(async () => root.render(<CommandBar surfaceMode="new-tab" onClose={close} />));
  const input = host.querySelector("input")!;
  await act(async () => type(input, "https://example.com/typed"));
  await act(async () => key(input, "Enter"));
  expect(native.open).toHaveBeenCalledOnce();
  expect(close).not.toHaveBeenCalled();
  await act(async () => key(input, "Enter"));
  expect(native.open).toHaveBeenCalledTimes(2);
  expect(close).toHaveBeenCalledOnce();
  expect(invoke.mock.calls.some(([method]) => method === "command.ranking.record")).toBe(false);
});

it("keeps missing-model Ask refusals in the command surface and searches after three failures", async () => {
  nativeFlag.value = true;
  const fixture = nativeOmniboxFixture();
  useStore.setState({
    settings: { modelConfigured: false, commandRouting: "automatic" },
    overlay: null,
    toasts: [],
  } as never);
  const start = vi.spyOn(useStore.getState(), "startRun");
  const create = vi.spyOn(useStore.getState(), "newTab").mockResolvedValue(page as never);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  const search = vi.spyOn(bridge, "resolveSearch").mockResolvedValue("https://example.com/profile-search");
  const question = "What is the local fixture showing?";
  const close = vi.fn();
  await act(async () =>
    root.render(
      <>
        <CommandBar surfaceMode="new-tab" onClose={close} />
        <Toasts />
      </>,
    ),
  );
  const input = host.querySelector("input")!;
  await act(async () => input.focus());
  await act(async () => type(input, question));
  for (let attempt = 0; attempt < 3; attempt++) {
    await act(async () => key(input, "Enter"));
    expect(input.value).toBe(question);
    expect(host.textContent).toContain("Ask is unavailable");
    expect(useStore.getState().overlay).toBeNull();
    expect(document.activeElement).toBe(input);
    expect(close).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  }
  expect(start).not.toHaveBeenCalled();
  expect(host.textContent).toContain("searching");
  const status = host.querySelector(".cb-query-status")!;
  expect(status.closest(".cb-pop")).not.toBeNull();
  expect(status.parentElement?.contains(input)).toBe(false);
  expect(input.value).toBe(question);
  expect(document.activeElement).toBe(input);
  await act(async () => key(input, "Enter"));
  expect(fixture.open).toHaveBeenCalledWith(expect.objectContaining({ disposition: "new-foreground-tab" }));
  expect(search).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
  expect(close).toHaveBeenCalledOnce();
});

it("keeps saved-work failure and Retry outside the editing row and retries the current query", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "results.search") throw new Error("Fixture work unavailable");
    return [] as never;
  });
  await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
  const input = host.querySelector("input")!;
  await act(async () => input.focus());
  await act(async () => type(input, "a long current query that must remain editable"));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 140)));
  const status = host.querySelector(".cb-query-status")!;
  expect(status.textContent).toContain("Some saved work couldn’t be searched.");
  expect(status.closest(".cb-pop")).not.toBeNull();
  expect(status.parentElement?.contains(input)).toBe(false);
  const retry = [...status.querySelectorAll("button")].find((button) => button.textContent === "Retry")!;
  const before = invoke.mock.calls.filter(([method]) => method === "results.search").length;
  await act(async () => retry.click());
  await act(async () => new Promise((resolve) => setTimeout(resolve, 140)));
  expect(invoke.mock.calls.filter(([method]) => method === "results.search")).toHaveLength(before + 1);
  expect(input.value).toBe("a long current query that must remain editable");
  expect(document.activeElement).toBe(input);
});

it("queries saved work only in All or Work, retaining current failures and Retry there", async () => {
  nativeFlag.value = true;
  nativeOmniboxFixture();
  const featureWindow = window as Window & { auxChromiumHost?: { featureStages: { automations: "on" } } };
  const previousHost = featureWindow.auxChromiumHost;
  featureWindow.auxChromiumHost = { featureStages: { automations: "on" } };
  try {
    const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
      if (["results.search", "routines.list", "conversations.list"].includes(method))
        throw new Error("current saved work unavailable");
      return [] as never;
    });
    const workCalls = () =>
      invoke.mock.calls.filter(([method]) =>
        ["results.search", "routines.list", "conversations.list"].includes(method),
      );
    const wait = () => act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
    await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
    const input = host.querySelector("input")!;
    await act(async () => type(input, "@"));
    await act(async () => type(input, "Aux native Red"));
    await wait();
    expect(workCalls()).toHaveLength(0);
    expect(host.textContent).not.toContain("Some saved work couldn’t be searched.");
    await act(async () => root.render(<CommandBar key="command" surfaceMode="command" />));
    await act(async () => type(host.querySelector("input")!, "split"));
    await wait();
    expect(workCalls()).toHaveLength(0);
    expect(host.textContent).not.toContain("Some saved work couldn’t be searched.");
    await act(async () => root.render(<CommandBar key="all" surfaceMode="new-tab" />));
    const all = host.querySelector("input")!;
    await act(async () => type(all, "project"));
    await wait();
    expect(workCalls()).toHaveLength(3);
    expect(host.textContent).toContain("Some saved work couldn’t be searched.");
    const retry = [...host.querySelectorAll("button")].find((button) => button.textContent === "Retry")!;
    await act(async () => retry.click());
    await wait();
    expect(workCalls()).toHaveLength(6);
    await act(async () => key(all, "2", { altKey: true }));
    expect(host.textContent).not.toContain("Some saved work couldn’t be searched.");
    await wait();
    expect(workCalls()).toHaveLength(6);
    await act(async () => key(all, "8", { altKey: true }));
    await wait();
    expect(workCalls()).toHaveLength(9);
    expect(host.textContent).toContain("Some saved work couldn’t be searched.");
  } finally {
    featureWindow.auxChromiumHost = previousHost;
  }
});
it("does not query unavailable routines or fabricate a saved-work failure on a fresh Profile", async () => {
  const featureWindow = window as Window & { auxChromiumHost?: { featureStages: { automations: "off" } } };
  const previousHost = featureWindow.auxChromiumHost;
  featureWindow.auxChromiumHost = { featureStages: { automations: "off" } };
  try {
    const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
      if (method === "routines.list") throw new Error("not qualified");
      return [] as never;
    });
    await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
    await act(async () => type(host.querySelector("input")!, "project"));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
    expect(invoke.mock.calls.some(([method]) => method === "routines.list")).toBe(false);
    expect(invoke.mock.calls.some(([method]) => method === "results.search")).toBe(true);
    expect(invoke.mock.calls.some(([method]) => method === "conversations.list")).toBe(true);
    expect(host.textContent).not.toContain("Some saved work couldn’t be searched.");
    expect(host.textContent).not.toContain("Searching saved work…");
  } finally {
    featureWindow.auxChromiumHost = previousHost;
  }
});

it("hides retained routine results immediately when their trusted feature stage becomes unavailable", async () => {
  nativeFlag.value = true;
  nativeOmniboxFixture();
  const featureWindow = window as Window & {
    auxChromiumHost?: { featureStages: { automations: "on" | "off" } };
  };
  const previousHost = featureWindow.auxChromiumHost;
  featureWindow.auxChromiumHost = { featureStages: { automations: "on" } };
  try {
    vi.spyOn(bridge, "invoke").mockImplementation(async (method) =>
      method === "routines.list"
        ? ([
            {
              routineId: "routine-current",
              title: "Project current skill",
              objective: "project",
              workspaceId: "workspace-current",
            },
          ] as never)
        : ([] as never),
    );
    await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
    await act(async () => type(host.querySelector("input")!, "project"));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
    expect(host.textContent).toContain("Project current skill");
    featureWindow.auxChromiumHost = { featureStages: { automations: "off" } };
    await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
    expect(host.textContent).not.toContain("Project current skill");
  } finally {
    featureWindow.auxChromiumHost = previousHost;
  }
});
