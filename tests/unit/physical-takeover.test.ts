import { expect, it } from "vitest";
import { EventTypes } from "@aux/contracts";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import type { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";

it("physical input takes an agent page even while its program is dispatching", async () => {
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = [];
  const target = { pageId: "active", controller: "agent", controllerEpoch: 4 };
  const lp = { target };
  let persisted = 0;
  const registry = {
    live: new Map([["active", lp]]),
    persist: () => { persisted++; },
    deps: { events: { emit: (type: string, payload: Record<string, unknown>) => emitted.push({ type, payload }) } },
  } as unknown as PageRegistry;
  const control = new ControlAuthority(registry);
  control.programInflight.add("active");
  control.onNativeTakeover("other");
  expect(target.controller).toBe("agent");
  control.onNativeTakeover("active");
  expect(target).toMatchObject({ controller: "human", controllerEpoch: 5 });
  expect(emitted).toContainEqual({ type: EventTypes.PageTakeover,
    payload: { pageId: "active", controller: "human", controllerEpoch: 5 } });
  control.onNativeTakeover("active");
  expect(persisted).toBe(1);
  await control.resume("active");
  expect(target).toMatchObject({ controller: "none", controllerEpoch: 6 });
  await expect(control.resume("active")).rejects.toMatchObject({ code: "conflict" });
});
