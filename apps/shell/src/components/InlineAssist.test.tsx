// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { defaultSelectionCaptureSettings, type PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { InlineAssist } from "./InlineAssist";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  useStore.setState({ settings: {} });
});

it("does not capture a field when assist is disabled in the Profile", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  useStore.setState({
    settings: { selectionCapture: { ...defaultSelectionCaptureSettings(), inlineAssist: false } },
  });
  const invoke = vi.spyOn(bridge, "invoke");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<InlineAssist />));
    expect(host.textContent).toContain("Inline assist is off");
    expect(invoke).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
  }
});

it("cancels a late capture and discards its field text when the preference changes", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const page = {
    pageId: "p1",
    windowId: bridge.windowId,
    url: "https://example.com/write",
    title: "Write",
    backend: "aux",
    documentEpoch: 2,
    viewStatus: "visible",
    controller: "none",
    ownedByRuntime: false,
  } as PageTarget;
  useStore.setState({ settings: {}, pages: [page], activePageId: page.pageId });
  let resolve!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation((method) =>
    method === "agent.inlineAssist.capture"
      ? new Promise((done) => {
          resolve = done;
        })
      : Promise.resolve({ cancelled: true }),
  );
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<InlineAssist />));
    await act(async () =>
      useStore.setState({
        settings: {
          selectionCapture: { ...defaultSelectionCaptureSettings(), inlineAssist: false, revision: 1 },
        },
      }),
    );
    await act(async () => resolve({ captureId: "late-capture", sourceText: "Private field content" }));
    expect(invoke).toHaveBeenCalledWith("agent.inlineAssist.cancel", { captureId: "late-capture" });
    expect(host.textContent).not.toContain("Private field content");
    expect(host.textContent).toContain("Inline assist is off");
  } finally {
    await act(async () => root.unmount());
  }
});

it("shows the source and a reviewed draft before applying text to the page", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const page = {
    pageId: "p1",
    windowId: bridge.windowId,
    url: "https://example.com/write",
    title: "Write",
    backend: "aux",
    documentEpoch: 2,
    viewStatus: "visible",
    controller: "none",
    ownedByRuntime: false,
  } as PageTarget;
  useStore.setState({ pages: [page], activePageId: page.pageId, overlay: "inline-assist" });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "agent.inlineAssist.capture")
      return {
        captureId: "11111111-1111-4111-8111-111111111111",
        pageId: page.pageId,
        url: page.url,
        documentEpoch: 2,
        origin: "https://example.com",
        fieldLabel: "Project note",
        sourceText: "A rough draft",
        mode: "selection",
      };
    if (method === "agent.inlineAssist.draft")
      return {
        captureId: "11111111-1111-4111-8111-111111111111",
        replacement: "A clear draft",
        modelId: "meta/muse-spark-1.3-contributor",
      };
    if (method === "agent.inlineAssist.apply") return { applied: true, undoAvailable: true };
    if (method === "agent.inlineAssist.cancel") return { cancelled: true };
    throw new Error(`Unexpected ${method}`);
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const button = (name: string) =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent?.includes(name))!;
  try {
    await act(async () => root.render(<InlineAssist />));
    expect(host.textContent).toContain("A rough draft");
    expect(host.textContent).toContain("The page changes only when you select Apply");
    expect(invoke.mock.calls.some(([method]) => method === "agent.inlineAssist.apply")).toBe(false);
    await act(async () => button("Draft with AI").click());
    expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Proposed field text"]')?.value).toBe(
      "A clear draft",
    );
    expect(invoke.mock.calls.some(([method]) => method === "agent.inlineAssist.apply")).toBe(false);
    await act(async () => button("Apply to field").click());
    expect(invoke).toHaveBeenCalledWith("agent.inlineAssist.apply", {
      captureId: "11111111-1111-4111-8111-111111111111",
      replacement: "A clear draft",
    });
  } finally {
    await act(async () => root.unmount());
  }
});
