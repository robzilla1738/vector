// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { MemoryExtractionViewSchema } from "@aux/contracts";
import { MemoryActivity } from "./MemoryActivity";

it("shows extraction-owned usage, proposed quotes, safe failures and the original retry target", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host),
    retry = vi.fn();
  const entry = MemoryExtractionViewSchema.parse({
    activityId: "11111111-1111-4111-8111-111111111111",
    sourceRunId: "original-source",
    capturedAt: 1,
    title: "Synthetic extraction",
    trigger: "run-completed",
    durationMs: 1234,
    candidateIds: ["22222222-2222-4222-8222-222222222222"],
    status: "completed",
    modelId: "fixture-model",
    inputTokens: 1234,
    outputTokens: 42,
    cachedInputTokens: 1000,
    costUsd: 0.001,
    costEstimated: true,
    proposals: [
      { claimId: "22222222-2222-4222-8222-222222222222", quote: "Synthetic source quote", state: "pending" },
    ],
  });
  try {
    await act(async () => root.render(<MemoryActivity entries={[entry]} />));
    expect(host.textContent).toContain("fixture-model");
    expect(host.textContent).toContain((1234).toLocaleString());
    expect(host.textContent).toContain("Cached input");
    expect(host.textContent).toContain("Cost (estimated)");
    expect(host.querySelector("blockquote")?.textContent).toBe("Synthetic source quote");
    const failed = {
      ...entry,
      status: "failed" as const,
      errorCode: "inference_failed" as const,
      candidateIds: [],
      proposals: [],
    };
    await act(async () =>
      root.render(
        <MemoryActivity
          entries={[failed]}
          retry={(original) => <button onClick={() => retry(original.sourceRunId)}>Try again</button>}
        />,
      ),
    );
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("The model request failed");
    await act(async () => host.querySelector<HTMLButtonElement>("section button")!.click());
    expect(retry).toHaveBeenCalledExactlyOnceWith("original-source");
    await act(async () =>
      root.render(
        <MemoryActivity
          entries={[
            {
              activityId: entry.activityId,
              sourceRunId: entry.sourceRunId,
              capturedAt: entry.capturedAt,
              title: entry.title,
              durationMs: 2,
              trigger: entry.trigger,
              candidateIds: [],
            },
          ]}
        />,
      ),
    );
    expect(host.textContent).toContain("Local extraction · no model request");
    expect(host.textContent).not.toContain("Input tokens");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
