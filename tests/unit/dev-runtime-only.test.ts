import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, expect, it } from "vitest";
import { assertCompiledRuntimeAbi } from "../../scripts/lib/compiled-runtime-abi.mjs";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});
function fixture(section = "__cstring") {
  const directory = mkdtempSync(join(tmpdir(), "aux-runtime-abi-"));
  directories.push(directory);
  const app = join(directory, "Aux.app"),
    hash = "a".repeat(64);
  const framework = join(app, "Contents/Frameworks/Aux Framework.framework/Versions/Current");
  mkdirSync(framework, { recursive: true });
  const header = join(directory, "aux_host_methods.h");
  writeFileSync(header, `inline constexpr std::string_view kManifestHash = "${hash}";`);
  // One real LC_SEGMENT_64/section_64 layout, with the hash in its linked string bytes.
  const bytes = Buffer.alloc(32 + 152 + 66);
  bytes.writeUInt32LE(0xfeedfacf, 0);
  bytes.writeUInt32LE(0x0100000c, 4);
  bytes.writeUInt32LE(1, 16);
  bytes.writeUInt32LE(152, 20);
  bytes.writeUInt32LE(0x19, 32);
  bytes.writeUInt32LE(152, 36);
  bytes.writeUInt32LE(1, 96);
  bytes.write(section, 104);
  bytes.write("__TEXT", 120);
  bytes.writeBigUInt64LE(66n, 144);
  bytes.writeUInt32LE(184, 152);
  bytes.write(hash, 185);
  const binary = join(framework, "Aux Framework");
  writeFileSync(binary, bytes);
  return { app, header, binary, directory };
}
it("admits the actual linked ABI and rejects a stale or non-string-section copy", () => {
  const current = fixture();
  expect(() => assertCompiledRuntimeAbi(current.app, current.header)).not.toThrow();
  writeFileSync(current.header, `kManifestHash = "${"b".repeat(64)}";`);
  expect(() => assertCompiledRuntimeAbi(current.app, current.header)).toThrow(/without --runtime-only/);
  const debugCopy = fixture("__debug_info");
  expect(() => assertCompiledRuntimeAbi(debugCopy.app, debugCopy.header)).toThrow(/matching host contracts/);
  writeFileSync(current.binary, Buffer.alloc(8));
  expect(() => assertCompiledRuntimeAbi(current.app, current.header)).toThrow(/rebuild native and renderer/);
});
it("requires a disposable Profile before acquiring a native lock", () => {
  const { directory } = fixture();
  const result = spawnSync(process.execPath, [resolve("scripts/dev.mjs"), "--runtime-only"], {
    env: { ...process.env, AUX_CHROMIUM_SRC: directory },
    encoding: "utf8",
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("with --temp-profile");
  expect(existsSync(join(directory, "out", ".aux-dev-lock"))).toBe(false);
});
