import hashlib
import json
import subprocess
from pathlib import Path

helper=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use')
expected='debc03deb3f94eb7e8b50fa88d25e617f970b75f1e515b757b131655ad3dde51'
if hashlib.sha256(helper.read_bytes()).hexdigest()!=expected:
    raise ValueError('Computer Use helper source changed')
process=subprocess.Popen(['otool','-tvV',str(helper)],stdout=subprocess.PIPE,text=True)
function=''
hits=[]
for line in process.stdout:
    if line.endswith(':\n') and not line.startswith('0'):
        function=line.strip()[:-1]
    if '_posix_spawn' in line or 'launchAndReturnError' in line or 'waitUntilExit' in line or '/usr/bin/osascript' in line or 'homeDirectoryForCurrentUser' in line or 'Library/Messages/chat.db' in line or '_dlopen' in line or '_dlsym' in line or '_SecRandomCopyBytes' in line or 'checkMacPermissions' in line and '\tbl\t' in line or line.startswith('0000000100011cd8'):
        hits.append({'function':function,'instruction':line.strip()})
if process.wait()!=0:
    raise RuntimeError('Static disassembly failed')
for hit in hits:
    hit['function']=subprocess.check_output(['xcrun','swift-demangle','--compact',hit['function']],text=True).strip()
header=Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/sys/spawn.h')
flags=[{'line':index+1,'text':line} for index,line in enumerate(header.read_text().splitlines()) if 'POSIX_SPAWN_SETEXEC ' in line]
imports=subprocess.check_output(['nm','-u',str(helper)],text=True).splitlines()
print(json.dumps({'format':'aux.computer-use.static-subprocess.v1','helper':str(helper),'sha256':expected,
                 'provider':'ordinary-shell-otool-nm-swift-demangle','observedCalls':hits,
                 'spawnFlags':{'path':str(header),'sha256':hashlib.sha256(header.read_bytes()).hexdigest(),'definitions':flags},
                 'inference':{'startup':'reexecDisclaimedIfNeeded sets 0x40, the SDK POSIX_SPAWN_SETEXEC flag: replacement of the current image, not a new child.',
                              'imessage.send':'sendMessage calls NSTask launchAndReturnError and waitUntilExit; this subprocess path cannot complete under process-fork denial.',
                              'otherCommands':'No proof of complete no-fork behavior; actual bounded observer-role acceptance still required.',
                              'privateData':'Messages defaults use Foundation homeDirectoryForCurrentUser plus Library/Messages/chat.db. HOME is not treated as a confinement guarantee. The finite role refuses those exports and denies private filesystem paths with a read/write allowlist.',
                              'dynamicLoading':'Observed dlopen/dlsym calls are in SQLite unixDlOpen/unixDlSym, not observed Keychain calls; no exhaustive indirect-call claim.'},
                 'rea':{'openBinarySucceeded':True,'deepAnalysis':'provider_unavailable','reason':'Installed Ghidra 12.2 unsupported by REA; no compatible native decompiler/JDK. No provider installed or updated. Target closed.'},
                 'credentialImports':[line.strip() for line in imports if any(name in line for name in ['SecItem','SecKeychain','SecKey','SecRandom','_dlsym','_dlopen'])],
                 'helperExecuted':False},indent=2))
