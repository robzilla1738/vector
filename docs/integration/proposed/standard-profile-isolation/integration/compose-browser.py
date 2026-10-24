#!/usr/bin/env python3
"""Replay drain proposals into a new source directory; never mutate Chromium."""
import argparse,hashlib,json
from pathlib import Path
scope=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser();p.add_argument('--snapshot',required=True);p.add_argument('--output',required=True);a=p.parse_args()
actual=Path(a.snapshot)/'src';out=Path(a.output);out.mkdir(parents=True,exist_ok=False)
values={};original={};inputs=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 b=p.read_bytes();inputs.append({'path':str(p),'sha256':sha(b)});return b.decode()
def pin(text,digest,label):assert sha(text.encode())==digest,label
for n in ['browser-drain','browser-drain-transport','browser-drain-final','browser-drain-after-mainloop','browser-drain-shutdown-snapshots']:
 lane=scope/n;manifest=json.loads(read(lane/'manifest.json'))
 for f in manifest['files']:
  name=f['path']
  if name not in values:
   path=actual/name
   if name.startswith('daemon/'):
    external=json.loads(read(lane/'external-baselines.json'))[name];path=Path(external['path'])
   values[name]=read(path);original[name]=values[name]
  pin(values[name],f['beforeSha256'],(n,name,'before'))
 rows=json.loads(read(lane/'replacements.json'))
 for row in rows:
  name=row['path'];assert values[name].count(row['old'])==row['count'],(n,name,row['old'][:80])
  values[name]=values[name].replace(row['old'],row['new'],row['count'])
 for f in manifest['files']:pin(values[f['path']],f['afterSha256'],(n,f['path'],'after'))
 for f in manifest.get('added',[]):
  assert f['path'] not in values and not (actual/f['path']).exists()
  values[f['path']]=read(lane/'source'/f['path']);original[f['path']]=None
  pin(values[f['path']],f['sha256'],(n,f['path'],'added'))
# Integrator-owned shared target registration: register the four new drain leaves in their owning targets.
registrations=[('content/browser/BUILD.gn','    "aux_child_lifetime.h",','    "aux_child_lifetime.h",\n    "aux_child_process_drain.cc",'),('content/public/browser/BUILD.gn','    "audio_stream_broker.h",','    "audio_stream_broker.h",\n    "aux_child_process_drain.h",'),('chrome/browser/ui/BUILD.gn','        "aux_owned_browser_quiesce.cc",','        "aux_browser_shutdown_drain.cc",\n        "aux_browser_shutdown_drain.h",\n        "aux_owned_browser_quiesce.cc",')]
for name,before,after in registrations:
 original[name]=read(actual/name);assert original[name].count(before)==1
 values[name]=original[name].replace(before,after,1)
for name,text in values.items():
 p=out/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
rows=[{'path':n,'beforeSha256':sha(original[n].encode()) if original[n] is not None else None,'afterSha256':sha(v.encode())} for n,v in sorted(values.items())]
(out/'composition.json').write_text(json.dumps({'format':'aux.standard-browser-drain.composition.v1','inputs':inputs,'files':rows,'actualTreeChanged':False,'compiled':False,'productExecuted':False},indent=2)+'\n')
print(json.dumps({'files':len(values),'newFiles':sum(original[n] is None for n in values),'sharedGnRegistrations':3,'actualTreeChanged':False}))
