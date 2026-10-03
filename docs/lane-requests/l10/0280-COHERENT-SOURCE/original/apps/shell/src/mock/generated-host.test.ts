import { expect, it } from "vitest";
import { HostMethods, HostEvents } from "@aux/contracts/host-methods";
import { createMockHost } from "../host/mock.generated";

it("covers every manifest host method and event with schema-valid stubs", () => {
  const host = createMockHost();
  const surface = { ...host } as Record<string, unknown>;
  for (const name of Object.keys(HostMethods)) {
    expect(typeof surface[name]).toBe("function");
  }
  for (const name of Object.keys(HostEvents)) {
    expect(typeof surface[name]).toBe("function");
  }
});

it("returns parsed results and isolates callers from shared state", async () => {
  const host = createMockHost();
  const first = await host.tabsSnapshot();
  expect(first).toEqual({ version: 0, tabs: [], windows: [] });
  const second = await host.tabsSnapshot();
  expect(second).not.toBe(first);
});

it("validates stub results against the live manifest schemas", async () => {
  const host = createMockHost() as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
  const failures: string[] = [];
  for (const [name, spec] of Object.entries(HostMethods)) {
    const result = await host[name]!();
    if (!spec.result.safeParse(result).success) failures.push(name);
  }
  expect(failures).toEqual([]);
});

it("routes emitted host events to registered listeners and unsubscribes", () => {
  const host = createMockHost();
  const payloads: unknown[] = [];
  const off = host.onTabsPlacement(payload => payloads.push(payload));
  host.emitEvent("onTabsPlacement", { pageId: "p1", windowId: "w1", placement: { kind: "pinned" } });
  off();
  host.emitEvent("onTabsPlacement", { pageId: "p2", windowId: "w1", placement: { kind: "pinned" } });
  expect(payloads).toHaveLength(1);
});
