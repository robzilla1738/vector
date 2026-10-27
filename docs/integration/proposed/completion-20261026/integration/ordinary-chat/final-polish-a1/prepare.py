#!/usr/bin/env python3
"""Apply the final-polish rules to the pinned current resources in a new derivative directory."""
import hashlib,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
# Pre-polish signed app clone retained by the a1 repair; its leaves are the pinned baseline.
APP=Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-completion-20261026-a1/combined-final-polish-a1/before-repair.app/Contents/Resources/aux/apps')
DIST=APP/'extension/dist'
DAEMON=APP/'daemon/Aux Daemon.app/Contents/Resources/node-development'
SOURCES=[('index.mjs',DAEMON/'index.mjs','8288fc38a69d1983030b6234227b4cc6cd4f9a61a6b63c5765a8bce7b321a4a6','daemon'),
         ('aux-native-entry.mjs',DAEMON/'aux-native-entry.mjs','7f8473737e3d8772e0a3709bf3b98b74288df969905ad0dce68a49753074d1b1','daemon'),
         ('_sessionId-ClN_BWh5.js',DIST/'assets/_sessionId-ClN_BWh5.js','998d750aa961572ff0e4d5aa7d568360dfc397bf004fb7f5567e5c3fb44874a6','session'),
         ('tabsearch-3k_2hgil.js',DIST/'assets/tabsearch-3k_2hgil.js','2581dc9bce21c7f3a049f8c24fce5b8f346565dfd62e5e6d0550b4d06454c218','tabsearch'),
         ('manifest.json',DIST/'manifest.json',None,'manifest')]
sha=lambda b:hashlib.sha256(b).hexdigest()
rules_path=HERE/'rules.json';rules=json.loads(rules_path.read_text())
output=Path(sys.argv[1]).resolve();assert not output.exists()
prepared=[]
for name,path,expected,group in SOURCES:
    assert path.is_file() and not path.is_symlink(),path
    data=path.read_bytes()
    assert expected is None or sha(data)==expected,(name,sha(data))
    text=data.decode()
    for rule in rules[group]:
        assert text.count(rule['find'])==rule['count'],(name,rule['why'])
        assert text.count(rule['replace'])==0,(name,'already applied',rule['why'])
        text=text.replace(rule['find'],rule['replace'])
    if name=='manifest.json':json.loads(text)
    prepared.append((name,data,text.encode()))
output.mkdir(mode=0o700)
for name,_,data in prepared:
    with (output/name).open('xb') as f:f.write(data)
receipt={'format':'aux.final-polish-preparation.v1','rulesSha256':sha(rules_path.read_bytes()),
         'resources':[{'name':n,'beforeSha256':sha(b),'afterSha256':sha(a)} for n,b,a in prepared],
         'appModified':False,'signed':False,'modelCalls':0}
(output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
