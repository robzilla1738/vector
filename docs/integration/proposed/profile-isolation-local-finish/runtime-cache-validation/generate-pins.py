"""Offline generation from the exact already-pinned supplied inventory only."""
import hashlib,json,pathlib,posixpath
HERE=pathlib.Path(__file__).parent
inputs=json.loads((HERE/'inputs.json').read_text())
pin=inputs['inputs']['sourcePins'];raw=pathlib.Path(pin['path']).read_bytes()
assert hashlib.sha256(raw).hexdigest()==pin['sha256']
pins=json.loads(raw);assert pins['version']==1 and pins['sourceVersion']=='1.26.1019.335' and len(pins['files'])==10929
records=pins['files'];by_path={e['path']:e for e in records};assert len(by_path)==len(records)
for entry in records:
 name=entry['path'];assert not name.startswith('/') and all(p not in ('','.','..') for p in name.split('/')) and '\\' not in name and '\0' not in name
 parent=posixpath.dirname(name)
 while parent:assert by_path[parent]['type']=='directory';parent=posixpath.dirname(parent)
 if entry['type']=='symlink':
  target=entry['linkTarget'];assert target and not target.startswith('/') and '\0' not in target and '\\' not in target
  target=posixpath.normpath(posixpath.join(posixpath.dirname(name),target))
  for _ in range(40):
   assert not target.startswith(('../','/')) and target!='..';parts=target.split('/')
   for i in range(len(parts)):
    prefix='/'.join(parts[:i+1]);node=by_path[prefix]
    if node['type']=='symlink':target=posixpath.normpath(posixpath.join(posixpath.dirname(prefix),node['linkTarget'],*parts[i+1:]));break
    if i<len(parts)-1:assert node['type']=='directory'
   else:break
  else:raise ValueError('Cyclic link inventory')
q=lambda value:json.dumps(value,ensure_ascii=True)
lines=['// Generated from the exact pinned source inventory; never caller supplied.',f'constexpr char kAuxRuntimeSourceVersion[]={q(pins["sourceVersion"])};']
for i,e in enumerate(records):
 if e.get('anchors'):
  lines.append(f'constexpr aux_runtime_cache::Anchor kAuxRuntimeAnchors{i}[]={{')
  for a in e['anchors']:
   assert a['count']>0 and a['find'] and (a.get('replacement')=='runtimeRoot' or a['find']=='ASIDE_' and a['replace']=='AUX_')
   lines.append('{'+','.join([q(a['find']),q(a.get('replace','')),str(a['count']),'true' if a.get('replacement')=='runtimeRoot' else 'false'])+'},')
  lines.append('};')
lines.append('constexpr aux_runtime_cache::Pin kAuxRuntimePins[]={')
for i,e in enumerate(records):
 lines.append('{'+','.join([q(e['path']),"'"+{'file':'f','directory':'d','symlink':'l'}[e['type']]+"'",str(e['mode']),str(e.get('size',0)),q(e.get('sourceSha256','')),q(e.get('linkTarget','')),f'kAuxRuntimeAnchors{i}' if e.get('anchors') else 'nullptr',str(len(e.get('anchors',[])))])+'},')
lines.append('};')
(HERE/'source/AuxRuntimeCachePins.inc').write_text('\n'.join(lines)+'\n')
