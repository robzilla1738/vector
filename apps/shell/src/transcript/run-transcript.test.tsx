// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { Observation, RunTranscriptProjection } from "@aux/contracts";
import { bridge } from "../bridge";
import { RunPanel } from "../components/RunPanel";
import { makeRun } from "../mock/fixtures";
import { useStore } from "../store";
import { RunTranscriptDetails } from "./RunTranscriptDetails";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("follows a live answer into verified evidence and an inert same-run artifact after refresh", async () => {
  const original = useStore.getState();
  const live = makeRun({ runId: "journey", status: "running", pageIds: [], result: undefined });
  const finished = makeRun({ ...live, status: "completed", statusMessage: "Done",
    config: { ...live.config, implementation: "agent-loop" }, result: { report: "**Reference:** rec-15",
      citations: [{ observationId: "snapshot-1", quote: "Internal ref rec-15." }] } });
  let projection: RunTranscriptProjection = { runId: "journey", items: [] };
  const artifactText = "<script>window.hacked=true</script>\nInternal ref rec-15.";
  const durable: RunTranscriptProjection = { runId: "journey", items: [
    { kind: "answer", text: "**Reference:** rec-15", terminal: true },
    { kind: "citation", observationId: "snapshot-1", quote: "Internal ref rec-15.", artifactId: "snapshot-1" },
    { kind: "artifact", artifactId: "snapshot-1", mediaType: "text/plain", size: artifactText.length, status: "complete" },
  ] };
  const encoded = btoa(artifactText);
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run: finished, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read") return { artifact: { artifactId: "snapshot-1", runId: "journey",
      path: "/private/hidden", mediaType: "text/plain", size: artifactText.length, status: "complete", createdAt: 1 },
      dataBase64: encoded } as never;
    return {} as never;
  });
  useStore.setState({ runs: [live], answerStreams: { journey: "Finding the reference…" }, steps: { journey: [] }, prompt: null });
  const host = document.createElement("div");
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
    await act(async () => { evidence.open = true; evidence.dispatchEvent(new Event("toggle")); });
    expect(evidence.textContent).toContain("Internal ref rec-15.");
    const inspect = Array.from(host.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent?.includes("Inspect cited snapshot"))!;
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
  const run = makeRun({ runId: "uncertain", status: "interrupted", pageIds: [],
    statusMessage: "Stopped with an uncertain outcome", result: undefined });
  const projection: RunTranscriptProjection = { runId: "uncertain", items: [
    { kind: "artifact", artifactId: "foreign", mediaType: "text/plain", size: 12, status: "complete" },
    { kind: "recovery", state: "interrupted", description: "Inspect the uncertain action before retrying.", action: "inspect" },
  ] };
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read") return { artifact: { artifactId: "foreign", runId: "another-run",
      mediaType: "text/plain", size: 12, status: "complete", createdAt: 1, path: "/private/foreign" },
      dataBase64: btoa("private data") } as never;
    return {} as never;
  });
  useStore.setState({ runs: [run], steps: { uncertain: [] }, prompt: null });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunPanel runId="uncertain" conversation />));
    expect(host.textContent).toContain("Inspect the uncertain action before retrying.");
    const details = host.querySelector<HTMLDetailsElement>(".transcript-artifacts")!;
    await act(async () => { details.open = true; details.dispatchEvent(new Event("toggle")); });
    const artifact = Array.from(details.querySelectorAll<HTMLButtonElement>("button"))[0]!;
    await act(async () => artifact.click());
    expect(host.querySelector('[aria-label="Saved run artifact"] [role="alert"]')?.textContent)
      .toContain("no longer belongs");
    expect(host.textContent).not.toContain("private data");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    useStore.setState(original, true);
  }
});

it("keeps a same-run HTML artifact inside a script-disabled mock frame", async () => {
  const run = makeRun({ runId: "html-run", status: "completed", pageIds: [] });
  const html = "<button onclick=\"window.testRan=true\">Click</button><script>window.testRan=true</script>";
  const projection: RunTranscriptProjection = { runId: run.runId, items: [
    { kind: "artifact", artifactId: "html-artifact", mediaType: "text/html", size: html.length, status: "complete" },
  ] };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read") return { artifact: { artifactId: "html-artifact", runId: run.runId,
      path: "/private/result.html", mediaType: "text/html", size: html.length, status: "complete", createdAt: 1 },
      dataBase64: btoa(html) } as never;
    return {} as never;
  });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    await act(async () => host.querySelector<HTMLButtonElement>(".transcript-artifacts button")!.click());
    const frame = host.querySelector<HTMLIFrameElement>('iframe[title="Inert HTML artifact"]');
    expect(frame?.getAttribute("sandbox")).toBe("");
    expect(frame?.getAttribute("srcdoc")).toContain("default-src 'none'");
    expect(frame?.getAttribute("srcdoc")).toContain(html);
    expect(host.querySelector("script")).toBeNull();
    expect(host.textContent).not.toContain("/private/result.html");
  } finally { await act(async () => root.unmount()); invoke.mockRestore(); }
});

it("opens only the current cited page and refuses a changed epoch", async () => {
  const original = useStore.getState();
  const run = makeRun({ runId: "source-run", status: "completed", pageIds: ["page-1"],
    config: { implementation: "agent-loop" } });
  const observation: Observation = {
    observationId: "obs-1", pageId: "page-1", documentEpoch: 7, revision: 2, observedAt: 10, scope: "full",
    content: { url: "https://example.test/source", title: "Source", viewport: { width: 800, height: 600, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: "Internal ref rec-15.", headings: [], elements: [],
      formFields: [], tables: [], links: [], dialogs: [], truncated: false,
      stats: { elementsTotal: 0, elementsShown: 0, textChars: 20, approxTokens: 6 } },
  };
  const saved = JSON.stringify(observation);
  const projection: RunTranscriptProjection = { runId: run.runId, items: [
    { kind: "citation", observationId: "obs-1", quote: "Internal ref rec-15.", artifactId: "obs-1" },
    { kind: "artifact", artifactId: "obs-1", mediaType: "application/json", size: saved.length, status: "complete" },
  ] };
  let epoch = 7;
  const activate = vi.fn(async () => {});
  useStore.setState({ activate });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 1, transcript: projection } as never;
    if (method === "artifacts.read") return { artifact: { artifactId: "obs-1", runId: run.runId,
      pageId: "page-1", path: "/private/obs.json", mediaType: "application/json", size: saved.length,
      status: "complete", createdAt: 1 }, dataBase64: btoa(saved) } as never;
    if (method === "pages.list") return [{ pageId: "page-1", url: observation.content.url, documentEpoch: epoch,
      ownedByRuntime: false, viewStatus: "visible", controller: "human" }] as never;
    return {} as never;
  });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunTranscriptDetails run={run} />));
    await act(async () => host.querySelector<HTMLButtonElement>(".transcript-citations button")!.click());
    expect(host.querySelector("pre")?.textContent).toBe("Internal ref rec-15.");
    const open = Array.from(host.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent === "Open cited page")!;
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
  const run = makeRun({runId:"failure-copy",status:"failed",pageIds:[],result:undefined,error:message,statusMessage:message,
    failure:{category:"authentication",message,retryable:true,action:"model_settings"}});
  const projection: RunTranscriptProjection = {runId:run.runId,items:[
    {kind:"error",category:"authentication",message,retryable:true,action:"model_settings"},
    {kind:"recovery",state:"failed",description:message,action:"settings"},
  ]};
  vi.spyOn(bridge,"invoke").mockResolvedValue({run,steps:[],transcript:projection} as never);
  useStore.setState({runs:[run],steps:{[run.runId]:[]},pages:[],prompt:null});
  const host = document.createElement("div"), root = createRoot(host);
  try {
    await act(async () => root.render(<RunPanel runId={run.runId} conversation />));
    expect(host.querySelector('.answer')).toBeNull();
    expect(host.querySelectorAll('.run-failure')).toHaveLength(1);
    expect(host.querySelector('.run-failure')?.textContent).toContain(message);
    const detail = host.querySelector<HTMLDetailsElement>('.transcript-error-details')!;
    expect(detail.open).toBe(false);
    expect(detail.textContent).toContain(message);
    expect(host.querySelector('.run-failure button')?.textContent).toBe("Model settings");
  } finally { await act(async () => root.unmount());vi.restoreAllMocks();useStore.setState(original,true); }
});
