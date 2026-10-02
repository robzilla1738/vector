import { describe, expect, it, vi } from "vitest";
import { boundedJson, withFailureEvidence } from "../host/lib/journey-diagnostics.mjs";

describe("real journey failure evidence", () => {
  it("retains actual tool replies and run transcript while rethrowing the original failure", async () => {
    const failure = new Error("Original loop budget assertion");
    const diagnostic = vi.fn<(...args: any[]) => void>();
    const calls = Array.from({ length: 10 }, (_, index) => ({ model: "fixture-model", stream: true,
      messages: [{ role: "user", content: "Unrelated prompt" }, { role: "tool", tool_call_id: `tool-${index}`, content: { error: "Actual producer refusal" } }] }));
    const transcript = { run: { status: "failed" }, transcript: { messages: [{ role: "tool", text: "Actual producer refusal" }] } };
    await expect(withFailureEvidence({ diagnostic, model: { calls, errors: [] } }, "first-chat-tool-open",
      async () => { throw failure; }, async () => transcript)).rejects.toBe(failure);
    const evidence = diagnostic.mock.calls[0]![1];
    expect(evidence.calls).toHaveLength(2);
    expect(evidence.calls[1].tools[0].tool_call_id).toBe("tool-9");
    expect(evidence.calls[1].tools[0].content.json).toContain("Actual producer refusal");
    expect(JSON.parse(evidence.actual.json)).toEqual(transcript);
    expect(JSON.stringify(evidence)).not.toContain("Unrelated prompt");
  });
  it("bounds transcript bytes and preserves failure when snapshot or evidence storage fails", async () => {
    const bounded = boundedJson({ text: "界".repeat(40_000) });
    expect(bounded.truncated).toBe(true);
    expect(Buffer.byteLength(bounded.json)).toBeLessThanOrEqual(16387);
    const failure = new Error("Original rename timeout");
    const diagnostic = vi.fn<(...args: any[]) => void>(() => { throw new Error("Evidence disk failure"); });
    await expect(withFailureEvidence({ diagnostic }, "download-rename", async () => { throw failure; },
      async () => { throw new Error("Actual RPC shutdown"); })).rejects.toBe(failure);
    expect(diagnostic.mock.calls[0]![1].actual.error).toBe("Actual RPC shutdown");
  });
  it("does not add observations or diagnostics to a passing journey action", async () => {
    const diagnostic = vi.fn(), snapshot = vi.fn();
    expect(await withFailureEvidence({ diagnostic }, "passing-action", async () => ({ real: "observations" }), snapshot)).toEqual({ real: "observations" });
    expect(snapshot).not.toHaveBeenCalled();
    expect(diagnostic).not.toHaveBeenCalled();
  });
});
