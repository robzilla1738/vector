// @vitest-environment jsdom
import { act, type ReactNode, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

vi.mock("../onboarding/OnboardingStarters", () => ({ OnboardingStarters: () => null }));
vi.mock("../store", () => ({
  errToast: vi.fn(),
  useStore: Object.assign(
    (select: (state: unknown) => unknown) => select({ railOpen: false, focusRequest: 0, connected: false }),
    { getState: () => ({ agentDraft: "Original question", connected: false }) },
  ),
}));
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "main",
    windowKind: "normal",
    privateMode: false,
    focusShell: () => Promise.resolve(),
    onEvent: () => () => {},
  },
}));
vi.mock("../commands", async () => {
  const { invokeScopedControl } = await import("../scoped-control-commands");
  return {
    runCommand: vi.fn(),
    executeCommand: (id: string, context: Parameters<typeof invokeScopedControl>[1]) => {
      try {
        return Promise.resolve(invokeScopedControl(id, context));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
});
vi.mock("./Conversation", () => ({
  Conversation: ({
    entryControls,
    composerRef,
  }: {
    entryControls?: ReactNode;
    composerRef: RefObject<HTMLTextAreaElement | null>;
  }) => (
    <section>
      <textarea ref={composerRef} defaultValue="Original question" aria-label="Question" />
      {entryControls}
    </section>
  ),
}));
import HomeAsk from "./HomeAsk";

it("keeps original Search focus/action and selected Ask inert while retaining the question", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const search = vi.fn();
  try {
    await act(async () => root.render(<HomeAsk onSearch={search} />));
    const controls = host.querySelector('[aria-label="Search or Ask"]')!;
    const [searchButton, askButton] = Array.from(controls.querySelectorAll("button"));
    expect(searchButton!.textContent).toBe("Search");
    expect(askButton!.textContent).toBe("Ask");
    expect(searchButton!.getAttribute("aria-pressed")).toBe("false");
    expect(askButton!.getAttribute("aria-pressed")).toBe("true");
    askButton!.focus();
    await act(async () => askButton!.click());
    expect(search).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(askButton);
    searchButton!.focus();
    await act(async () => searchButton!.click());
    expect(search).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(searchButton);
    expect(host.querySelector("textarea")!.value).toBe("Original question");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
