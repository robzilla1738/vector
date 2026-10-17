// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExternalAgents } from "./ExternalAgents";
import { bridge } from "../bridge";

vi.mock("../bridge", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../bridge")>();
  return {
    ...actual,
    inNativeHost: false,
    inMock: true,
    bridge: {
      ...actual.bridge,
      windowId: "developer-window",
      windowKind: "normal",
      privateMode: false,
      invoke: vi.fn(),
      agentClients: vi.fn(async () => []),
      agentConnections: vi.fn(async () => []),
      agentConfig: vi.fn(),
      revokeAgentConnection: vi.fn(),
    },
  };
});
vi.mock("./CliInstallControl", () => ({ CliInstallControl: () => null }));
vi.mock("./RemoteDebugging", () => ({ RemoteDebugging: () => null }));
vi.mock("./ExternalAgentOversight", () => ({ ExternalAgentOversight: () => null }));

let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  bridge.windowId = "developer-window";
  bridge.privateMode = false;
  vi.mocked(bridge.invoke).mockImplementation(async (method) => {
    if (method === "workspaces.list") return [{ workspaceId: "space", name: "Test Space" }] as never;
    if (method === "tasks.list")
      return [{ taskId: "task", workspaceId: "space", title: "Test Task", state: "open" }] as never;
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
const render = (active = true) => act(async () => root.render(<ExternalAgents active={active} />));
async function open() {
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Connect an external agent"]')!.click(),
  );
}
const button = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("dialog button")].find(
    (item) => item.textContent === text,
  )!;

it("locks the original client and scope while creating a configuration and admits only one request", async () => {
  let resolve!: (value: unknown) => void;
  vi.mocked(bridge.agentConfig).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }) as never,
  );
  await render();
  await open();
  await act(async () => {
    button("Copy configuration manually").click();
    button("Copy configuration manually").click();
  });
  expect(bridge.agentConfig).toHaveBeenCalledTimes(1);
  expect(button("JSON client").disabled).toBe(true);
  expect(document.querySelector<HTMLInputElement>('[aria-label="Connection name"]')!.disabled).toBe(true);
  expect(document.querySelector<HTMLSelectElement>('[aria-label="Connection scope"]')!.disabled).toBe(true);
  await act(async () => resolve({ command: "aux", args: [], env: { SYNTHETIC_TOKEN: "test-only" } }));
  expect(document.querySelector<HTMLTextAreaElement>('[aria-label="Agent configuration"]')!.value).toContain(
    "[mcp_servers.aux-browser]",
  );
  expect(button("JSON client").disabled).toBe(false);
});

it("retires a pending credential result on route departure and does not install it into the next editor", async () => {
  let resolve!: (value: unknown) => void;
  vi.mocked(bridge.agentConfig).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }) as never,
  );
  await render();
  await open();
  await act(async () => button("Copy configuration manually").click());
  await render(false);
  expect(document.querySelector("dialog")).toBeNull();
  await render();
  await open();
  await act(async () => button("JSON client").click());
  await act(async () => resolve({ command: "aux", args: [], env: { SYNTHETIC_TOKEN: "retired-test-only" } }));
  expect(document.querySelector('[aria-label="Agent configuration"]')).toBeNull();
  expect(document.querySelector<HTMLInputElement>('[aria-label="Connection name"]')!.value).toBe(
    "JSON client task connection",
  );
  expect(button("Copy configuration manually").disabled).toBe(false);
});
