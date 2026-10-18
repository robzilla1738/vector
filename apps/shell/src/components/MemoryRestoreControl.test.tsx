// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { AuxEvent, MemoryRevisionPreview } from "@aux/contracts";
import { call } from "../store";
import { MemoryRestoreControl } from "./MemoryRestoreControl";
const notifications = vi.hoisted(() => new Set<(event: AuxEvent) => void>());
vi.mock("../store", () => ({ call: vi.fn() }));
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "memory-review",
    privateMode: false,
    windowKind: "normal",
    onEvent: (callback: (event: AuxEvent) => void) => {
      notifications.add(callback);
      return () => {
        notifications.delete(callback);
      };
    },
  },
}));
vi.mock("./MemoryDocument", () => ({ MemoryDocument: ({ text }: { text: string }) => <p>{text}</p> }));
vi.mock("../commands", async () => {
  const { COMMANDS } = await import("@aux/contracts");
  const { invokeScopedControl } = await import("../scoped-control-commands");
  const { commandExecutor } = await import("../command-execution");
  return {
    executeCommand: commandExecutor(
      (id: string, context: Parameters<typeof invokeScopedControl>[1]) => {
        const definition = COMMANDS.find((entry) => entry.id === id);
        return definition && "dispatch" in definition && definition.dispatch === "scoped"
          ? () => invokeScopedControl(id, context)
          : undefined;
      },
      () => {},
    ).execute,
  };
});
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const restore = vi.fn(async (_preview: MemoryRevisionPreview) => {});
const claimId = randomUUID(),
  revisionId = randomUUID();
const preview: MemoryRevisionPreview = {
  workspaceId: "memory-space",
  revisionId,
  expectedGeneration: "original-generation",
  changes: [
    {
      claimId,
      path: "episodic/2026-10-17.md",
      before: {
        claimId,
        sourceRunId: "synthetic-source",
        text: "Original synthetic source quote",
        capturedAt: 1,
        ownerEdit: { text: "Current owner-edited synthetic note", revision: 1, updatedAt: 2 },
      },
      after: {
        claimId,
        sourceRunId: "synthetic-source",
        text: "Original synthetic source quote",
        capturedAt: 1,
      },
    },
  ],
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  restore.mockClear();
  vi.mocked(call).mockReset();
  vi.mocked(call).mockResolvedValue(preview as never);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = (current = () => true) =>
  act(async () =>
    root.render(
      <MemoryRestoreControl
        workspaceId="memory-space"
        revisionId={revisionId}
        disabled={false}
        current={current}
        restore={restore}
      />,
    ),
  );
const click = async (label: string) =>
  act(async () => {
    const button = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (node) => node.textContent?.trim() === label,
    );
    if (!button) throw new Error(`Missing Memory review control: ${label}`);
    button.click();
  });
it("shows the exact current/restored notes and dispatches only the reviewed generation", async () => {
  await render();
  await click("Restore this revision");
  expect(document.querySelector("dialog")?.textContent).toContain("Current owner-edited synthetic note");
  expect(document.querySelector("dialog")?.textContent).toContain("Original synthetic source quote");
  expect(restore).not.toHaveBeenCalled();
  await click("Restore approved notes");
  expect(restore).toHaveBeenCalledExactlyOnceWith(preview);
  expect(document.querySelector("dialog")).toBeNull();
});
it("withholds a preview that finishes after its original owner retires", async () => {
  let complete!: (value: MemoryRevisionPreview) => void;
  vi.mocked(call).mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve as typeof complete;
      }),
  );
  let live = true;
  await render(() => live);
  await click("Restore this revision");
  live = false;
  await act(async () => complete(preview));
  expect(document.querySelector("dialog")).toBeNull();
  expect(restore).not.toHaveBeenCalled();
});

it("clears reviewed note content when Memory changes or is forgotten", async () => {
  await render();
  await click("Restore this revision");
  expect(document.querySelector("dialog")).not.toBeNull();
  await act(async () => {
    for (const notify of notifications)
      notify({
        type: "workspace.memory.updated",
        payload: { workspaceId: "memory-space" },
        streamId: "fixture",
        seq: 1,
        ts: 1,
      });
  });
  expect(document.querySelector("dialog")).toBeNull();
  expect(document.body.textContent).not.toContain("Current owner-edited synthetic note");
  expect(restore).not.toHaveBeenCalled();
});
