// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FilterListManager } from "./FilterListManager";
import { useFilterLists } from "./use-filter-lists";

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
  meta: {
    fetchedAt: 1000,
    bytes: 100,
    sha256: "b".repeat(64),
  },
};

function ManagedFilters() {
  const controller = useFilterLists(true);
  return <FilterListManager controller={controller} />;
}

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
    backend: "ublock_origin",
    compilationWarnings: [],
    cosmeticBackend: "native_user_styles",
  }));
  api.addFilterSource.mockImplementation(async () => {
    sources = [source];
    return sources;
  });
  api.setFilterSourceEnabled.mockImplementation(async () => {
    sources = [{ ...source, enabled: false }];
    return sources;
  });
  await act(async () => root.render(<ManagedFilters />));
  await flush();
  write("Filter list name", "Research list");
  write("Filter list URL", source.url);
  expect(api.addFilterSource).not.toHaveBeenCalled();
  act(() => button("Review list").click());
  expect(container.textContent).toContain("The source sees this browser's network address.");
  await act(async () => button("Add selected list").click());
  await flush();
  expect(api.addFilterSource).toHaveBeenCalledWith("Research list", source.url, "adblock");
  await act(async () => button("Pause list").click());
  await flush();
  expect(api.setFilterSourceEnabled).toHaveBeenCalledWith(source.id, false);
  expect(container.textContent).toContain("Paused");
});

it("states native unavailability and disables filter mutations", async () => {
  api.filterLists.mockResolvedValue({
    sources: [],
    backend: "unavailable",
    compilationWarnings: [],
    cosmeticBackend: "unavailable",
  });
  await act(async () => root.render(<ManagedFilters />));
  await flush();
  expect(container.textContent).toContain("Native filtering unavailable");
  expect(button("Review list").hasAttribute("disabled")).toBe(true);
  expect(api.addFilterSource).not.toHaveBeenCalled();
});

it("offers full Standard and Hosts formats with truthful native scope", async () => {
  api.filterLists.mockResolvedValue({
    sources: [],
    backend: "ublock_origin",
    compilationWarnings: [],
    cosmeticBackend: "native_user_styles",
  });
  api.addFilterSource.mockResolvedValue([]);
  await act(async () => root.render(<ManagedFilters />));
  await flush();
  const select = container.querySelector<HTMLSelectElement>('[aria-label="Filter list type"]')!;
  expect(select.value).toBe("adblock");
  expect(container.textContent).toContain("uBlock Origin native filtering");
  expect(container.textContent).not.toContain("network rules");
  expect(select.querySelector<HTMLOptionElement>('option[value="adblock"]')!.disabled).toBe(false);
  expect(select.querySelector<HTMLOptionElement>('option[value="hosts"]')).toBeTruthy();
  write("Filter list URL", "https://lists.example.test/filters.txt");
  act(() => button("Review list").click());
  expect(container.textContent).toContain("native network, cosmetic and bundled scriptlet rules");
  await act(async () => button("Add selected list").click());
  expect(api.addFilterSource).toHaveBeenCalledWith(
    "lists.example.test",
    "https://lists.example.test/filters.txt",
    "adblock",
  );
});

it("preserves the reviewed source and disables Add when an original held update reports native unavailability", async () => {
  const available = {
    sources: [source],
    backend: "ublock_origin",
    compilationWarnings: [],
    cosmeticBackend: "native_user_styles",
  };
  api.filterLists.mockResolvedValue(available);
  let finish!: (value: unknown) => void;
  api.updateFilters.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  await act(async () => root.render(<ManagedFilters />));
  write("Filter list name", "Keep reviewed draft");
  write("Filter list URL", "https://lists.example.test/keep.txt");
  await act(async () => button("Review list").click());
  expect(container.querySelector('[aria-label="Review filter source"]')?.textContent).toContain(
    "Keep reviewed draft",
  );
  await act(async () => button("Update enabled lists").click());
  expect(button("Add selected list").disabled).toBe(true);
  await act(async () => {
    finish({ ...available, backend: "unavailable" });
  });
  expect(container.textContent).toContain("Native filtering unavailable");
  expect(container.querySelector('[aria-label="Review filter source"]')?.textContent).toContain(
    "https://lists.example.test/keep.txt",
  );
  expect(container.querySelector<HTMLInputElement>('[aria-label="Filter list name"]')!.value).toBe(
    "Keep reviewed draft",
  );
  expect(button("Add selected list").disabled).toBe(true);
  await act(async () => button("Add selected list").click());
  expect(api.addFilterSource).not.toHaveBeenCalled();
  expect(api.updateFilters).toHaveBeenCalledTimes(1);
  act(() => button("Cancel").click());
  expect(container.querySelector('[aria-label="Review filter source"]')).toBeNull();
  expect(container.querySelector<HTMLInputElement>('[aria-label="Filter list URL"]')!.value).toBe(
    "https://lists.example.test/keep.txt",
  );
});
