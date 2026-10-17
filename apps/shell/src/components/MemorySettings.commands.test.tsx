// @vitest-environment jsdom
import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { MemorySettings } from "./MemorySettings";
import { invokeScopedControl } from "../scoped-control-commands";
const MEMORY_SETTINGS_COMMANDS = ["select-memory-space", "retry-memory-search", "retry-memory-load"] as const;
const mocks = vi.hoisted(() => ({ call: vi.fn(), privateMode: false, state: {} as any }));
vi.mock("../commands", async () => {
  const module = await import("../scoped-control-commands");
  return {
    executeCommand: async (id: any, context: any) => module.invokeScopedControl(id, context),
  };
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
  useStore: Object.assign((select: any) => select(mocks.state), {
    getState: () => mocks.state,
    setState: (value: any) => Object.assign(mocks.state, value),
  }),
}));
vi.mock("./MemoryDocumentBrowser", () => ({
  MemoryDocumentBrowser: ({ active, onManage }: { active: boolean; onManage(): void }) => {
    useEffect(() => {
      if (active) onManage();
    }, [active, onManage]);
    return null;
  },
}));
vi.mock("./SpaceMemoryEditor", () => ({
  SpaceMemoryEditor: ({ memory }: any) => <output>{memory.workspaceId}</output>,
}));
vi.mock("../settings/sections/SpaceMemory", () => ({ SpaceMemory: () => null }));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.privateMode = false;
  mocks.call.mockReset();
  mocks.state = {
    memoryWorkspaceId: null,
    layout: {
      activeSpaceId: "a",
      spaces: [
        { id: "a", workspaceId: "wa", name: "First" },
        { id: "b", workspaceId: "wb", name: "Long Space name" },
      ],
      archivedSpaces: [],
    },
  };
  mocks.call.mockImplementation(async (method, params) =>
    method === "workspaces.memory.get"
      ? { workspaceId: params.workspaceId, content: "", revision: 1, items: [], excludedOrigins: [] }
      : [{ workspaceId: "wb", name: "Long Space name", excerpt: "Saved notes", enabled: true }],
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const choices = () => [
  ...host.querySelectorAll<HTMLButtonElement>('[aria-label="Space memory selection"] > button'),
];
it("selects only the focused original Space through a remapped registered command", async () => {
  await act(async () => root.render(<MemorySettings />));
  const second = choices()[1]!;
  second.focus();
  const command = COMMANDS.find((item) => item.id === "select-memory-space")!;
  const overrides = { "select-memory-space": [{ key: "m", command: true, alt: true }] };
  expect(
    matchShortcut(effectiveShortcuts(overrides), { key: "m", meta: true, alt: true, shift: false })?.id,
  ).toBe(command.id);
  await act(async () => {
    invokeScopedControl("select-memory-space", { payload: { scopeId: "b" } });
  });
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.get", { workspaceId: "wb" });
  expect(second.getAttribute("aria-pressed")).toBe("true");
  expect(document.activeElement).toBe(second);
  expect(
    MEMORY_SETTINGS_COMMANDS.every((id) =>
      COMMANDS.find((item) => item.id === id && "windows" in item && item.windows?.join() === "normal"),
    ),
  ).toBe(true);
});
it("refuses foreign, retired, replaced workspace and Private controls without a load", async () => {
  await act(async () => root.render(<MemorySettings />));
  const second = choices()[1]!;
  second.focus();
  const count = mocks.call.mock.calls.length;
  expect(() => invokeScopedControl("select-memory-space", { payload: { scopeId: "a" } })).toThrow();
  mocks.state.layout.spaces[1].workspaceId = "replacement";
  expect(() => invokeScopedControl("select-memory-space")).toThrow("Space changed");
  mocks.privateMode = true;
  expect(() => invokeScopedControl("select-memory-space")).toThrow();
  await act(async () => root.render(<MemorySettings />));
  expect(() => invokeScopedControl("select-memory-space")).toThrow();
  expect(mocks.call).toHaveBeenCalledTimes(count);
});
it("retries the real original failed load once, retaining Space focus and rejecting the removed Retry", async () => {
  mocks.call.mockRejectedValueOnce(new Error("Original load failure"));
  await act(async () => root.render(<MemorySettings />));
  const retry = host.querySelector<HTMLButtonElement>('[role="alert"] button')!;
  retry.focus();
  await act(async () => {
    invokeScopedControl("retry-memory-load");
    expect(() => invokeScopedControl("retry-memory-load")).toThrow();
  });
  expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.get", { workspaceId: "wa" });
  expect(host.textContent).toContain("wa");
  expect(host.textContent).not.toContain("Original load failure");
  expect(() => invokeScopedControl("retry-memory-load")).toThrow();
});
it("retries genuine search failure with the unchanged editable query and current load scope", async () => {
  vi.useFakeTimers();
  await act(async () => root.render(<MemorySettings />));
  const input = host.querySelector<HTMLInputElement>("input")!;
  mocks.call.mockImplementation(async (method, params) => {
    if (method === "workspaces.memory.search") throw new Error("Original search failure");
    return { workspaceId: params.workspaceId, content: "", revision: 1, items: [], excludedOrigins: [] };
  });
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "notes");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    vi.advanceTimersByTime(140);
  });
  const retry = host.querySelector<HTMLButtonElement>('[role="alert"] button')!;
  retry.focus();
  mocks.call.mockImplementation(async (method, params) =>
    method === "workspaces.memory.search"
      ? [{ workspaceId: "wb", name: "Long Space name", excerpt: "Saved notes", enabled: true }]
      : { workspaceId: params.workspaceId, content: "", revision: 1, items: [], excludedOrigins: [] },
  );
  await act(async () => {
    invokeScopedControl("retry-memory-search");
  });
  await act(async () => {
    vi.advanceTimersByTime(140);
  });
  expect(input.value).toBe("notes");
  expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.search", { query: "notes" });
  expect(choices()).toHaveLength(1);
  expect(host.textContent).toContain("Saved notes");
});

it("keeps the new workspace when an original pending load finishes after selection", async () => {
  let finishA!: (value: unknown) => void;
  mocks.call.mockImplementation((method, params) =>
    params.workspaceId === "wa"
      ? new Promise((resolve) => {
          finishA = resolve;
        })
      : Promise.resolve({ workspaceId: "wb", content: "", revision: 1, items: [], excludedOrigins: [] }),
  );
  await act(async () => root.render(<MemorySettings />));
  const second = choices()[1]!;
  second.focus();
  await act(async () => {
    second.click();
  });
  expect(host.textContent).toContain("wb");
  await act(async () => {
    finishA({ workspaceId: "wa", content: "stale", revision: 1, items: [], excludedOrigins: [] });
  });
  expect(host.textContent).toContain("wb");
  expect(host.textContent).not.toContain("stale");
  expect(second.getAttribute("aria-pressed")).toBe("true");
});
it("keeps only the current query's choices when an earlier search completes late", async () => {
  vi.useFakeTimers();
  const completions = new Map<string, (value: unknown) => void>();
  mocks.call.mockImplementation((method, params) =>
    method === "workspaces.memory.search"
      ? new Promise((resolve) => completions.set(params.query, resolve))
      : Promise.resolve({
          workspaceId: params.workspaceId,
          content: "",
          revision: 1,
          items: [],
          excludedOrigins: [],
        }),
  );
  await act(async () => root.render(<MemorySettings />));
  const input = host.querySelector<HTMLInputElement>("input")!;
  for (const value of ["old", "current"]) {
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      vi.advanceTimersByTime(140);
    });
  }
  await act(async () => {
    completions.get("current")!([
      { workspaceId: "wa", name: "First", excerpt: "Current notes", enabled: true },
    ]);
  });
  await act(async () => {
    completions.get("old")!([
      { workspaceId: "wb", name: "Long Space name", excerpt: "Old notes", enabled: true },
    ]);
  });
  expect(choices()).toHaveLength(1);
  expect(choices()[0]!.textContent).toContain("Current notes");
  expect(host.textContent).not.toContain("Old notes");
  choices()[0]!.focus();
  await act(async () => {
    invokeScopedControl("select-memory-space");
  });
  expect(input.value).toBe("current");
});
