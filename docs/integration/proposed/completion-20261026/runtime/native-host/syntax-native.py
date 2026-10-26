#!/usr/bin/env python3
"""Check finite host and changed stream/transport code with actual target flags."""
from pathlib import Path
import hashlib
import json
import shlex
import subprocess
import sys
HERE=Path(__file__).resolve().parent
SOURCE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
BUILD=SOURCE/'out/AuxFast'
plan=json.loads((HERE/'changes.json').read_text())
roots=[]
for row in plan['files']:
    if row['path'].startswith('daemon/'):continue
    roots.append({'type':'file','name':str(SOURCE/row['path']),'external-contents':str(HERE/'source'/row['path'])})
(HERE/'vfs.json').write_text(json.dumps({'version':0,'case-sensitive':'true','roots':roots},indent=2)+'\n')
targets=[
 ('chrome/browser/extensions/api/messaging/aux_native_host_lease.cc','obj/chrome/browser/extensions/api/messaging/messaging.ninja'),
 ('chrome/browser/extensions/api/messaging/native_message_process_host.cc','obj/chrome/browser/extensions/api/messaging/messaging.ninja'),
 ('chrome/browser/extensions/api/messaging/native_process_launcher.cc','obj/chrome/browser/extensions/api/messaging/messaging.ninja'),
 ('chrome/browser/extensions/api/messaging/launch_context.cc','obj/chrome/browser/extensions/api/messaging/messaging.ninja'),
 ('chrome/browser/extensions/api/messaging/launch_context_posix.cc','obj/chrome/browser/extensions/api/messaging/messaging.ninja'),
 ('net/base/file_stream.cc','obj/net/net.ninja'),
 ('net/base/file_stream_context.cc','obj/net/net.ninja'),
 ('chrome/browser/aux/AuxNativePeerTransport.cc','obj/chrome/browser/aux/platform.ninja'),
 ('chrome/browser/aux/AuxOwnedNativePeerChild.cc','obj/chrome/browser/aux/platform.ninja'),
 ('chrome/browser/aux/AuxSelectedStateHome.cc','obj/chrome/browser/aux/platform.ninja'),
 ('chrome/browser/chrome_browser_main.cc','obj/chrome/browser/core.ninja'),
 ('chrome/browser/aux/profile_identity.cc','obj/chrome/browser/aux/platform.ninja'),
]
prior=json.loads((HERE/'native-syntax.json').read_text())['results'] if (HERE/'native-syntax.json').exists() else []
results=[x for x in prior if sys.argv[1:] and Path(x['path']).name not in sys.argv[1:]]
for name,target in targets:
    if sys.argv[1:] and Path(name).name not in sys.argv[1:]:continue
    variables={}
    for line in (BUILD/target).read_text().splitlines():
        if line and not line.startswith(' ') and ' = ' in line:
            k,v=line.split(' = ',1);variables[k]=v.replace('$:',':')
    flags=[]
    for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:
        flags.extend(shlex.split(variables.get(key,'')))
    args=[str(SOURCE/'third_party/llvm-build/Release+Asserts/bin/clang++'),*flags,
        '-fmodule-name='+variables['cc_module_name']+'_Private',
        '-ivfsoverlay',str(HERE/'vfs.json'),'-fsyntax-only',
        str(SOURCE/name) if (SOURCE/name).exists() else str(HERE/'source'/name)]
    result=subprocess.run(args,cwd=BUILD,capture_output=True,text=True)
    log=Path(name).stem+'.syntax.txt';(HERE/log).write_text(result.stdout+result.stderr)
    results.append({'path':name,'exitCode':result.returncode,'log':log,'command':args,'sourceSha256':hashlib.sha256((HERE/'source'/name).read_bytes()).hexdigest()})
    print(name,result.returncode,flush=True)
(HERE/'native-syntax.json').write_text(json.dumps({'results':results,'nativeTreeChanged':False,'objectBuild':False},indent=2)+'\n')
raise SystemExit(any(x['exitCode']!=0 for x in results))
