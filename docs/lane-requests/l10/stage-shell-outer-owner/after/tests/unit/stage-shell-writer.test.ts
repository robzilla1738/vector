import * as fs from "node:fs";
import * as paths from "node:path";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import { acquireNativeSlot, assertNativeSlotOwned } from "../../scripts/native-slot.mjs";

const script = fs.readFileSync(new URL("../../chromium/stage-shell.mjs", import.meta.url), "utf8");
const body = script.replace(/^import .*;\n/gm, "").replaceAll("import.meta.dirname", "fixtureChromium");
const sha = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");
function seed(root: string) {
  fs.mkdirSync(paths.join(root, "assets"), { recursive: true });
  const files = {
    "assets/index-test.js": "window.auxChromiumHost = true;",
    "index.html": '<meta http-equiv="Content-Security-Policy" content="object-src &#39;self&#39;"><script type="module" src="/aux_host_bootstrap.js"></script><script type="module" src="/assets/index-test.js"></script>',
  };
  const entries = Object.entries(files).map(([path, data]) => { fs.writeFileSync(paths.join(root, path), data); return { path, bytes: Buffer.byteLength(data), sha256: sha(data) }; });
  const manifest = { kind: "aux-webui-shell-v1", files: entries, sha256: sha(entries.map(({ path, bytes, sha256 }) => `${path}\t${bytes}\t${sha256}\n`).join("")) };
  fs.writeFileSync(paths.join(root, "manifest.json"), JSON.stringify(manifest));
  return manifest;
}
function run(root: string, mode: string, token: string | undefined, onCopy?: () => void, onRename?: () => void, expectedReceipt?: string) {
  const logs: string[] = [], mutations: string[] = [];
  const mutate = <A extends unknown[], R>(name: string, action: (...args: A) => R) => (...args: A) => { mutations.push(name); return action(...args); };
  const pinned = paths.join(root, "pinned"), output = paths.join(root, "output");
  const receipt = expectedReceipt ?? (token ? JSON.stringify(assertNativeSlotOwned({ path: paths.join(root, "slot"), token })) : undefined);
  const context = {
    ...paths, createHash, fixtureChromium: paths.join(root, "chromium"), Buffer,
    process: { pid: process.pid, argv: ["node", "stage-shell.mjs", mode, output], env: { AUX_SHELL_PIN_DIR: pinned, AUX_CHROMIUM_SRC: paths.join(root, "source"), HOME: root, AUX_NATIVE_SLOT_EXPECTED_OWNER: receipt } },
    console: { log: (line: string) => logs.push(line) },
    ...Object.fromEntries(["existsSync", "readFileSync", "readdirSync", "statSync"].map(name => [name, fs[name as "existsSync"]])),
    mkdirSync: mutate("mkdir", fs.mkdirSync), rmSync: mutate("remove", fs.rmSync), writeFileSync: mutate("write", fs.writeFileSync),
    cpSync: mutate("copy", (...args: Parameters<typeof fs.cpSync>) => { fs.cpSync(...args); onCopy?.(); }),
    renameSync: mutate("rename", (...args: Parameters<typeof fs.renameSync>) => { fs.renameSync(...args); onRename?.(); }),
    assertNativeSlotOwned: (options: { expectedOwner?: NonNullable<Parameters<typeof assertNativeSlotOwned>[0]>["expectedOwner"] } = {}) => assertNativeSlotOwned({ path: paths.join(root, "slot"), token, ...options }),
  };
  return { execute: () => runInNewContext(body, context), logs, mutations, output };
}
it("installs only original verified bytes under a captured temp owner", async () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-writer-"));
  try {
    const manifest = seed(paths.join(root, "pinned")); const slot = await acquireNativeSlot({ path: paths.join(root, "slot") });
    const trial = run(root, "install", slot.token); trial.execute();
    expect(JSON.parse(fs.readFileSync(paths.join(trial.output, "manifest.json"), "utf8"))).toEqual(manifest);
    expect(trial.logs).toHaveLength(1); expect(trial.logs[0]).toContain("Installed 2 verified WebUI assets"); slot.release();
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
it("refuses missing original ownership before any install mutation", () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-writer-"));
  try { seed(paths.join(root, "pinned")); const trial = run(root, "install", undefined); expect(trial.execute).toThrow(); expect(trial.mutations).toEqual([]); expect(trial.logs).toEqual([]); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
});
it("refuses a replaced original owner before later copy or destination publication", async () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-writer-"));
  try {
    seed(paths.join(root, "pinned")); const slot = await acquireNativeSlot({ path: paths.join(root, "slot") });
    fs.mkdirSync(paths.join(root, "output")); fs.writeFileSync(paths.join(root, "output", "original"), "unchanged");
    let copied = false; const trial = run(root, "install", slot.token, () => {
      if (copied) return; copied = true;
      const owner = paths.join(root, "slot", "owner.json"); fs.renameSync(owner, paths.join(root, "retained-owner")); fs.copyFileSync(paths.join(root, "retained-owner"), owner);
    });
    expect(trial.execute).toThrow("Native writer does not own the original live slot"); expect(trial.mutations.filter(name => name === "copy")).toHaveLength(1);
    expect(fs.readFileSync(paths.join(root, "output", "original"), "utf8")).toBe("unchanged"); expect(trial.logs).toEqual([]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
it("requires the same owner before reporting install success after final rename", async () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-writer-"));
  try {
    seed(paths.join(root, "pinned")); const slot = await acquireNativeSlot({ path: paths.join(root, "slot") });
    const trial = run(root, "install", slot.token, undefined, () => fs.writeFileSync(paths.join(root, "slot", "quarantine.json"), "retained refusal"));
    expect(trial.execute).toThrow("Native writer does not own the original live slot"); expect(trial.logs).toEqual([]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
it("keeps original capture and verify independent of a native writer slot", () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-capture-"));
  try {
    const dist = paths.join(root, "apps", "shell", "dist"); seed(dist);
    fs.mkdirSync(paths.join(dist, ".vite")); fs.writeFileSync(paths.join(dist, ".vite", "manifest.json"), "{}");
    fs.mkdirSync(paths.join(root, "apps", "shell", "src"), { recursive: true });
    const capture = run(root, "capture", undefined); capture.execute(); expect(capture.logs[0]).toContain("Pinned 2 WebUI assets");
    const verify = run(root, "verify", undefined); verify.execute(); expect(verify.mutations).toEqual([]); expect(verify.logs[0]).toContain("Verified 2 pinned WebUI assets");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

it("refuses same-token owner replacement between outer capture and installer entry", async () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-writer-"));
  try {
    seed(paths.join(root, "pinned")); const slot = await acquireNativeSlot({ path: paths.join(root, "slot") });
    const receipt = JSON.stringify(assertNativeSlotOwned({ path: paths.join(root, "slot"), token: slot.token }));
    const owner = paths.join(root, "slot", "owner.json");
    fs.renameSync(owner, paths.join(root, "original-owner")); fs.copyFileSync(paths.join(root, "original-owner"), owner);
    const trial = run(root, "install", slot.token, undefined, undefined, receipt);
    expect(trial.execute).toThrow("Native writer does not own the original live slot");
    expect(trial.mutations).toEqual([]); expect(trial.logs).toEqual([]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
it("refuses absent, malformed, duplicate or widened outer receipts before mutation", async () => {
  const root = fs.mkdtempSync(paths.join(tmpdir(), "aux-shell-writer-"));
  try {
    seed(paths.join(root, "pinned")); const slot = await acquireNativeSlot({ path: paths.join(root, "slot") });
    const owner = assertNativeSlotOwned({ path: paths.join(root, "slot"), token: slot.token });
    const exact = JSON.stringify(owner);
    for (const raw of ["", "{", "[]", "null", "x".repeat(4097), JSON.stringify({ ...owner, extra: true }),
      JSON.stringify({ ...owner, directory: { ...owner.directory, ino: -1 } }),
      JSON.stringify({ ...owner, file: { dev: owner.file.dev } }),
      exact.replace('{', '{"pid":1,'), exact.replace('"pid":', '"pid": ')]) {
      const trial = run(root, "install", slot.token, undefined, undefined, raw);
      expect(trial.execute).toThrow("Native installer requires the original outer owner receipt");
      expect(trial.mutations).toEqual([]); expect(trial.logs).toEqual([]);
    }
    slot.release();
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
