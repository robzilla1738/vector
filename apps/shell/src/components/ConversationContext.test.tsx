// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { ConversationContext } from "./ConversationContext";
vi.mock("../ui/popover", () => ({
  Popover: ({
    trigger,
    children,
  }: {
    trigger: React.ReactNode;
    children: (close: () => void) => React.ReactNode;
  }) => (
    <div>
      {trigger}
      {children(() => {})}
    </div>
  ),
}));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("omits empty history after the real context request", async () => {
  vi.spyOn(bridge, "invoke").mockResolvedValue({ entries: [], historyEnabled: true } as never);
  await act(async () =>
    root.render(<ConversationContext chatId="chat" revision="1" disabled={false} onBusy={() => {}} />),
  );
  expect(host.textContent).toBe("");
});
it("retains history controls when all existing turns are excluded", async () => {
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockResolvedValue({
      entries: [{ runId: "prior", goal: "Earlier request", included: false }],
      historyEnabled: true,
    } as never);
  await act(async () =>
    root.render(<ConversationContext chatId="chat" revision="1" disabled={false} onBusy={() => {}} />),
  );
  expect(host.textContent).toContain("Previous turns · 0");
  expect(host.textContent).toContain("Earlier request");
  await act(async () => host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1]!.click());
  expect(invoke).toHaveBeenCalledWith("runs.context.set", { chatId: "chat", runId: "prior", included: true });
});
it("keeps context load errors discoverable rather than treating them as empty history", async () => {
  vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Unavailable"));
  await act(async () =>
    root.render(<ConversationContext chatId="chat" revision="1" disabled={false} onBusy={() => {}} />),
  );
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("Could not load conversation context");
});
