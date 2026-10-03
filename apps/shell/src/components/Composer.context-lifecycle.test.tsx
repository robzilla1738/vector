// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { Conversation } from "./Conversation";
import { BrowserContextTray } from "./BrowserContextTray";
import { makePage } from "../mock/fixtures";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  useStore.setState({ agentDraft: "Keep this page-free question", railOpen: false, runs: [], pendingTurns: [], pages: [], connected: true, conversationId: null, toasts: [] });
  vi.spyOn(bridge, "invoke").mockImplementation(async method => {
    if (method === "runs.list" || method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Other chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true);
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
async function beginImage() {
  await act(async () => root.render(<Conversation />));
  const input = host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!;
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!.click());
  const action = [...document.querySelectorAll<HTMLButtonElement>('dialog[aria-label="Add context"] button')].find(node => node.textContent === "Image")!;
  expect(action).toBeTruthy();
  await act(async () => action.click());
  expect(document.querySelector('dialog[aria-label="Add context"]')).toBeNull();
  return input;
}

it("retains image review and the page-free draft after actual plus-menu initiation closes", async () => {
  let resolve!: (value: { filename: string; dataUrl: string }) => void;
  const picker = vi.spyOn(bridge, "pickEvidenceImage").mockImplementation(() => new Promise(done => { resolve = done; }));
  const input = await beginImage();
  expect(picker).toHaveBeenCalledOnce();
  expect(host.textContent).toContain("Preparing image…");
  await act(async () => resolve({ filename: "reference.png", dataUrl: "data:image/png;base64,c3ludGhldGlj" }));
  expect(host.querySelector('.capture-editor img')?.getAttribute("src")).toBe("data:image/png;base64,c3ludGhldGlj");
  expect(host.textContent).toContain("reference.png");
  expect(host.textContent).not.toContain("Preparing image…");
  expect(input.value).toBe("Keep this page-free question");
  expect(useStore.getState().pages).toEqual([]);
  expect(bridge.invoke).not.toHaveBeenCalledWith("conversations.images.add", expect.anything());
});

it("keeps a late image picker failure visible with the unchanged draft after the menu closes", async () => {
  let reject!: (reason: Error) => void;
  vi.spyOn(bridge, "pickEvidenceImage").mockImplementation(() => new Promise((_done, fail) => { reject = fail; }));
  const input = await beginImage();
  await act(async () => reject(new Error("The image could not be read")));
  expect(host.querySelector('[role="alert"]')?.textContent).toBe("The image could not be read");
  expect(input.value).toBe("Keep this page-free question");
  expect(host.querySelector('[aria-label="Add context"]')).toBeTruthy();
});

it("does not apply a late image picker result to a different conversation", async () => {
  let resolve!: (value: { filename: string; dataUrl: string }) => void;
  vi.spyOn(bridge, "pickEvidenceImage").mockImplementation(() => new Promise(done => { resolve = done; }));
  await beginImage();
  useStore.setState({ conversationDrafts: { "chat:other": "Other retained draft" } });
  await act(async () => root.render(<Conversation chatId="other" />));
  await act(async () => resolve({ filename: "old-chat.png", dataUrl: "data:image/png;base64,c3ludGhldGlj" }));
  expect(host.querySelector('.capture-editor')).toBeNull();
  expect(host.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe("Other retained draft");
  expect(bridge.invoke).not.toHaveBeenCalledWith("conversations.images.add", expect.anything());
});

it("does not add a pending browser source after the conversation becomes locked", async () => {
  const page = makePage(0, { pageId: "source", title: "Reference", url: "https://example.test/reference" });
  useStore.setState({ pages: [page] });
  let resolve!: (value: typeof page[]) => void;
  vi.mocked(bridge.invoke).mockImplementation(async method => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list") return new Promise(done => { resolve = done; });
    throw new Error(method);
  });
  const onSources = vi.fn();
  const render = (disabled: boolean) => <BrowserContextTray primary="none" sources={[]} onPrimary={vi.fn()} onSources={onSources} disabled={disabled} />;
  await act(async () => root.render(render(false)));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  await act(async () => document.querySelector<HTMLInputElement>('dialog input[type="checkbox"]')!.click());
  await act(async () => root.render(render(true)));
  await act(async () => resolve([page]));
  expect(onSources).not.toHaveBeenCalled();
});

it("retains a genuine pending selection through an equivalent source-array rerender", async () => {
  const page = makePage(0, { pageId: "source", title: "Reference", url: "https://example.test/reference" });
  useStore.setState({ pages: [page] });
  let resolve!: (value: typeof page[]) => void;
  vi.mocked(bridge.invoke).mockImplementation(async method => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list") return new Promise(done => { resolve = done; });
    throw new Error(method);
  });
  const onSources = vi.fn();
  const render = () => <BrowserContextTray primary="none" sources={[]} onPrimary={vi.fn()} onSources={onSources} disabled={false} />;
  await act(async () => root.render(render()));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  await act(async () => document.querySelector<HTMLInputElement>('dialog input[type="checkbox"]')!.click());
  await act(async () => root.render(render()));
  await act(async () => resolve([page]));
  expect(onSources).toHaveBeenCalledExactlyOnceWith([expect.objectContaining({ pageId: page.pageId, url: page.url, documentEpoch: page.documentEpoch })]);
});

it("does not retry recovery after a lock and unlock while its original list is pending", async () => {
  const page = makePage(0, { pageId: "source", title: "Reference", url: "https://example.test/reference" });
  useStore.setState({ pages: [page] });
  let resolve!: (value: { pageId: string }[]) => void;
  vi.mocked(bridge.invoke).mockImplementation(async method => {
    if (method === "browser.recovery.list") return new Promise(done => { resolve = done; });
    throw new Error(method);
  });
  const onSources = vi.fn();
  const render = (disabled: boolean) => <BrowserContextTray primary="none" sources={[]} onPrimary={vi.fn()} onSources={onSources} disabled={disabled} />;
  await act(async () => root.render(render(false)));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  await act(async () => document.querySelector<HTMLInputElement>('dialog input[type="checkbox"]')!.click());
  await act(async () => root.render(render(true)));
  await act(async () => root.render(render(false)));
  await act(async () => resolve([{ pageId: page.pageId }]));
  expect(onSources).not.toHaveBeenCalled();
  expect(vi.mocked(bridge.invoke).mock.calls.some(([method]) => method === "browser.recovery.retry" || method === "pages.list")).toBe(false);
});

it.each([false, true])("retires a pending additional-tab selection across chat navigation (return to first: %s)", async returnToFirst => {
  const page = makePage(0, { pageId: "source", title: "Reference", url: "https://example.test/reference" });
  useStore.setState({ pages: [page], conversationContexts: { "chat:first": "none", "chat:second": "none" }, conversationDrafts: { "chat:first": "First draft", "chat:second": "Second draft" } });
  let resolve!: (value: typeof page[]) => void;
  const defaultInvoke = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation(async (method, args) => {
    if (method === "browser.recovery.list") return [];
    if (method === "pages.list") return new Promise(done => { resolve = done; });
    return defaultInvoke(method, args);
  });
  await act(async () => root.render(<Conversation chatId="first" />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!.click());
  await act(async () => document.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  await act(async () => document.querySelector<HTMLInputElement>('dialog[aria-label="Add browser tabs"] input[type="checkbox"]')!.click());
  await act(async () => root.render(<Conversation chatId="second" />));
  if (returnToFirst) await act(async () => root.render(<Conversation chatId="first" />));
  await act(async () => resolve([page]));
  expect(Object.values(useStore.getState().conversationBrowserSources).flat()).not.toContainEqual(expect.objectContaining({ pageId: page.pageId }));
  expect(host.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(returnToFirst ? "First draft" : "Second draft");
});

it("still retries a genuinely pending tab and selects its fresh live document", async () => {
  const before = makePage(0, { pageId: "source", title: "Reference", url: "https://example.test/before", documentEpoch: 1 });
  const after = { ...before, url: "https://example.test/after", documentEpoch: 2 };
  useStore.setState({ pages: [before] });
  vi.mocked(bridge.invoke).mockImplementation(async method => {
    if (method === "browser.recovery.list") return [{ pageId: before.pageId }];
    if (method === "browser.recovery.retry") return {};
    if (method === "pages.list") return [after];
    throw new Error(method);
  });
  const onSources = vi.fn();
  await act(async () => root.render(<BrowserContextTray primary="none" sources={[]} onPrimary={vi.fn()} onSources={onSources} disabled={false} />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add browser tabs"]')!.click());
  await act(async () => document.querySelector<HTMLInputElement>('dialog input[type="checkbox"]')!.click());
  expect(bridge.invoke).toHaveBeenCalledWith("browser.recovery.retry", { pageId: before.pageId });
  expect(onSources).toHaveBeenCalledExactlyOnceWith([expect.objectContaining({ pageId: after.pageId, url: after.url, documentEpoch: 2 })]);
});


it("shows a concise context failure and retries without discarding the draft", async () => {
  const originalInvoke = vi.mocked(bridge.invoke).getMockImplementation()!;
  let failed = true;
  vi.mocked(bridge.invoke).mockImplementation(async (method, args) => {
    if (method === "conversations.images.get" && failed) throw new Error("not_found: no page internal-page-id");
    return originalInvoke(method, args);
  });
  useStore.setState({ conversationDrafts: { "chat:recover": "Keep my question" } });
  await act(async () => root.render(<Conversation chatId="recover" />));
  const alert = host.querySelector('[role="alert"]')!;
  expect(alert.textContent).toBe("Saved context couldn’t be loaded. Your draft is kept.");
  const details = alert.parentElement!.querySelector('details')!;
  expect(details.open).toBe(false);
  expect(details.textContent).toContain("not_found: no page internal-page-id");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.disabled).toBe(true);
  failed = false;
  await act(async () => alert.parentElement!.querySelector<HTMLButtonElement>('button')!.click());
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe("Keep my question");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.disabled).toBe(false);
});

it.each(["same", "new-draft", "other-chat"])("restores only the original empty draft after a thrown start (%s)", async scenario => {
  let reject!: (reason: Error) => void;
  const startRun = vi.fn().mockImplementation(() => new Promise((_done, fail) => { reject = fail; }));
  useStore.setState({ startRun, conversationDrafts: { "chat:original": "Original question", "chat:other": "Other question" } });
  await act(async () => root.render(<Conversation chatId="original" />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
  expect(startRun).toHaveBeenCalledOnce();
  expect(useStore.getState().conversationDrafts["chat:original"] ?? "").toBe("");
  if (scenario === "new-draft") await act(async () => useStore.getState().setConversationDraft("original", "New question"));
  if (scenario === "other-chat") await act(async () => root.render(<Conversation chatId="other" />));
  await act(async () => reject(new Error("not_found: no page internal-page-id")));
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe(scenario === "new-draft" ? "New question" : "Original question");
  expect(useStore.getState().conversationDrafts["chat:other"]).toBe("Other question");
  const stayed = scenario !== "other-chat";
  const alert = host.querySelector('[role="alert"]');
  const details = alert?.parentElement?.querySelector('details');
  expect(alert?.textContent ?? null).toBe(stayed ? "Your message couldn’t be sent. Try sending it again. Your reply is kept." : null);
  expect(details?.open ?? null).toBe(stayed ? false : null);
  expect(details?.textContent ?? null).toBe(stayed ? "Detailsnot_found: no page internal-page-id" : null);
  expect(host.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe(scenario === "other-chat" ? "Other question" : scenario === "new-draft" ? "New question" : "Original question");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.disabled).toBe(false);
  expect(startRun.mock.calls[0]![1]).toMatchObject({ pageId: null, pageIds: [], scope: "new" });
  expect(useStore.getState().pages).toEqual([]);
});
