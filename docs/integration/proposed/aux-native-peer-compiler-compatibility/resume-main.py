#!/usr/bin/env python3
"""Prepare/resume the exact failed main graph; never execute its output."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node-tree',type=Path,required=True)
    parser.add_argument('--node-receipt',type=Path,required=True)
    parser.add_argument('--node-receipt-sha256',required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--execute',action='store_true')
    args=parser.parse_args()
    pins=json.loads((HERE/'inputs.json').read_text())
    def verify():
        for section in ('files','baseline','mainPlanningInputs'):
            for name,expected in pins[section].items():
                if sha(REPO/name)!=expected:
                    raise RuntimeError('Source/planner pin differs: '+name)
        prior=Path(pins['priorOutput']).resolve(strict=True)
        if sha(prior/'plan-or-build.json')!=pins['priorReceiptSha256']:
            raise RuntimeError('Prior failed receipt differs')
        for name,expected in pins['reusableObjects'].items():
            if sha(prior/name)!=expected:
                raise RuntimeError('Previously compiled object differs: '+name)
        return prior
    prior=verify()
    previous=json.loads((prior/'plan-or-build.json').read_text())
    if previous['results']!=[0]*9+[1] or previous['passed'] is not False or previous['executed'] is not True or previous['inputsUnchanged'] is not True:
        raise SystemExit('Exact failed command9 boundary required')
    if args.node_receipt_sha256!=previous['nodeReceiptSha256']:
        raise SystemExit('Must retain the actual reviewed Node build')
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==prior:
        raise SystemExit('Fresh external successor output required')
    # The existing planner authenticates actual Node receipt, finite37archives,
    # force-load graph and every source/config pin. It compiles nothing here.
    planner=[sys.executable,str(REPO/'docs/integration/proposed/aux-native-daemon-main/build.py'),
             '--node-tree',str(args.node_tree),'--node-receipt',str(args.node_receipt),
             '--node-receipt-sha256',args.node_receipt_sha256,'--output',str(output)]
    subprocess.run(planner,check=True)
    planned=json.loads((output/'plan-or-build.json').read_text())
    commands=planned['commands']
    expected=[[value.replace(str(prior),str(output)) for value in command] for command in previous['commands']]
    if commands!=expected or len(commands)!=12:
        raise SystemExit('Original graph changed beyond output location')
    # Only the failed transport TU changes.0..8 commands/include order stay exact.
    transport=str(REPO/'docs/integration/proposed/aux-native-daemon-authority-transport/source/AuxNativePeerTransport.cc')
    if commands[9].count(transport)!=1:
        raise SystemExit('Exact failed transport source required')
    commands[9]=[str(HERE/'source/AuxNativePeerTransport.cc') if value==transport else value for value in commands[9]]
    include=REPO/'docs/integration/proposed/aux-selected-home-fileport-retry/source'
    # The real C declaration is selected, never redeclared or weakened.
    commands[9][commands[9].index('-c'):commands[9].index('-c')]=['-I',str(include)]
    for name,expected_hash in pins['reusableObjects'].items():
        shutil.copyfile(prior/name,output/name)
        if sha(output/name)!=expected_hash:
            raise SystemExit('Copied object differs')
    (output/'plan-or-build.json').rename(output/'original-verified-plan.json')
    result={'format':'aux.native-daemon-main.resume.v1','executed':args.execute,
            'priorFailedReceiptSha256':pins['priorReceiptSha256'],'reusedObjects':pins['reusableObjects'],
            'commands':commands,'results':[],'executableRun':False,'moduleLoaded':False,'signed':False,'passed':False}
    failure=None
    try:
        if args.execute:
            for index in (9,10,11):
                process=subprocess.run(commands[index],capture_output=True,text=True)
                (output/(str(index)+'.log')).write_text(process.stdout+process.stderr)
                result['results'].append({'command':index,'exitCode':process.returncode})
                if process.returncode:
                    raise RuntimeError('Successor build command failed: '+str(index))
            result['executableSha256']=sha(output/'Aux Daemon')
            reference=json.loads((REPO/'docs/integration/proposed/aux-native-daemon-main/inputs.json').read_text())['ptyImportReference']
            check=subprocess.run([sys.executable,str(REPO/'docs/integration/proposed/aux-native-embedded-pty-policy/check-final-exports.py'),
                '--main',str(output/'Aux Daemon'),'--main-sha256',result['executableSha256'],
                '--module',str(REPO/reference['path']),'--module-sha256',reference['sha256'],
                '--module-reference','--output',str(output/'pty-main-exports.json')],capture_output=True,text=True)
            (output/'pty-main-exports.log').write_text(check.stdout+check.stderr)
            result['ptyExportMetadataExitCode']=check.returncode
            if check.returncode:
                raise RuntimeError('Post-link metadata export check failed')
            result['ptyExportMetadataSha256']=sha(output/'pty-main-exports.json')
        result['passed']=True
    except Exception as error:
        failure=error
        result['error']=str(error)
    finally:
        try:
            verify()
            result['inputsUnchanged']=True
        except Exception as error:
            failure=error
            result['passed']=False
            result['pinError']=str(error)
        (output/'resume-build.json').write_text(json.dumps(result,indent=2)+'\n')
    if failure:
        raise SystemExit(str(failure))

if __name__=='__main__':
    main()
