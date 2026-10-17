import { settingsButtonCss } from "../../../../tests/unit/settings-control-css";
// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BrowserProfiles } from "./BrowserProfiles";

const mocks = vi.hoisted(() => ({ profiles: vi.fn(), command: vi.fn(), privateMode: false }));
vi.mock("../bridge", () => ({
  inNativeHost: true,
  bridge: {
    browserProfiles: mocks.profiles,
    get privateMode() {
      return mocks.privateMode;
    },
  },
}));
vi.mock("../commands", () => ({ executeCommand: mocks.command }));
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let style: HTMLStyleElement;
const longName = "ResearchAndPlanning".repeat(30);

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.privateMode = false;
  mocks.profiles.mockReset();
  mocks.command.mockReset();
  mocks.profiles.mockResolvedValue([
    {
      id: "default",
      name: "Personal",
      current: true,
      spaces: [{ id: "space-original", name: longName, color: "blue" }],
    },
  ]);
  mocks.command.mockResolvedValue(true);
  host = document.createElement("div");
  host.className = "settings-content";
  style = document.createElement("style");
  // Parse only the shipped Profile containment rules; jsdom does not support the file’s layers/containers.
  style.textContent =
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../styles/primitives.css"), "utf8")
      .match(/\.btn(?:\.sm)? \{[^}]+\}/g)!
      .join("\n") +
    "\n" +
    settingsButtonCss +
    "\n" +
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), "Settings.css"), "utf8")
      .match(/(?:\.browser-profiles > [^{]+|\.settings-content \.btn )\{[^}]+\}/g)!
      .join("\n");
  document.head.append(style);
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  vi.unstubAllGlobals();
});

it("keeps a complete long Space name and original registered selection within the Profile section", async () => {
  await act(async () => root.render(<BrowserProfiles />));
  const section = host.querySelector<HTMLElement>('section[aria-label="Spaces in this Profile"]')!;
  const choice = section.querySelector("button")!;
  expect(choice.textContent).toBe(longName);
  expect(choice.className).toBe("btn sm ghost");
  expect(getComputedStyle(choice).minHeight).toBe("32px");
  expect(getComputedStyle(choice).height).toBe("auto");
  expect(getComputedStyle(choice).whiteSpace).toBe("normal");
  expect(getComputedStyle(section).maxWidth).toBe("100%");
  expect(getComputedStyle(section).minWidth).toBe("0");
  expect(getComputedStyle(choice).maxWidth).toBe("100%");
  expect(getComputedStyle(choice).overflowWrap).toBe("anywhere");
  choice.focus();
  expect(document.activeElement).toBe(choice);
  await act(async () => choice.click());
  expect(mocks.command).toHaveBeenCalledExactlyOnceWith("focus-profile-space", {
    payload: { profileId: "default", spaceId: "space-original" },
  });
  expect(choice.disabled).toBe(false);
});

it("contains the real failed Profile message without replacing its text or refresh action", async () => {
  const failure = `Unavailable:${"OriginalProfileIdentifier".repeat(40)}`;
  mocks.profiles.mockRejectedValueOnce(new Error(failure));
  await act(async () => root.render(<BrowserProfiles />));
  const alert = host.querySelector<HTMLElement>('[role="alert"]')!;
  expect(alert.querySelector("p")?.textContent).toBe(`Error: ${failure}`);
  expect(getComputedStyle(alert).maxWidth).toBe("100%");
  expect(getComputedStyle(alert).overflowWrap).toBe("anywhere");
  const refresh = alert.querySelector("button")!;
  expect(refresh.textContent).toBe("Refresh profiles");
  expect(refresh.disabled).toBe(false);
  expect(refresh.classList.contains("btn")).toBe(true);
});

it("retains private Profile exclusion without loading native Profile data", async () => {
  mocks.privateMode = true;
  await act(async () => root.render(<BrowserProfiles />));
  expect(host.textContent).toBe("");
  expect(mocks.profiles).not.toHaveBeenCalled();
});

it("holds the same Space action while pending and preserves the actual native refusal", async () => {
  let complete!: (value: boolean) => void;
  mocks.command.mockImplementationOnce(
    () =>
      new Promise<boolean>((resolve) => {
        complete = resolve;
      }),
  );
  await act(async () => root.render(<BrowserProfiles />));
  const choice = host.querySelector<HTMLButtonElement>(
    'section[aria-label="Spaces in this Profile"] button',
  )!;
  choice.focus();
  await act(async () => {
    choice.click();
    choice.click();
  });
  expect(mocks.command).toHaveBeenCalledTimes(1);
  expect(choice.disabled).toBe(true);
  expect(host.querySelector<HTMLButtonElement>("button.btn.sm")?.disabled).toBe(true);
  await act(async () => complete(false));
  expect(choice.disabled).toBe(false);
  expect(choice.textContent).toBe(longName);
  expect(host.querySelector('[role="alert"] p')?.textContent).toBe("This Space could not be focused.");
  expect(mocks.command).toHaveBeenCalledExactlyOnceWith("focus-profile-space", {
    payload: { profileId: "default", spaceId: "space-original" },
  });
  choice.focus();
  expect(document.activeElement).toBe(choice);
});
