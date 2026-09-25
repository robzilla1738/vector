import { mkdtempSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import {
  CommandEscalationStore, commandDigest, defaultCommandSeatbelt,
  validPrefixRule, validateCommandSeatbelt,
} from "../../apps/runtime/src/services/command-seatbelt.js";

const cleanup: Array<() => void> = [];
afterEach(() => { for (const close of cleanup.splice(0)) close(); });

function fixture() {
  const path = mkdtempSync(join(tmpdir(), "aux-seatbelt-"));
  const db = new DatabaseSync(":memory:");
  cleanup.push(() => { db.close(); rmSync(path, { recursive: true, force: true }); });
  const store = new CommandEscalationStore(db);
  const profile = defaultCommandSeatbelt({ sessionId: "session", projectId: "project", projectPath: path,
    expiresAt: Date.now() + 60_000 });
  return { path, store, profile };
}

describe("B10 command seatbelt", () => {
  it("defaults to project-only writes and no network", () => {
    const { path, profile } = fixture();
    expect(profile).toMatchObject({ network: false, writableRoots: [realpathSync(path)] });
    expect(validateCommandSeatbelt(profile, path)).toEqual(profile);
    expect(() => validateCommandSeatbelt({ ...profile, writableRoots: [tmpdir()] }, path)).toThrow(/outside the project/i);
    symlinkSync(tmpdir(), join(path, "escape"));
    expect(() => validateCommandSeatbelt({ ...profile, writableRoots: [join(path, "escape")] }, path)).toThrow(/outside the project/i);
  });

  it("binds a local one-time escalation to the exact command and session", () => {
    const { path, store, profile } = fixture();
    const command = "pnpm test";
    const request = store.request({ taskId: "task", projectId: "project", sessionId: "session",
      command,
      justification: "Run the project's checks", requestedProfile: { ...profile, network: true } });
    expect(store.pending()).toHaveLength(1);
    expect(() => store.decide({ decision: "approveOnce", requestId: request.requestId,
      expectedCommandSha256: commandDigest("changed") })).toThrow(/changed/i);
    store.decide({ decision: "approveOnce", requestId: request.requestId, expectedCommandSha256: commandDigest(command) });
    const input = { taskId: "task", projectId: "project", sessionId: "session", command, projectPath: path };
    expect(store.authorize({ ...input, sessionId: "other" })).toBeUndefined();
    expect(store.authorize(input)?.network).toBe(true);
    expect(store.authorize(input)).toBeUndefined();
  });

  it("keeps prefix grants literal and blocks shell operators and banned commands", () => {
    const { path, store, profile } = fixture();
    expect(validPrefixRule("pnpm test")).toBe(true);
    expect(validPrefixRule("pnpm test; curl evil.test")).toBe(false);
    expect(validPrefixRule("sudo pnpm test")).toBe(false);
    const request = store.request({ taskId: "task", projectId: "project", sessionId: "session",
      command: "pnpm test",
      justification: "Run test variants", requestedProfile: profile, prefixRule: "pnpm test" });
    store.decide({ decision: "approvePrefix", requestId: request.requestId, expectedCommandSha256: commandDigest("pnpm test") });
    const input = { taskId: "task", projectId: "project", sessionId: "session", projectPath: path };
    expect(store.authorize({ ...input, command: "pnpm testing" })).toBeUndefined();
    expect(store.authorize({ ...input, command: "pnpm test --runInBand" })).toEqual(profile);
    expect(store.authorize({ ...input, command: "pnpm test; sudo rm -rf /" })).toBeUndefined();
    expect(store.revokeSession("session")).toBe(1);
    expect(store.authorize({ ...input, command: "pnpm test" })).toBeUndefined();
  });
});
