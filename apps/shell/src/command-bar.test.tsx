// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const nativeFlag = vi.hoisted(() => ({ value: true }));
vi.mock("./bridge", async importOriginal => ({
  ...await importOriginal<typeof import("./bridge")>(),
  get inNativeHost() { return nativeFlag.value; },
}));
import { bridge } from "./bridge";
import { CommandBar } from "./components/CommandBar";
import { useStore } from "./store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
  observe() {} unobserve() {} disconnect() {}
};
Element.prototype.scrollIntoView ??= () => {};

const page = {
  pageId: "p1", url: "https://github.com/aux", title: "Aux repo", favicon: "",
  loading: false, ownedByRuntime: false, viewStatus: "visible" as const,
  canGoBack: true, canGoForward: false, muted: false, backend: "aux",
  navigationError: null, showBlankDocument: false,
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

beforeEach(() => {
  nativeFlag.value = true;
  useStore.setState({
    pages: [{ ...page }], activePageId: "p1", bookmarks: [], closedTabs: [],
    programs: [], runs: [], settings: {},
  } as never);
  ({ host, root } = mount());
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

const settle = () => act(async () => new Promise(resolve => setTimeout(resolve, 20)));

describe("CommandBar keyboard contract", () => {
  it("Escape blurs the field", async () => {
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "half-typed query"));
    await act(async () => key(input, "Escape"));
    expect(document.activeElement).not.toBe(input);
  });

  it("Enter on typed search navigates through the tab command", async () => {
    const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack);
    const requiredBridge = bridge as typeof bridge & { resolveSearch: (query: string) => Promise<string> };
    vi.spyOn(requiredBridge, "resolveSearch").mockResolvedValue("https://duckduckgo.com/?q=how+do+browsers+restore+sessions");
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "how do browsers restore sessions"));
    await act(async () => key(input, "Enter"));
    await settle();
    expect(command.mock.calls.some(([c]) => c.kind === "navigate" && String((c as { url?: string }).url).includes("duckduckgo.com"))).toBe(true);
  });

  it("ArrowDown + Enter runs the highlighted suggestion, not the intent row", async () => {
    useStore.setState({
      pages: [{ ...page }, { ...page, pageId: "p2", url: "https://gitlab.com/other", title: "GitLab other" }],
      bookmarks: [{ url: "https://github.blog/x", title: "GitHub blog", folderPath: [] }],
    } as never);
    const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "git"));
    // [intent, ask, tab-p2, bookmark] — two downs land on the open tab.
    await act(async () => key(input, "ArrowDown"));
    await act(async () => key(input, "ArrowDown"));
    await act(async () => key(input, "Enter"));
    await settle();
    expect(command.mock.calls.some(([c]) => c.kind === "activate" && (c as { pageId?: string }).pageId === "p2")).toBe(true);
    expect(command.mock.calls.every(([c]) => !(c.kind === "navigate" && String((c as { url?: string }).url).includes("q=git")))).toBe(true);
  });

  it("updates bookmark suggestions when a saved title changes", async () => {
    useStore.setState({ bookmarks: [{ url: "https://example.com/guide", title: "Original guide", folderPath: [] }] } as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "guide"));
    await vi.waitFor(async () => { await act(async () => {}); expect(host.textContent).toContain("Original guide"); });
    await act(async () => useStore.setState({ bookmarks: [{ url: "https://example.com/guide", title: "Updated guide", folderPath: [] }] } as never));
    await vi.waitFor(async () => { await act(async () => {}); expect(host.textContent).toContain("Updated guide"); });
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
  });

  it("keyword engines route Enter to the engine, not the default search", async () => {
    const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "gh aux browser"));
    await act(async () => key(input, "Enter"));
    await settle();
    expect(command.mock.calls.some(([c]) => c.kind === "navigate" && (c as { url?: string }).url === "https://github.com/search?q=aux%20browser")).toBe(true);
  });

  it("requests indexed local history as soon as a usable query is typed", async () => {
    nativeFlag.value = false;
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "gi"));
    expect(invoke).toHaveBeenCalledWith("history.list", { query: "gi", limit: 6 });
  });

  it("remote suggestions honor the preference and privacy gate", async () => {
    nativeFlag.value = false;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(["x", ["extra suggestion"]])));
    useStore.setState({ settings: { searchSuggestions: true, searchEngine: "https://duckduckgo.com/?q=%s" } } as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    // Private-looking input: never leaves the machine.
    await act(async () => type(input, "192.168.1.1"));
    await act(async () => new Promise(resolve => setTimeout(resolve, 300)));
    expect(fetchMock).not.toHaveBeenCalled();
    // Public query past the debounce reaches the engine endpoint.
    await act(async () => type(input, "public question"));
    await act(async () => new Promise(resolve => setTimeout(resolve, 300)));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("duckduckgo.com/ac/"));
  });

  it("never paints a late remote suggestion for an earlier query", async () => {
    nativeFlag.value = false;
    const replies:((response:Response)=>void)[]=[];
    const fetchMock=vi.spyOn(globalThis,"fetch").mockImplementation(()=>new Promise(resolve=>replies.push(resolve)));
    useStore.setState({settings:{searchSuggestions:true,searchEngine:"https://duckduckgo.com/?q=%s"}} as never);
    await act(async()=>root.render(<CommandBar/>));
    const input=host.querySelector("input")!;
    await act(async()=>input.focus());
    await act(async()=>type(input,"first query"));
    await act(async()=>new Promise(resolve=>setTimeout(resolve,190)));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async()=>type(input,"second query"));
    await act(async()=>new Promise(resolve=>setTimeout(resolve,190)));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async()=>replies[0]!(new Response(JSON.stringify(["first query",["stale suggestion"]]))));
    expect(host.textContent).not.toContain("stale suggestion");
    await act(async()=>replies[1]!(new Response(JSON.stringify(["second query",["current suggestion"]]))));
    await settle();
    expect(host.textContent).toContain("current suggestion");
  });

  it("finds saved results from the address field and ignores an older work query", async () => {
    let releaseOld: ((value: unknown) => void) | undefined;
    vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
      if (method === "results.search") {
        const query = (params as { query: string }).query;
        if (query === "old") return await new Promise<unknown>(resolve => { releaseOld = resolve; }) as never;
        return [{ artifactId: "artifact-new", chatId: "chat-new", filename: "current-report.md", conversationTitle: "Research",
          mediaType: "text/markdown", byteLength: 128, createdAt: Date.now(), runId: "run-new", turnGoal: "Research" }] as never;
      }
      return [] as never;
    });
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "old"));
    await act(async () => new Promise(resolve => setTimeout(resolve, 130)));
    await act(async () => type(input, "new"));
    await act(async () => new Promise(resolve => setTimeout(resolve, 130)));
    expect(host.textContent).toContain("current-report.md");
    await act(async () => releaseOld?.([{ artifactId: "artifact-old", filename: "stale-report.md" }]));
    expect(host.textContent).not.toContain("stale-report.md");
    await act(async () => host.querySelector<HTMLElement>(".cb-opt.results")!.click());
    expect(useStore.getState().resultPreview).toBe("artifact-new");
  });

  it("keeps scoped pills keyboard reachable and records a chosen tab", async () => {
    useStore.setState({ pages: [{ ...page }, { ...page, pageId: "p2", title: "GitLab project", url: "https://gitlab.com/project" }] } as never);
    const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => method === "command.ranking.list" ? [] as never :
      method === "command.ranking.record" ? { query: "git", candidateKey: "gitlab project\u0000gitlab.com", source: "tabs", uses: 1, lastUsedAt: Date.now() } as never : [] as never);
    const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue(ack);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "git"));
    await act(async () => key(input, "2", { altKey: true }));
    expect(host.querySelector<HTMLButtonElement>('.cb-provider-scopes button[aria-pressed="true"]')?.textContent).toBe("Open Tabs");
    expect(host.textContent).toContain("GitLab project");
    expect(host.textContent).not.toContain("Search for “git”");
    await act(async () => key(input, "Enter"));
    await settle();
    expect(command.mock.calls.some(([c]) => c.kind === "activate" && (c as { pageId?: string }).pageId === "p2")).toBe(true);
    expect(invoke.mock.calls.some(([method]) => method === "command.ranking.record")).toBe(true);
  });

  it("reopens a closed tab from its scope and returns to all results with Escape", async () => {
    useStore.setState({ closedTabs: [{ pageId: "closed-guide", title: "Guide", url: "https://example.com/guide", closedAt: Date.now() }] } as never);
    const reopen = vi.spyOn(useStore.getState(), "reopenClosedTab").mockResolvedValue(undefined);
    vi.spyOn(bridge, "autocomplete").mockResolvedValue([]);
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
    expect(host.querySelector<HTMLButtonElement>('.cb-provider-scopes button[aria-pressed="true"]')?.textContent).toBe("All");
    await act(async () => key(input, "3", { altKey: true }));
    await act(async () => key(input, "Enter"));
    await settle();
    expect(reopen).toHaveBeenCalledWith("closed-guide");
  });

  it("opens a bookmarked page from its scope even when a matching tab is open", async () => {
    useStore.setState({
      pages: [{ ...page }, { ...page, pageId: "p2", title: "Guide", url: "https://example.com/guide" }],
      bookmarks: [{ url: "https://example.com/guide", title: "Guide", folderPath: ["Reading"] }],
    } as never);
    const navigate = vi.spyOn(useStore.getState(), "navigatePage").mockResolvedValue(undefined);
    vi.spyOn(bridge, "autocomplete").mockResolvedValue([]);
    vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "guide"));
    await settle();
    await act(async () => key(input, "4", { altKey: true }));
    expect(host.querySelector(".cb-opt.bookmarks")?.textContent).toContain("Reading");
    await act(async () => key(input, "Enter"));
    await settle();
    expect(navigate).toHaveBeenCalledWith("p1", "https://example.com/guide");
  });

  it("finds a browser history match in History and opens an extension action", async () => {
    const nativeWindow = window as Window & { auxChromiumHost?: { featureStages?: { extensions: "on" } } };
    const priorHost = nativeWindow.auxChromiumHost;
    nativeWindow.auxChromiumHost = { featureStages: { extensions: "on" } };
    try {
    vi.spyOn(bridge, "autocomplete").mockResolvedValue([
      { id: "visit", type: "history", title: "Guide visit", url: "https://example.com/guide" },
    ]);
    vi.spyOn(bridge, "extensions").mockResolvedValue([
      { key: "guide", name: "Guide tools", version: "1", permissions: [], enabled: true, loaded: true, managed: false, source: "store" },
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
    expect(host.querySelector(".cb-opt.history")?.textContent).toContain("Guide visit");
    await act(async () => key(input, "Enter"));
    await settle();
    expect(navigate).toHaveBeenCalledWith("p1", "https://example.com/guide");
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
    const sites = [...host.querySelectorAll<HTMLButtonElement>(".cb-provider-scopes button")].find(button => button.textContent === "Sites")!;
    await act(async () => sites.focus());
    await settle();
    expect(host.querySelector(".cb-provider-scopes")).not.toBeNull();
    await act(async () => sites.click());
    expect(host.querySelector<HTMLButtonElement>('.cb-provider-scopes button[aria-pressed="true"]')?.textContent).toBe("Sites");
  });
});
