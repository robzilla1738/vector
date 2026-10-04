import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";

const repo = fileURLToPath(new URL("../..", import.meta.url));
const harness = `
import ast,json,sys,subprocess as actual,types,os
from pathlib import Path
repo=Path(sys.argv[1]);cfg=json.loads(Path(sys.argv[2]).read_text());work=[];checks=[]
source=(repo/'chromium/aux-chromium').read_text();tree=ast.parse(source)
selected=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('stage_shell_owner','stage_shell')]
env={**os.environ,'HOME':cfg['home'],'AUX_NATIVE_SLOT_TOKEN':cfg['token']}
if 'receipt' in cfg:env['AUX_NATIVE_SLOT_EXPECTED_OWNER']=cfg['receipt']
def run(*args,**kwargs):
 if args[:2]==('node','--input-type=module'):
  result=actual.run(args,cwd=repo,env=env,check=True,text=True,capture_output=True)
  checks.append(result.stdout.strip());return result.stdout.strip()
 work.append(list(args));return ''
def build(*args,**kwargs):
 work.append(['build'])
 if cfg.get('replaceDuringBuild'):
  owner=Path(cfg['home'])/'aux-chromium-stable/.aux-native-slot/owner.json'
  owner.rename(owner.with_name('retained-owner.json'));owner.write_bytes(owner.with_name('retained-owner.json').read_bytes())
namespace={'ENV':env,'ROOT':repo/'chromium','REPO':repo,'run':run,'json':json,'subprocess':types.SimpleNamespace(run=build)}
exec(compile(ast.Module(body=selected,type_ignores=[]),'actual-stage-shell-parent','exec'),namespace)
try:
 namespace['stage_shell']();result={'success':True}
except (SystemExit,actual.CalledProcessError) as error:
 result={'success':False,'error':str(error)}
result.update(work=work,checks=len(checks),sameReceipt=bool(checks) and all(x==env.get('AUX_NATIVE_SLOT_EXPECTED_OWNER') for x in checks),inheritedUnchanged=('receipt' not in cfg or env.get('AUX_NATIVE_SLOT_EXPECTED_OWNER')==cfg['receipt']))
print(json.dumps(result))
`;
function trial(options: { inherited?: boolean; replaceBefore?: boolean; replaceDuringBuild?: boolean; raw?: string } = {}) {
  const home = fs.mkdtempSync(path.join(tmpdir(), "aux-shell-parent-"));
  const slot = path.join(home, "aux-chromium-stable", ".aux-native-slot");
  fs.mkdirSync(slot, { recursive: true });
  const token = randomUUID();
  fs.writeFileSync(path.join(slot, "owner.json"), JSON.stringify({ pid: process.pid, token }));
  const directory = fs.statSync(slot), file = fs.statSync(path.join(slot, "owner.json"));
  const receipt = JSON.stringify({ pid: process.pid, token, directory: { dev: directory.dev, ino: directory.ino }, file: { dev: file.dev, ino: file.ino } });
  if (options.replaceBefore) {
    fs.renameSync(path.join(slot, "owner.json"), path.join(slot, "retained-owner.json"));
    fs.copyFileSync(path.join(slot, "retained-owner.json"), path.join(slot, "owner.json"));
  }
  const config = path.join(home, "config.json");
  fs.writeFileSync(config, JSON.stringify({ home, token, ...(options.inherited ? { receipt } : {}), ...(options.raw !== undefined ? { receipt: options.raw } : {}), replaceDuringBuild: options.replaceDuringBuild }));
  try { return JSON.parse(execFileSync("python3", ["-c", harness, repo, config], { encoding: "utf8" })) as { success: boolean; work: string[][]; checks: number; sameReceipt: boolean; inheritedUnchanged: boolean }; }
  finally { fs.rmSync(home, { recursive: true, force: true }); }
}
it("captures an original owned receipt before staging and retains it through install", () => {
  const result = trial(); expect(result.success).toBe(true); expect(result.checks).toBe(2); expect(result.sameReceipt).toBe(true);
  expect(result.work.map(row => row.at(-1))).toEqual(["packages/contracts", "typecheck", "build", "capture", "install"]);
});
it("validates and preserves the inherited outer receipt without recapturing it", () => {
  const result = trial({ inherited: true }); expect(result.success).toBe(true); expect(result.inheritedUnchanged).toBe(true); expect(result.sameReceipt).toBe(true); expect(result.checks).toBe(2);
});
it("refuses a same-token replaced inherited owner before staging work", () => {
  const result = trial({ inherited: true, replaceBefore: true }); expect(result.success).toBe(false); expect(result.work).toEqual([]); expect(result.inheritedUnchanged).toBe(true);
});
it("refuses owner replacement during staging before install without recapturing authority", () => {
  const result = trial({ replaceDuringBuild: true }); expect(result.success).toBe(false); expect(result.checks).toBe(1); expect(result.work.at(-1)?.at(-1)).toBe("capture"); expect(result.work.some(row => row.includes("install"))).toBe(false);
});
it("refuses malformed inherited receipts before any staging work", () => {
  for (const raw of ["", "null", "{", "{}", "[]", "x".repeat(4097)]) {
    const result = trial({ raw }); expect(result.success).toBe(false); expect(result.work).toEqual([]); expect(result.checks).toBe(0); expect(result.inheritedUnchanged).toBe(true);
  }
});
