#!/usr/bin/env python3
"""Three actual platform-target TUs + unchanged wire. Never link/run native code."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import shutil
import subprocess

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
NATIVE=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
BUILD=NATIVE/'out/AuxFast'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--execute',action='store_true')
    args=parser.parse_args()
    pins=json.loads((HERE/'inputs.json').read_text())
    prior=Path(pins['priorOutput']).resolve(strict=True)
    def verify():
        if sha(HERE/'resume.py')!=pins['recipeSha256']:
            raise ValueError('Successor recipe differs')
        overlay={str(path.relative_to(prior)):sha(path) for path in (prior/'include').rglob('*') if path.is_file()}
        if overlay!=pins['retainedOverlay']:
            raise ValueError('Exact retained header overlay differs')
        entry=pins['previousInputs']
        if sha(REPO/entry['path'])!=entry['sha256']:
            raise ValueError('Previous source manifest differs')
        previous=json.loads((REPO/entry['path']).read_text())
        for section in ('files','baseline'):
            for name,expected in previous[section].items():
                if sha(REPO/name)!=expected:
                    raise ValueError('Original source pin differs: '+name)
        entry=previous['parentCompileInputs']
        if sha(REPO/entry['path'])!=entry['sha256']:
            raise ValueError('Parent input manifest differs')
        parent=json.loads((REPO/entry['path']).read_text())
        for name,expected in parent['compileInputs'].items():
            if sha(REPO/name)!=expected:
                raise ValueError('Original parent source differs: '+name)
        for row in parent['nativeConfigInputs']:
            if sha(Path(row['path']))!=row['sha256']:
                raise ValueError('Original compiler/PCM/config differs: '+row['path'])
        for name,expected in pins['targetEvidence'].items():
            if sha(Path(name))!=expected:
                raise ValueError('Actual platform target evidence differs')
        if sha(prior/'results.json')!=pins['priorReceiptSha256']:
            raise ValueError('Partial failure receipt differs')
        for name,expected in pins['retainedObjects'].items():
            if sha(prior/name)!=expected:
                raise ValueError('Earlier passed object differs')
    verify()
    old=json.loads((prior/'results.json').read_text())
    if [(r['name'],r['exitCode']) for r in old['commands']] != [('chromium-AuxOwnedNativePeerChild.cc',0),('chromium-AuxSelectedStateHome.cc',0),('chromium-daemon_supervisor.cc',1)] or not old['postPinsVerified'] or old['passed'] is not False:
        raise SystemExit('Exact two-success/supervisor-failure boundary required')
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    variables={}
    ninja=BUILD/'obj/chrome/browser/aux/platform.ninja'
    for line in ninja.read_text().splitlines():
        if ' = ' in line and not line.startswith(' '):
            key,value=line.split(' = ',1)
            variables[key]=value.replace('$:',':')
    flags=[]
    for key in ('defines','include_dirs','cflags','cflags_cc','module_deps'):
        flags+=shlex.split(variables[key])
    flags+=['-fmodule-name='+variables['cc_module_name']+'_Private']
    if variables['cc_module_name']!='//chrome/browser/aux:platform' or flags.count('-fno-exceptions')!=1 or '-fexceptions' in flags:
        raise SystemExit('Actual platform target identity/mode differs')
    source_jobs=old['plannedCommands']
    jobs=[]
    selected=str(REPO/'docs/integration/proposed/aux-native-adopted-daemon/source')
    for index,name in ((3,'daemon_supervisor.cc'),(4,'installation_auth.cc'),(5,'browser_platform.cc')):
        source_line=': cxx ../../chrome/browser/aux/'+name+' |'
        if sum(source_line in line for line in ninja.read_text().splitlines())!=1:
            raise SystemExit('Source is not owned by actual platform target')
        prior_job=source_jobs[index]
        if prior_job['name']!='chromium-'+name:
            raise SystemExit('Remaining TU order differs')
        command=prior_job['command']
        start=command.index(selected)-1
        if command[start]!='-I':
            raise SystemExit('Original custom include boundary differs')
        suffix=[value.replace(str(prior),str(output)) for value in command[start:]]
        compiler=str(NATIVE/'third_party/llvm-build/Release+Asserts/bin/clang++')
        target=[compiler,'-MMD','-MF',str(output/(name+'.d')),'-I',str(output/'include')]+flags+suffix
        jobs.append({'name':prior_job['name'],'command':target})
    wire=source_jobs[6]
    if wire['name']!='pure-wire-predicate':
        raise SystemExit('Exact original wire predicate required')
    jobs.append({'name':wire['name'],'command':[value.replace(str(prior),str(output)) for value in wire['command']]})
    shutil.copytree(prior/'include',output/'include')
    for name,expected in pins['retainedObjects'].items():
        shutil.copyfile(prior/name,output/name)
        if sha(output/name)!=expected:
            raise SystemExit('Copied passed object differs')
    receipt={'format':'aux.native-platform-flags.resume.v1','executed':args.execute,'passed':False,
             'priorReceiptSha256':pins['priorReceiptSha256'],'retainedHistoricalObjects':pins['retainedObjects'],
             'actualTarget':pins['targetLabel'],'targetEvidence':pins['targetEvidence'],'targetFlags':flags,
             'targetModuleDependencies':variables['module_deps'],'plannedCommands':jobs,'commands':[],
             'linked':False,'nativeCodeExecuted':False,'ipcOrSecurityExecuted':False}
    failure=None
    try:
        if args.execute:
            for job in jobs:
                result=subprocess.run(job['command'],cwd=BUILD,capture_output=True,text=True)
                log=output/(job['name']+'.log')
                log.write_text(result.stdout+result.stderr)
                row={'name':job['name'],'command':job['command'],'exitCode':result.returncode,'logSha256':sha(log)}
                obj=output/(job['name']+'.o')
                if obj.exists():
                    row['objectSha256']=sha(obj)
                receipt['commands'].append(row)
                if result.returncode:
                    raise RuntimeError('Compile failed: '+job['name'])
        receipt['passed']=True
    except Exception as error:
        failure=error
        receipt['error']=str(error)
    finally:
        try:
            verify()
            receipt['postPinsVerified']=True
        except Exception as error:
            failure=error
            receipt['passed']=False
            receipt['postPinError']=str(error)
        (output/'results.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if failure:
        raise SystemExit(str(failure))
    print('PASS: three real platform-target TUs + unchanged wire' if args.execute else 'PREPARED: actual platform flags; no compiler/link/native execution')

if __name__=='__main__':
    main()
