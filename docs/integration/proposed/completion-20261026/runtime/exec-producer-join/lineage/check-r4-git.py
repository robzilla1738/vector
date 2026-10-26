#!/usr/bin/env python3
"""Compile actual changed TUs only. No native product/addon/helper execution."""
import hashlib,json,shlex,subprocess,sys
from pathlib import Path
H=Path(__file__).resolve().parent
R=Path('/Users/rcourson/Documents/Vibe/web')
N=R/'out/aux-node-static-26.5.0/node-v26.5.0'
ONLY_PTY='--only-pty' in sys.argv
PREVIOUS=Path('/private/tmp/aux-spawn-custody-native-20261023-r3')
OUT=Path('/private/tmp/aux-spawn-custody-native-20261023-r4-pty' if ONLY_PTY else '/private/tmp/aux-spawn-custody-native-20261023-r4-complete')
CLANG='/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang'
SDK='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk'
BRO=Path('/private/tmp/aux-browser-root-provenance/docs/integration/proposed/profile-isolation-next/browser-roots/source')
ENV=R/'docs/integration/proposed/profile-isolation-next/containment/source'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def oldcommand(suffix,source,name):
    matches=[p for p in (N/'out/Release/.deps').rglob('*.d') if str(p).endswith(suffix)]
    if len(matches)!=1:raise ValueError('Expected one actual original command: '+suffix)
    cmd=shlex.split(matches[0].read_text().splitlines()[0].split(' := ',1)[1])
    cmd[0]=CLANG+'++' if source.endswith('.cc') else CLANG
    cmd[cmd.index('-o')+1]=str(OUT/(name+'.o'))
    cmd[cmd.index('-MF')+1]=str(OUT/(name+'.d'))
    # Replace one old relative translation unit, retain actual compile flags.
    sources=[i for i,v in enumerate(cmd) if v.endswith(('.cc','.c'))]
    if len(sources)!=1:raise ValueError('Unexpected TU command')
    cmd[sources[0]]=str(H/'source'/source)
    cmd[1:1]=['-I'+str(H/'source'),'-I'+str(ENV),'-I'+str(N/'deps/uv/src/unix'),'-isysroot',SDK]
    return {'name':name,'cwd':str(N/'out'),'command':cmd}
def main():
    if OUT.exists():raise SystemExit('Fresh external output required')
    OUT.mkdir(mode=0o700)
    commands=[oldcommand('/node_base/src/process_wrap.o.d','process_wrap.cc','process-wrap'),oldcommand('/libuv/deps/uv/src/unix/process.o.d','process.c','libuv-process')]
    # SyncProcessRunner uses the same actual Node internal flags as ProcessWrap.
    sync=dict(commands[0]);sync['name']='spawn-sync';sync['command']=list(sync['command'])
    sync['command']=[v.replace(str(H/'source/process_wrap.cc'),str(H/'source/spawn_sync.cc')).replace(str(OUT/'process-wrap.o'),str(OUT/'spawn-sync.o')).replace(str(OUT/'process-wrap.d'),str(OUT/'spawn-sync.d')) for v in sync['command']]
    commands.append(sync)
    host=json.loads((R/'docs/integration/proposed/final-completion/native/exec-parent/inputs.json').read_text())['commands'][0]
    cmd=list(host['command']);cmd[cmd.index('-c')+1]=str(H/'source/AuxDevelopmentWorkerHost.cc');cmd[cmd.index('-o')+1]=str(OUT/'worker-host.o');cmd[cmd.index('-MF')+1]=str(OUT/'worker-host.d')
    cmd[1:1]=['-I',str(H/'source'),'-I',str(BRO)]
    commands.append({'name':'worker-host','cwd':str(R),'command':cmd})
    commands.append({'name':'descriptor-fixture','cwd':str(R),'command':[CLANG+'++','-isysroot',SDK,'-std=c++20','-arch','arm64','-mmacosx-version-min=13.5','-I'+str(H/'source'),'-I'+str(N/'deps/uv/include'),'-MMD','-MF',str(OUT/'descriptor-fixture.d'),'-c',str(H/'source/descriptor-fixture.cc'),'-o',str(OUT/'descriptor-fixture.o')]})
    commands.append({'name':'pty-addon','cwd':str(R),'command':[CLANG+'++','-isysroot',SDK,'-std=c++20','-arch','arm64','-mmacosx-version-min=13.5','-DNAPI_VERSION=8','-DNAPI_CPP_EXCEPTIONS','-DNODE_GYP_MODULE_NAME=pty','-fexceptions','-fPIC','-I'+str(H/'source'),'-I'+str(ENV),'-I/private/tmp/aux-node-pty-build-deps-20261023/node_modules/node-addon-api','-idirafter',str(N/'src'),'-I'+str(N/'deps/v8/include'),'-I'+str(N/'deps/uv/include'),'-MMD','-MF',str(OUT/'pty-addon.d'),'-c',str(H/'source/pty.cc'),'-o',str(OUT/'pty-addon.o')]})
    previous=None
    if ONLY_PTY:
        previous=json.loads((PREVIOUS/'results.json').read_text())
        expected=['process-wrap','libuv-process','spawn-sync','worker-host','descriptor-fixture']
        if [v['name'] for v in previous['results'] if v['exitCode']==0]!=expected or not previous.get('inputsUnchanged'):
            raise SystemExit('Previous five actual TU checks are not established')
        for path,digest in previous['frozenFiles'].items():
            if path!=str(H/'check.py') and sha(path)!=digest:raise SystemExit('Previous compile input changed: '+path)
        commands=commands[-1:]
    # Discover exact compile dependencies, then freeze before object compilation.
    frozen={str(p):sha(p) for p in [H/'check.py',*(H/'source').iterdir(),*(H/'baseline').iterdir(),ENV/'AuxExecSpawnEnvelope.h',BRO/'AuxBrowserRootBridge.h'] if p.is_file()}
    for item in commands:
        cmd=item['command'];pre=list(cmd)
        for flag in ['-o','-MF']:
            i=pre.index(flag);del pre[i:i+2]
        pre=[v for v in pre if v not in ['-c','-MMD']]+['-MM']
        run=subprocess.run(pre,cwd=item['cwd'],capture_output=True,text=True)
        if run.returncode:
            (OUT/'dependency-error.log').write_text(run.stdout+run.stderr)
            (OUT/'results.json').write_text(json.dumps({'format':'aux.native-spawn-custody.compile.v1','passed':False,'phase':'dependency-discovery','failedCommand':item,'error':run.stderr,'linked':False,'executableRun':False},indent=2)+'\n')
            raise SystemExit(run.stderr)
        deps=shlex.split(run.stdout.replace('\\\n',' ').split(':',1)[1])
        for value in deps:
            path=str((Path(item['cwd'])/value).resolve());frozen[path]=sha(path)
    def verify():
        for path,digest in frozen.items():
            if sha(path)!=digest:raise ValueError('Frozen input changed: '+path)
    verify()
    report={'format':'aux.native-spawn-custody.compile.v1','passed':False,'commands':commands,'results':[], 'frozenInputCount':len(frozen),'linked':False,'executableRun':False,'nativeBindingLoaded':False,'sandboxExecuted':False,'ownerDataRead':False,'protectedRuntimeAccepted':False,'descendantCustodyProven':False,'ipcIsolationProven':False,'acceptedAppChanged':False}
    failure=None
    try:
        for item in commands:
            run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True)
            (OUT/(item['name']+'.log')).write_text(run.stdout+run.stderr)
            report['results'].append({'name':item['name'],'exitCode':run.returncode})
            if run.returncode:raise ValueError('Compile failed: '+item['name'])
            verify()
        # Actual emitted compiler dependency files must be covered by the frozen
        # prepass inventory; a newly appearing header is not silently accepted.
        all_commands=(previous['commands'][:-1] if previous else [])+commands
        actual_dependencies={}
        for item in all_commands:
            base=PREVIOUS if previous and item['name']!='pty-addon' else OUT
            raw=(base/(item['name']+'.d')).read_text().replace('\\\n',' ')
            allowed=previous['frozenFiles'] if previous and item['name']!='pty-addon' else frozen
            for value in shlex.split(raw.split(':',1)[1]):
                path=str((Path(item['cwd'])/value).resolve())
                if path not in allowed or sha(path)!=allowed[path]:raise ValueError('Actual dependency absent or changed: '+path)
                actual_dependencies[path]=allowed[path]
        report['actualDependencyCount']=len(actual_dependencies)
        report['actualDependencies']=actual_dependencies
        report['objects']={p.name:sha(p) for p in OUT.glob('*.o')}
        if previous:
            report['previousReceiptSha256']=sha(PREVIOUS/'results.json')
            report['previousResults']=previous['results'][:-1]
            report['previousObjects']={v['name']+'.o':sha(PREVIOUS/(v['name']+'.o')) for v in previous['results'] if v['exitCode']==0}
            report['previousFrozenInputCount']=previous['frozenInputCount']
            report['previousInputsStillMatch']=True
        report['compiledTUCount']=len(all_commands)
        report['passed']=True
    except Exception as error:failure=error;report['error']=str(error)
    finally:
        try:verify();report['inputsUnchanged']=True
        except Exception as error:failure=error;report['passed']=False;report['pinError']=str(error)
        report['frozenFiles']=frozen
        (OUT/'results.json').write_text(json.dumps(report,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: actual Node ProcessWrap, SyncProcessRunner, libuv process, retained WorkerHost, actual PTY addon and descriptor compile-time fixture; no link/execution')
if __name__=='__main__':main()
