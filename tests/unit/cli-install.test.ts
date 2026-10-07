import { afterEach, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installCli } from "@aux/runtime";

const homes: string[] = [];
afterEach(() => homes.splice(0).forEach((home) => rmSync(home, { recursive: true, force: true })));
function fixture() {
  const home = mkdtempSync(join(tmpdir(), "aux-cli-'quoted-"));
  homes.push(home);
  const entry = join(home, "cli.js");
  writeFileSync(entry, "process.stdout.write(JSON.stringify(process.argv.slice(2)))");
  return { home, entry, node: process.execPath, current: async () => {} };
}

it("installs the actual bundled CLI with literal arguments and preserves unrelated commands", async () => {
  const options = fixture();
  const result = await installCli({ ...options, path: join(options.home, ".local", "bin") });
  expect(result.pathConfigured).toBe(true);
  expect(statSync(result.path).mode & 0o777).toBe(0o755);
  expect(
    JSON.parse(
      execFileSync(result.path, ["open", "https://example.org/$literal", "--profile", "My Profile"], {
        encoding: "utf8",
      }),
    ),
  ).toEqual(["open", "https://example.org/$literal", "--profile", "My Profile"]);
  await installCli(options);
  writeFileSync(result.path, "human command");
  await expect(installCli(options)).rejects.toMatchObject({ code: "conflict" });
  expect(readFileSync(result.path, "utf8")).toBe("human command");
});

it("rolls back retired installation but retains a concurrent human edit and refuses symlink destinations", async () => {
  const options = fixture();
  const path = join(options.home, ".local", "bin", "aux");
  let calls = 0;
  await expect(
    installCli({
      ...options,
      current: async () => {
        if (++calls === 3) throw new Error("retired");
      },
    }),
  ).rejects.toThrow("retired");
  expect(() => statSync(path)).toThrow();
  calls = 0;
  await expect(
    installCli({
      ...options,
      current: async () => {
        if (++calls === 3) {
          writeFileSync(path, "concurrent human edit");
          throw new Error("retired");
        }
      },
    }),
  ).rejects.toThrow("retired");
  expect(readFileSync(path, "utf8")).toBe("concurrent human edit");
  rmSync(path);
  symlinkSync(options.entry, path);
  await expect(installCli(options)).rejects.toMatchObject({ code: "permission_denied" });
  expect(readFileSync(options.entry, "utf8")).toContain("process.stdout");
});
