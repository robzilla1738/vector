#!/usr/bin/env python3
"""Replay count-checked fixed-loader edits against their exact static preimage."""
from pathlib import Path
import argparse,hashlib,json
HERE=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
plan=json.loads((HERE/'entry.anchors.json').read_text());data=a.source.read_bytes()
assert hashlib.sha256(data).hexdigest()==plan['inputSha256']
text=data.decode()
for edit in plan['anchors']:
 assert text.count(edit['before'])==edit['count']==1
 text=text.replace(edit['before'],edit['after'])
assert hashlib.sha256(text.encode()).hexdigest()==plan['outputSha256']
assert not a.output.exists()
a.output.write_text(text)
