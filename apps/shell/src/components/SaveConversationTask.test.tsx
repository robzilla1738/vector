// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SaveConversationTask } from "./SaveConversationTask";

vi.mock("../store", () => ({
  call: vi.fn(),
  useStore: (select: (state: unknown) => unknown) => select({
    layout: { spaces: [{ id: "personal", workspaceId: "workspace", name: "Personal" }], activeSpaceId: "personal" },
  }),
}));

it("only opens task setup on request and retains the objective when cancelled", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  const onSaved = vi.fn();
  try {
    act(() => root.render(<SaveConversationTask chatId="chat" runId="run" goal="Summarize this page" onSaved={onSaved} />));
    expect(container.querySelector("form")).toBeNull();
    expect(container.textContent).toBe("Save as task");
    act(() => container.querySelector<HTMLButtonElement>("button")!.click());
    expect(container.querySelector("form")).not.toBeNull();
    expect(container.querySelector("textarea")?.value).toBe("Summarize this page");
    act(() => container.querySelector<HTMLButtonElement>('button[type="button"]')!.click());
    expect(container.querySelector("form")).toBeNull();
    expect(onSaved).not.toHaveBeenCalled();
    act(() => container.querySelector<HTMLButtonElement>("button")!.click());
    expect(container.querySelector("textarea")?.value).toBe("Summarize this page");
  } finally {
    act(() => root.unmount());
    vi.unstubAllGlobals();
  }
});
