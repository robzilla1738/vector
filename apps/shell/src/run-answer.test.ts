// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";

const pending = (suspensionId = "s1", kind = "ask-user-question") => ({
  suspensionId,
  runId: "run",
  turnId: "run",
  threadId: "thread",
  state: "pending",
  kind,
  request: { kind, instruction: "Which account?", guidance: "Choose an account." },
  createdAt: 1,
});

afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState({ prompt: null, runAnswerDrafts: {}, runAnswerPending: {} });
});
it("keeps a requested answer and prompt when submission fails", async () => {
  const prompt = { runId: "run", question: "Which account?" };
  const draft = { question: prompt.question, text: "Use the work account" };
  useStore.setState({ prompt, runAnswerDrafts: { run: draft } });
  vi.spyOn(bridge, "invoke").mockRejectedValue(new Error("Disconnected"));
  await expect(useStore.getState().answerRun("run", draft.text, prompt.question, "s1")).rejects.toThrow(
    "Disconnected",
  );
  expect(useStore.getState().prompt).toBe(prompt);
  expect(useStore.getState().runAnswerDrafts.run).toBe(draft);
  expect(useStore.getState().runAnswerPending.run).toBeUndefined();
});
it("sends once while pending and does not clear a newer question or draft", async () => {
  let finish!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation((method) =>
    method === "runs.get"
      ? Promise.resolve({
          run: { runId: "run", status: "needs_input", statusMessage: "First?" },
          suspension: pending(),
        })
      : new Promise((resolve) => {
          finish = resolve;
        }),
  );
  useStore.setState({
    prompt: { runId: "run", question: "First?" },
    runAnswerDrafts: { run: { question: "First?", text: "First answer" } },
  });
  const sending = useStore.getState().answerRun("run", "First answer", "First?", "s1");
  await useStore.getState().answerRun("run", "First answer", "First?", "s1");
  await vi.waitFor(() => expect(invoke).toHaveBeenCalledTimes(2));
  expect(invoke).toHaveBeenLastCalledWith("runs.answer", {
    runId: "run",
    answer: "First answer",
    expectedSuspensionId: "s1",
  });
  const prompt = { runId: "run", question: "Next?" };
  const draft = { question: "Next?", text: "Keep this draft" };
  useStore.setState({ prompt, runAnswerDrafts: { run: draft } });
  finish({ ok: true });
  await sending;
  expect(useStore.getState().prompt).toBe(prompt);
  expect(useStore.getState().runAnswerDrafts.run).toBe(draft);
});
it("clears only the successfully submitted prompt and draft", async () => {
  vi.spyOn(bridge, "invoke").mockImplementation((method) =>
    Promise.resolve(
      method === "runs.get"
        ? { run: { runId: "run", status: "needs_input", statusMessage: "Which?" }, suspension: pending() }
        : { ok: true },
    ),
  );
  useStore.setState({
    prompt: { runId: "run", question: "Which?" },
    runAnswerDrafts: { run: { question: "Which?", text: "This one" } },
  });
  await useStore.getState().answerRun("run", "This one", "Which?", "s1");
  expect(useStore.getState().prompt).toBeNull();
  expect(useStore.getState().runAnswerDrafts.run).toBeUndefined();
});
it("keeps the draft and refuses a changed question before sending", async () => {
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockResolvedValue({
      run: { runId: "run", status: "needs_input", statusMessage: "New question?" },
      suspension: pending("s2"),
    });
  useStore.setState({
    prompt: { runId: "run", question: "Old question?" },
    runAnswerDrafts: { run: { question: "Old question?", text: "Old answer" } },
  });
  await expect(useStore.getState().answerRun("run", "Old answer", "Old question?", "s1")).rejects.toThrow(
    "request changed",
  );
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(useStore.getState().runAnswerDrafts.run?.text).toBe("Old answer");
});
it("refuses a new suspension even when its question text is unchanged", async () => {
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockResolvedValue({
      run: { runId: "run", status: "needs_input", statusMessage: "Which account?" },
      suspension: pending("s2"),
    });
  useStore.setState({ runAnswerDrafts: { run: { question: "Which account?", text: "Use work" } } });
  await expect(useStore.getState().answerRun("run", "Use work", "Which account?", "s1")).rejects.toThrow(
    "request changed",
  );
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(useStore.getState().runAnswerDrafts.run?.text).toBe("Use work");
});
it.each([
  ["missing typed request", null],
  ["approval", pending("s1", "approval")],
  ["stale turn", { ...pending(), turnId: "old-turn" }],
  ["answered record", { ...pending(), state: "answered" }],
])("refuses %s while preserving the answer draft", async (_label, suspension) => {
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockResolvedValue({
      run: { runId: "run", status: "needs_input", statusMessage: "Which account?" },
      suspension,
    });
  useStore.setState({ runAnswerDrafts: { run: { question: "Which account?", text: "Use work" } } });
  await expect(useStore.getState().answerRun("run", "Use work", "Which account?", "s1")).rejects.toThrow(
    "request changed",
  );
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(useStore.getState().runAnswerDrafts.run?.text).toBe("Use work");
});
