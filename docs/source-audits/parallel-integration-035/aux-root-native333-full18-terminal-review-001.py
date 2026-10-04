from pathlib import Path
import json,hashlib,subprocess,stat,ast
h=lambda p:hashlib.file_digest(Path(p).open('rb'),'sha256').hexdigest();b=Path('/private/tmp/aux-builder-native333-preparation-001');c=b/'NATIVE333-SUCCESSFUL-FULL18-TERMINAL-CLOSURE-001.json';assert h(c)=='db6b0e010c48fe756da454c70d680c3a5cdf3481333ace9627de8994d18ec0ad';j=json.loads(c.read_text())
for p,v in j['rawArtifacts'].items():assert isinstance(v,str) and h(p)==v,p
assert len(j['rawArtifacts'])==15
assert h(j['terminalProof'])==j['terminalProofSha256'] and h(j['outerTerminal'])==j['outerTerminalSha256'];t=json.loads(Path(j['terminalProof']).read_text());o=json.loads(Path(j['outerTerminal']).read_text());assert t['graphExitCode']==0 and t['watcherExitCode']==0 and o['exitCode']==0 and o['originalGroupEmpty'] and o['slotAbsent'];assert t['outputs']==j['actualOutputHashes'] and len(t['outputs'])==18
for p,v in t['outputs'].items():assert h(p)==v,p
for row in j['generatedRestoredPhysicalRows']:
 p=Path(row['path']);z=p.stat();actual={'path':str(p),'device':z.st_dev,'inode':z.st_ino,'uid':z.st_uid,'mode':stat.S_IMODE(z.st_mode),'bytes':z.st_size,'mtimeNs':z.st_mtime_ns,'sha256':h(p)};assert actual==row and actual['mode']==0o644
 seal=next(x for x in t['originalGeneratedModesRestored']['rows'] if x['path']==str(p));assert {k:v for k,v in actual.items() if k!='path'}==seal['restoration']['after'] and seal['restoration']['namedOriginalAtRestoration'] and seal['restoration']['contentStillExpected']
ps=subprocess.check_output(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],text=True);remaining=[line for line in ps.splitlines() if len(line.split())>=3 and (int(line.split()[0]) in j['originalPids'] or int(line.split()[2]) in j['originalGroups'])];assert not remaining,remaining;assert len(j['originalPids'])==12 and len(j['originalGroups'])==2 and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
p=Path(j['terminalProof']).parent;state=json.loads((p/'state.json').read_text());assert state['actualVersionHeaderRealRevision'] and state['terminalGnAndMetadataGuard']=='PASS' and state['terminalNativeAndGeneratedGuard']=='PASS' and state['ownedCompilerChildrenAbsent'];assert t['nativeAndGeneratedGuard']=='PASS' and not t['assertionsExecuted'] and not t['payloadStaged'] and t['mixedPairNotLaunchable']
req=json.loads((b/'NATIVE333-READONLY-COMPILED-CAPTURE-REQUEST-001.json').read_text());assert h(b/'NATIVE333-READONLY-COMPILED-CAPTURE-REQUEST-001.json')=='c974560e96324f31e28d2848090e3d2bc2e5236375a2438b2906f1fed973ab5c'
for k in ['controller','baseline','exactDelta','closure']:assert h(req[k]['path'])==req[k]['sha256']
a=ast.parse(Path(req['baseline']['path']).read_text());z=ast.parse(Path(req['controller']['path']).read_text())
class Strings(ast.NodeTransformer):
 def visit_Constant(self,n):
  if isinstance(n.value,str) and (len(n.value)==64 or any(s in n.value.lower() for s in ['native332','native333','native331']) or n.value in ['d9a0e06ed2a263b95bb02a1b91a128a3fcf74d78','1a19524e71b37b4f221701bc0487ec3f1a41c8c2','7fc074917a610981e17791d656430cb2130a99d4','557efd5dc6afba744e5f594a8871e7ece50f80f9']):return ast.copy_location(ast.Constant(value='AUTHENTICATED_SUCCESSOR_LITERAL'),n)
  return n
assert ast.dump(Strings().visit(a))==ast.dump(Strings().visit(z));assert req['argv'][-3]==j['terminalProofSha256'] and req['argv'][-1]==j['outerTerminalSha256']
proof={'status':'FULL18_NATURAL_TERMINAL_AND_READONLY_CAPTURE_ADMISSION_PASS','actualRaw':15,'actualOutputHashes':18,'freshAbsentPids':12,'freshAbsentGroups':2,'actualPhysical0644Restored':3,'captureRequestSha256':h(b/'NATIVE333-READONLY-COMPILED-CAPTURE-REQUEST-001.json'),'captureController':req['controller'],'firstSourceAuditRefusal':'uppercase NATIVE filename literals not normalized; corrected comparison covers exact reviewed literal delta, no native refusal','scope':'read-only compiled identity capture only; no runtime/helper/App'};Path('/tmp/aux-root-native333-full18-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
