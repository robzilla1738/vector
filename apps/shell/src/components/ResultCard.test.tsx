// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ConversationArtifact } from "@aux/contracts";
vi.mock("./surfaces", () => ({ AnswerPreview: ({ text }: { text: string }) => <div>{text}</div> }));
import { ResultCard } from "./ResultCard";
const result: ConversationArtifact = {
  artifactId: "artifact",
  runId: "run",
  filename: "report.md",
  mediaType: "text/markdown",
  excerpt: "A plain answer",
  byteLength: 15,
  createdAt: 1,
  turnGoal: "Say hello",
  included: false,
};
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
it("does not infer automatic-report provenance from the filename", async () => {
  await act(async () => root.render(<ResultCard result={result} onOpen={() => {}} />));
  expect(container.querySelector(".result-card-compact")).toBeNull();
  expect(container.querySelector(".result-card-preview")?.textContent).toBe("A plain answer");
  expect(container.querySelector("details")).toBeNull();
});
it("keeps a verified compact report durable and openable, with preview collapsed", async () => {
  const open = vi.fn();
  await act(async () => root.render(<ResultCard result={result} revision={3} compact onOpen={open} />));
  const disclosure = container.querySelector<HTMLDetailsElement>("details");
  expect(disclosure?.open).toBe(false);
  expect(disclosure?.querySelector("[inert]")).not.toBeNull();
  expect(container.querySelector(".result-card-version")?.textContent).toBe("v3");
  const button = container.querySelector<HTMLButtonElement>('[aria-label="Open report.md"]');
  act(() => button!.click());
  expect(open).toHaveBeenCalledOnce();
  act(() => {
    disclosure!.open = true;
  });
  expect(disclosure?.textContent).toContain("A plain answer");
});
it("retains ordinary explicit generated deliverable cards and their open action", async () => {
  const open = vi.fn();
  await act(async () =>
    root.render(
      <ResultCard
        result={{
          ...result,
          filename: "analysis.csv",
          mediaType: "text/csv",
          generatedKind: "csv",
          excerpt: "Name,Value\nA,1",
        }}
        onOpen={open}
      />,
    ),
  );
  expect(container.querySelector("table")).not.toBeNull();
  expect(container.querySelector(".result-card-compact")).toBeNull();
  const button = container.querySelector<HTMLButtonElement>('[aria-label="Open analysis.csv"]');
  act(() => button!.click());
  expect(open).toHaveBeenCalledOnce();
});
