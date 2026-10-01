import { expect, it } from "vitest";
import { createStartupTrace } from "../host/lib/startup-evidence.mjs";

const owned = { pid: 123, generation: 1, launchKind: "child", exitCode: null, signal: null, spawnError: null, exitStatusAvailable: false };

it("coalesces repeated polls while retaining launch and first/latest elapsed times", () => {
  let clock = 10;
  const trace = createStartupTrace(() => clock);
  for (let index = 1; index <= 1000; index++) {
    clock = 10 + index;
    trace.record("descriptor-poll", { descriptorExists: false });
  }
  expect(trace.snapshot(owned).samples).toEqual([
    { phase: "launch-started", firstElapsedMs: 0, latestElapsedMs: 0, count: 1 },
    { phase: "descriptor-poll", descriptorExists: false, firstElapsedMs: 1, latestElapsedMs: 1000, count: 1000 },
  ]);
});

it("retains distinct peer statuses and only explicitly whitelisted facts", () => {
  const trace = createStartupTrace(() => 0);
  const peer = { ready: false, serviceMatches: true, nonceMatches: true, pidMatches: true, instanceMatches: true, startedAtMatches: true, schemaMatches: true };
  trace.record("peer-response", { ...peer, status: 503, token: "secret-token", nonce: "secret-nonce", session: "secret-session" });
  trace.record("peer-response", { ...peer, status: 200, ready: true });
  const snapshot = trace.snapshot({ ...owned, spawnError: new Error("secret-environment"), environment: "secret-value" });
  expect(snapshot.samples.map(sample => "status" in sample ? sample.status : undefined)).toEqual([undefined, 503, 200]);
  expect(snapshot.process).toEqual({ pid: 123, generation: 1, launchKind: "child", exitCode: null, signal: null, spawnErrorPresent: true, exitStatusAvailable: false });
  expect(JSON.stringify(snapshot)).not.toMatch(/secret|token|environment|session|"nonce"/);
});

it("keeps launch plus at most fifteen recent transitions and returns independent snapshots", () => {
  let clock = 0;
  const trace = createStartupTrace(() => clock);
  for (let index = 1; index <= 40; index++) {
    clock = index;
    trace.record("descriptor-poll", { descriptorExists: index % 2 === 0 });
  }
  const snapshot = trace.snapshot(owned);
  expect(snapshot.samples).toHaveLength(16);
  expect(snapshot.samples[0]!.phase).toBe("launch-started");
  expect(snapshot.samples[1]!.firstElapsedMs).toBe(26);
  expect(snapshot.samples.at(-1)!.latestElapsedMs).toBe(40);
  snapshot.samples[0]!.count = 99;
  expect(trace.snapshot(owned).samples[0]!.count).toBe(1);
  expect(snapshot.phase).toBe("before-owned-cleanup");
  expect(snapshot.process).toEqual({ pid: 123, generation: 1, launchKind: "child", exitCode: null, signal: null, spawnErrorPresent: false, exitStatusAvailable: false });
});

it("refuses unknown phases, malformed approved fields and nonmonotonic clock samples", () => {
  let clock = 1;
  const trace = createStartupTrace(() => clock);
  expect(() => trace.record("arbitrary", { token: "secret" })).toThrow("Unknown startup phase");
  expect(() => trace.record("descriptor-poll", { descriptorExists: "secret" })).toThrow("Invalid startup fact");
  clock = 0;
  expect(() => trace.record("descriptor-poll", { descriptorExists: true })).toThrow("monotonic");
});
