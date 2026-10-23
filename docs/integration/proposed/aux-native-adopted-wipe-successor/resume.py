#!/usr/bin/env python3
"""Resume exactly five unpassed parent TUs plus wire; never link/run native code."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[3]
NATIVE=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')

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
        for section in ('files','baseline'):
            for name,expected in pins[section].items():
                if sha(REPO/name)!=expected:
                    raise ValueError('Frozen source differs: '+name)
        entry=pins['parentCompileInputs']
        if sha(REPO/entry['path'])!=entry['sha256']:
            raise ValueError('Parent compiler input manifest differs')
        parent=json.loads((REPO/entry['path']).read_text())
        for name,expected in parent['compileInputs'].items():
            if sha(REPO/name)!=expected:
                raise ValueError('Original parent input differs: '+name)
        for row in parent['nativeConfigInputs']:
            if sha(Path(row['path']))!=row['sha256']:
                raise ValueError('Compiler/config differs: '+row['path'])
        if sha(prior/'results.json')!=pins['priorReceiptSha256']:
            raise ValueError('Actual partial failure receipt differs')
        if sha(prior/pins['passedObject']['name'])!=pins['passedObject']['sha256']:
            raise ValueError('Passed transport object differs')
        for name,expected in pins['oldOverlay'].items():
            if sha(prior/name)!=expected:
                raise ValueError('Original include overlay differs')
    verify()
    old=json.loads((prior/'results.json').read_text())
    if [(x['name'],x['exitCode']) for x in old['commands']] != [('chromium-AuxNativePeerTransport.cc',0),('chromium-AuxOwnedNativePeerChild.cc',1)] or old['passed'] is not False or not old['postPinsVerified']:
        raise SystemExit('Exact passed-transport/failed-child boundary required')
    output=args.output.resolve()
    if output.exists() or output==REPO or REPO in output.parents or output==NATIVE or NATIVE in output.parents:
        raise SystemExit('Fresh external output required')
    output.mkdir(parents=True)
    jobs=[{'name':job['name'],'command':[value.replace(str(prior),str(output)) for value in job['command']]} for job in old['plannedCommands']]
    if len(jobs)!=7 or jobs[0]['name']!='chromium-AuxNativePeerTransport.cc':
        raise SystemExit('Exact seven-command parent plan required')
    for index,name in ((1,'AuxOwnedNativePeerChild.cc'),(2,'AuxSelectedStateHome.cc')):
        if jobs[index]['name']!='chromium-'+name:
            raise SystemExit('Exact changed source order required')
        command=jobs[index]['command']
        cursor=command.index('-c')+1
        if command[cursor]!=str(REPO/'docs/integration/proposed/aux-native-adopted-daemon/source'/name):
            raise SystemExit('Original adopted source differs')
        command[cursor]=str(HERE/'source'/name)
    for name in pins['oldOverlay']:
        destination=output/name
        destination.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(prior/name,destination)
    shutil.copyfile(prior/pins['passedObject']['name'],output/pins['passedObject']['name'])
    if sha(output/pins['passedObject']['name'])!=pins['passedObject']['sha256']:
        raise SystemExit('Copied passed object differs')
    receipt={'format':'aux.native-adopted-wipe.resume.v1','executed':args.execute,'passed':False,
             'priorReceiptSha256':pins['priorReceiptSha256'],'reusedTransportObject':pins['passedObject'],
             'plannedCommands':jobs,'commands':[],'linked':False,'nativeCodeExecuted':False,'ipcOrSecurityExecuted':False}
    failure=None
    try:
        if args.execute:
            for job in jobs[1:]:
                process=subprocess.run(job['command'],cwd=NATIVE/'out/AuxFast',capture_output=True,text=True)
                log=output/(job['name']+'.log')
                log.write_text(process.stdout+process.stderr)
                row={'name':job['name'],'command':job['command'],'exitCode':process.returncode,'logSha256':sha(log)}
                artifact=output/(job['name']+'.o')
                if artifact.exists():
                    row['objectSha256']=sha(artifact)
                receipt['commands'].append(row)
                if process.returncode:
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
    print('PASS: five remaining parent TUs + wire' if args.execute else 'PREPARED: passed transport retained; six remaining commands, no compiler')

if __name__=='__main__':
    main()
