// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { NewBookmarkDialog } from "./NewBookmarkDialog";

it("rejects unsupported addresses, submits a web bookmark, and keeps a failed draft editable", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const save = vi.fn(),
    close = vi.fn();
  const render = (busy = false, error = "") =>
    root.render(
      <NewBookmarkDialog folderName="Research" busy={busy} error={error} onSave={save} onClose={close} />,
    );
  try {
    await act(async () => render());
    const form = document.querySelector("form")!;
    const address = form.querySelector<HTMLInputElement>('input[type="url"]')!;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const change = async (value: string) =>
      act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(address, value);
        address.dispatchEvent(new Event("input", { bubbles: true }));
      });
    await change("javascript:alert(1)");
    expect(submit.disabled).toBe(true);
    await act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(save).not.toHaveBeenCalled();
    await change("https://example.com/research");
    await act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(save).toHaveBeenCalledWith({ title: "example.com", url: "https://example.com/research" });
    await act(async () => render(true));
    expect(address.disabled).toBe(true);
    expect(submit.disabled).toBe(true);
    await act(async () => render(false, "Folder changed. Try again."));
    expect(address.value).toBe("https://example.com/research");
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("Folder changed");
    expect(close).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
