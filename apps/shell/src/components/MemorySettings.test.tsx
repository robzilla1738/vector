// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemorySettings } from "./MemorySettings";

const mocks = vi.hoisted(() => ({ call: vi.fn(), privateMode: false, state: {} as Record<string, unknown> }));
vi.mock("../commands", async () => {
  const module = await import("../scoped-control-commands");
  return { executeCommand: async (id: any, context: any) => module.invokeScopedControl(id, context) };
});
vi.mock("../bridge", () => ({
  bridge: {
    get privateMode() {
      return mocks.privateMode;
    },
    onEvent: () => () => {},
  },
}));
vi.mock("../store", () => ({
  call: mocks.call,
  errToast: vi.fn(),
  useStore: Object.assign((select: (state: unknown) => unknown) => select(mocks.state), {
    getState: () => mocks.state,
    setState: (value: unknown) => Object.assign(mocks.state, value),
  }),
}));
vi.mock("./SpaceMemoryEditor", () => ({
  SpaceMemoryEditor: ({ memory }: { memory: { workspaceId: string } }) => (
    <output>{memory.workspaceId}</output>
  ),
}));
vi.mock("../settings/sections/SpaceMemory", () => ({ SpaceMemory: () => null }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
let errors: ReturnType<typeof vi.spyOn>;
const longName = "ResearchPlanningAndReview".repeat(30);
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  mocks.privateMode = false;
  mocks.call.mockReset();
  errors = vi.spyOn(console, "error");
  mocks.state = {
    memoryWorkspaceId: null,
    layout: {
      activeSpaceId: "first",
      spaces: [{ id: "first", workspaceId: "workspace-first", name: "Personal" }],
      archivedSpaces: [{ id: "archived", workspaceId: "workspace-archived", name: longName }],
    },
  };
  mocks.call.mockImplementation(async (method, params) => {
    if (method === "workspaces.memory.get")
      return { workspaceId: params.workspaceId, content: "", revision: 1, excludedOrigins: [], items: [] };
    if (method === "workspaces.memory.search")
      return [
        {
          workspaceId: "workspace-archived",
          name: longName,
          excerpt: "Original saved excerpt",
          enabled: false,
        },
      ];
    throw new Error(method);
  });
  host = document.createElement("div");
  host.className = "settings-content";
  document.body.append(host);
  style = document.createElement("style");
  const dir = dirname(fileURLToPath(import.meta.url));
  // Real global button rules must precede the scoped overrides. jsdom cannot parse layers/containers.
  const settings = readFileSync(join(dir, "Settings.css"), "utf8");
  // jsdom ignores CSS specificity. Apply the actual two-class base before the three-class search override.
  const memoryRules = settings.match(
    /(?:\.memory-space-list[^{}]*|\.memory-search-results |\.settings-content \.btn )\{[^}]+\}/g,
  )!;
  memoryRules.sort(
    (a, b) =>
      Number(a.startsWith(".memory-space-list.memory-search-results")) -
      Number(b.startsWith(".memory-space-list.memory-search-results")),
  );

  style.textContent =
    readFileSync(join(dir, "../styles/primitives.css"), "utf8")
      .match(/\.btn(?:\.sm)? \{[^}]+\}/g)!
      .join("\n") +
    "\n" +
    memoryRules.join("\n");
  document.head.append(style);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  errors.mockRestore();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function choices() {
  return [...host.querySelectorAll<HTMLButtonElement>('[aria-label="Space memory selection"] > button')];
}
it("contains the full archived Space label and preserves exact workspace selection and focus", async () => {
  await act(async () => root.render(<MemorySettings />));
  const choice = choices()[1]!;
  expect(choice.textContent).toBe(`${longName} · Archived`);
  const css = getComputedStyle(choice);
  expect(css.minWidth).toBe("0");
  expect(css.maxWidth).toBe("100%");
  expect(css.height).toBe("auto");
  expect(css.minHeight).toBe("32px");
  expect(css.whiteSpace).toBe("normal");
  expect(getComputedStyle(choice.querySelector("span")!).overflowWrap).toBe("anywhere");
  choice.focus();
  await act(async () => choice.click());
  expect(document.activeElement).toBe(choice);
  expect(choice.getAttribute("aria-pressed")).toBe("true");
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.get", { workspaceId: "workspace-archived" });
  expect(errors).not.toHaveBeenCalled();
  const heading = host.querySelector("h4")!;
  expect(heading.textContent).toBe(longName);
  expect(getComputedStyle(heading).overflowWrap).toBe("anywhere");
});
it("search retains the long title, original excerpt and paused status with its larger hit area", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<MemorySettings />));
  const input = host.querySelector("input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Research");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => vi.advanceTimersByTimeAsync(140));
  expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.search", { query: "Research" });
  const choice = choices()[0]!;
  expect(choice.querySelector("span")?.textContent).toBe(`${longName} · Archived`);
  expect(choice.querySelector("small")?.textContent).toBe("Original saved excerpt · Paused");
  expect(getComputedStyle(choice).minHeight).toBe("64px");
  expect(getComputedStyle(choice).whiteSpace).toBe("normal");
  choice.focus();
  await act(async () => choice.click());
  expect(document.activeElement).toBe(choice);
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.get", { workspaceId: "workspace-archived" });
});
it("private browsing keeps memory excluded without loading or searching original data", async () => {
  mocks.privateMode = true;
  await act(async () => root.render(<MemorySettings />));
  expect(host.textContent).toBe("Space memory is unavailable in private browsing.");
  expect(mocks.call).not.toHaveBeenCalled();
  expect(choices()).toHaveLength(0);
});
