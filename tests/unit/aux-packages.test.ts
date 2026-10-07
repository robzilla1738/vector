import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { AuxPackageManifestSchema } from "@aux/contracts";
import { loadAuxPackage, auxSkillInstructions } from "../../apps/runtime/src/services/aux-packages.js";
import {
  resolveAgentProfile,
  profileAllowsTool,
  narrowProfileLimit,
  narrowCostLimit,
} from "../../apps/runtime/src/services/agent-profiles.js";

describe("Aux packages and profiles", () => {
  it("rejects executable package metadata and escaping skill paths", () => {
    expect(
      AuxPackageManifestSchema.safeParse({
        schemaVersion: 1,
        name: "example",
        version: "1.0.0",
        install: "sh run",
      }).success,
    ).toBe(false);
    expect(
      AuxPackageManifestSchema.safeParse({
        schemaVersion: 1,
        name: "example",
        version: "1.0.0",
        skills: ["../SKILL.md"],
      }).success,
    ).toBe(false);
  });
  it("pins imported skills and rejects unregistered workflow tools", async () => {
    const root = await mkdtemp(join(tmpdir(), "aux-package-"));
    try {
      await mkdir(join(root, "skills"));
      await writeFile(
        join(root, "skills/SKILL.md"),
        "---\nname: Example\ndescription: Demonstration\nallowed-tools: bash\n---\n\nRead the relevant file.",
      );
      await writeFile(
        join(root, "aux.package.json"),
        JSON.stringify({ schemaVersion: 1, name: "example", version: "1.0.0", skills: ["skills/SKILL.md"] }),
      );
      const snapshot = await loadAuxPackage(root, new Set(["read_file"]));
      await writeFile(join(root, "skills/SKILL.md"), "changed");
      expect(auxSkillInstructions([snapshot], "Example")).toBe("Read the relevant file.");
      expect(snapshot.warnings).toEqual(["skills/SKILL.md: unsupported metadata allowed-tools"]);
      expect(snapshot.digest).toMatch(/^[a-f0-9]{64}$/);
      await writeFile(
        join(root, "aux.package.json"),
        JSON.stringify({
          schemaVersion: 1,
          name: "example",
          version: "1.0.0",
          workflows: { unsafe: [{ tool: "foreign_agent", input: {} }] },
        }),
      );
      await expect(loadAuxPackage(root, new Set(["read_file"]))).rejects.toThrow("Unknown Aux workflow tool");
      await writeFile(
        join(root, "aux.package.json"),
        JSON.stringify({ schemaVersion: 1, name: "example", version: "1.0.0", skills: ["linked.md"] }),
      );
      await symlink(join(root, "skills/SKILL.md"), join(root, "linked.md"));
      await expect(loadAuxPackage(root, new Set())).rejects.toThrow("bounded regular files");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
  it("declares a coder subset and retains read-only profiles", () => {
    const coder = resolveAgentProfile("coder");
    expect(coder.workspace).toBe("isolated");
    expect(resolveAgentProfile("default").workspace).toBe("shared");
    expect(profileAllowsTool(coder, "apply_changes")).toBe(true);
    expect(profileAllowsTool(coder, "act")).toBe(false);
    expect(profileAllowsTool(coder, "reconcile_file")).toBe(true);
    expect(profileAllowsTool(coder, "package_skill")).toBe(true);
    expect(narrowProfileLimit(5, 20)).toBe(5);
    expect(narrowProfileLimit(0, 20)).toBe(20);
    expect(narrowCostLimit(0, 20)).toBe(0);
    expect(narrowCostLimit(20, 0)).toBe(0);
    expect(profileAllowsTool(resolveAgentProfile("read_only"), "bash")).toBe(false);
  });
});
