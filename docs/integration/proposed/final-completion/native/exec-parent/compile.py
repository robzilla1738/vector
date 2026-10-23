#!/usr/bin/env python3
"""Compile owned C++ and typecheck paired Swift only; never link or execute."""
import hashlib,json,shlex,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
    pins=json.loads((H/'inputs.json').read_text());out=Path(pins['output'])
    frozen=dict(pins['frozenFiles'])
    for p in [H/'inputs.json',H/'compile.py',*(H/'source').iterdir()]:frozen[str(p)]=sha(p)
    def verify():
        for p,h in frozen.items():
            if sha(p)!=h:raise ValueError('Frozen input changed: '+p)
    verify()
    if out.exists():raise SystemExit('Fresh external output required')
    out.mkdir(mode=0o700)
    report={'format':'aux.exec-private-parent.compile.v1','passed':False,'commands':pins['commands'],'results':[], 'signed':False,'linked':False,'executableRun':False,'moduleLoaded':False,'protectedRuntimeAccess':False,'acceptedAppChanged':False,'nativeCustodyProven':False,'spawnAdmissionProven':False,'browserRootProven':False,'frozenInputCount':len(frozen)}
    failure=None
    try:
        for item in pins['commands']:
            run=subprocess.run(item['command'],capture_output=True,text=True)
            (out/(item['name']+'.log')).write_text(run.stdout+run.stderr)
            report['results'].append({'name':item['name'],'exitCode':run.returncode})
            if run.returncode:raise RuntimeError('Compile failed: '+item['name'])
            verify()
        raw=(out/'host.d').read_text().replace('\\\n',' ')
        deps={str(Path(v).resolve()) for v in shlex.split(raw.split(':',1)[1])}
        for p in deps:
            if p not in frozen or sha(p)!=frozen[p]:raise ValueError('Actual dependency absent or changed: '+p)
        imports=subprocess.check_output(['/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/nm','-u',str(out/'host.o')],text=True)
        if imports.split().count('_AuxCopyAuthenticatedExecPrivateParent')!=1:raise ValueError('Expected new Swift import exactly once')
        report.update({'passed':True,'hostObjectSha256':sha(out/'host.o'),'actualDependencyCount':len(deps),'actualDependencies':{p:frozen[p] for p in sorted(deps)},'newSwiftImportPresent':True,'swiftTypecheckedSourceCount':sum(v.endswith('.swift') for v in pins['commands'][1]['command'])})
    except Exception as e:failure=e;report['error']=str(e)
    finally:
        try:verify();report['inputsUnchanged']=True
        except Exception as e:failure=e;report['passed']=False;report['pinError']=str(e)
        (out/'results.json').write_text(json.dumps(report,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: actual WorkerHost object plus existing 46-source Swift typecheck; no link or execution')
if __name__=='__main__':main()
