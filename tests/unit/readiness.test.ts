import { describe, it, expect } from "vitest";
import { executeProgram } from "@aux/runtime";
import { AUX_WORLD_SOURCE, RequestTracker } from "@aux/chromium-driver";
import type { DriverPage } from "@aux/chromium-driver";
import type { Condition } from "@aux/contracts";

describe("readiness request tracking", () => {
  const req = (type: string, frame: unknown) => ({ resourceType: () => type, frame: () => frame });

  it("counts main-frame fetch/XHR from Node and needs a quiet window after the last one ends", () => {
    const main = {};
    const t = new RequestTracker(() => main);
    expect(t.quiet(100)).toBe(true); // a fresh document is quiet, not "100 ms old"
    const a = req("fetch", main);
    const b = req("xhr", main);
    t.started(a);
    t.started(b);
    t.started(req("image", main));
    t.started(req("fetch", {})); // child frame
    t.started({ resourceType: () => "fetch", frame: () => { throw new Error("service worker"); } });
    expect(t.size).toBe(2);
    t.ended(a);
    const endedAt = Date.now();
    expect(t.quiet(100, endedAt + 500)).toBe(false); // b still in flight
    t.ended(b);
    expect(t.quiet(100, Date.now())).toBe(false);
    expect(t.quiet(100, Date.now() + 100)).toBe(true);
  });

  it("forgets the old document's requests on navigation", () => {
    const main = {};
    const t = new RequestTracker(() => main);
    t.started(req("fetch", main));
    t.reset();
    expect(t.size).toBe(0);
  });

  it("installs nothing in the page's own world — the tracker lives in the aux isolated world", () => {
    expect(AUX_WORLD_SOURCE).toContain("MutationObserver");
    expect(AUX_WORLD_SOURCE).not.toMatch(/\.fetch\s*=|prototype\.send\s*=/);
  });
});

describe("executor: waitFor settled", () => {
  const fake = (settles: boolean) => {
    const seen: Condition[] = [];
    const page = {
      identity: { pageId: "p1", targetId: "t", backend: "aux" },
      waitFor: async (c: Condition) => {
        seen.push(c);
        return settles ? { ok: true, timedOut: false } : { ok: false, timedOut: true, detail: "page did not settle" };
      },
    } as unknown as DriverPage;
    return { page, seen };
  };

  it("forwards the condition and succeeds when the page settles", async () => {
    const { page, seen } = fake(true);
    const res = await executeProgram(page, { pageId: "p1", steps: [{ id: "w", op: "waitFor", condition: { kind: "settled", timeoutMs: 300 } }] });
    expect(res.status).toBe("completed");
    expect(seen).toEqual([{ kind: "settled", timeoutMs: 300 }]);
  });

  it("fails the step with condition_timeout when the page never settles", async () => {
    const { page } = fake(false);
    const res = await executeProgram(page, { pageId: "p1", steps: [{ id: "w", op: "waitFor", condition: { kind: "settled" } }] });
    expect(res.status).toBe("failed");
    expect(res.steps[0]?.error?.code).toBe("condition_timeout");
  });
});
