import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { developmentAcceptanceStages } from "../../apps/runtime/src/api/development-acceptance.js";

it("accepts one preview only in a matching disposable native Profile", () => {
  const root = mkdtempSync("/tmp/aux-native-journey-");
  const dataDir = join(root, "profile", "Default", "Aux Runtime Data");
  const token = randomBytes(32).toString("hex");
  const sourceCommit = "a".repeat(40);
  const stages = { electronMigration: "preview", memory: "preview", spaces: "preview" };
  try {
    mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    writeFileSync(join(dataDir, "development-acceptance.json"), JSON.stringify({ version: 1,
      sourceCommit, tokenHash: createHash("sha256").update(token).digest("hex"),
      features: ["electronMigration"], createdAt: Date.now() }), { mode: 0o600 });
    expect(developmentAcceptanceStages(stages, dataDir, sourceCommit)).toBe(stages);
    expect(developmentAcceptanceStages(stages, dataDir, sourceCommit, token)).toEqual({
      electronMigration: "on", memory: "preview", spaces: "preview",
    });
    writeFileSync(join(dataDir, "development-acceptance.json"), JSON.stringify({ version: 1,
      sourceCommit, tokenHash: createHash("sha256").update(token).digest("hex"),
      features: ["memory", "spaces"], createdAt: Date.now() }), { mode: 0o600 });
    expect(developmentAcceptanceStages(stages, dataDir, sourceCommit, token)).toEqual({
      electronMigration: "preview", memory: "on", spaces: "on",
    });
    expect(() => developmentAcceptanceStages(stages, dataDir, "b".repeat(40), token)).toThrow(/does not match/);
    expect(() => developmentAcceptanceStages(stages, dataDir, sourceCommit, "0".repeat(64))).toThrow(/does not match/);
    const unsafe = join(root, "owner-profile", "Default", "Aux Runtime Data");
    mkdirSync(unsafe, { recursive: true });
    expect(() => developmentAcceptanceStages(stages, unsafe, sourceCommit, token)).toThrow(/disposable/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
