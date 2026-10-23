#!/usr/bin/env python3
import pathlib,json,hashlib,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
for name,digest in json.loads((p/'inputs.json').read_text()).items():assert sha(repo/name)==digest,name
for name,digest in json.loads((p/'source-pins.json').read_text())['inputs'].items():assert sha(repo/name)==digest,name
patch=''.join(''.join(difflib.unified_diff(f.read_text().splitlines(True),(p/'source'/f.name).read_text().splitlines(True),fromfile='baseline/'+f.name,tofile='source/'+f.name)) for f in sorted((p/'baseline').iterdir()))
assert patch==(p/'successors.patch').read_text()
print('PASS: exact predecessor/current source pins and five-source successor patch')
