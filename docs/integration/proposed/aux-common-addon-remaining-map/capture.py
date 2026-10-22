#!/usr/bin/env python3
"""Read-only exact current-stage command map; evaluates no supplied code."""
import argparse,hashlib,json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
STAGE='out/provided-reuse-aux-crypto-stage'
DAEMON=STAGE+'/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'
DAEMON_LOADER=STAGE+'/apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-native.cjs'
CLI_LOADER=STAGE+'/apps/cli/Aux CLI.app/Contents/Resources/native/aux-native.cjs'
PDF_LOADER=STAGE+'/apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-pdf.cjs'
EXTRA=[
'docs/integration/proposed/aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift',
'docs/integration/proposed/aux-native-macos-utilities/source/AuxAppKitUtilityBoundary.swift',
'docs/integration/proposed/aux-native-macos-utilities/source/AuxOSJobCustody.swift',
'docs/integration/proposed/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift',
'docs/integration/proposed/aux-development-host/source/AuxSignedDevelopmentOwner.swift',
'docs/integration/proposed/aux-development-worker-host/source/AuxDevelopmentWorkerHost.cc',
'docs/integration/proposed/aux-development-worker-host/evidence/current-direct-attach-refusal-compile-only.json',
'docs/integration/proposed/aux-native-macos-utilities/evidence/check.json',
'docs/integration/proposed/aux-native-pdf-os-surface/evidence/consumer-callsite-inventory.json',
'docs/integration/proposed/aux-native-dispatch-abi/README.md']
def hash(raw):return hashlib.sha256(raw).hexdigest()
def collect(artifact_root):
    artifact_root=artifact_root.resolve()
    def input_path(p):return (artifact_root if p.startswith("out/") else ROOT)/p
    text=input_path(DAEMON).read_text()
    files=[{'path':p,'sha256':hash(input_path(p).read_bytes()),'bytes':input_path(p).stat().st_size} for p in [DAEMON,DAEMON_LOADER,CLI_LOADER,PDF_LOADER,*EXTRA]]
    families={
      'runNativeHelperCommand':['app-icons','list-open-apps','copy-file','open-with','install-crash-handler'],
      'runNativeHelperCommandAsync':['generate-thumbnail','pick-directory','focus-explorer-path'],
      'runMacInstallHelper':['install-init','install-status','dk-unwrap','cdp-sign','get-public-keys','install-destroy'],
      'runNativeKeyCommand':['keys-status','public-keys','ecdh-secret','init-keys','cdp-sign','destroy-keys'],
      'runHelper':['status','enroll','unlock','verify','remove'],
      'runNativeHelper':['status','unlock-batch']}
    callsites=[]
    for function,commands in families.items():
      for command in commands:
        needle=function+'(`'+command+'`'
        positions=[m.start() for m in re.finditer(re.escape(needle),text)]
        for offset in positions:
          callsites.append({'function':function,'command':command,'characterOffset':offset,'utf8ByteOffset':len(text[:offset].encode()),'context':text[max(0,offset-160):offset+len(needle)+210]})
    anchors=[
     'return[path.join(__auxDaemonResources,`native/aux-native.cjs`)]',
     'function loadPdfBinding(){return require$2(path.join(__auxDaemonResources,`native/aux-pdf.cjs`))}',
     'const binding = require(workerData.bindingPath);',
     'parentPort.postMessage({ output: binding.run(workerData.command, workerData.input) });',
     'workerData:{bindingPath:loadedBindingPath,command:Cn,input:ei}',
     'Cn===`save`?`secure-save`:Cn===`read`?`secure-read`:`secure-clear`',
     'ei.mode===`reveal`&&ei.targetType===`file`?`reveal-path`:`open-path`',
     'if(process.platform===`win32`){if(!isNativeHelperBindingAvailable())',
     'function installNativeCrashHandler(){if(process.platform===`win32`)',
    ]
    counts=[{'anchor':a,'count':text.count(a)} for a in anchors]
    assert all(a['count']==1 for a in counts)
    pdf={name:len(re.findall(r'nativePdf\.'+name+r'\(',text)) for name in ['extractText','fillFormFields','getFormFields','merge','renderPages','rotate','split']}
    assert sum(pdf.values())==9
    command_counts={}
    for item in callsites:
      key=item['function']+':'+item['command'];command_counts[key]=command_counts.get(key,0)+1
    assert command_counts['runNativeHelperCommandAsync:generate-thumbnail']==2
    assert all(command_counts['runNativeHelperCommand:'+name]==1 for name in ['app-icons','list-open-apps','copy-file','open-with'])
    assert not list((artifact_root/STAGE).rglob('native.mjs'))
    return {'format':'aux.common-addon.remaining-stage-map.v1','files':files,'stage':STAGE,'commonLoaderLeaves':2,'nativeMjsStandaloneLeaf':False,'commonWrapperBundledFunction':'init_src$6','anchors':counts,'literalCallsites':callsites,'literalCallsiteCounts':command_counts,'nativePdfCalls':pdf,'evaluatedCode':False,'originalAddonLoaded':False,'OSOrSecurityExecuted':False,'UIChanged':False}
def main():
 p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--artifact-root',type=Path,required=True);a=p.parse_args();data=collect(a.artifact_root);encoded=json.dumps(data,indent=2,ensure_ascii=False)+'\n';target=HERE/'source-map.json'
 if a.write:target.write_text(encoded)
 else:assert target.read_text()==encoded,'Pinned actual stage/source map drift'
 print('PASS: actual stage/14 sources pinned; nine PDF calls separated, six Mac OS calls through common binding (thumbnail twice); no code execution')
if __name__=='__main__':main()
