#!/usr/bin/env python3
"""Exact static source projection only; never execute a product."""
from pathlib import Path
import argparse, hashlib, json
HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('output',type=Path);args=parser.parse_args()
args.output.mkdir(parents=True,exist_ok=False)
def digest(data):return hashlib.sha256(data).hexdigest()
receipts=[]
for plan_name in ['projection.json','source-transforms.json']:
 plan=json.loads((HERE/plan_name).read_text())
 for row in plan['files']:
  if row.get('create'):
   source=HERE/'source'/row['name'];data=source.read_bytes()
  else:
   source=Path(row['input']);data=source.read_bytes()
   if digest(data)!=row['inputSha256']:raise SystemExit(f'Input changed: {source}')
   text=data.decode()
   for anchor in row['anchors']:
    if text.count(anchor['before'])!=anchor['count']:raise SystemExit(f'Anchor changed: {source}')
    text=text.replace(anchor['before'],anchor['after'])
   data=text.encode()
  if digest(data)!=row['outputSha256']:raise SystemExit(f'Output mismatch: {source}')
  name=row.get('name',row.get('outputName'));out=args.output/name
  if out.exists():raise SystemExit(f'Duplicate output: {name}')
  out.write_bytes(data);receipts.append({'path':str(out),'sha256':digest(data)})
(args.output/'receipt.json').write_text(json.dumps({'files':receipts,'productExecuted':False},indent=2)+'\n')
print(f'Passed exact projection of {len(receipts)} files')
