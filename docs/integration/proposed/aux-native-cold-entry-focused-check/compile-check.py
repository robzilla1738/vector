#!/usr/bin/env python3
"""Two changed cold-start callers only; no linking/native execution."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
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
    def verify():
        for section in ('workspaceInputs','generatedSources'):
            for name,expected in pins[section].items():
                if sha(REPO/name)!=expected:
                    raise ValueError('Workspace source differs: '+name)
        for name,expected in pins['nativeInputs'].items():
            if sha(Path(name))!=expected:
                raise ValueError('Native compiler/config input differs: '+name)
        if sha(REPO/pins['composition']['path'])!=pins['composition']['sha256']:
            raise ValueError('Reviewed composition differs')
        if sha(HERE/'compile-check.py')!=pins['recipeSha256']:
            raise ValueError('Focused recipe differs')
    verify()
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    proposal=REPO/'docs/integration/proposed'
    overlay=output/'include/chrome/browser/aux'
    overlay.mkdir(parents=True)
    copies={'AuxNativeParentColdLaunch.h':proposal/'aux-native-parent-cold-launch/source/AuxNativeParentColdLaunch.h',
            'daemon_supervisor.h':proposal/'aux-native-adopted-daemon/source/daemon_supervisor.h',
            'installation_auth.h':proposal/'aux-native-adopted-daemon/source/installation_auth.h'}
    for name,path in copies.items():
        (overlay/name).write_bytes(path.read_bytes())
    includes=['-I',str(output/'include'),'-I',str(proposal/'aux-native-adopted-daemon/source'),
              '-I',str(proposal/'aux-native-peer-compiler-compatibility/source'),
              '-I',str(proposal/'aux-native-daemon-authority-transport/source')]
    jobs=[]
    for name,target,source in (
        ('cold-launch','obj/chrome/browser/aux/platform.ninja',proposal/'aux-native-parent-cold-launch/source/AuxNativeParentColdLaunch.cc'),
        ('enabled-chrome-main-hook','obj/chrome/browser/core.ninja',HERE/'source/chrome_browser_main.cc')):
        text=(BUILD/target).read_text()
        variables={}
        for line in text.splitlines():
            if ' = ' in line and not line.startswith(' '):
                key,value=line.split(' = ',1)
                variables[key]=value.replace('$:',':')
        flags=[]
        for key in ('defines','include_dirs','cflags','cflags_cc','module_deps'):
            flags+=shlex.split(variables[key])
        flags+=['-fmodule-name='+variables['cc_module_name']+'_Private']
        if flags.count('-fno-exceptions')!=1 or '-fexceptions' in flags:
            raise ValueError('Genuine Chromium target exception mode differs')
        if name=='enabled-chrome-main-hook':
            if ': cxx ../../chrome/browser/chrome_browser_main.cc |' not in text:
                raise ValueError('Actual core target no longer owns Chrome main')
            flags+=['-D'+pins['isolatedHookCompileDefine']]
        command=[str(NATIVE/'third_party/llvm-build/Release+Asserts/bin/clang++'),'-MMD','-MF',str(output/(name+'.d'))]+includes+flags+['-c',str(source),'-o',str(output/(name+'.o'))]
        jobs.append({'name':name,'targetNinja':target,'targetModule':variables['cc_module_name'],
                     'moduleDependencies':variables['module_deps'],'command':command})
    receipt={'format':'aux.native-cold-entry.focused-check.v1','executed':args.execute,'passed':False,
             'composition':pins['composition'],'plannedCommands':jobs,'commands':[],
             'productionColdEntryDefineChanged':False,'isolatedHookCompileDefine':pins['isolatedHookCompileDefine'],
             'linked':False,'nativeCodeExecuted':False,'daemonRecompiled':False,'priorSixTUsRepeated':False}
    failure=None
    try:
        if args.execute:
            for job in jobs:
                result=subprocess.run(job['command'],cwd=BUILD,capture_output=True,text=True)
                log=output/(job['name']+'.log');log.write_text(result.stdout+result.stderr)
                row={'name':job['name'],'exitCode':result.returncode,'logSha256':sha(log)}
                artifact=output/(job['name']+'.o')
                if artifact.exists():row['objectSha256']=sha(artifact)
                receipt['commands'].append(row)
                if result.returncode:raise RuntimeError('Focused compile failed: '+job['name'])
        receipt['passed']=True
    except Exception as error:
        failure=error;receipt['error']=str(error)
    finally:
        try:verify();receipt['inputsUnchanged']=True
        except Exception as error:failure=error;receipt['passed']=False;receipt['pinError']=str(error)
        (output/'results.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: two real caller objects; no link/native execution' if args.execute else 'PREPARED: two caller commands; no compiler/link/native execution')

if __name__=='__main__':main()
