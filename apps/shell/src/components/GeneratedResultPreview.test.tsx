// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { GeneratedResultPreview } from "./GeneratedResultPreview";

let host: HTMLDialogElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  host = document.createElement("dialog");
  host.open = true;
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const file = {
  artifactId: "artifact-a",
  chatId: "chat-a",
  filename: "report.docx",
  mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  byteLength: 1200,
  createdAt: 1,
  sha256: "a".repeat(64),
  kind: "docx" as const,
  revision: 1,
  rootArtifactId: "artifact-a",
  parentArtifactId: "artifact-a",
  sourceRunId: "turn-a",
  preview: { title: "Brief", lines: ["<script>alert(1)</script>"] },
  spec: { kind: "docx" as const, title: "Brief", paragraphs: ["Current text"], tables: [] },
};
const button = (label: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((element) => element.textContent === label)!;

it("shows inert document preview, exports stored bytes, and saves same-chat revision", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "results.generated.get") return file;
    if (method === "results.generated.versions") return [file];
    if (method === "results.generate") return { ...file, artifactId: "artifact-b", revision: 2 };
    throw new Error(`Unexpected ${method}`);
  });
  const save = vi.spyOn(bridge, "saveStoredArtifact").mockResolvedValue("/tmp/report.docx");
  const changed = vi.fn();
  await act(async () =>
    root.render(
      <GeneratedResultPreview
        artifactId="artifact-a"
        chatId="chat-a"
        onClose={() => {}}
        onVersionSaved={changed}
      />,
    ),
  );
  expect(host.textContent).toContain("Current text");
  expect(host.querySelector("script,iframe,img")).toBeNull();
  await act(async () => button("Export file…").click());
  expect(save).toHaveBeenCalledWith("artifact-a", "report.docx");
  await act(async () => button("Revise").click());
  const editor = host.querySelector<HTMLTextAreaElement>("textarea")!;
  expect(editor.value).toBe("Current text");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(
      editor,
      "## Updated findings\n\n**Revenue rose.** [Source](https://example.test/report)",
    );
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(button("Export file…").disabled).toBe(true);
  await act(async () => button("Save new version").click());
  expect(invoke).toHaveBeenCalledWith(
    "results.generate",
    expect.objectContaining({
      chatId: "chat-a",
      sourceArtifactId: "artifact-a",
      filename: "report.docx",
      spec: {
        ...file.spec,
        paragraphs: ["## Updated findings", "**Revenue rose.** [Source](https://example.test/report)"],
      },
    }),
  );
  expect(changed).toHaveBeenCalledWith("artifact-b");
});

it("edits an offscreen workbook cell without dropping other rows or changing numeric types", async () => {
  const sheet = {
    name: "Research",
    rows: Array.from({ length: 21 }, (_, index) => [`Source ${index + 1}`, index + 1]),
  };
  const workbook = {
    ...file,
    filename: "research.xlsx",
    kind: "xlsx",
    spec: { kind: "xlsx", sheets: [sheet] },
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "results.generated.get") return workbook;
    if (method === "results.generated.versions") return [workbook];
    if (method === "results.generate") return { ...workbook, artifactId: "revised", revision: 2 };
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () =>
    root.render(<GeneratedResultPreview artifactId="artifact-a" chatId="chat-a" onClose={() => {}} />),
  );
  await act(async () => button("Revise").click());
  expect(host.querySelector('[aria-label="Row 21, column 2"]')).toBeNull();
  await act(async () => button("Next rows").click());
  const cell = host.querySelector<HTMLInputElement>('[aria-label="Row 21, column 2"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(cell, "42");
    cell.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => button("Save new version").click());
  expect(invoke).toHaveBeenCalledWith(
    "results.generate",
    expect.objectContaining({
      spec: { kind: "xlsx", sheets: [{ ...sheet, rows: [...sheet.rows.slice(0, 20), ["Source 21", 42]] }] },
    }),
  );
});
