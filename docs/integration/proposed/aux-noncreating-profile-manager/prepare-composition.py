#!/usr/bin/env python3
"""Compose corrective successor from the actual applied baseline, never staged forcing."""
from pathlib import Path
import argparse,hashlib,json,subprocess
here=Path(__file__).resolve().parent;repo=here.parents[3];parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);a=parser.parse_args();out=a.output.resolve();assert not out.exists();pins=json.loads((here/'inputs.json').read_text());subprocess.run(['python3',str(here/'verify.py')],check=True)
metadata={'version':1,'files':[{'path':x['path'],'baselineSha256':x['inputSha256'],'outputSha256':x['outputSha256']}for x in pins['files']]};out.parent.mkdir(parents=True,exist_ok=True);mp=out.parent/(out.name+'-metadata.json');assert not mp.exists();mp.write_text(json.dumps(metadata,indent=2)+'\n')
subprocess.run(['python3',str(repo/'scripts/extend-provided-native.py'),str(Path(pins['parentManifest']).parent),'--patch',str(here/'followup.patch'),'--metadata',str(mp),'--output',str(out)],check=True)
m=json.loads((out/'manifest.json').read_text());assert len(m['files'])==791 and len(m['binaryAssets'])==23;assert m['parentCompositionSha256']==pins['parentManifestSha256']
print('PASS: unapplied 791-source /23-asset corrective composition; actual applied base verified without --staged-base')
