import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { openablePath } from "../../apps/desktop/main/open-path-policy.js";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach(dir => rmSync(dir, { recursive: true, force: true })));
const temp = () => { const dir = mkdtempSync(join(tmpdir(), "aux-open-")); dirs.push(dir); return dir; };

it("opens documents under an Aux root and nothing else", () => {
  const root = temp(), outside = temp();
  mkdirSync(join(root, "reports"));
  writeFileSync(join(root, "reports", "summary.md"), "ok");
  writeFileSync(join(outside, "secret.txt"), "no");
  writeFileSync(join(root, "run.command"), "echo");
  symlinkSync(join(outside, "secret.txt"), join(root, "link.txt"));
  expect(openablePath(join(root, "reports", "summary.md"), [root])).toMatch(/summary\.md$/);
  expect(openablePath(join(outside, "secret.txt"), [root])).toBeNull();
  expect(openablePath(join(root, "run.command"), [root])).toBeNull();
  expect(openablePath(join(root, "link.txt"), [root])).toBeNull();
  expect(openablePath("relative/path.md", [root])).toBeNull();
  expect(openablePath(join(root, "..", "x"), [root])).toBeNull();
});
