// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ConversationSource } from "@aux/contracts";
import { SourceRow, sourceDescription } from "./SourceRow";

let host: HTMLDivElement, style: HTMLStyleElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  host.style.width = "240px";
  document.body.append(host);
  root = createRoot(host);
  style = document.createElement("style");
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../ui/ui.css"), "utf8");
  style.textContent = css.match(/^\.ui-list-copy small \{[^}]+\}/m)![0];
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  vi.unstubAllGlobals();
});
it("wraps complete recorded account and Profile metadata while preserving the original focused open action", async () => {
  const accountKey = `${"OriginalRecordedAccount".repeat(12)}@example.test`;
  const profileName = "OriginalProfileName".repeat(15);
  const source: ConversationSource = {
    kind: "calendar", sourceId: "original-source", runId: "original-run",
    connectionId: "original-connection", accountKey, profileId: "original-profile",
    title: "Original Calendar event", url: "https://calendar.google.com/calendar/u/0/r/eventedit/original",
    start: "2026-10-04", end: "2026-10-05", observedAt: 1,
  };
  const names = { "original-profile": profileName }, opened = vi.fn();
  await act(async () => root.render(<SourceRow source={source} profileNames={names} onOpen={opened} />));
  const metadata = host.querySelector("small")!;
  expect(metadata.textContent).toBe(sourceDescription(source, names));
  expect(metadata.textContent).toContain(accountKey);
  expect(metadata.textContent).toContain(profileName);
  expect(getComputedStyle(metadata).overflowWrap).toBe("anywhere");
  expect(getComputedStyle(metadata).display).toBe("block");
  const button = host.querySelector<HTMLButtonElement>("button")!;
  expect(button.disabled).toBe(false);
  expect(button.title).toBe(source.title);
  button.focus();
  expect(document.activeElement).toBe(button);
  await act(async () => button.click());
  expect(opened).toHaveBeenCalledTimes(1);
  expect(opened.mock.calls[0]![0]!.currentTarget).toBe(null);
  expect(opened.mock.calls[0]![0]!.target).toBe(button);
  expect(metadata.textContent).toBe(sourceDescription(source, names));
});
