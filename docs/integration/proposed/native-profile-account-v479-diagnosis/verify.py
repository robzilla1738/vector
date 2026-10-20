#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
h=Path(__file__).resolve().parent;e=json.loads((h/'source-evidence.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
for row in e['nativePins']:
 assert sha((Path(e['nativeRoot'])/row['path']).read_bytes())==row['sha256']
for row in e['original']+e['sources']+[e['wrapper']]:
 b=Path(row['path']).read_bytes();assert sha(b)==row['sha256']
 for anchor in row.get('anchors',[]):
  s=b.decode();assert s.count(anchor['find'])==anchor['count'];v=s[anchor['offset']:anchor['offset']+anchor['length']];assert v==anchor['text'] and sha(v.encode())==anchor['sha256']
for row in [e['observation'],e['logExcerpt']]:
 assert sha((h/row['copy']).read_bytes())==row['sha256']
print('PASS bounded account/auth source and observation pins; no runtime operations')
