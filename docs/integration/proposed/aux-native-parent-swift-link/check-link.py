#!/usr/bin/env python3
"""Link actual three parent Swift objects with genuine Chromium final driver; never run."""
import argparse
import hashlib
import json
import os
from pathlib import Path
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
    initial_gn=None
    def verify():
        for section in ('files','nativeInputs','objects','sdkStubInputs'):
            for name,expected in pins[section].items():
                path=Path(name) if name.startswith('/') else REPO/name
                if sha(path)!=expected:raise ValueError('Exact link input differs: '+name)
        gn=pins['nativeGn']
        current=sha(Path(gn['path']))
        if current not in (gn['baselineSha256'],gn['successorSha256']) or (initial_gn is not None and current!=initial_gn):
            raise ValueError('Native GN is neither exact baseline/successor, or changed during check')
        return current
    initial_gn=verify()
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    original=json.loads((HERE/'failed-link-prefix.json').read_text())
    prefix=original['commandPrefix']
    if '-fuse-ld=lld' not in prefix or '-Wl,--strict-auto-link' not in prefix:
        raise SystemExit('Actual Chromium driver/autolink policy differs')
    paths=pins['runtimePaths']
    sdk=str(Path(paths['sdk']).parent.parent.parent)
    compiler=str(NATIVE/'third_party/llvm-build/Release+Asserts/bin/clang++')
    compile_command=[compiler,'--target=arm64-apple-macos','-mmacos-version-min=13.0','-isysroot',sdk,
                     '-x','c','-c',str(HERE/'probe.c'),'-o',str(output/'probe.o')]
    link_command=prefix+['-o',str(output/'parent-swift-link-probe'),str(output/'probe.o')]+list(pins['objects'])
    link_command+=['-L',paths['toolchain'],'-L',paths['sdk'],paths['compatibilityArchive'],
                   '-Wl,-rpath,'+paths['rpath'],
                   '-Wl,-u,_AuxCopyAuthenticatedFreshChildParentDescriptor',
                   '-Wl,-u,_AuxValidateEmbeddedNativeDaemonLaunchPolicy']
    receipt={'format':'aux.parent-swift-runtime.link-check.v1','executed':args.execute,'passed':False,
             'objects':pins['objects'],'commands':[compile_command,link_command],
             'nativeGnInputSha256':initial_gn,
             'runtimePaths':paths,'resultCodes':[],'nativeCodeExecuted':False,'protectedCalls':0,
             'swiftModuleRecompiled':False,'frameworkLinked':False,'signingToolUsed':False}
    failure=None
    try:
        if args.execute:
            env=os.environ.copy();env.update(original['environment'])
            for index,command in enumerate((compile_command,link_command)):
                result=subprocess.run(command,cwd=BUILD,env=env,capture_output=True,text=True)
                log=output/(str(index)+'.log');log.write_text(result.stdout+result.stderr)
                receipt['resultCodes'].append(result.returncode)
                if result.returncode:raise RuntimeError('Bounded module link failed: '+str(index))
            receipt['probeSha256']=sha(output/'parent-swift-link-probe')
        receipt['passed']=True
    except Exception as error:
        failure=error;receipt['error']=str(error)
    finally:
        try:verify();receipt['inputsUnchanged']=True
        except Exception as error:failure=error;receipt['passed']=False;receipt['pinError']=str(error)
        (output/'results.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: actual parent module linked with genuine C++ final driver; binary not run' if args.execute else 'PREPARED: exact parent-object runtime link; no compiler/link/native execution')

if __name__=='__main__':main()
