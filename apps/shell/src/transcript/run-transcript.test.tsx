import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Observation, RunTranscriptProjection } from "@aux/contracts";
import { bridge } from "../bridge";
import { RunPanel } from "../components/RunPanel";
import { makeRun, makeDocumentPage } from "../mock/fixtures";
import type { DocumentResultCitation } from "@aux/contracts/document-citation";
import { useStore } from "../store";
import { RunTranscriptDetails } from "./RunTranscriptDetails";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let originalState: ReturnType<typeof useStore.getState>;
beforeEach(() => {
  originalState = useStore.getState();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    const details = this.closest("details");
    return (details && !details.open && this.tagName !== "SUMMARY"
      ? []
      : [{ width: 10, height: 10 }]) as unknown as DOMRectList;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  useStore.setState(originalState, true);
  document.body.replaceChildren();
});

it("follows a live answer into verified evidence and an inert same-run artifact after refresh", async () => {
  const original = useStore.getState();
  const live = makeRun({ runId: "journey", status: "running", pageIds: [], result: undefined });
  const finished = makeRun({
    ...live,
    status: "completed",
    statusMessage: "Done",
    config: { ...live.config, implementation: "agent-loop" },
    result: {
      report: "**Reference:** rec-15",
      citations: [{ observationId: "snapshot-1", quote: "Internal ref rec-15." }],
    },
  });
  let projection: RunTranscriptProjection = { runId: "journey", items: [] };
  const artifactText = "<script>window.hacked=true</script>\nInternal ref rec-15.";
  const durable: RunTranscriptProjection = {
    runId: "journey",
    items: [
      { kind: "answer", text: "**Reference:** rec-15", terminal: true },
      {
        kind: "citation",
        observationId: "snapshot-1",
        quote: "Internal ref rec-15.",
        artifactId: "snapshot-1",
      },
      {
        kind: "artifact",
        artifactId: "snapshot-1",
        mediaType: "text/plain",
        size: artifactText.length,
        status: "complete",
      },
    ],
  };
  const encoded = btoa(artifactText);
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get")
      return { run: finished, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read")
      return {
        artifact: {
          artifactId: "snapshot-1",
          runId: "journey",
          path: "/private/hidden",
          mediaType: "text/plain",
          size: artifactText.length,
          status: "complete",
          createdAt: 1,
        },
        dataBase64: encoded,
      } as never;
    return {} as never;
  });
  useStore.setState({
    runs: [live],
    answerStreams: { journey: "Finding the reference…" },
    steps: { journey: [] },
    prompt: null,
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunPanel runId="journey" conversation />));
    expect(host.querySelector(".answer-stream")?.textContent).toContain("Finding the reference");
    expect(host.textContent).not.toContain("Internal ref rec-15.");

    projection = durable;
    await act(async () => useStore.setState({ runs: [finished] }));
    expect(host.querySelector(".answer-stream")).toBeNull();
    expect(host.querySelector(".answer strong")?.textContent).toBe("Reference:");
    expect(host.textContent).toContain("Verified evidence");
    const evidence = host.querySelector<HTMLDetailsElement>(".transcript-citations")!;
    await act(async () => {
      evidence.open = true;
      evidence.dispatchEvent(new Event("toggle"));
    });
    expect(evidence.textContent).toContain("Internal ref rec-15.");
    const inspect = Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find((button) =>
      button.textContent?.includes("Inspect cited snapshot"),
    )!;
    await act(async () => inspect.click());
    expect(invoke).toHaveBeenCalledWith("artifacts.read", { artifactId: "snapshot-1" });
    expect(host.querySelector('[aria-label="Saved run artifact"] pre')?.textContent).toContain(artifactText);
    expect(host.querySelector("script")).toBeNull();
    expect(host.textContent).not.toContain("/private/hidden");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    useStore.setState(original, true);
  }
});

it("shows interruption as inspection work and refuses a foreign artifact preview", async () => {
  const original = useStore.getState();
  const run = makeRun({
    runId: "uncertain",
    status: "interrupted",
    pageIds: [],
    statusMessage: "Stopped with an uncertain outcome",
    result: undefined,
  });
  const projection: RunTranscriptProjection = {
    runId: "uncertain",
    items: [
      { kind: "artifact", artifactId: "foreign", mediaType: "text/plain", size: 12, status: "complete" },
      {
        kind: "recovery",
        state: "interrupted",
        description: "Inspect the uncertain action before retrying.",
        action: "inspect",
      },
    ],
  };
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read")
      return {
        artifact: {
          artifactId: "foreign",
          runId: "another-run",
          mediaType: "text/plain",
          size: 12,
          status: "complete",
          createdAt: 1,
          path: "/private/foreign",
        },
        dataBase64: btoa("private data"),
      } as never;
    return {} as never;
  });
  useStore.setState({ runs: [run], steps: { uncertain: [] }, prompt: null });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunPanel runId="uncertain" conversation />));
    expect(host.textContent).toContain("Inspect the uncertain action before retrying.");
    const details = host.querySelector<HTMLDetailsElement>(".transcript-artifacts")!;
    await act(async () => {
      details.open = true;
      details.dispatchEvent(new Event("toggle"));
    });
    const artifact = Array.from(details.querySelectorAll<HTMLButtonElement>("button"))[0]!;
    await act(async () => artifact.click());
    expect(host.querySelector('[aria-label="Saved run artifact"] [role="alert"]')?.textContent).toContain(
      "no longer belongs",
    );
    expect(host.textContent).not.toContain("private data");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    useStore.setState(original, true);
  }
});

it("keeps a same-run HTML artifact inside a script-disabled mock frame", async () => {
  const run = makeRun({ runId: "html-run", status: "completed", pageIds: [] });
  const html = '<button onclick="window.testRan=true">Click</button><script>window.testRan=true</script>';
  const projection: RunTranscriptProjection = {
    runId: run.runId,
    items: [
      {
        kind: "artifact",
        artifactId: "html-artifact",
        mediaType: "text/html",
        size: html.length,
        status: "complete",
      },
    ],
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read")
      return {
        artifact: {
          artifactId: "html-artifact",
          runId: run.runId,
          path: "/private/result.html",
          mediaType: "text/html",
          size: html.length,
          status: "complete",
          createdAt: 1,
        },
        dataBase64: btoa(html),
      } as never;
    return {} as never;
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    useStore.setState({ runs: [run] });
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    await act(async () => {
      host.querySelector<HTMLDetailsElement>(".transcript-artifacts")!.open = true;
    });
    await act(async () => host.querySelector<HTMLButtonElement>(".transcript-artifacts button")!.click());
    const frame = host.querySelector<HTMLIFrameElement>('iframe[title="Inert HTML artifact"]');
    expect(frame?.getAttribute("sandbox")).toBe("");
    expect(frame?.getAttribute("srcdoc")).toContain("default-src 'none'");
    expect(frame?.getAttribute("srcdoc")).toContain(html);
    expect(host.querySelector("script")).toBeNull();
    expect(host.textContent).not.toContain("/private/result.html");
  } finally {
    await act(async () => root.unmount());
    invoke.mockRestore();
  }
});

it("opens only the current cited page and refuses a changed epoch", async () => {
  const original = useStore.getState();
  const run = makeRun({
    runId: "source-run",
    status: "completed",
    pageIds: ["page-1"],
    config: { implementation: "agent-loop" },
  });
  const observation: Observation = {
    observationId: "obs-1",
    pageId: "page-1",
    documentEpoch: 7,
    revision: 2,
    observedAt: 10,
    scope: "full",
    content: {
      url: "https://example.test/source",
      title: "Source",
      viewport: { width: 800, height: 600, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 },
      frames: [],
      text: "Internal ref rec-15.",
      headings: [],
      elements: [],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 0, elementsShown: 0, textChars: 20, approxTokens: 6 },
    },
  };
  const saved = JSON.stringify(observation);
  const projection: RunTranscriptProjection = {
    runId: run.runId,
    items: [
      { kind: "citation", observationId: "obs-1", quote: "Internal ref rec-15.", artifactId: "obs-1" },
      {
        kind: "artifact",
        artifactId: "obs-1",
        mediaType: "application/json",
        size: saved.length,
        status: "complete",
      },
    ],
  };
  let epoch = 7;
  const activate = vi.fn(async () => {});
  useStore.setState({ activate });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read")
      return {
        artifact: {
          artifactId: "obs-1",
          runId: run.runId,
          pageId: "page-1",
          path: "/private/obs.json",
          mediaType: "application/json",
          size: saved.length,
          status: "complete",
          createdAt: 1,
        },
        dataBase64: btoa(saved),
      } as never;
    if (method === "pages.list")
      return [
        {
          pageId: "page-1",
          url: observation.content.url,
          documentEpoch: epoch,
          ownedByRuntime: false,
          viewStatus: "visible",
          controller: "human",
        },
      ] as never;
    return {} as never;
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    useStore.setState({ runs: [run] });
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    await act(async () => {
      host.querySelector<HTMLDetailsElement>(".transcript-citations")!.open = true;
    });
    await act(async () => host.querySelector<HTMLButtonElement>(".transcript-citations button")!.click());
    expect(host.querySelector("pre")?.textContent).toBe("Internal ref rec-15.");
    const open = Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => button.textContent === "Open cited page",
    )!;
    epoch = 8;
    await act(async () => open.click());
    expect(activate).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("cited page changed");
    epoch = 7;
    await act(async () => open.click());
    expect(activate).toHaveBeenCalledExactlyOnceWith("page-1");
  } finally {
    await act(async () => root.unmount());
    invoke.mockRestore();
    useStore.setState(original, true);
  }
});

it("shows one failure explanation with recorded technical detail collapsed", async () => {
  const original = useStore.getState();
  const message = "The model connection expired. Reconnect to continue.";
  const run = makeRun({
    runId: "failure-copy",
    status: "failed",
    pageIds: [],
    result: undefined,
    error: message,
    statusMessage: message,
    failure: { category: "authentication", message, retryable: true, action: "model_settings" },
  });
  const projection: RunTranscriptProjection = {
    runId: run.runId,
    items: [
      { kind: "error", category: "authentication", message, retryable: true, action: "model_settings" },
      { kind: "recovery", state: "failed", description: message, action: "settings" },
    ],
  };
  vi.spyOn(bridge, "invoke").mockResolvedValue({ run, steps: [], transcript: projection } as never);
  useStore.setState({ runs: [run], steps: { [run.runId]: [] }, pages: normalizePages([]), prompt: null });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunPanel runId={run.runId} conversation />));
    expect(host.querySelector(".answer")).toBeNull();
    expect(host.querySelectorAll(".run-failure")).toHaveLength(1);
    expect(host.querySelector(".run-failure")?.textContent).toContain(message);
    const detail = host.querySelector<HTMLDetailsElement>(".transcript-error-details")!;
    expect(detail.open).toBe(false);
    expect(detail.textContent).toContain(message);
    expect(host.querySelector(".run-failure button")?.textContent).toBe("Model settings");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    useStore.setState(original, true);
  }
});

it("omits only verified saved-answer duplicates while preserving explicit artifact inspection", async () => {
  const run = makeRun({ runId: "saved-answer", status: "completed", pageIds: [] });
  const items = ["automatic", "explicit"].map((artifactId) => ({
    kind: "artifact",
    artifactId,
    mediaType: "text/plain",
    size: 5,
    status: "complete",
  }));
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get")
      return { run, steps: [], modelCalls: 1, transcript: { runId: run.runId, items } } as never;
    if (method === "artifacts.read")
      return {
        artifact: {
          artifactId: "explicit",
          runId: run.runId,
          mediaType: "text/plain",
          size: 5,
          status: "complete",
        },
        dataBase64: btoa("hello"),
      } as never;
    return {} as never;
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    useStore.setState({ runs: [run] });
    await act(async () => root.render(<RunTranscriptDetails run={run} savedAnswerIds={["automatic"]} />));
    expect(host.querySelector(".transcript-artifacts summary")?.textContent).toBe("Saved artifacts · 1");
    await act(async () => {
      host.querySelector<HTMLDetailsElement>(".transcript-artifacts")!.open = true;
    });
    await act(async () => host.querySelector<HTMLButtonElement>(".transcript-artifacts button")!.click());
    expect(invoke).toHaveBeenCalledWith("artifacts.read", { artifactId: "explicit" });
    expect(host.textContent).toContain("hello");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});

it("remaps the focused original artifact control and keeps its safe preview", async () => {
  const { executeCommand, dispatchShortcut } = await import("../commands");
  const { COMMANDS } = await import("@aux/contracts");
  const run = makeRun({ runId: "remapped-evidence", status: "completed", pageIds: [] });
  const artifact = {
    kind: "artifact",
    artifactId: "original",
    mediaType: "text/plain",
    size: 5,
    status: "complete",
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get")
      return { run, steps: [], transcript: { runId: run.runId, items: [artifact] } } as never;
    if (method === "artifacts.read")
      return { artifact: { ...artifact, runId: run.runId }, dataBase64: btoa("hello") } as never;
    return {} as never;
  });
  useStore.setState({ runs: [run] });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    const summary = host.querySelector<HTMLElement>("summary")!;
    summary.focus();
    await act(async () => {
      await executeCommand("toggle-run-artifacts");
    });
    expect(host.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
    const button = host.querySelector<HTMLButtonElement>('[data-command-id="inspect-run-artifact"]')!;
    button.focus();
    await act(async () => {
      expect(
        dispatchShortcut({
          commandId: "inspect-run-artifact",
          key: "i",
          meta: true,
          alt: false,
          shift: false,
        }),
      ).toBe(true);
    });
    expect(invoke).toHaveBeenCalledWith("artifacts.read", { artifactId: "original" });
    expect(host.querySelector("pre")!.textContent).toBe("hello");
    for (const id of [
      "close-run-artifact",
      "retry-run-evidence",
      "toggle-run-citations",
      "toggle-run-artifacts",
      "inspect-run-citation",
      "inspect-run-artifact",
      "toggle-run-evidence-error",
      "open-run-cited-page",
    ])
      expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
        palette: false,
        bindings: [],
        intercept: true,
      });
    host.querySelector<HTMLButtonElement>('[data-command-id="close-run-artifact"]')!.focus();
    await act(async () => {
      await executeCommand("close-run-artifact");
    });
    expect(host.querySelector('[aria-label="Saved run artifact"]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
  }
});

it("permanently retires a held artifact completion across original-window ABA", async () => {
  const run = makeRun({ runId: "held-evidence", status: "completed", pageIds: [] });
  const artifact = {
    kind: "artifact",
    artifactId: "original",
    mediaType: "text/plain",
    size: 5,
    status: "complete",
  };
  let resolve!: (value: unknown) => void;
  const pending = new Promise((resolveValue) => {
    resolve = resolveValue;
  });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get")
      return { run, steps: [], transcript: { runId: run.runId, items: [artifact] } } as never;
    if (method === "artifacts.read") return pending as never;
    return {} as never;
  });
  useStore.setState({ runs: [run] });
  const originalWindow = bridge.windowId;
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    host.querySelector<HTMLDetailsElement>("details")!.open = true;
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[data-command-id="inspect-run-artifact"]')!.click(),
    );
    expect(invoke).toHaveBeenCalledWith("artifacts.read", { artifactId: "original" });
    bridge.windowId = "other-window";
    await act(async () => root.render(<RunTranscriptDetails run={run} readOnly />));
    bridge.windowId = originalWindow;
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    await act(async () =>
      resolve({ artifact: { ...artifact, runId: run.runId }, dataBase64: btoa("hello") }),
    );
    expect(host.querySelector("pre")).toBeNull();
    expect(host.textContent).not.toContain("Loading artifact…");
    host.querySelector<HTMLDetailsElement>("details")!.open = true;
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[data-command-id="inspect-run-artifact"]')!.click(),
    );
    expect(host.querySelector("pre")!.textContent).toBe("hello");
  } finally {
    bridge.windowId = originalWindow;
    await act(async () => root.unmount());
  }
});

it("opens the exact cited document capture and retires a held section when its run changes", async () => {
  const run = makeRun({ runId: "document-citation", status: "completed", pageIds: [] });
  const source = {
    ...makeDocumentPage("First captured section", "Saved report.txt"),
    nextCursor: "next-section",
    attachment: {
      attachmentId: "saved-document",
      filename: "Saved report.txt",
      excerpt: "First captured section",
      included: true,
      createdAt: 1,
      byteLength: 500,
    },
  };
  const citation: DocumentResultCitation = {
    kind: "document",
    source: {
      chatId: "original-chat",
      attachmentId: source.attachment.attachmentId,
      sha256: source.sha256,
      snapshotId: source.document.snapshotId,
    },
    locator: { kind: "text", line: 50, offset: 0 },
    quote: "The cited line fifty.",
  };
  const cursor = "cited-section";
  source.chunk = {
    index: 0,
    segments: [{ locator: citation.locator, text: `Captured context. ${citation.quote} Following context.` }],
  };
  const projection: RunTranscriptProjection = {
    runId: run.runId,
    items: [{ kind: "document-citation", citation, cursor }],
  };
  const reads: { params: unknown; resolve(value: typeof source): void }[] = [];
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "runs.get") return { run, steps: [], transcript: projection };
    if (method === "conversations.attachments.read")
      return new Promise<typeof source>((resolve) => reads.push({ params, resolve }));
    throw new Error(`Unexpected ${method}`);
  });
  useStore.setState({ runs: [run] });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const control = (command: string) =>
    host.querySelector<HTMLButtonElement>(`[data-command-id="${command}"]`)!;
  try {
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    await act(async () => {
      host.querySelector<HTMLDetailsElement>(".transcript-citations")!.open = true;
    });
    expect(host.textContent).toContain("Line 50");
    expect(host.textContent).toContain(citation.quote);
    await act(async () => control("inspect-run-citation").click());
    expect(reads).toHaveLength(1);
    expect(reads[0]!.params).toEqual({
      chatId: "original-chat",
      attachmentId: "saved-document",
      sha256: source.sha256,
      cursor,
    });
    await act(async () =>
      reads[0]!.resolve({
        ...source,
        document: { ...source.document, snapshotId: "00000000-0000-4000-8000-000000000002" },
      }),
    );
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "original document snapshot is unavailable",
    );
    expect(host.textContent).not.toContain("Captured context.");
    await act(async () => control("retry-conversation-document-read").click());
    expect(reads[1]!.params).toEqual(reads[0]!.params);
    await act(async () => reads[1]!.resolve(source));
    expect(host.textContent).toContain("Captured context.");
    expect(host.textContent).toContain("Cited section");
    expect(host.querySelector("pre mark")?.textContent).toBe(citation.quote);
    expect(reads).toHaveLength(2);
    await act(async () => control("next-document-section").click());
    expect(reads[2]!.params).toEqual({
      chatId: "original-chat",
      attachmentId: "saved-document",
      sha256: source.sha256,
      cursor: "next-section",
    });
    await act(async () =>
      reads[2]!.resolve({
        ...source,
        chunk: {
          index: 1,
          segments: [{ locator: { kind: "text", line: 60, offset: 0 }, text: citation.quote }],
        },
      }),
    );
    expect(host.querySelector("pre mark")).toBeNull();
    await act(async () => control("previous-document-section").click());
    expect(reads[3]!.params).toEqual(reads[0]!.params);
    await act(async () => reads[3]!.resolve(source));
    expect(host.querySelector("pre mark")?.textContent).toBe(citation.quote);
    await act(async () => control("next-document-section").click());
    const nextRun = makeRun({ runId: "other-run", status: "completed", pageIds: [] });
    await act(async () => {
      useStore.setState({ runs: [run, nextRun] });
      root.render(<RunTranscriptDetails run={nextRun} />);
    });
    await act(async () =>
      reads[4]!.resolve({
        ...source,
        chunk: { index: 1, segments: [{ locator: citation.locator, text: "Retired section response" }] },
      }),
    );
    expect(host.querySelector('[aria-label="Document snapshot"]')).toBeNull();
    expect(host.textContent).not.toContain("Retired section response");
  } finally {
    await act(async () => root.unmount());
  }
});
