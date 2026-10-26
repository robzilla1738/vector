#!/usr/bin/env python3
"""Construct an unsigned v10 resource from the exact v9 public policy; no activation."""
import argparse,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);args=p.parse_args()
raw=args.source.read_bytes();policy=json.loads(raw)
keys={'format','role','accessGroup','authoritySelection','nativeHostLayout','taskLayout','storageLocation'}
assert set(policy)==keys and policy['format']=='aux.fresh.bootstrap.policy.v9'
assert policy['role']=='daemon' and policy['nativeHostLayout']=='embedded-daemon'
assert policy['taskLayout']=='aux.native.task-control-split.v1'
assert policy['authoritySelection']=='aux.fresh.authority.host-availability.v1'
assert policy['storageLocation']=={'format':'aux.current-os-user-location.v1'}
policy['format']='aux.fresh.bootstrap.policy.v10'
policy['pdfModule']={'path':'Contents/Resources/native/aux-pdf.node','identifier':'dev.aux.browser.pdf','sha256':'ed5b4faec15d3fc3c29a97f0dd304b388844cf0bf16fad5a69a62b357a52dcc0','bytes':9474752}
policy['macOSUtilitiesModule']={'path':'Contents/Resources/native/aux-macos-utilities.node','identifier':'dev.aux.browser.macos-utilities','sha256':'7aff7611505145a5629cf42496be506200e7c1026087b2e397057e646d220e5e','bytes':393720}
data=(json.dumps(policy,separators=(',',':'),sort_keys=True)+'\n').encode()
assert not args.output.exists(),'Never overwrite a policy resource'
args.output.write_bytes(data)
print(json.dumps({'sourceSha256':hashlib.sha256(raw).hexdigest(),'outputSha256':hashlib.sha256(data).hexdigest(),'activated':False,'signed':False}))
