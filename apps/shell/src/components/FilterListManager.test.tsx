// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FilterListManager } from "./FilterListManager";

const api = vi.hoisted(() => ({
  filterLists: vi.fn(),
  addFilterSource: vi.fn(),
  removeFilterSource: vi.fn(),
  setFilterSourceEnabled: vi.fn(),
  updateFilters: vi.fn(),
}));
vi.mock("../bridge", () => ({ bridge: api }));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const source = {
  id: "aaaaaaaaaaaa",
  name: "Research list",
  url: "https://lists.example.test/hosts",
  enabled: true,
  kind: "hosts" as const,
  meta: { fetchedAt: 1000, hosts: 2, sha256: "b".repeat(64) },
};

function button(label: string) {
  const found = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error(`Missing ${label}`);
  return found;
}
function write(label: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  Object.values(api).forEach((method) => method.mockReset());
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("requires review before adding a source and lets the user pause it", async () => {
  let sources: (typeof source)[] = [];
  api.filterLists.mockImplementation(async () => ({
    sources,
    hosts: sources.length ? 2 : 0,
    cookieSelectors: 0,
    builtinHosts: 50,
    backend: "electron_web_request",
  }));
  api.addFilterSource.mockImplementation(async () => {
    sources = [source];
    return sources;
  });
  api.setFilterSourceEnabled.mockImplementation(async () => {
    sources = [{ ...source, enabled: false }];
    return sources;
  });
  await act(async () => root.render(<FilterListManager />));
  await flush();
  write("Filter list name", "Research list");
  write("Filter list URL", source.url);
  expect(api.addFilterSource).not.toHaveBeenCalled();
  act(() => button("Review list").click());
  expect(container.textContent).toContain("The source sees this browser's network address.");
  await act(async () => button("Add selected list").click());
  await flush();
  expect(api.addFilterSource).toHaveBeenCalledWith("Research list", source.url, "hosts");
  await act(async () => button("Pause list").click());
  await flush();
  expect(api.setFilterSourceEnabled).toHaveBeenCalledWith(source.id, false);
  expect(container.textContent).toContain("Paused");
});

it("states preview limits and disables filter mutations", async () => {
  api.filterLists.mockResolvedValue({
    sources: [],
    hosts: 0,
    cookieSelectors: 0,
    builtinHosts: 0,
    backend: "preview",
  });
  await act(async () => root.render(<FilterListManager />));
  await flush();
  expect(container.textContent).toContain("no requests are blocked here");
  expect(button("Review list").hasAttribute("disabled")).toBe(true);
  expect(api.addFilterSource).not.toHaveBeenCalled();
});

it("reviews cookie-banner type before adding and describes the cosmetic scope", async () => {
  api.filterLists.mockResolvedValue({
    sources: [],
    hosts: 0,
    cookieSelectors: 0,
    builtinHosts: 50,
    backend: "electron_web_request",
  });
  api.addFilterSource.mockResolvedValue([]);
  await act(async () => root.render(<FilterListManager />));
  await flush();
  const select = container.querySelector<HTMLSelectElement>('[aria-label="Filter list type"]')!;
  await act(async () => {
    select.value = "cookie_banner";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  write("Filter list URL", "https://lists.example.test/cookies.txt");
  act(() => button("Review list").click());
  expect(container.textContent).toContain("hide cookie banners on matching sites");
  await act(async () => button("Add selected list").click());
  expect(api.addFilterSource).toHaveBeenCalledWith(
    "lists.example.test",
    "https://lists.example.test/cookies.txt",
    "cookie_banner",
  );
});

it("offers only installed native host filtering in Chromium", async () => {
  api.filterLists.mockResolvedValue({
    sources: [],
    hosts: 0,
    cookieSelectors: 0,
    builtinHosts: 88,
    backend: "subresource_filter",
  });
  await act(async () => root.render(<FilterListManager />));
  await flush();
  const cosmetic = container.querySelector<HTMLOptionElement>('option[value="cookie_banner"]')!;
  expect(cosmetic.disabled).toBe(true);
  expect(container.textContent).toContain("Chromium applies downloaded domain lists");
});

it("offers cookie-banner lists when Chromium attests document-start stylesheets", async () => {
  api.filterLists.mockResolvedValue({
    sources: [],
    hosts: 0,
    cookieSelectors: 0,
    builtinHosts: 88,
    backend: "subresource_filter",
    cosmeticBackend: "document_start_stylesheet",
  });
  await act(async () => root.render(<FilterListManager />));
  await flush();
  expect(container.querySelector<HTMLOptionElement>('option[value="cookie_banner"]')!.disabled).toBe(false);
  expect(container.textContent).not.toContain("native stylesheet backend");
});
