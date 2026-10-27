#!/usr/bin/env python3
"""Apply the brand-sweep rules to pinned app leaves in a new derivative directory.

Usage: prepare.py <Aux.app holding the pinned leaves> <new output directory>
"""
import hashlib,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
APPS='Contents/Resources/aux/apps/'
DAEMON=APPS+'daemon/Aux Daemon.app/Contents/Resources/'
DIST=APPS+'extension/dist/'
SOURCES=[('index.mjs',DAEMON+'node-development/index.mjs','66efcff1bd9a1f80f23613e51f3b1ed4c6cf360d48857de19041c1e52363561a','daemon'),
         ('aux-native-entry.mjs',DAEMON+'node-development/aux-native-entry.mjs','cec5745bb5aad80896d6e1d5d58c7638b078f64829a2263e59e0455de0541481','daemon'),
         ('onboarding-SKILL.md',DAEMON+'static/skills/builtin/onboarding/SKILL.md','e09a588a0fcfc7253006e2d210b09c00943bbf45323181259d641d6852eacdd1','onboarding'),
         ('notion-SKILL.md',DAEMON+'static/skills/builtin/notion/SKILL.md','96230bdac7ef3bc4d1fc4d552a39720aa1fef6b5d05b332de256d83a6705a254','notion'),
         ('general-3dgRbrRk.js',DIST+'assets/general-3dgRbrRk.js','231ffd603754999e7601393b18dc0b03d177bbbfc01650da795991b214dae9f4','general'),
         ('mcps-DmPp5oo9.js',DIST+'assets/mcps-DmPp5oo9.js','9677c647f3537abcf90dd5cf707229e5fb6f83cd185ae19c5f4fcb72060b0d03','mcps'),
         ('queries-ldd77hNk.js',DIST+'assets/queries-ldd77hNk.js','1d92d3847f80b83b38f124663f40b62a0ca97419d8f5358a69131b6283581063','queries'),
         ('recovery-key-CPOQuYx2.js',DIST+'assets/recovery-key-CPOQuYx2.js','b6e6ef4ed1b7dd26b4b5dbea31ed7ad20b2824b5ad62bdcf5ff88274328c377c','recoveryKey'),
         ('content.js',DIST+'content/content.js','ee45b3083e1b2fe712836b585b4d4fa5120cb797d052da1a22c89d9628d7e0de','apiTimeout'),
         ('background.js',DIST+'background.js','5878bfc73f19bc07c31cea0e33da6ae5ef005ce434b891b9975b732285a28fe4','background'),
         ('google-sign-in-C6OIqXPh.js',DIST+'assets/google-sign-in-C6OIqXPh.js','4bcbf7de84a6e5f98f6208fbc8a876d69b6c6206956e4d3144973ff9e9ac7690','googleSignIn'),
         ('browser-icon-DvnonVC4.js',DIST+'assets/browser-icon-DvnonVC4.js','c3fb45292979d9df78a24cdf1d518f999b64d773b93c7ddc5c3e3d3e5fc4a7e0','browserIcon'),
         ('password-LjdLcSRV.js',DIST+'assets/password-LjdLcSRV.js','585025e66ae4f36f08fd86148f99a1131905f35791840bcbde3d79d753d29d9d','password'),
         ('manifest.json',DIST+'manifest.json','2b11aab8c83a06a0a6572d714599593bfe233aab31ab7ab5bc6cc65f52d215a9','manifest'),
         ('Aux Framework','Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework','4ebbd4707703d5c998e866329dbed4917850224490e43c013c6d27f24e73d857','framework')]
sha=lambda b:hashlib.sha256(b).hexdigest()
rules_path=HERE/'rules.json';rules=json.loads(rules_path.read_text())
app=Path(sys.argv[1]).resolve();output=Path(sys.argv[2]).resolve();assert not output.exists()
prepared=[]
for name,relative,expected,group in SOURCES:
    path=app/relative
    assert path.is_file() and not path.is_symlink(),path
    data=path.read_bytes();assert sha(data)==expected,(name,sha(data))
    binary=group=='framework'
    body=data if binary else data.decode()
    for rule in rules[group]:
        find,replace=(rule['find'].encode(),rule['replace'].encode()) if binary else (rule['find'],rule['replace'])
        assert body.count(find)==rule['count'],(name,rule['why'],body.count(find))
        if binary: assert len(find)==len(replace),rule['why']
        body=body.replace(find,replace)
    after=body if binary else body.encode()
    if binary: assert len(after)==len(data)
    if name=='manifest.json':json.loads(body)
    prepared.append((name,relative,data,after))
output.mkdir(mode=0o700)
for name,_,_,data in prepared:
    with (output/name).open('xb') as f:f.write(data)
receipt={'format':'aux.brand-sweep-preparation.v1','rulesSha256':sha(rules_path.read_bytes()),
         'resources':[{'name':n,'target':t,'beforeSha256':sha(b),'afterSha256':sha(a)} for n,t,b,a in prepared],
         'appModified':False,'signed':False,'modelCalls':0}
(output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
