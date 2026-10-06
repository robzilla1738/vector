// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("../../commands", () => ({ executeCommand: execute }));
vi.mock("../../store", () => ({
  call: async (method: string) =>
    method === "workspaces.list" ? [{ workspaceId: "space", name: "Research" }] : [],
}));
import QueueTonight from "./QueueTonight";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("keeps rejected work editable and prevents a second submission while the original acknowledgement is pending", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let reject!: (error: Error) => void;
  const held = new Promise((_resolve, fail) => {
    reject = fail;
  });
  execute.mockReset().mockReturnValueOnce(held).mockResolvedValueOnce({ id: "queued" });
  try {
    await act(async () => root.render(<QueueTonight />));
    const work = document.body.querySelectorAll("select")[1]!;
    await act(async () => {
      work.value = "memory.consolidate";
      work.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const submit = document.body.querySelector<HTMLButtonElement>("button.btn")!;
    await act(async () => submit.click());
    expect(submit.disabled).toBe(true);
    await act(async () => submit.click());
    expect(execute).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error("Native queue refused")));
    expect(document.body.querySelector('[role="alert"]')?.textContent).toBe("Native queue refused");
    expect(work.value).toBe("memory.consolidate");
    expect(submit.disabled).toBe(false);
    await act(async () => submit.click());
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute.mock.calls[1]).toEqual(execute.mock.calls[0]);
    expect(execute.mock.calls[0]?.[0]).toBe("queue-for-tonight");
    expect(execute.mock.calls[0]?.[1]?.payload.queue.payload).toEqual({
      kind: "memory.consolidate",
      workspaceId: "space",
    });
    expect(document.body.querySelector('[role="alert"]')).toBeNull();
  } finally {
    if (execute.mock.calls.length) reject(new Error("Fixture cleanup"));
    await act(async () => root.unmount());
    host.remove();
  }
});
