from pathlib import Path
import json,hashlib,ast,stat,mmap
h=lambda p:hashlib.file_digest(Path(p).open('rb'),'sha256').hexdigest();b=Path('/private/tmp/aux-builder-native333-preparation-001');r=Path('/private/tmp/aux-browser-runtime-builder-native333-source-001');s=Path('/Users/rcourson/aux-chromium-stable/chromium/src');g=r/'release/test-artifacts/builder-native333-7fc07491-native-build-001/compiled-stage-guard.json';assert h(g)=='96c6d45dc11ee340a18d75a45124dd29a871836d3fbdc84c93889a520e3c03ed';d=json.loads(g.read_text())
for path,value in d['native'].items():assert h(s/path)==value,path
for path,value in d['packetFiles'].items():assert h(r/path)==value,path
for path,value in d['generated'].items():assert h(path)==value,path
for row in d['shellFiles']:assert h(s/'chrome/browser/resources/aux/assets'/row['path'])==row['sha256'],row['path']
for path,value in d['runtimeFiles'].items():assert h(Path(d['runtimeRoot'])/path)==value,path
assert h(d['helperExecutable'])==d['helperExecutableSha256']
for path,value in d['sourceGateFiles'].items():assert h(path)==value,path
assert len(d['native'])==733 and len(d['packetFiles'])==333 and len(d['shellFiles'])==174 and len(d['runtimeFiles'])==92
# All18 changed-build outputs were independently rehashed in the immediate root terminal review; no repeated whole compiled-cache scan.
assert json.loads(Path('/tmp/aux-root-native333-full18-terminal-review-001.json').read_text())['status']=='FULL18_NATURAL_TERMINAL_AND_READONLY_CAPTURE_ADMISSION_PASS'
with (s/'out/AuxDev/libchrome_dll.dylib').open('rb') as f:
 mm=mmap.mmap(f.fileno(),0,access=mmap.ACCESS_READ);chunk=mm[d['actualCompiledSourceIdentityOffset']:d['actualCompiledSourceIdentityOffset']+40];assert chunk==b'7fc074917a610981e17791d656430cb2130a99d4';mm.close()
L=b/'stage-native333-7fc07491-runtime-helper-target27-launch-001.json';assert h(L)=='1b3a15e8b658f388c533036cbf34c098edda146ee2aa4e8cd495589493d3abf6';j=json.loads(L.read_text())
for path,value in j['pins'].items():assert h(path)==value,path
assert h(b/'run-native333-original-runtime-helper-launch-001.py')=='023cf040a482bc4bd0edb398db33384dda4f2451824d6e7e8d6e3f278793324b';assert j['argv'][-1]==h(g)
receipt=json.loads((b/'NATIVE333-RUNTIME-HELPER-TOOL-PREFLIGHT-001.json').read_text())
for row in receipt['actualToolRows']:
 p=Path(row['path']);z=p.stat();assert str(p.resolve())==row['resolvedTarget'] and h(p)==row['sha256'] and z.st_size==row['bytes'] and stat.S_IMODE(z.st_mode)==row['mode'] and z.st_uid==row['uid'],p
assert len(receipt['actualToolRows'])==11
request=json.loads((b/'NATIVE333-RUNTIME-HELPER-SOURCE-REQUEST-001.json').read_text());old=ast.parse(Path(request['originalController']['path']).read_text());new=ast.parse(Path(request['controller']['path']).read_text())
class Successor(ast.NodeTransformer):
 def visit_Constant(self,n):
  if isinstance(n.value,str) and (len(n.value)==64 or any(x in n.value.lower() for x in ['native332','native333','native331']) or 'native-window-d7b9e10d38c8-target27-' in n.value or n.value in ['d9a0e06ed2a263b95bb02a1b91a128a3fcf74d78','1a19524e71b37b4f221701bc0487ec3f1a41c8c2','7fc074917a610981e17791d656430cb2130a99d4','557efd5dc6afba744e5f594a8871e7ece50f80f9']):return ast.copy_location(ast.Constant(value='AUTHENTICATED_SUCCESSOR_LITERAL'),n)
  return n
 def visit_Compare(self,n):
  if ast.dump(n.left)==ast.dump(ast.parse("len(D['packetFiles'])",mode='eval').body) and len(n.comparators)==1 and isinstance(n.comparators[0],ast.Constant) and n.comparators[0].value in [332,333]:n.comparators[0]=ast.Constant(value=333)
  return self.generic_visit(n)
assert ast.dump(Successor().visit(old))==ast.dump(Successor().visit(new));assert not Path(request['freshHelperCache']).exists() and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
proof={'status':'COMPILED_IDENTITY_AND_RUNTIME_HELPER_ADMISSION_PASS','actualNative':733,'actualPackets':333,'actualAssets':174,'actualRuntime':92,'historicalHelperExact':True,'actualSourceIdentityInBinary':True,'actualToolRows':11,'launcher':h(L),'outer':h(b/'run-native333-original-runtime-helper-launch-001.py'),'exactOriginalControllerExceptReviewedSourceLiteralsAndPacketCount':True,'scope':'offline matching runtime +fresh unchanged d7SDK27 helper trusted-only nonprompting; no App or safety dispatch'};Path('/tmp/aux-root-native333-runtime-helper-admission-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
