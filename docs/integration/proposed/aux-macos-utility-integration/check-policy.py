#!/usr/bin/env python3
import pathlib,subprocess,re,tempfile
root=pathlib.Path(__file__).resolve().parents[4];proposal=root/'docs/integration/proposed';here=proposal/'aux-macos-utility-integration'
with tempfile.TemporaryDirectory(prefix='aux-v4-content-') as d:
 out=pathlib.Path(d)
 files=list(dict.fromkeys(re.findall(r'"\$proposal/([^"\n]+\.swift)"',(proposal/'aux-development-host/build.sh').read_text())));files=[str(proposal/f) for f in files if '/tests/' not in f]
 subprocess.run(['xcrun','swiftc','-target','arm64-apple-macos13.0','-module-cache-path',str(out/'cache'),'-D','AUX_MINIMAL_RUNTIME_DISPATCH','-D','AUX_SCOPED_SECURE_STORE_DISPATCH','-D','AUX_MACOS_UTILITY_DISPATCH','-D','AUX_ATOMIC_CSK_DISPATCH','-framework','AppKit','-framework','QuickLookThumbnailing','-framework','ImageIO',*files,str(here/'tests/main.swift'),str(root/'out/aux-runtime-utilities-atomic-v4/imports.o'),'-o',str(out/'fixture')],check=True)
 subprocess.run([str(out/'fixture')],check=True)
