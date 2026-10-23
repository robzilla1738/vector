#!/usr/bin/env python3
"""Recompile only transport9; retain10objects, unchanged46Swift link and export metadata."""
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
    prior=Path(pins['priorOutput']).resolve(strict=True)
    def verify():
        for name,expected in pins['files'].items():
            if sha(REPO/name)!=expected:raise ValueError('Frozen source/planner differs: '+name)
        if sha(HERE/'build.py')!=pins['recipeSha256']:raise ValueError('Successor recipe differs')
        if sha(prior/'resume-build.json')!=pins['priorReceiptSha256']:raise ValueError('Prior success receipt differs')
        if sha(prior/'original-verified-plan.json')!=pins['priorVerifiedPlanSha256']:raise ValueError('Original verified Node plan differs')
        folder=REPO/'docs/integration/proposed/aux-native-peer-safe-containers/source/chrome/browser/aux'
        for name in ('AuxNativePeerTransport.h','AuxNativePeerWire.h','AuxSelectedHomePolicyBridge.h','AuxFreshColdBootstrapNativeBridge.h','AuxPreparedDaemonAuthority.h'):
            if (folder/name).exists():raise ValueError('Unreviewed local header would shadow original server graph')
        if sha(prior/'Aux Daemon')!=pins['priorExecutableSha256']:raise ValueError('Prior executable differs')
        for name,expected in pins['unchangedObjects'].items():
            if sha(prior/name)!=expected:raise ValueError('Exact unchanged object differs: '+name)
        browser=pins['actualBrowserTransport']
        if sha(Path(browser['path']))!=browser['sha256']:raise ValueError('Actual browser transport generation differs')
    verify()
    previous=json.loads((prior/'resume-build.json').read_text())
    if previous['passed'] is not True or previous['executed'] is not True or previous['inputsUnchanged'] is not True or previous['results']!=[{'command':9,'exitCode':0},{'command':10,'exitCode':0},{'command':11,'exitCode':0}] or previous['ptyExportMetadataExitCode']!=0:
        raise SystemExit('Exact actual31927 successful boundary required')
    verified_plan=json.loads((prior/'original-verified-plan.json').read_text())
    if args.node_receipt_sha256!=verified_plan['nodeReceiptSha256']:
        raise SystemExit('Exact previously reviewed Node build receipt required')
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==prior:
        raise SystemExit('Fresh external successor output required')
    planner=[sys.executable,str(REPO/'docs/integration/proposed/aux-native-daemon-main/build.py'),
             '--node-tree',str(args.node_tree),'--node-receipt',str(args.node_receipt),
             '--node-receipt-sha256',args.node_receipt_sha256,'--output',str(output)]
    # Original planner authenticates actual Node receipt,37target archives,
    # six force-load dependencies, config and every original source/header pin.
    subprocess.run(planner,check=True)
    planned=json.loads((output/'plan-or-build.json').read_text())
    commands=planned['commands']
    expected=[[value.replace(str(prior),str(output)) for value in command] for command in previous['commands']]
    if len(commands)!=12 or len(expected)!=12:raise SystemExit('Actual11C++/46Swift graph required')
    # Reconstruct the reviewed prior compiler correction to authenticate all
    # commands before selecting the one new common transport implementation.
    old=str(REPO/'docs/integration/proposed/aux-native-daemon-authority-transport/source/AuxNativePeerTransport.cc')
    prior_source=str(REPO/'docs/integration/proposed/aux-native-peer-compiler-compatibility/source/AuxNativePeerTransport.cc')
    index=commands[9].index('-c')+1
    if commands[9][index]!=old:raise SystemExit('Original transport operand differs')
    commands[9][index]=prior_source
    index=commands[9].index('-c')
    commands[9][index:index]=['-I',str(REPO/'docs/integration/proposed/aux-selected-home-fileport-retry/source')]
    if commands!=expected:raise SystemExit('Source/header/link commands differ from exact actual success')
    new_source=REPO/'docs/integration/proposed/aux-native-peer-safe-containers/source/chrome/browser/aux/AuxNativePeerTransport.cc'
    commands[9][commands[9].index('-c')+1]=str(new_source)
    # Quoted header lookup falls back to the unchanged original server header
    # already pinned in the exact command; no browser-only header is substituted.
    for name,expected_hash in pins['unchangedObjects'].items():
        shutil.copyfile(prior/name,output/name)
        if sha(output/name)!=expected_hash:raise SystemExit('Copied unchanged object differs')
    (output/'plan-or-build.json').rename(output/'original-verified-plan.json')
    receipt={'format':'aux.native-main.safe-transport-resume.v1','executed':args.execute,'passed':False,
             'priorReceiptSha256':pins['priorReceiptSha256'],'reusedObjects':pins['unchangedObjects'],
             'actualBrowserTransport':pins['actualBrowserTransport'],'commands':commands,'results':[],
             'executableRun':False,'moduleLoaded':False,'signed':False,'nodeRebuilt':False}
    failure=None
    try:
        if args.execute:
            for index in (9,11):
                result=subprocess.run(commands[index],capture_output=True,text=True)
                (output/(str(index)+'.log')).write_text(result.stdout+result.stderr)
                receipt['results'].append({'command':index,'exitCode':result.returncode})
                if result.returncode:raise RuntimeError('Successor command failed: '+str(index))
            receipt['executableSha256']=sha(output/'Aux Daemon')
            reference=json.loads((REPO/'docs/integration/proposed/aux-native-daemon-main/inputs.json').read_text())['ptyImportReference']
            check=subprocess.run([sys.executable,str(REPO/'docs/integration/proposed/aux-native-embedded-pty-policy/check-final-exports.py'),
                '--main',str(output/'Aux Daemon'),'--main-sha256',receipt['executableSha256'],
                '--module',str(REPO/reference['path']),'--module-sha256',reference['sha256'],
                '--module-reference','--output',str(output/'pty-main-exports.json')],capture_output=True,text=True)
            (output/'pty-main-exports.log').write_text(check.stdout+check.stderr)
            receipt['ptyExportMetadataExitCode']=check.returncode
            if check.returncode:raise RuntimeError('Actual export metadata check failed')
            receipt['ptyExportMetadataSha256']=sha(output/'pty-main-exports.json')
        receipt['passed']=True
    except Exception as error:
        failure=error;receipt['error']=str(error)
    finally:
        try:verify();receipt['inputsUnchanged']=True
        except Exception as error:failure=error;receipt['passed']=False;receipt['pinError']=str(error)
        (output/'results.json').write_text(json.dumps(receipt,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: transport9 + unchanged final link + export metadata' if args.execute else 'PREPARED:10objects retained; no compile/link/native execution')

if __name__=='__main__':main()
