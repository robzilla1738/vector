// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ResultRecord } from "@aux/contracts";
import { useStore } from "../store";
import { ResultsTable } from "./ResultsTable";

const initial = useStore.getState();
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("updates one result row while preserving filtering, sorting, and the active set label", async () => {
  const first: ResultRecord = { resultId: "first", sourceUrl: "https://example.com/one", values: { name: "Alpha" }, observedAt: 1, status: "ok" };
  const second: ResultRecord = { resultId: "second", sourceUrl: "https://example.com/two", values: { name: "Beta" }, observedAt: 2, status: "partial" };
  useStore.setState({ results: [first, second], sets: [{ setId: "set", name: "Research set", source: "manual", memberIds: [], createdAt: 1 }], activeSetId: "set" });
  await act(async () => root.render(<ResultsTable />));
  expect(host.querySelector("h2")?.textContent).toBe("Research set");
  expect(host.querySelectorAll("tbody tr")).toHaveLength(2);

  await act(async () => useStore.setState(state => ({ results: state.results.map(result => result.resultId === "first"
    ? { ...result, values: { name: "Gamma" } } : result) })));
  expect(host.textContent).toContain("Gamma");
  expect(host.textContent).not.toContain("Alpha");

  const input = host.querySelector<HTMLInputElement>('[aria-label="Filter rows"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Gamma");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(host.querySelector("tbody")?.textContent).toContain("Gamma");
  expect(host.querySelector(".count")?.textContent).toBe("1 of 2 rows");
  let exported = "";
  vi.stubGlobal("Blob", class { constructor(parts: unknown[]) { exported = parts.join(""); } });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn().mockReturnValue("blob:result-fixture") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const json = [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "JSON")!;
  await act(async () => json.click());
  expect(JSON.parse(exported)).toEqual([{ ...first, values: { name: "Gamma" } }]);

  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const sourceHeader = [...host.querySelectorAll<HTMLButtonElement>("th button")].find(button => button.textContent?.includes("Source"))!;
  await act(async () => sourceHeader.click());
  expect(host.querySelector("th[aria-sort='ascending']")?.textContent).toContain("Source");
  expect(host.querySelectorAll("tbody tr")).toHaveLength(2);
});
