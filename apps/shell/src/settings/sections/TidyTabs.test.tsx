// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ windowId: "one", privateMode: false }));
vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  bridge: {
    ...(await original<typeof import("../../bridge")>()).bridge,
    get windowId() {
      return state.windowId;
    },
    get privateMode() {
      return state.privateMode;
    },
  },
}));
import { TidyTabsSetting } from "./TidyTabs";
import { executeCommand } from "../../commands";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, value: string;
const save = vi.fn<(text: string) => Promise<boolean>>(),
  close = vi.fn();
const render = async (active = true) => {
  await act(async () =>
    root.render(<TidyTabsSetting active={active} value={value} onSave={save} onClose={close} />),
  );
};
const input = () => host.querySelector<HTMLTextAreaElement>("textarea")!;
async function type(text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(input(), text);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function submit() {
  await act(async () => {
    input().focus();
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}
function held() {
  let resolve!: (value: boolean) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<boolean>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.windowId = "one";
  state.privateMode = false;
  value = "";
  save.mockReset().mockResolvedValue(true);
  close.mockReset();
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("edits a counted draft and saves only after explicit confirmation", async () => {
  await render();
  await type("Group by project");
  expect(host.textContent).toContain("16/300");
  expect(save).not.toHaveBeenCalled();
  await submit();
  expect(save).toHaveBeenCalledWith("Group by project");
  expect(close).toHaveBeenCalledOnce();
});
it("Cancel does not write or start a model call", async () => {
  await render();
  await type("Unsaved preference");
  await act(async () =>
    [...host.querySelectorAll("button")].find((x) => x.textContent === "Cancel")!.click(),
  );
  expect(save).not.toHaveBeenCalled();
  expect(close).toHaveBeenCalledOnce();
});
it("keeps failed drafts open for retry", async () => {
  save.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  await render();
  await type("Group by site");
  await submit();
  expect(close).not.toHaveBeenCalled();
  expect(input().value).toBe("Group by site");
  expect(host.textContent).toContain("wasn’t saved");
  await submit();
  expect(close).toHaveBeenCalledOnce();
});
it("accepts its acknowledged value publication before the save promise settles", async () => {
  const pending = held();
  save.mockReturnValueOnce(pending.promise);
  await render();
  await type("Group by topic");
  await submit();
  value = "Group by topic";
  await render();
  await act(async () => pending.resolve(true));
  expect(close).toHaveBeenCalledOnce();
});
it("refuses replaced preferences and over-limit drafts", async () => {
  await render();
  await type("Local preference");
  value = "External change";
  await render();
  expect(input().disabled).toBe(true);
  expect(host.textContent).toContain("changed in another view");
  expect(save).not.toHaveBeenCalled();
});
for (const retirement of ["window", "Private", "inactive"] as const)
  it(`retires a pending save across ${retirement} A→B→A`, async () => {
    const old = held();
    save.mockReturnValueOnce(old.promise);
    await render();
    await type("Old preference");
    await submit();
    if (retirement === "window") state.windowId = "two";
    else if (retirement === "Private") state.privateMode = true;
    await render(retirement !== "inactive");
    state.windowId = "one";
    state.privateMode = false;
    await render();
    await type("Fresh preference");
    await act(async () => old.resolve(true));
    expect(close).not.toHaveBeenCalled();
    expect(input().value).toBe("Fresh preference");
  });
it("keeps original hidden/unfocused commands from writing", async () => {
  await render();
  await type("Group by project");
  host.tabIndex = -1;
  host.focus();
  await expect(executeCommand("save-tidy-prompt")).rejects.toThrow();
  host.hidden = true;
  input().focus();
  await expect(executeCommand("save-tidy-prompt")).rejects.toThrow();
  expect(save).not.toHaveBeenCalled();
});
it("never enables saving a programmatically oversized prompt", async () => {
  await render();
  await type("x".repeat(301));
  expect(host.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled).toBe(true);
  input().focus();
  await expect(executeCommand("save-tidy-prompt")).rejects.toThrow();
  expect(save).not.toHaveBeenCalled();
});
