import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BashSeatbelt, type BashRunner } from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const fn of cleanup.splice(0).reverse()) fn();
});

const CTX = { runId: "run-1", threadId: "chat-1", turnId: "run-1" };

function fixture(extra: Partial<ConstructorParameters<typeof BashSeatbelt>[0]> = {}) {
  const root = mkdtempSync(join(tmpdir(), "aux-bash-"));
  cleanup.push(() => rmSync(root, { recursive: true, force: true }));
  const calls: {
    file: string;
    args: string[];
    opts: { cwd: string; env: Record<string, string>; timeoutMs: number };
  }[] = [];
  const runner: BashRunner = async (file, args, opts) => {
    calls.push({ file, args, opts });
    return { stdout: "ok\n", stderr: "", exitCode: 0, timedOut: false };
  };
  const seatbelt = new BashSeatbelt({
    writableRoots: () => [root],
    scratchDir: join(root, "tmp"),
    runner,
    ...extra,
  });
  return { root, seatbelt, calls };
}

describe("BashSeatbelt (S5/06-X)", () => {
  it("runs the command via sandbox-exec with a confined env", async () => {
    const { root, seatbelt, calls } = fixture();
    const result = await seatbelt.run({ command: "echo hi" }, CTX);
    expect(result).toMatchObject({ stdout: "ok\n", exitCode: 0, timedOut: false, truncated: false });
    expect(calls).toHaveLength(1);
    const { file, args, opts } = calls[0]!;
    expect(file).toBe("/usr/bin/sandbox-exec");
    expect(args[0]).toBe("-p");
    expect(args.slice(-2)).toEqual(["-c", "echo hi"]);
    // SBPL matches real paths — the cwd is canonicalized (/var → /private/var on macOS).
    expect(opts.cwd).toBe(realpathSync(root));
    expect(opts.env.TMPDIR).toBe(join(root, "tmp"));
    expect(opts.env.HOME).toBe(join(root, "tmp"));
    expect(opts.env.PATH).toBe("/usr/bin:/bin:/usr/sbin:/sbin");
    expect(opts.timeoutMs).toBe(30_000);
  });

  it("profile denies the network and confines writes to the roots", async () => {
    const { root, seatbelt, calls } = fixture();
    await seatbelt.run({ command: "ls" }, CTX);
    const profile = calls[0]!.args[1]!;
    expect(profile).toContain("(deny default)");
    expect(profile).toContain("(deny network-inbound network-outbound network-bind)");
    expect(profile).not.toContain("network-outbound)");
    expect(profile).toContain("(deny file-read-data");
    expect(profile).toContain('(subpath "/Users")');
    expect(profile).toContain(`(allow file-write* (subpath "${realpathSync(root)}")`);
    expect(profile).toContain("(allow file-read-metadata)");
    // The root is re-allowed for reads AFTER the sensitive-path deny.
    expect(profile).toContain(`(allow file-read-data (subpath "${realpathSync(root)}")`);
  });

  it("network:true consults the gate and parks/denies transparently", async () => {
    let verdict: "allow" | "deny" | { park: { kind: "approval"; instruction: string } } = "allow";
    const { seatbelt, calls } = fixture({ networkGate: async () => verdict });
    verdict = { park: { kind: "approval", instruction: "allow outbound?" } };
    expect(await seatbelt.run({ command: "curl x", network: true }, CTX)).toEqual({ park: verdict.park });
    verdict = "deny";
    await expect(seatbelt.run({ command: "curl x", network: true }, CTX)).rejects.toThrow(/denied/);
    verdict = "allow";
    await seatbelt.run({ command: "curl x", network: true }, CTX);
    expect(calls.at(-1)!.args[1]).toContain("(allow network-outbound)");
    expect(calls.at(-1)!.args[1]).not.toContain("(deny network");
  });

  it("network:true is unsupported without a gate", async () => {
    const { seatbelt } = fixture();
    await expect(seatbelt.run({ command: "curl x", network: true }, CTX)).rejects.toThrow(/network is off/);
  });

  it("rejects empty commands, oversized commands and out-of-root workdirs", async () => {
    const { seatbelt } = fixture();
    await expect(seatbelt.run({ command: "   " }, CTX)).rejects.toThrow(/1 to 8192/);
    await expect(seatbelt.run({ command: "x".repeat(9_000) }, CTX)).rejects.toThrow(/8192/);
    await expect(seatbelt.run({ command: "ls", workdir: "/etc" }, CTX)).rejects.toThrow(/session roots/);
  });

  it("requires at least one writable root", async () => {
    const seatbelt = new BashSeatbelt({
      writableRoots: () => [],
      scratchDir: "/tmp/x",
      runner: async () => ({ stdout: "", stderr: "", exitCode: 0, timedOut: false }),
    });
    await expect(seatbelt.run({ command: "ls" }, CTX)).rejects.toThrow(/no writable session roots/);
  });

  it("fails honestly without the macOS sandbox", async () => {
    const { seatbelt } = fixture({ platform: "linux" });
    await expect(seatbelt.run({ command: "ls" }, CTX)).rejects.toThrow(/sandbox-exec/);
  });

  it("extraDenyRead lands inside the deny clause before the root re-allows", async () => {
    const { root, calls } = fixture({ extraDenyRead: () => ["/private/var/db/dslocal"] });
    const seatbelt = new BashSeatbelt({
      writableRoots: () => [root],
      scratchDir: join(root, "tmp"),
      extraDenyRead: () => ["/private/var/db/dslocal"],
      runner: async (_f, args, opts) => {
        calls.push({ file: _f, args, opts });
        return { stdout: "", stderr: "", exitCode: 0, timedOut: false };
      },
    });
    await seatbelt.run({ command: "ls" }, CTX);
    const profile = calls.at(-1)!.args[1]!;
    expect(profile).toContain('(subpath "/private/var/db/dslocal")');
    expect(profile.indexOf("(deny file-read-data")).toBeLessThan(
      profile.indexOf(`(subpath "${realpathSync(root)}")`),
    );
  });

  it.skipIf(process.platform !== "darwin")(
    "real seatbelt: sh runs, writes confine to roots, /Users unreadable",
    async () => {
      const { root } = fixture();
      const seatbelt = new BashSeatbelt({
        writableRoots: () => [root],
        scratchDir: join(root, "tmp"),
        extraDenyRead: () => [],
      });
      const probe = await seatbelt.run(
        {
          command:
            "echo alive && echo w > out.txt && cat out.txt && (cat /Users >/dev/null 2>&1 && echo USERS-READABLE || echo USERS-DENIED) && (echo x > /tmp/aux-bash-evil.txt 2>/dev/null && echo EVIL-WROTE || echo WRITE-DENIED)",
        },
        CTX,
      );
      if ("park" in probe) throw new Error("unexpected park");
      expect(probe.exitCode).toBe(0);
      expect(probe.stdout).toContain("alive");
      expect(probe.stdout).toContain("USERS-DENIED");
      expect(probe.stdout).toContain("WRITE-DENIED");
      expect(probe.stderr).not.toContain("Operation not permitted\nx");
      expect(readFileSync(join(root, "out.txt"), "utf8").trim()).toBe("w");
    },
  );

  it("clamps timeout and clips oversized output", async () => {
    const big = "y".repeat(70 * 1024);
    const calls: { opts: { timeoutMs: number } }[] = [];
    const { seatbelt } = fixture({
      runner: async (_f, _a, opts) => {
        calls.push({ opts });
        return { stdout: big, stderr: "", exitCode: 0, timedOut: false };
      },
    });
    const result = await seatbelt.run({ command: "cat big", timeoutMs: 500_000 }, CTX);
    expect(calls[0]!.opts.timeoutMs).toBe(120_000);
    expect("park" in result ? undefined : result.truncated).toBe(true);
    expect("park" in result ? "" : result.stdout.length).toBeLessThanOrEqual(64 * 1024);
  });
});
