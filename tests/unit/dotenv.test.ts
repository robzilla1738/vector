import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dotEnvCandidates, loadDotEnv, parseDotEnv } from "@vector/runtime";

describe("minimal .env loader", () => {
  it("parses KEY=value with comments, export prefix and quotes", () => {
    const parsed = parseDotEnv([
      "# comment",
      "",
      "AI_GATEWAY_API_KEY=abc123",
      "export VECTOR_PLANNER_MODEL=openai/gpt-5",
      'QUOTED="line1\\nline2 # not a comment"',
      "SINGLE='keep # this'",
      "TRAILING=value # comment",
      "not a valid line",
      "EMPTY=",
    ].join("\n"));
    expect(parsed).toEqual({
      AI_GATEWAY_API_KEY: "abc123",
      VECTOR_PLANNER_MODEL: "openai/gpt-5",
      QUOTED: "line1\nline2 # not a comment",
      SINGLE: "keep # this",
      TRAILING: "value",
      EMPTY: "",
    });
  });

  it("dataDir/.env is consulted before cwd/.env and the real environment always wins", () => {
    const root = mkdtempSync(join(tmpdir(), "vector-dotenv-"));
    const dataDir = join(root, "data");
    const cwd = join(root, "cwd");
    for (const d of [dataDir, cwd]) writeFileSync(join(d + "-marker"), "");
    writeFileSync(join(root, "data.env"), "A=from-data\nB=from-data\n");
    writeFileSync(join(root, "cwd.env"), "B=from-cwd\nC=from-cwd\nD=from-cwd\n");
    try {
      const env = { A: undefined, D: "real" } as NodeJS.ProcessEnv;
      const merged = loadDotEnv(env, [join(root, "data.env"), join(root, "cwd.env"), join(root, "missing.env")]);
      expect(merged.A).toBe("from-data");
      expect(merged.B).toBe("from-data"); // first file wins among files
      expect(merged.C).toBe("from-cwd");
      expect(merged.D).toBe("real"); // process env wins
      expect(env.A).toBeUndefined(); // input not mutated
      const files = dotEnvCandidates({ VECTOR_DATA_DIR: dataDir } as NodeJS.ProcessEnv, cwd);
      expect(files).toEqual([join(dataDir, ".env"), join(cwd, ".env")]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
