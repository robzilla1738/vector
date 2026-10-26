#!/usr/bin/env python3
"""Exercise the actual new journal reader on a few disposable malformed records."""
from pathlib import Path
import copy
import hashlib
import json
import os
import subprocess
import tempfile

HERE=Path(__file__).resolve().parent
REPO=HERE.parents[5]
source=(HERE/'source/daemon/AuxNativeTaskLayout.swift').read_text()
strict=(REPO/'docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift').read_text()
def method(text,name):
    start=text.rfind('\n',0,text.index(name))+1
    brace=text.index('{',text.index(name));depth=0;quoted=False;escaped=False
    for position in range(brace,len(text)):
        char=text[position]
        if quoted:
            if escaped:escaped=False
            elif char=='\\':escaped=True
            elif char=='"':quoted=False
        elif char=='"':quoted=True
        elif char=='{':depth+=1
        elif char=='}':
            depth-=1
            if not depth:return text[start:position+1]+'\n'
    raise RuntimeError(name)
fixture='''import Foundation
import Darwin
enum AuxFreshColdGuardError:Error {case metadata,path,io(Int32)}
enum AuxFreshColdBootstrapError:Error {case legacyOrUnknownExistingState}
enum EnvelopePortError:Error {case malformedRecord}
'''+method(strict,'func strictEnvelopeObject(')+'enum Fixture {\n'
start=source.index('    private struct NativeHostProcess {');end=source.index('    // Decoder yields',start)
fixture+=source[start:end]
for name in ['decodeNativeHostProcesses(','nativeHostRecordNames(','nativeHostProcesses(','metadata(','entry(']:
    fixture+=method(source,'private static func '+name)
fixture+='''static func inspect(_ root:Int32,_ expected:Data)throws->Int {try nativeHostProcesses(home:root,expected:expected).count}
}
let manifest=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))) as! [String:Any]
let expected=Data((manifest["binding"] as! String).utf8)
for test in manifest["cases"] as! [[String:Any]] {
    let root=open(test["path"] as! String,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
    guard root>=0 else{fatalError("fixture root")};defer{close(root)}
    do{let count=try Fixture.inspect(root,expected)
       guard let wanted=test["count"] as? Int,wanted==count else{fatalError("expected refusal")}
    }catch{guard test["count"]==nil else{fatalError("unexpected refusal")}}
}
print("native host reader cases passed")
'''
base={'format':'aux.native-host-lifetime.v1','intentId':'12345678-1234-1234-1234-123456789abd','leaseId':'12345678-1234-1234-1234-123456789abc',
'controlScope':'a'*64,'controlTransactionId':'ABCDEF01-1234-1234-1234-123456789ABC',
'controlReservationSha256':'b'*64,'policySha256':'c'*64,'transportGeneration':'1','accountId':'0',
'accountIncarnation':'ABCDEF02-1234-1234-1234-123456789ABC','profileId':'ABCDEF03-1234-1234-1234-123456789ABC',
'profilePathSha256':'d'*64,'recordSha256':'e'*64,'extensionOriginSha256':'1'*64,'nativeHostNameSha256':'2'*64,'hostImageSha256':'3'*64,
'daemon':{'pid':'101','seconds':'1700000001','microseconds':'1'},'browser':{'pid':'102','seconds':'1700000002','microseconds':'2'},
'phase':'spawned','helper':{'pid':'103','seconds':'1700000003','microseconds':'3'}}
binding={key:base[key] for key in ['controlScope','controlTransactionId','controlReservationSha256','policySha256']}
with tempfile.TemporaryDirectory(prefix='aux-native-host-reader-') as temporary:
    root=Path(temporary);cases=[];files=[]
    for name in ['valid','prepared','wrong-binding','bad-image','extra-field','symlink','partial-name']:
        home=root/name;home.mkdir(mode=0o700);journal=home/'.aux-native-host-lifetimes.v1';journal.mkdir(mode=0o700)
        record=copy.deepcopy(base)
        if name=='prepared':record['phase']='prepared';del record['helper']
        if name=='wrong-binding':record['controlScope']='f'*64
        if name=='bad-image':record['hostImageSha256']='bad'
        if name=='extra-field':record['ready']=True
        path=journal/(base['leaseId']+'.json' if name!='partial-name' else '.in-progress')
        if name=='symlink':path.symlink_to(root/'missing')
        else:path.write_text(json.dumps(record));path.chmod(0o600);files.append((path,path.read_bytes(),path.stat().st_mode))
        case={'name':name,'path':str(home)}
        if name=='valid':case['count']=3
        cases.append(case)
    harness=root/'reader.swift';harness.write_text(fixture)
    manifest=root/'cases.json';manifest.write_text(json.dumps({'binding':json.dumps(binding),'cases':cases}))
    result=subprocess.run(['/usr/bin/swift',str(harness),str(manifest)],capture_output=True,text=True)
    (HERE/'reader-check.txt').write_text(result.stdout+result.stderr)
    assert all(path.read_bytes()==body and path.stat().st_mode==mode for path,body,mode in files)
    report={'cases':len(cases),'exitCode':result.returncode,'sourceSha256':hashlib.sha256(source.encode()).hexdigest(),
            'syntheticBytesAndModesUnchanged':True,'kernelProcessQueryExecuted':False,'helperLaunched':False}
    (HERE/'reader-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
    raise SystemExit(result.returncode)
