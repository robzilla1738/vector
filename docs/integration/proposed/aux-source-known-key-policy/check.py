import pathlib,subprocess,tempfile,shlex,json
repo=pathlib.Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip());base=repo/'docs/integration/proposed';own=base/'aux-source-known-key-policy';frozen=pathlib.Path('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node/bin/node');composed='/Users/rcourson/Documents/Vibe/web/out/provided-candidate-aux-pdf-native/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs'
with tempfile.TemporaryDirectory(prefix='aux-key-family-') as d:
 out=pathlib.Path(d);subprocess.run([str(frozen),str(own/'tests/caller-labels.mjs'),composed,str(out/'labels.json')],check=True)
 subprocess.run(['xcrun','swiftc','-module-cache-path',str(out/'cache'),str(base/'aux-native-p256-envelope-port/source/EnvelopeRecords.swift'),str(base/'aux-native-secure-store/source/AuxSecureStore.swift'),str(own/'tests/main.swift'),'-o',str(out/'fixture')],check=True)
 subprocess.run([str(out/'fixture'),str(out/'labels.json')],check=True)
 # Actual current separate-file native composition, typecheck only. No module load.
 text=(base/'aux-development-host/build.sh').read_text();import re
 files=list(dict.fromkeys(re.findall(r'"\$proposal/([^"\n]+\.swift)"',text)))
 files=[str(base/p) for p in files if '/tests/' not in p]
 subprocess.run(['xcrun','swiftc','-typecheck','-target','arm64-apple-macos13.0','-module-cache-path',str(out/'cache'),'-D','AUX_MINIMAL_RUNTIME_DISPATCH','-D','AUX_SCOPED_SECURE_STORE_DISPATCH','-D','AUX_MACOS_UTILITY_DISPATCH','-framework','AppKit','-framework','QuickLookThumbnailing','-framework','ImageIO',*files],check=True)
 print('PASS: actual current composed scoped native graph typechecked; no factory/Security/OS execution')
