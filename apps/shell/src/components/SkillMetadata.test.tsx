// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Routine } from "@aux/contracts";
import { SkillMetadata } from "./SkillMetadata";

const routine = {
  description: "Review reports",
  icon: "chart",
  autoInject: { keywords: ["weekly report"], urls: ["https://example.test/reports"] },
} as Routine;
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function write(label: string, value: string) {
  const field = [...container.querySelectorAll("input, textarea")].find((item) =>
    item.closest("label")?.textContent?.includes(label),
  ) as HTMLInputElement | HTMLTextAreaElement | undefined;
  if (!field) throw new Error(`Missing field ${label}`);
  const prototype =
    field instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

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

it("saves bounded sharing metadata without running the Skill", () => {
  const onSave = vi.fn();
  act(() => root.render(<SkillMetadata routine={routine} disabled={false} onSave={onSave} />));
  write("Suggestion keywords", "weekly report\nmonthly close\nmonthly close");
  write("Suggestion URL prefixes", "https://example.test/reports\nhttps://example.test/monthly");
  act(() => container.querySelector("button")!.click());
  expect(onSave).toHaveBeenCalledWith({
    description: "Review reports",
    icon: "chart",
    autoInject: {
      keywords: ["weekly report", "monthly close"],
      urls: ["https://example.test/reports", "https://example.test/monthly"],
    },
  });
  expect(container.textContent).toContain("they never start it");
});

it("refuses non-web URL hints before changing the Skill", () => {
  const onSave = vi.fn();
  act(() => root.render(<SkillMetadata routine={routine} disabled={false} onSave={onSave} />));
  write("Suggestion URL prefixes", "file:///private/notes");
  act(() => container.querySelector("button")!.click());
  expect(container.querySelector('[role="alert"]')?.textContent).toMatch(/http or https/);
  expect(onSave).not.toHaveBeenCalled();
});
