// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { makeRun } from "./mock/fixtures";
const initial = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(initial, true);
});
it("starts a page-free chat without opening a tab or displacing newer navigation or drafts", async () => {
  let finish!: (value: unknown) => void;
  const run = makeRun({ runId: "background", config: { chatId: "chat" } });
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const open = vi.fn().mockResolvedValue({ pageId: "task-page" });
  const reveal = vi.fn();
  useStore.setState({
    openBackgroundTab: open,
    openConversation: reveal,
    mode: "conversation",
    conversationId: null,
    overlay: null,
    agentDraft: "Research this",
    settings: { ...initial.settings, modelConfigured: true },
  });
  const pending = useStore
    .getState()
    .startRun("Research this", { scope: "new", presentation: "conversation" });
  await Promise.resolve();
  expect(open).not.toHaveBeenCalled();
  expect(bridge.invoke).toHaveBeenCalledWith("runs.start", expect.objectContaining({ pageIds: [] }));
  useStore.setState({ overlay: "settings", agentDraft: "A newer draft" });
  finish(run);
  await pending;
  expect(reveal).not.toHaveBeenCalled();
  expect(useStore.getState().overlay).toBe("settings");
  expect(useStore.getState().agentDraft).toBe("A newer draft");
  expect(useStore.getState().runs).toContain(run);
});
it("opens the requested conversation when the originating view is unchanged", async () => {
  const run = makeRun({ runId: "foreground" });
  vi.spyOn(bridge, "invoke").mockResolvedValue(run);
  const reveal = vi.fn();
  useStore.setState({ openConversation: reveal, settings: { ...initial.settings, modelConfigured: true } });
  await useStore.getState().startRun("Question", { pageId: "page", presentation: "conversation" });
  expect(reveal).toHaveBeenCalledWith(run.runId);
});
