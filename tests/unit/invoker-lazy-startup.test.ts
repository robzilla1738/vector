import { expect, it, vi } from "vitest";
import { EventBus, makeInvoker, openDb, Repo, type Services } from "@aux/runtime";

it("describes registered capabilities and shuts down without starting unrelated services", async () => {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const stopTracking = vi.fn();
  vi.spyOn(events, "subscribe").mockReturnValue(stopTracking);
  const services = {
    repo,
    events,
    featureHost: "chromium-fork",
    serviceAvailable: () => true,
  } as unknown as Services;
  const construct = vi.fn(() => {
    throw new Error("Unrelated service started during capability discovery");
  });
  for (const name of [
    "pages",
    "runs",
    "settings",
    "responses",
    "operations",
    "state",
    "tracer",
    "outboundMcp",
    "subagents",
  ]) {
    Object.defineProperty(services, name, { get: construct });
  }
  const invoke = makeInvoker(services);
  try {
    const description = (await invoke("runtime.describe", {}, { external: false })) as {
      features: Record<string, boolean>;
    };
    expect(description.features).toMatchObject({
      responseCapture: true,
      operationRegistry: true,
      stateIndex: true,
      tracing: true,
    });
    await Promise.all([invoke.dispose(), invoke.dispose()]);
    expect(construct).not.toHaveBeenCalled();
    expect(stopTracking).toHaveBeenCalledOnce();
  } finally {
    repo.close();
  }
});
