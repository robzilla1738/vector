from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/Users/rcourson/Documents/Vibe/web');TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-exec-workspace';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
commands=[['/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc','-sdk','/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk','-target','arm64-apple-macos13.5','-typecheck',str(ROOT/'docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift'),'/private/tmp/aux-browser-only-daemon-build-20261025-a61/source/AuxRegisteredMemoryAccountOwner.swift',str(TARGET/'source/AuxSelectedAccountOwner.swift')]]
pins={}
for path in commands[0]:
 if path.endswith('.swift'):
  p=Path(path);local=HERE/'source'/p.name if p.is_relative_to(TARGET) else p;pins[path]=sha(local)
pins[commands[0][0]]=sha(Path(commands[0][0]))
(HERE/'typecheck-recipe.json').write_text(json.dumps({'format':'aux.selected-workspace-owner-typecheck.v1','commands':commands,'inputHashes':pins,'output':'/private/tmp/aux-selected-exec-workspace-typecheck-20261026-a1','activated':False,'candidateChanged':False,'EntitlementRequired':True},indent=2)+'\n')
