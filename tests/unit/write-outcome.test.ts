import { expect, it } from "vitest";
import { DurableWriteLedger, beginConsequentialWrite, settleWrite, writeOutcome } from "@aux/runtime";

const step = (op: string, status: "ok" | "failed" | "skipped", code?: string) => ({ op, status, ...(code ? { error: { code, message: code } } : {}) });

it("classifies a failure before any dispatch as not applied", () => {
  expect(writeOutcome({ status: "failed", steps: [step("click", "failed", "target_ambiguous")] }).outcome).toBe("not_applied");
  expect(writeOutcome({ status: "failed", steps: [step("extract", "ok"), step("fill", "failed", "ref_stale"), step("click", "skipped")] }).outcome).toBe("not_applied");
});

it("keeps a post-dispatch failure uncertain", () => {
  expect(writeOutcome({ status: "failed", steps: [step("click", "failed", "condition_timeout")] }).outcome).toBe("uncertain");
  expect(writeOutcome({ status: "failed", steps: [step("fill", "ok"), step("click", "failed", "target_detached")] }).outcome).toBe("uncertain");
  expect(writeOutcome({ status: "failed", steps: [] }).outcome).toBe("uncertain");
  expect(writeOutcome({ status: "completed", steps: [{ op: "click", status: "ok", receipt: { uncertain: true } }] }).outcome).toBe("uncertain");
});

it("confirms writes that all dispatched when only a later read failed", () => {
  expect(writeOutcome({ status: "failed", steps: [step("click", "ok"), step("waitFor", "failed", "condition_timeout")] }).outcome).toBe("confirmed");
});

it("lets the next write proceed after a pre-dispatch failure", () => {
  const ledger = new DurableWriteLedger();
  const base = { runId: "r", pageId: "p", documentEpoch: 1 };
  const first = beginConsequentialWrite(ledger, { ...base, revision: 1, steps: [{ op: "click", target: "r3" }] });
  settleWrite(ledger, first.intentId, { status: "failed", steps: [step("click", "failed", "target_ambiguous")] });
  expect(beginConsequentialWrite(ledger, { ...base, revision: 2, steps: [{ op: "click", target: "r4" }] }).skip).toBe(false);
  ledger.close();
});
