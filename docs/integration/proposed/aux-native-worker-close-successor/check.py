#!/usr/bin/env python3
"""Compile only the changed native host and pure constexpr boundary; never execute."""
import argparse,hashlib,json,pathlib,subprocess,shlex

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--node-source',required=True);p.add_argument('--output',required=True);a=p.parse_args()
d=pathlib.Path(__file__).resolve().parent;root=d.parents[3];out=pathlib.Path(a.output).resolve();out.mkdir(mode=0o700)
pins=json.loads((d/'inputs.json').read_text())['files']
for name,digest in pins.items():
    if sha(root/name)!=digest: raise SystemExit('source changed: '+name)
node=pathlib.Path(a.node_source).resolve()
# Actual Node26 source identity already used by the frozen v4 build.
if sha(node/'src/node.h')!='e111abb2864e18368a446ee662f446743fd79d3c4ca4d4f84601c03b7491eddf':
    raise SystemExit('Node header identity mismatch')
base=root/'docs/integration/proposed'
common=['xcrun','clang++','-std=c++20','-arch','arm64','-mmacosx-version-min=13.5','-DNAPI_VERSION=8','-fPIC','-DAUX_ATOMIC_CSK_DISPATCH=1','-DAUX_NATIVE_DAEMON_AUTHORITY_SERVER=1']
includes=[d/'source',base/'aux-native-authenticated-pty-helper/source',base/'aux-native-daemon-main/source',node/'src',node/'deps/v8/include',node/'deps/uv/include']
for name in ['aux-native-environment-preload','aux-native-node-runner','aux-native-sealed-parent-entry','aux-native-fresh-cold-bootstrap','aux-native-daemon-authority-transport','aux-owned-napi-adapter','aux-native-prepared-daemon-authority','aux-native-fresh-read-result-reconciliation']:
    includes.append(base/name/'source')
for include in includes: common+=['-I',str(include)]
# Freeze candidate transitive non-system headers before invoking the compiler.
header_roots=includes+[base/'aux-native-pdf-host-consumer/source',base/'aux-native-utility-host-consumer/source']
header_hashes={str(p.resolve()):sha(p) for include in header_roots for p in include.rglob('*.h')}
header_hashes.update({str((root/name).resolve()):digest for name,digest in pins.items()})
sdk=pathlib.Path(subprocess.run(['xcrun','--show-sdk-path'],check=True,capture_output=True,text=True).stdout.strip())/'SDKSettings.json'
sdk_digest='7b93ad7e534cc4b31c6a4e39d19b5e0288acf2168c2649479a796d1cb51939fb'
if sha(sdk)!=sdk_digest:raise SystemExit('SDK metadata identity mismatch')
header_hashes[str(sdk.resolve())]=sdk_digest
commands=[]
for name,source in [('host',d/'source/AuxDevelopmentWorkerHost.cc'),('pure-close',d/'tests/check-close.cc')]:
    command=common+['-MMD','-MF',str(out/(name+'.d')),'-c',str(source),'-o',str(out/(name+'.o'))];commands.append(command)
    run=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    (out/(name+'.log')).write_text(run.stdout)
    if run.returncode: print(run.stdout);raise SystemExit(run.returncode)
for name,digest in pins.items():
    if sha(root/name)!=digest: raise SystemExit('source changed during check: '+name)
dependencies={}
for name in ['host','pure-close']:
    deptext=(out/(name+'.d')).read_text().replace('\\\n',' ')
    for item in shlex.split(deptext.split(':',1)[1]):
        path=pathlib.Path(item).resolve();digest=header_hashes.get(str(path))
        if digest is None or sha(path)!=digest:raise SystemExit('dependency missing or changed: '+str(path))
        dependencies[str(path)]=digest
symbols=subprocess.run(['xcrun','nm',str(out/'host.o')],check=True,capture_output=True,text=True).stdout
(out/'symbols.txt').write_text(symbols)
exports=['AuxNativePtyBeginCurrent','AuxNativePtyCanSpawn','AuxNativePtyCopyHelperPath','AuxNativePtySpawnFailed','AuxNativePtyChildCreated','AuxNativePtyDirectWaitResult']
for name in exports:
    if not any(' T _'+name in line for line in symbols.splitlines()):raise SystemExit('ABI symbol missing: '+name)
receipt={'compileExitCode':0,'commands':commands,'sourceHashesBeforeAndAfter':pins,'actualDependencyHashesBeforeAndAfter':dependencies,'objects':{name:sha(out/(name+'.o')) for name in ['host','pure-close']},'constexprChecks':{'all25PairsAnd125Triples':True,'actualLossySequences':True,'invalidRepresentationsRefuse':True,'closeIsNoexcept':True},'abiExports':exports,'executedOrLoaded':False,'signed':False,'activated':False,'wholeDescendantCustody':False}
(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'passed':True,'receipt':str(out/'receipt.json')}))
