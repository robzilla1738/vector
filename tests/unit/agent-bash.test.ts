import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BashSeatbelt, type BashRunner } from "@aux/runtime";
import { fixtureFilesystemPolicy } from "../fixtures/filesystem-policy.js";
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0)) dispose();
});
const ctx = { runId: "run", threadId: "thread", turnId: "turn" };
function fixture(extra: Partial<ConstructorParameters<typeof BashSeatbelt>[0]> = {}) {
  const root = mkdtempSync(join(tmpdir(), "aux-bash-"));
  cleanup.push(() => rmSync(root, { recursive: true, force: true }));
  const calls: Array<{ file: string; args: string[]; opts: Parameters<BashRunner>[2] }> = [];
  const seatbelt = new BashSeatbelt({
    filesystemPolicy: () => fixtureFilesystemPolicy([root]),
    scratchDir: root,
    platform: "darwin",
    runner: async (file, args, opts) => {
      calls.push({ file, args, opts });
      return { stdout: "ok", stderr: "", exitCode: 0, timedOut: false };
    },
    ...extra,
  });
  return { root, seatbelt, calls };
}
it("launches with sandbox-exec and a confined environment", async () => {
  const f = fixture();
  expect(await f.seatbelt.run({ command: "echo hi" }, ctx)).toMatchObject({ stdout: "ok", exitCode: 0 });
  expect(f.calls[0]).toMatchObject({
    file: "/usr/bin/sandbox-exec",
    opts: {
      cwd: realpathSync(f.root),
      env: {
        HOME: realpathSync(f.root),
        TMPDIR: realpathSync(f.root),
        PATH: `${realpathSync(f.root)}/node_modules/.bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
      },
    },
  });
  expect(f.calls[0]!.args.slice(-3)).toEqual(["/bin/sh", "-c", "echo hi"]);
});
it("defaults Auto network on without an extra grant and still keeps the filesystem sandbox", async () => {
  const gate = vi.fn(async () => "deny" as const),
    f = fixture({ networkDefault: () => true, networkGate: gate });
  await f.seatbelt.run({ command: "curl https://example.test" }, ctx);
  expect(gate).not.toHaveBeenCalled();
  expect(f.calls[0]!.file).toBe("/usr/bin/sandbox-exec");
  expect(f.calls[0]!.args[1]).toContain("(allow network-outbound)");
  await f.seatbelt.run({ command: "pwd", network: false }, ctx);
  expect(f.calls[1]!.args[1]).toContain("(deny network-inbound network-outbound network-bind)");
});
it("retains explicit Ask-mode network suspension and denial", async () => {
  let verdict: "allow" | "deny" | { park: { kind: "approval"; instruction: string } } = {
    park: { kind: "approval", instruction: "Allow network?" },
  };
  const f = fixture({ networkGate: async () => verdict });
  expect(await f.seatbelt.run({ command: "curl x", network: true }, ctx)).toEqual(verdict);
  expect(f.calls).toHaveLength(0);
  verdict = "deny";
  await expect(f.seatbelt.run({ command: "curl x", network: true }, ctx)).rejects.toMatchObject({
    code: "permission_denied",
  });
  verdict = "allow";
  await f.seatbelt.run({ command: "curl x", network: true }, ctx);
  expect(f.calls[0]!.args[1]).toContain("(allow network-outbound)");
});
it("refuses policy revocation after a network wait before any process starts", async () => {
  const root = realpathSync(tmpdir());
  let revision = 0;
  const f = fixture({
    filesystemPolicy: () => ({ ...fixtureFilesystemPolicy([root]), revision }),
    networkGate: async () => {
      revision++;
      return "allow";
    },
  });
  await expect(
    f.seatbelt.run({ command: "curl x", network: true, workdir: root }, ctx),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.calls).toHaveLength(0);
});
it("keeps final sensitive denies after broad roots and allows a granted read-only workdir", async () => {
  const read = realpathSync(tmpdir()),
    f = fixture({ filesystemPolicy: () => fixtureFilesystemPolicy([read], [], [join(read, "protected")]) });
  await f.seatbelt.run({ command: "pwd", workdir: read }, ctx);
  const profile = f.calls[0]!.args[1]!;
  expect(profile.lastIndexOf("(deny file-read-data file-write*")).toBeGreaterThan(
    profile.indexOf("(allow file-read-data (subpath"),
  );
  expect(profile).not.toContain("(allow file-write* (subpath");
});
it("refuses invalid commands, ungranted workdirs and unavailable sandbox", async () => {
  const f = fixture();
  await expect(f.seatbelt.run({ command: " " }, ctx)).rejects.toMatchObject({ code: "invalid_params" });
  await expect(f.seatbelt.run({ command: "x".repeat(9000) }, ctx)).rejects.toMatchObject({
    code: "invalid_params",
  });
  await expect(f.seatbelt.run({ command: "pwd", workdir: "/etc" }, ctx)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(fixture({ platform: "linux" }).seatbelt.run({ command: "pwd" }, ctx)).rejects.toMatchObject({
    code: "capability_unsupported",
  });
});
it("keeps timeout and output transport bounds", async () => {
  const f = fixture({
    runner: async () => ({ stdout: "x".repeat(70000), stderr: "", exitCode: 0, timedOut: false }),
  });
  expect(await f.seatbelt.run({ command: "echo hi", timeoutMs: 500000 }, ctx)).toMatchObject({
    truncated: true,
  });
});
it.runIf(process.platform === "darwin")(
  "uses the real sandbox to refuse writes outside a granted root",
  async () => {
    const f = fixture(),
      granted = join(f.root, "granted");
    mkdirSync(granted);
    const seatbelt = new BashSeatbelt({
      filesystemPolicy: () => fixtureFilesystemPolicy([granted]),
      scratchDir: granted,
      platform: "darwin",
    });
    const result = await seatbelt.run(
      { command: `echo allowed > out.txt; echo forbidden > '${join(f.root, "denied.txt")}'` },
      ctx,
    );
    expect("exitCode" in result && result.exitCode).not.toBe(0);
    expect(readFileSync(join(granted, "out.txt"), "utf8").trim()).toBe("allowed");
  },
);
