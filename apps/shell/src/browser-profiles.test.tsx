// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
vi.mock("./bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./bridge")>()),
  inNativeHost: true,
}));
import { bridge } from "./bridge";
import { BrowserProfiles } from "./components/BrowserProfiles";
import { ProfileMoveConfirmation } from "./components/ProfileSwitcher";
beforeEach(() => vi.stubGlobal("auxChromiumHost", { featureStages: { profiles: "on" } }));
afterEach(() => vi.unstubAllGlobals());
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("retains a created profile when its window fails, allowing Open without creating it twice", async () => {
  const list = vi
    .spyOn(bridge, "browserProfiles")
    .mockResolvedValue([{ id: "default", name: "Personal", current: true, archived: false }]);
  const create = vi
    .spyOn(bridge, "createBrowserProfile")
    .mockResolvedValue({ id: "work", name: "Work", current: false, archived: false });
  const open = vi
    .spyOn(bridge, "openBrowserProfile")
    .mockRejectedValueOnce(new Error("Launch failed"))
    .mockResolvedValue(true);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  const button = (label: string) =>
    Array.from(host.querySelectorAll("button")).find((item) => item.textContent === label)!;
  try {
    await act(async () =>
      root.render(
        <>
          <BrowserProfiles />
          <ProfileMoveConfirmation />
        </>,
      ),
    );
    await act(async () => button("New profile").click());
    const input = host.querySelector("input")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Work");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () =>
      host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
    );
    expect(host.querySelector("form")).toBeNull();
    expect(host.textContent).toContain("“Work” was created. Use Open");
    expect(list).toHaveBeenCalledTimes(1);
    await act(async () => button("Open").click());
    expect(create).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(2);
    expect(host.textContent).toContain("Opening Work in a separate window");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
  }
});
it("keeps Profile actions in one menu and requires a named confirmation before deletion", async () => {
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  const profiles = [
    { id: "default", name: "Personal", current: true, archived: false },
    { id: "work", name: "Work", current: false, archived: false },
  ];
  vi.spyOn(bridge, "browserProfiles").mockResolvedValue(profiles);
  const remove = vi.spyOn(bridge, "deleteBrowserProfile").mockResolvedValue([profiles[0]!]);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () =>
      root.render(
        <>
          <BrowserProfiles />
          <ProfileMoveConfirmation />
        </>,
      ),
    );
    expect(host.querySelectorAll('[aria-haspopup="menu"]')).toHaveLength(2);
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Work Profile"]')!.click(),
    );
    const item = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(
      (node) => node.textContent === "Delete…",
    )!;
    await act(async () => item.click());
    expect(remove).not.toHaveBeenCalled();
    const confirmation = document.querySelector('dialog[aria-label="Delete “Work”?"]')!;
    expect(confirmation.textContent).toContain("permanently removes");
    await act(async () =>
      [...confirmation.querySelectorAll("button")]
        .find((node) => node.textContent === "Keep Profile")!
        .click(),
    );
    expect(document.querySelector('dialog[aria-label="Delete “Work”?"]')).toBeNull();
    expect(document.activeElement).toBe(host.querySelector('[aria-label="Actions for Work Profile"]'));
    expect(remove).not.toHaveBeenCalled();
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Work Profile"]')!.click(),
    );
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
        .find((node) => node.textContent === "Delete…")!
        .click(),
    );
    expect(remove).not.toHaveBeenCalled();
    await act(async () =>
      [...document.querySelectorAll<HTMLButtonElement>('dialog[aria-label="Delete “Work”?"] button')]
        .find((node) => node.textContent === "Delete permanently")!
        .click(),
    );
    expect(remove).toHaveBeenCalledOnce();
    expect(host.querySelector('[aria-label="Actions for Work Profile"]')).toBeNull();
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[aria-label="Actions for Personal Profile"]')!.click(),
    );
    expect(document.querySelector('[role="menu"]')?.textContent).toBe("Rename");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
