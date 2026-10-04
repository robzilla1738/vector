from pathlib import Path
import json,hashlib,re,subprocess,ast
h=lambda p:hashlib.file_digest(Path(p).open('rb'),'sha256').hexdigest()
b=Path('/private/tmp/aux-builder-native333-preparation-001'); c=b/'NATIVE333-ENUMERATION-TERMINAL-CLOSURE-001.json';j=json.loads(c.read_text());assert h(c)=='fa18f8959b78016a5686656f8981217ecca91c0b0652cd2fbb54d9e4db89fade'
for p,pin in j['artifactPins'].items():assert h(p)==pin['sha256'] and Path(p).stat().st_size==pin['bytes'],p
assert j['naturalExitCode']==0 and j['assertionsExecuted']==False and j['appExecuted']==False
p=Path(j['actualEnumeration']['path']);en=json.loads(p.read_text());cv=json.loads((b/'native333-required524-source-closure-002-REQUEST-ONLY.json').read_text());assert en['coverageSha256']==h(b/'native333-required524-source-closure-002-REQUEST-ONLY.json');assert len(en['records'])==17 and not en['assertionsExecuted']
for row,target in zip(en['records'],cv['requiredTargets'],strict=True):
 assert row['target']==target['target'] if 'target' in target else row['target']==target['binary']
 assert row['requiredCases']==target['requiredCases'];assert row['exitCode']==0 and not row['timedOut'] and row['originalGroupEmpty'] and not row['missingOrDuplicate']
 suite='';cases=[]
 for line in (p.parent/(row['target']+'.stdout')).read_text().splitlines():
  name=line.split('#',1)[0].strip()
  if not line[:1].isspace():suite=name if re.fullmatch(r'[A-Za-z0-9_/.]+\.',name) else ''
  elif suite and re.fullmatch(r'[A-Za-z0-9_/]+',name):cases.append(suite+name)
 assert cases==row['allActualCases'];assert all(cases.count(x)==1 for x in target['requiredCases']);assert row['argv']==['/Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/'+row['target'],'--gtest_list_tests']
assert sum(len(x['requiredCases']) for x in en['records'])==524
outer=json.loads(Path(j['outerTerminal']['path']).read_text());assert outer['exitCode']==0 and outer['originalGroupEmpty'] and not outer['actualRows'] and outer['slotAbsent']
rows=subprocess.check_output(['ps','-axo','pid=,pgid=,comm='],text=True).splitlines();assert not any(int(x.split()[0]) in j['originalPids'] or int(x.split()[1]) in j['originalGroups'] for x in rows if len(x.split())>=3);assert not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
proof={'result':'PASS','enumerationSha256':h(p),'closureSha256':h(c),'actual17OriginalBinariesAndRequired524EachOnce':True,'actual39RawPinsAndOriginalPidGroupAbsence':True,'originalRequiredCaseSetsAndOrderPreserved':True,'assertionsAndAppNotExecuted':True};Path('/tmp/aux-root-native333-enumeration-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
