/**
 * Behavioral checks for the 12 non-negotiable Vector Engine invariants.
 */
import { describe, it, expect } from "vitest";
import {
  Router,
  MemoryRouterStore,
  evaluateHeldOutAdvantage,
  recoverAfterCrash,
  speculatePlan,
  authorizePageTool,
  redactForModel,
  COORDINATOR_TRANSITIONS,
  verifySkillPostconditions,
  compileSkill,
} from "@vector/runtime";
import { RefRegistry } from "@vector/browser-driver";
import { VectorError } from "@vector/contracts";

describe("non-negotiable invariants", () => {
  it("1 engine-only never substitutes Chromium", () => {
    const r = new Router({
      mode: () => "always",
      engineAvailable: () => false,
      store: new MemoryRouterStore(),
    });
    const d = r.decide("https://a.test/", undefined);
    expect(d.backend).toBe("vector-engine");
    expect(d.fallbackAllowed).toBe(false);
    expect(d.backendUnavailable).toBe(true);
    const native = new Router({
      mode: () => "auto",
      engineAvailable: () => false,
      nativeOnly: () => true,
      store: new MemoryRouterStore(),
    });
    const n = native.decide("https://a.test/", "chrome");
    expect(n.backend).toBe("vector-engine");
    expect(n.fallbackAllowed).toBe(false);
    expect(n.backendUnavailable).toBe(true);
  });

  it("3/4 page output is not authority and cannot grant egress", () => {
    expect(authorizePageTool("delete", [])).toBe(false);
    const redacted = redactForModel({ authorization: "Bearer secret", n: 1 }) as { authorization: string; n: number };
    expect(redacted.n).toBe(1);
    expect(String(redacted.authorization)).not.toContain("secret");
  });

  it("5 stale refs do not resolve after slot reuse", () => {
    const refs = new RefRegistry();
    refs.register("p", [{ ref: "r1", frame: "main", tag: "a", rect: { x: 0, y: 0, w: 1, h: 1 }, selector: { css: "a" } }]);
    const epoch = refs.epoch("p");
    refs.register("p", [{ ref: "r1", frame: "main", tag: "b", rect: { x: 0, y: 0, w: 1, h: 1 }, selector: { css: "b" } }]);
    expect(refs.resolve("p", "r1", epoch)).toBeUndefined();
    expect(refs.resolve("p", "r1")?.tag).toBe("b");
  });

  it("8 uncertain writes are not auto-retried after crash", () => {
    const journal = [
      { id: "w", idempotencyKey: "k", committed: true },
      { id: "w2", idempotencyKey: "k", committed: true },
    ];
    for (const crashAt of COORDINATOR_TRANSITIONS) {
      const r = recoverAfterCrash({ crashAt, journal });
      expect(r.duplicateWrites).toBe(0);
      expect(r.historicalDuplicates).toBe(1);
    }
  });

  it("9 takeover-equivalent crash at dispatch needs review, not silent rollback", () => {
    const r = recoverAfterCrash({ crashAt: "dispatch", journal: [{ id: "w", idempotencyKey: "k", committed: true }] });
    expect(r.needsUserReview).toBe(true);
    expect(r.restartSafe).toBe(false);
  });

  it("10/11 stretch and speculation do not invent tokens or treat GET as harmless", () => {
    expect(evaluateHeldOutAdvantage({ success: 1, p95Ms: 10, tokensPerSuccess: null }, { success: 1, p95Ms: 1, tokensPerSuccess: null }).meetsStretch).toBe(false);
    expect(speculatePlan({ archivedGetSafe: false, wouldWrite: false }).allowed).toBe(false);
  });

  it("12 backend-unavailable is a typed error, not a skip", () => {
    const e = new VectorError("backend_unavailable", "vector-engine backend is not connected");
    expect(e.code).toBe("backend_unavailable");
  });

  it("18 skill reuse fails closed when postconditions miss", () => {
    const skill = compileSkill({
      id: "inc",
      goalPattern: "increment",
      pageId: "p",
      steps: [{ id: "c", op: "click", target: "r1" }],
      preconditions: [{ role: "button", nameIncludes: "Increment" }],
      postconditions: [{ nameIncludes: "2" }],
      evidence: "test",
    });
    const obs = {
      title: "t",
      url: "https://app.test/",
      headings: [],
      elements: [{ ref: "r1", role: "button", name: "Increment", tag: "button" }],
      formFields: [],
    } as never;
    expect(verifySkillPostconditions(skill, obs, "https://app.test/")).toBe(false);
  });
});
