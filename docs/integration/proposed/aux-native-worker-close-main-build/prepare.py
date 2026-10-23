#!/usr/bin/env python3
"""Freeze a distinct coherent link; never alter predecessor inputs or artifacts."""
import hashlib,json,re,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent;W=H.parents[3]
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
OLD=Path('/private/tmp/aux-native-pty-v4-main-20261023')
OUT=Path('/private/tmp/aux-native-worker-close-main-20261023')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
pfile=W/'docs/integration/proposed/aux-native-pty-v4-main-build/inputs.json';p=json.loads(pfile.read_text())
rfile=OLD/'results.json';r=json.loads(rfile.read_text())
assert r['passed'] and r['inputsUnchanged'] and r['results']==[{'command':'link','exitCode':0}]
assert sha(OLD/'Aux Daemon')==r['executableSha256']=='263186eb7fe9809081034668eb588d5bb5456bd52205aad10a246d052caa34d9'
planfile=Path('/private/tmp/aux-native-current-entry-reader-20261023/original-verified-plan.json')
plan=json.loads(planfile.read_text())['commands'];assert len(plan)==12
files=dict(p['frozenFiles']);files[str(pfile)]=sha(pfile);files[str(rfile)]=sha(rfile);files[str(planfile)]=sha(planfile)
for name,digest in p['reusedObjects'].items():
    assert sha(OLD/name)==digest;files[str(OLD/name)]=digest
files[str(OLD/'Aux Daemon')]=sha(OLD/'Aux Daemon')
successor=W/'docs/integration/proposed/aux-native-worker-close-successor/source'
for source in successor.iterdir():
    if source.is_file():files[str(source)]=sha(source)
consumer_cache={}
def includes(command):
    return [Path(command[i+1]) for i,v in enumerate(command[:-1]) if v=='-I']
def closure(source,search):
    seen=set();stack=[Path(source).resolve()]
    while stack:
        path=stack.pop()
        if path in seen:continue
        seen.add(path)
        text=path.read_text(errors='replace')
        for name in re.findall(r'^\s*#\s*include\s*"([^"]+)"',text,re.M):
            for parent in [path.parent,*search]:
                candidate=(parent/name).resolve()
                if candidate.is_file():stack.append(candidate);break
    return seen
# Only these four real operands can see the class declaration; inspect all11
# actual finite quote-include graphs before choosing any object for reuse.
consumers={}
for i,old_command in enumerate(plan[:11]):
    source=old_command[old_command.index('-c')+1]
    if i==2:source=ROOT/'docs/integration/proposed/aux-native-pty-helper-host/source/AuxDevelopmentWorkerHost.cc'
    graph=closure(source,includes(old_command))
    consumer_cache[str(i)]=[str(x) for x in sorted(graph)]
    headers=[str(x) for x in graph if x.name=='AuxDevelopmentWorkerHost.h']
    if headers:consumers[str(i)]=headers
assert set(consumers)=={'0','2','3','4'},consumers
compiler=subprocess.check_output(['xcrun','--find','clang++'],text=True).strip();files[compiler]=sha(compiler)
commands=[]
for i in [0,2,3,4]:
    command=[v.replace('/private/tmp/aux-native-current-entry-reader-20261023',str(OUT)) for v in plan[i]]
    command[:2]=[compiler]
    command[1:1]=['-I',str(successor),'-I',str(W/'docs/integration/proposed/aux-native-authenticated-pty-helper/source'),'-MMD','-MF',str(OUT/(str(i)+'.d'))]
    if i==2:command[command.index('-c')+1]=str(successor/'AuxDevelopmentWorkerHost.cc')
    graph=closure(command[command.index('-c')+1],includes(command))
    headers=[x for x in graph if x.name=='AuxDevelopmentWorkerHost.h']
    assert headers==[successor/'AuxDevelopmentWorkerHost.h'],headers
    for source in graph:files[str(source)]=sha(source)
    commands.append({'object':str(i)+'.o','command':command})
link=[v.replace(str(OLD),str(OUT)) for v in p['link']]
assert sum(v.endswith('.swift') for v in link)==46 and link.count('-no_adhoc_codesign')==1
for path,digest in files.items():assert sha(path)==digest,path
pins={'format':'aux.worker-close-native-main.inputs.v1','output':str(OUT),'priorOutput':str(OLD),'frozenFiles':files,'compile':commands,'link':link,'reusedObjects':{k:v for k,v in p['reusedObjects'].items() if k not in ['0.o','2.o','3.o','4.o']},'recompiledObjects':['0.o','2.o','3.o','4.o'],'classHeader':str(successor/'AuxDevelopmentWorkerHost.h'),'classHeaderSha256':sha(successor/'AuxDevelopmentWorkerHost.h'),'classHeaderConsumersBefore':consumers,'all11QuoteIncludeGraphs':consumer_cache,'swiftSourcesUnchanged':46,'nodeArchivesChecked':42,'policyFormat':p['policyFormat'],'fixedReaderPreserved':p['fixedReaderPreserved'],'tools':p['tools'],'expectedFlatImports':p['expectedFlatImports'],'ptyImports':p['ptyImports'],'swiftInternalDefinitions':p['swiftInternalDefinitions'],'module':p['module'],'moduleSha256':p['moduleSha256'],'automaticAdHocSigningDisabled':True}
(H/'inputs.json').write_text(json.dumps(pins,indent=2)+'\n')
print('Frozen four paired-header C++ operands, seven exact reused objects,46unchanged Swift sources and42archives')
