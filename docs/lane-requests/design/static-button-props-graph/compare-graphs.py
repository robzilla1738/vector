from pathlib import Path
import json,hashlib,re
base=Path('/private/tmp/aux-design-static-props-baseline');current=Path('/private/tmp/aux-root-sidebar-selection-next');out=base/'docs/lane-requests/design/static-button-props-graph'
bm=json.loads((base/'apps/shell/dist/.vite/manifest.json').read_text());cm=json.loads((out/'current-manifest.json').read_text());snapshot=json.loads((out/'CURRENT-SNAPSHOT.json').read_text())
assert hashlib.sha256((current/'apps/shell/dist/.vite/manifest.json').read_bytes()).hexdigest()==snapshot['manifestSHA256']
for asset in snapshot['assets']:assert hashlib.sha256((current/'apps/shell/dist'/asset['file']).read_bytes()).hexdigest()==asset['sha256']
def labels(m):
 d={k:('source:'+v['src'] if v.get('src') else 'chunk:'+v.get('name','unknown')) for k,v in m.items() if v['file'].endswith('.js')};assert len(set(d.values()))==len(d);return d
def graph(m):
 names=labels(m);return {names[k]:{'imports':[names[x] for x in v.get('imports',[])],'dynamicImports':[names[x] for x in v.get('dynamicImports',[])],'isEntry':v.get('isEntry',False),'isDynamicEntry':v.get('isDynamicEntry',False)} for k,v in m.items() if k in names}
def metrics(root,m):
 budget=json.loads((root/'scripts/budgets.json').read_text())['bundle'];boot=re.compile(budget['bootDynamicImports']);seen=set();js=set();css=set()
 def visit(k):
  if k in seen:return
  seen.add(k);v=m.get(k)
  if not v:return
  js.add(v['file']);css.update(v.get('css',[]))
  for i in v.get('imports',[]):visit(i)
  for i in v.get('dynamicImports',[]):
   if boot.search(m[i]['file']):visit(i)
 for k in budget['startupEntries']:visit(k)
 dist=root/'apps/shell/dist';return {'startupJS':sum((dist/p).stat().st_size for p in js),'startupCSS':sum((dist/p).stat().st_size for p in css),'totalJS':sum(p.stat().st_size for p in (dist/'assets').glob('*.js')),'startupLabels':sorted(labels(m)[k] for k in seen if k in labels(m))}
def preloads(root,m):
 ids={v['file']:labels(m)[k] for k,v in m.items() if k in labels(m)}
 html=(root/'apps/shell/dist/index.html').read_text();return [ids[url.lstrip('/')] for url in re.findall(r'<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"',html)]
bg,cg=graph(bm),graph(cm);b,c=metrics(base,bm),metrics(current,cm);assert bg.keys()==cg.keys();assert b['startupLabels']==c['startupLabels'];assert preloads(base,bm)==preloads(current,cm)
changed={k:{'before':bg[k],'after':cg[k]} for k in bg if bg[k]!=cg[k]};boot=set(b['startupLabels']);assert all([x for x in bg[k]['imports'] if x not in boot]==[x for x in cg[k]['imports'] if x not in boot] for k in bg);assert all(bg[k]['dynamicImports']==cg[k]['dynamicImports'] and bg[k]['isEntry']==cg[k]['isEntry'] and bg[k]['isDynamicEntry']==cg[k]['isDynamicEntry'] for k in bg)
report={'status':'corrected own-join baseline; first build explicitly invalid','baselineSource':'6a52c99ff','baselineManifestSHA256':hashlib.sha256((base/'apps/shell/dist/.vite/manifest.json').read_bytes()).hexdigest(),'currentManifestSHA256':snapshot['manifestSHA256'],'baseline':b,'current':c,'delta':{k:c[k]-b[k] for k in ['startupJS','startupCSS','totalJS']},'modulepreloadOrder':preloads(base,bm),'baselineGraph':bg,'currentGraph':cg,'rawGraphDifferences':changed,'nodeLabelsEqual':True,'dynamicImportEdgesAndOrderEqual':True,'startupNodesEqual':True,'staticImportEdgesAndOrderExcludingAlreadyBootNodesEqual':True,'rawStaticImportOrderEqual':False,'limits':{'startupJS':501760,'startupCSS':184320,'totalJS':1843200}}
(out/'GRAPH-BYTES-RESULT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'baseline':b,'current':c,'delta':report['delta'],'changedGraphNodes':len(changed),'preloads':report['modulepreloadOrder']},indent=2))
