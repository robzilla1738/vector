import { describe, it, expect } from "vitest";
import { executeProgram } from "@vector/runtime";
import { READINESS_INIT_SCRIPT, READINESS_GLOBAL, POST_NAVIGATION_SETTLE_MS } from "@vector/browser-driver";
import type { DriverPage } from "@vector/browser-driver";
import type { Condition } from "@vector/contracts";

describe("readiness init script", () => {
  it("is self-contained, idempotent, and wraps fetch/XHR into an in-flight counter", async () => {
    // run the serialized script in a sandbox standing in for a document
    const calls: string[] = [];
    const sandbox: Record<string, unknown> = {
      performance: { now: () => Date.now() },
      setTimeout,
      Promise,
      MutationObserver: class {
        observe() {
          calls.push("observe");
        }
      },
      document: { documentElement: {} },
      fetch: () => {
        calls.push("fetch");
        return new Promise<string>((r) => setTimeout(() => r("ok"), 10));
      },
      XMLHttpRequest: class {
        addEventListener(ev: string, cb: () => void) {
          setTimeout(cb, 5);
        }
        send() {
          calls.push("send");
        }
      },
    };
    sandbox.globalThis = sandbox;
    const run = new Function("globalThis", `with (globalThis) { ${READINESS_INIT_SCRIPT} }`) as (g: unknown) => void;
    run(sandbox);
    run(sandbox); // second install is a no-op
    const st = sandbox[READINESS_GLOBAL] as { inflight: number; requests: number; lastMutation: number | null };
    expect(st).toBeTruthy();
    expect(calls).toContain("observe");
    expect(st.lastMutation).toBeNull(); // "never" — a fresh document is quiet, not "100 ms old"

    const before = 0;
    await new Promise((r) => setTimeout(r, 2));
    const p = (sandbox.fetch as () => Promise<string>)();
    const xhr = new (sandbox.XMLHttpRequest as new () => { send(): void })();
    xhr.send();
    expect(st.inflight).toBe(2);
    expect(st.requests).toBe(2);
    await expect(p).resolves.toBe("ok");
    await new Promise((r) => setTimeout(r, 15));
    expect(st.inflight).toBe(0);
    expect(st.lastMutation).not.toBeNull();
    expect(st.lastMutation!).toBeGreaterThanOrEqual(before);
    expect(calls.filter((c) => c === "fetch")).toHaveLength(1); // the original fetch was called exactly once
  });

  it("bounds the implicit post-navigation wait at 500 ms", () => {
    expect(POST_NAVIGATION_SETTLE_MS).toBeLessThanOrEqual(500);
  });
});

describe("executor: waitFor settled", () => {
  const fake = (settles: boolean) => {
    const seen: Condition[] = [];
    const page = {
      identity: { pageId: "p1", targetId: "t", backend: "vector" },
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
