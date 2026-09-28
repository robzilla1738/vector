// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { RunTranscriptProjection } from "@aux/contracts";
import { bridge } from "../bridge";
import { RunPanel } from "../components/RunPanel";
import { makeRun } from "../mock/fixtures";
import { useStore } from "../store";

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
