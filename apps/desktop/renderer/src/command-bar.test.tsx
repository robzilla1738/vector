// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./bridge", async importOriginal => ({ ...await importOriginal<typeof import("./bridge")>(), inNativeHost: true }));
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
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
    await act(async () => root.render(<CommandBar />));
    const input = host.querySelector("input")!;
    await act(async () => input.focus());
    await act(async () => type(input, "gi"));
    expect(invoke).toHaveBeenCalledWith("history.list", { query: "gi", limit: 6 });
  });

  it("remote suggestions honor the preference and privacy gate", async () => {
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
});
