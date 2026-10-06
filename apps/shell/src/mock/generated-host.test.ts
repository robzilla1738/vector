import { expect, it } from "vitest";
import { AuxError } from "@aux/contracts";
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
  const refused: Array<{ name: string; code: unknown }> = [];
  for (const [name, spec] of Object.entries(HostMethods)) {
    try {
      const result = await host[name]!();
      if (!spec.result.safeParse(result).success) failures.push(name);
    } catch (error) {
      refused.push({ name, code: error instanceof AuxError ? error.code : undefined });
    }
  }
  expect(failures).toEqual([]);
  expect(refused.map((row) => row.name).sort()).toEqual(
    [
      "native.copilotStart",
      "native.copilotEndpoint",
      "native.copilotStop",
      "native.contentBlockState",
      "native.contentBlockBegin",
      "native.contentBlockAppend",
      "native.contentBlockCommit",
      "native.cdpReset",
      "native.cdpCatalog",
      "native.cdpAttach",
      "native.cdpStartNavigation",
      "native.cdpTakeNavigationReceipt",
      "native.cdpDispatch",
      "native.egressContext",
      "native.egressInstall",
      "native.egressRevoke",
      "native.egressResumePerson",
      "native.egressResumeRun",
      "native.egressCheckRunResume",
      "native.egressRunTerminal",
      "native.createAgentPage",
      "native.creatorCleanupProof",
      "native.closeCreatedPage",
      "native.recorderStart",
      "native.recorderDrain",
      "native.recorderStop",
      "native.personRead",
      "native.personReadContext",
      "native.permissionRetire",
    ].sort(),
  );
  expect(refused.map((row) => row.code)).toEqual(refused.map(() => "backend_unavailable"));
});

it("routes emitted host events to registered listeners and unsubscribes", () => {
  const host = createMockHost();
  const payloads: unknown[] = [];
  const off = host.onTabsPlacement((payload) => payloads.push(payload));
  host.emitEvent("onTabsPlacement", { pageId: "p1", windowId: "w1", placement: { kind: "pinned" } });
  off();
  host.emitEvent("onTabsPlacement", { pageId: "p2", windowId: "w1", placement: { kind: "pinned" } });
  expect(payloads).toHaveLength(1);
});
