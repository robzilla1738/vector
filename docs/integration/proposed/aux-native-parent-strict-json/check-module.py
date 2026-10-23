#!/usr/bin/env python3
"""Replay the genuine failed Swift wrapper boundary with one pure helper added."""
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
    def verify():
        for name,expected in pins['files'].items():
            if sha(REPO/name)!=expected:raise ValueError('Proposal input differs: '+name)
        for name,expected in pins['nativeInputs'].items():
            if sha(Path(name))!=expected:raise ValueError('Actual Swift/GN input differs: '+name)
        extraction=pins['extraction']
        original=REPO/extraction['source']
        if sha(original)!=extraction['sourceSha256']:raise ValueError('Original pure helper source differs')
        prefix=original.read_bytes().split(extraction['stopBefore'].encode(),1)[0]
        helper=HERE/'source/chrome/browser/aux/native_peer_policy/AuxStrictEnvelopeObject.swift'
        if prefix!=helper.read_bytes() or sha(helper)!=extraction['prefixSha256']:raise ValueError('Pure prefix extraction differs')
    verify()
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    original=json.loads((HERE/'failed-command.json').read_text())
    command=list(original['command'])
    if command[command.index('--module-name')+1]!='AuxParentSealedPolicy' or command[command.index('--bridge-header')+1]!='':
        raise SystemExit('Actual failed module/header contract differs')
    replacements={'--header-path':output/'gen/AuxParentSealedPolicy.h',
                  '--target-out-dir':output/'obj/AuxParentSealedPolicy',
                  '--depfile-path':output/'AuxParentSealedPolicy.d'}
    for flag,path in replacements.items():
        command[command.index(flag)+1]=str(path)
    helper=HERE/'source/chrome/browser/aux/native_peer_policy/AuxStrictEnvelopeObject.swift'
    command.insert(command.index('--fix-generated-header'),str(helper))
    environment=os.environ.copy()
    environment.update(original['environment'])
    receipt={'format':'aux.native-parent-strict-json.module-check.v1','executed':args.execute,'passed':False,
             'command':command,'toolVersionEnvironment':original['environment'],
             'originalFailedCommandSha256':sha(HERE/'failed-command.json'),'sources':3,
             'moduleName':'AuxParentSealedPolicy','linked':False,'nativeCodeExecuted':False,
             'protectedGraphIncluded':False,'nativeCheckoutMutated':False}
    failure=None
    try:
        if args.execute:
            result=subprocess.run(command,cwd=BUILD,env=environment,capture_output=True,text=True)
            log=output/'module.log';log.write_text(result.stdout+result.stderr)
            receipt['exitCode']=result.returncode;receipt['logSha256']=sha(log)
            if result.returncode:raise RuntimeError('Actual three-source Swift module compile failed')
            module=output/'obj/AuxParentSealedPolicy/AuxParentSealedPolicy.swiftmodule'
            header=output/'gen/AuxParentSealedPolicy.h'
            objects=[output/'obj/AuxParentSealedPolicy'/name for name in ['AuxAuthenticatedChildParentPolicyReader.o','AuxFreshBootstrapPolicy.o','AuxStrictEnvelopeObject.o']]
            for artifact in [module,header]+objects:
                if not artifact.is_file():raise ValueError('Actual wrapper output missing: '+str(artifact))
            receipt['artifacts']={str(path.relative_to(output)):sha(path) for path in [module,header]+objects}
        receipt['passed']=True
    except Exception as error:
        failure=error;receipt['error']=str(error)
    finally:
        try:verify();receipt['inputsUnchanged']=True
        except Exception as error:failure=error;receipt['passed']=False;receipt['pinError']=str(error)
        (output/'results.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: actual three-source Swift module + generated header' if args.execute else 'PREPARED: actual Swift wrapper successor; no compiler')

if __name__=='__main__':main()
