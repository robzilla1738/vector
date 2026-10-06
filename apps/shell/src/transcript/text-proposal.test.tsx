// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { RunPanel } from "../components/RunPanel";
import { makePage, makeRun } from "../mock/fixtures";
import { useStore } from "../store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const original = useStore.getState();
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(original, true);
});

const captureId = "11111111-1111-4111-8111-111111111111";
const proposal = "<script>not executable</script>\nA clear project note.";
const page = makePage(0, {
  pageId: "write-page",
  url: "https://example.com/write",
  backend: "aux",
  controller: "none",
  documentEpoch: 4,
});
const run = makeRun({
  runId: "draft-run",
  status: "completed",
  pageIds: [page.pageId],
  config: { implementation: "agent-loop" },
  result: { report: "Here is the draft", textProposal: proposal },
});

async function mount() {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get")
      return {
        run,
        steps: [],
        modelCalls: 1,
        transcript: { runId: run.runId, items: [{ kind: "text-proposal", text: proposal, terminal: true }] },
      } as never;
    if (method === "agent.inlineAssist.capture")
      return {
        captureId,
        pageId: page.pageId,
        url: page.url,
        documentEpoch: 4,
        origin: "https://example.com",
        fieldLabel: "Project note",
        sourceText: "Old note",
        mode: "selection",
      } as never;
    if (method === "agent.inlineAssist.apply") return { applied: true, undoAvailable: true } as never;
    if (method === "agent.inlineAssist.cancel") return { cancelled: true } as never;
    return {} as never;
  });
  useStore.setState({ runs: [run], pages: [page], activePageId: page.pageId, steps: { [run.runId]: [] } });
  const host = document.createElement("div");
  const root = createRoot(host);
  await act(async () => root.render(<RunPanel runId={run.runId} conversation />));
  return { host, invoke, unmount: async () => act(async () => root.unmount()) };
}

it("reviews the persisted proposal and current field before one brokered Insert with undo guidance", async () => {
  const view = await mount();
  try {
    expect(view.host.querySelector('[aria-label="Text proposal"] pre')?.textContent).toBe(proposal);
    expect(view.host.querySelector("script")).toBeNull();
    expect(view.invoke.mock.calls.some(([method]) => method === "agent.inlineAssist.apply")).toBe(false);
    const button = (name: string) =>
      [...view.host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === name)!;
    await act(async () => button("Review Insert").click());
    expect(view.host.textContent).toContain("Old note");
    expect(view.host.textContent).toContain("Project note");
    expect(view.host.textContent).toContain("https://example.com");
    expect(view.invoke.mock.calls.some(([method]) => method === "agent.inlineAssist.apply")).toBe(false);
    await act(async () => {
      button("Insert text").click();
      button("Insert text")?.click();
    });
    expect(view.invoke.mock.calls.filter(([method]) => method === "agent.inlineAssist.apply")).toEqual([
      ["agent.inlineAssist.apply", { captureId, replacement: proposal, proposalRunId: run.runId }],
    ]);
    expect(view.host.textContent).toContain("Use Undo in that field");
  } finally {
    await view.unmount();
  }
});

it("disables Insert if the selected page drifts after review", async () => {
  const view = await mount();
  try {
    const button = (name: string) =>
      [...view.host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === name)!;
    await act(async () => button("Review Insert").click());
    await act(async () => useStore.setState({ pages: [{ ...page, documentEpoch: 5 }] }));
    expect(view.host.textContent).toContain("The page changed");
    expect(button("Insert text").disabled).toBe(true);
    expect(view.invoke.mock.calls.some(([method]) => method === "agent.inlineAssist.apply")).toBe(false);
  } finally {
    await view.unmount();
  }
});
