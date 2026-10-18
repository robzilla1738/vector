// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { XConnections } from "./XConnections";
import { call } from "../../store";
import { bridge } from "../../bridge";
vi.mock("../../bridge", () => ({
  bridge: { windowId: "x-fixture", privateMode: false, openExternal: vi.fn() },
  inNativeHost: false,
  inMock: true,
}));
vi.mock("../../store", () => ({ call: vi.fn() }));
const dispose: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of dispose.splice(0)) await close();
  vi.mocked(call).mockReset();
  vi.mocked(bridge.openExternal).mockReset();
  vi.unstubAllGlobals();
});
const account = {
  connectionId: "0b6bbfc0-249e-488e-96fa-b4db415eb6ac",
  userId: "123456789",
  username: "fixture_owner",
  label: "Fixture account",
  revision: "a".repeat(64),
  state: "active",
  scopes: ["tweet.read", "users.read", "offline.access", "tweet.write"],
  operations: ["posts.search", "posts.create"],
  createdAt: 1,
  updatedAt: 1,
};
const task = {
  taskId: "22ea4017-3b73-4b09-a832-7d5a8036bc0b",
  workspaceId: "4d2fe0ab-f127-4764-ab05-8c1f9b104234",
  title: "Fixture task",
  revision: 3,
  state: "open",
};
async function fixture(snapshot: unknown = { available: true, connections: [account] }) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.mocked(call).mockImplementation(async (method) => {
    if (method === "x.accounts.list") return snapshot as never;
    if (method === "tasks.list") return [task] as never;
    if (method === "x.grants.list") return [] as never;
    if (method === "x.grants.create") return { grantId: "fixture-grant" } as never;
    throw Error(`Unexpected fixture method ${method}`);
  });
  const container = document.createElement("div"),
    root = createRoot(container);
  document.body.append(container);
  dispose.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  const render = (active = true) => act(async () => root.render(<XConnections active={active} />));
  await render();
  const button = (text: string) =>
    Array.from(container.querySelectorAll("button")).find((button) => button.textContent === text)!;
  return { container, render, button };
}
it("shows truthful missing registration without connecting or advertising fabricated operations", async () => {
  const f = await fixture({
    available: false,
    reason: "X OAuth registration is required.",
    connections: [],
  });
  expect(f.container.textContent).toContain("X OAuth registration is required.");
  expect(f.button("Connect X account").disabled).toBe(true);
  expect(vi.mocked(call).mock.calls.some(([method]) => method === "x.auth.start")).toBe(false);
});
it("grants only explicitly selected operations to the exact account and saved task revisions", async () => {
  const f = await fixture();
  expect(f.button("Grant selected operations").disabled).toBe(true);
  const label = Array.from(f.container.querySelectorAll("label")).find(
    (label) => label.textContent === "posts · create",
  )!;
  await act(async () => label.querySelector("input")!.click());
  await act(async () => f.button("Grant selected operations").click());
  expect(call).toHaveBeenCalledWith("x.grants.create", {
    taskId: task.taskId,
    taskRevision: task.revision,
    workspaceId: task.workspaceId,
    connectionId: account.connectionId,
    accountRevision: account.revision,
    operations: ["posts.create"],
  });
  expect(vi.mocked(call).mock.calls.some(([method]) => method === "x.auth.start")).toBe(false);
});
it("does not open a late OAuth URL after the original Settings view retires and returns", async () => {
  const f = await fixture({ available: true, connections: [] });
  let finish!: (value: unknown) => void;
  vi.mocked(call).mockImplementationOnce(
    async () =>
      new Promise<never>((resolve) => {
        finish = (value) => resolve(value as never);
      }),
  );
  await act(async () => f.button("Connect X account").click());
  await f.render(false);
  await f.render(true);
  await act(async () => finish({ url: "https://accounts.x.com/fixture", expiresAt: Date.now() + 1000 }));
  expect(bridge.openExternal).not.toHaveBeenCalled();
});
it("keeps a refresh action usable after runtime failure", async () => {
  const f = await fixture();
  vi.mocked(call).mockRejectedValueOnce(new Error("Runtime unavailable"));
  await act(async () => f.button("Refresh accounts").click());
  expect(f.container.querySelector('[role="alert"]')?.textContent).toContain("Runtime unavailable");
  expect(f.button("Refresh accounts").disabled).toBe(false);
});

it("retains required identity scopes and keeps optional choices local until explicit sign-in", async () => {
  const f = await fixture({ available: true, connections: [] });
  expect(
    [...f.container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].filter(
      (input) => input.disabled && input.checked,
    ),
  ).toHaveLength(3);
  const permission = [...f.container.querySelectorAll("label")].find(
    (label) => label.textContent === "Publish posts and replies",
  )!;
  await act(async () => permission.querySelector("input")!.click());
  expect(f.container.querySelector("summary")?.textContent).toContain("4 selected");
  expect(call).not.toHaveBeenCalledWith("x.auth.start", expect.anything());
  expect(bridge.openExternal).not.toHaveBeenCalled();
});
