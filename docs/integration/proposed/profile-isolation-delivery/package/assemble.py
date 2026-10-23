#!/usr/bin/env python3
"""Assemble an exact inactive successor; never authorize startup or sign."""
import argparse,hashlib,json,os,pathlib,shutil,subprocess
P=pathlib.Path
DAEMON='apps/daemon/Aux Daemon.app/Contents/'
REPLACEMENTS={DAEMON+'MacOS/aux-daemon':0o755,DAEMON+'Resources/node-development/index.mjs':0o644,DAEMON+'Resources/node-development/aux-native-entry.mjs':0o644,DAEMON+'Resources/native/aux-owned-native.cjs':0o644,DAEMON+'Resources/native/node-pty/prebuilds/darwin-arm64/pty.node':0o755}
PAIR_KEYS=dict(zip(REPLACEMENTS,['daemon','source','entry','loader','pty']))
sha=lambda p:hashlib.sha256(P(p).read_bytes()).hexdigest()
def inventory(root):
 result=[]
 for p in sorted(root.rglob('*')):
  n=str(p.relative_to(root));mode=p.lstat().st_mode&0o777
  if p.is_symlink():
   target=os.readlink(p)
   if not p.resolve().is_relative_to(root.resolve()):raise ValueError('escaping link '+n)
   result.append(dict(path=n,type='link',target=target,mode=mode))
  elif p.is_file():result.append(dict(path=n,type='file',sha256=sha(p),mode=mode))
 return result
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def unsigned(root):
 for p in root.rglob('*'):
  if not p.is_file() or p.is_symlink():continue
  with p.open('rb') as stream:magic=stream.read(4)
  if magic not in [bytes.fromhex(x) for x in ['cffaedfe','feedfacf','cefaedfe','feedface','cafebabe','bebafeca','cafebabf','bfbafeca']]:continue
  loads=subprocess.check_output(['/usr/bin/otool','-l',str(p)],text=True)
  if 'LC_CODE_SIGNATURE' in loads:raise ValueError('signed native artifact '+str(p))
def pin(p,h):
 if P(p).is_symlink() or not P(p).is_file() or sha(p)!=h:raise ValueError('input pin '+str(p))
def verify_native_inventory(root,leaves):
 expected=[]
 for x in leaves:
  rel=P(x['path'])
  if rel.is_absolute() or '..' in rel.parts or str(rel)!=x['path']:raise ValueError('invalid native inventory path')
  if x['type']=='file':expected.append({k:x[k] for k in ['path','type','sha256','mode']})
  elif x['type']=='symlink':expected.append(dict(path=x['path'],type='link',target=x['target'],mode=x['mode']))
  else:raise ValueError('unknown native inventory leaf')
 actual=inventory(root)
 if actual!=expected:raise ValueError('native inventory content/mode/coverage mismatch')
 return actual
def verify_pair(r):
 pin(r['sourcePair'],r['sourcePairSha256']);pair=json.loads(P(r['sourcePair']).read_text())
 if pair['passed'] is not True or pair['coldFeatureEnabled'] or pair['runtimeAuthorityGranted']:raise ValueError('inactive exact source pair required')
 items={x['path']:x for x in r['replacements']}
 if len(items)!=len(r['replacements']) or set(items)!=set(PAIR_KEYS):raise ValueError('exact unique paired leaves required')
 for rel,key in PAIR_KEYS.items():
  item=items[rel]
  if item['sha256']!=pair[key+'Sha256'] or P(item['input']).resolve()!=P(pair[key]).resolve():raise ValueError('source pair mismatch '+key)
 if r['daemonReceiptSha256']!=pair['daemonReceiptSha256']:raise ValueError('paired daemon receipt mismatch')
 pin(r['sourceReceipt'],r['sourceReceiptSha256']);pin(r['entryReceipt'],r['entryReceiptSha256'])
 source=json.loads(P(r['sourceReceipt']).read_text());entry=json.loads(P(r['entryReceipt']).read_text())
 if source['passed'] is not True or entry['passed'] is not True or not source['coldRefusalPreserved'] or not entry['defaultEntryRefusalPreserved']:raise ValueError('checked refused projections required')
 if source['composedSha256']!=pair['sourceSha256'] or entry['sourceSha256']!=pair['sourceSha256'] or entry['entrySha256']!=pair['entrySha256'] or entry['loaderSha256']!=pair['loaderSha256'] or entry['sourceReceiptSha256']!=r['sourceReceiptSha256']:raise ValueError('projection receipt pairing mismatch')
 return pair
def main():
 a=argparse.ArgumentParser();a.add_argument('recipe');v=a.parse_args();recipe=P(v.recipe).resolve();r=json.loads(recipe.read_text());out=P(r['output']);baseline=P(r['baselineApp']);native=P(r['nativeApp']);receipt=P(r['nativeReceipt']);pin(receipt,r['nativeReceiptSha256']);build=json.loads(receipt.read_text())
 if not build['passed'] or build['signed'] or not build['sharedLinkConfigUnchanged'] or not build['appStableDuringInventory'] or not build['allInspectedMachoUnsigned']:raise ValueError('successful unsigned full build required')
 pair=verify_pair(r)
 if out.exists() or not out.is_absolute() or any(out.resolve().is_relative_to(p.resolve()) for p in [baseline,native]):raise ValueError('fresh separate output required')
 link=P(r['daemonReceipt']);pin(link,r['daemonReceiptSha256']);linked=json.loads(link.read_text())
 if not linked['passed'] or not linked['inputsUnchanged'] or linked['signed']:raise ValueError('successful unsigned daemon link required')
 if not any(x['sha256']==linked['executableSha256'] for x in r['replacements']):raise ValueError('linked daemon missing')
 if P(build['appPath']).resolve()!=native.resolve():raise ValueError('build app path mismatch')
 leaf_file=receipt.parent/'app-inventory.json';pin(leaf_file,build['appInventoryFileSha256']);leaves=json.loads(leaf_file.read_text())
 if digest(leaves)!=build['appInventorySha256']:raise ValueError('build inventory digest')
 native_inv=verify_native_inventory(native,leaves)
 unsigned(native)
 base_inv=inventory(baseline)
 if digest(base_inv)!=r['baselineInventorySha256'] or digest(native_inv)!=r['nativeInventorySha256']:raise ValueError('app inventory mismatch')
 resources='Contents/Resources/aux';old=baseline/resources
 bundle=json.loads((old/'bundle.json').read_text());changes=[]
 boundary=r['outerBoundary']
 if boundary['path']!='Contents/Resources/package.json' or P(boundary['input']).resolve()!=(baseline/boundary['path']).resolve() or boundary['mode']!=0o644:raise ValueError('exact outer package boundary required')
 pin(boundary['input'],boundary['sha256'])
 if P(boundary['input']).read_bytes()!=b'{\n  "private": true\n}\n':raise ValueError('outer package semantics changed')
 paths=[x['path'] for x in r['replacements']]
 if len(paths)!=len(REPLACEMENTS) or set(paths)!=set(REPLACEMENTS):raise ValueError('exact five replacement leaves required')
 for item in r['replacements']:
  rel=P(item['path'])
  if rel.is_absolute() or '..' in rel.parts:raise ValueError('relative replacement required')
  if item['mode']!=REPLACEMENTS[item['path']]:raise ValueError('replacement mode mismatch')
  pin(old/rel,item['previousSha256']);pin(item['input'],item['sha256']);changes.append(item)
 # The caller's full build is the base: no warm native-object mixing.
 out.mkdir(mode=0o700);app=out/'Aux.app'
 try:
  subprocess.run(['/bin/cp','-cR',str(native),str(app)],check=True)
  if (app/resources).exists():raise ValueError('native seed contains unexpected supplied resources')
  subprocess.run(['/bin/cp','-cR',str(old),str(app/resources)],check=True)
  marker=app/boundary['path']
  if not marker.resolve().is_relative_to(app.resolve()):raise ValueError('outer boundary escape')
  if marker.exists():
   pin(marker,boundary['sha256'])
   if marker.stat().st_mode&0o777!=boundary['mode']:raise ValueError('outer boundary mode changed')
  else:
   shutil.copyfile(boundary['input'],marker);os.chmod(marker,boundary['mode'])
  for item in changes:
   dst=app/resources/item['path']
   if not dst.resolve().is_relative_to((app/resources).resolve()):raise ValueError('replacement escape')
   shutil.copyfile(item['input'],dst);os.chmod(dst,item['mode']);pin(dst,item['sha256'])
   entries=[x for x in bundle['files'] if x['path']==item['path']]
   if len(entries)!=1:raise ValueError('unique bundle leaf required')
   entries[0].update(sha256=item['sha256'],mode=item['mode'],changeKinds=['integration'])
  historical={key:bundle[key] for key in ['finalApp','nativeEntryProjection','finalLocalNativeReplacement','deliveryProvenance'] if key in bundle}
  projection=dict(format='aux.dormant-native-entry.package.v4',dormant=True,sourceSha256=pair['sourceSha256'],files=[dict(path=x['path'],sha256=x['sha256'],mode=x['mode'],bytes=P(x['input']).stat().st_size) for x in changes if PAIR_KEYS[x['path']] in ['entry','loader']],sourceReceiptSha256=r['sourceReceiptSha256'],entryReceiptSha256=r['entryReceiptSha256'],pairedBuildReceiptSha256=sha(link),pairedExecutableSha256=pair['daemonSha256'],defaultEntryRefusalPreserved=True,coldHookEnabled=False,runtimeAuthorityGranted=False)
  bundle['finalApp']=str(app)
  bundle['nativeEntryProjection']=projection
  bundle['finalLocalNativeReplacement']=dict(format='aux.inactive-successor-native.package-inputs.v2',buildReceiptSha256=sha(link),policyFormatSupported=pair['policyFormat'],signedPolicyAccepted=False,authorityGranted=False,coldHookEnabled=False,defaultEntryRefusalPreserved=True,replacements=changes,nativeEntryProjection=projection)
  if 'deliveryProvenance' in bundle:bundle['deliveryProvenance']={**bundle['deliveryProvenance'],'scope':'historical-source-delivery-before-successor-integration'}
  bundle['successorIntegration']={'recipeSha256':sha(recipe),'daemonReceiptSha256':sha(link),'nativeReceiptSha256':sha(receipt),'sourcePairSha256':r['sourcePairSha256'],'baselineMetadata':historical,'outerBoundary':boundary,'dormant':True,'runtimeAuthorityGranted':False,'replacements':changes}
  (app/resources/'bundle.json').write_text(json.dumps(bundle,indent=2)+'\n')
  changed={x['path'] for x in changes}|{'bundle.json'}
  before=inventory(old);after=inventory(app/resources)
  if [x for x in before if x['path'] not in changed]!=[x for x in after if x['path'] not in changed]:raise ValueError('unrelated resource/UI mutation')
  if inventory(baseline)!=base_inv or inventory(native)!=native_inv:raise ValueError('input changed during assembly')
  result=dict(format='aux.inactive-successor-package.v1',passed=True,recipeSha256=sha(recipe),files=inventory(app),uiPreserved=True,sourceAppsUnchanged=True,signed=False,executed=False,coldHookEnabled=False,runtimeAuthorityGranted=False,testable=False)
  result['inventorySha256']=digest(result['files']);(out/'receipt.json').write_text(json.dumps(result,indent=2)+'\n')
 except Exception as e:
  (out/'failure.json').write_text(json.dumps({'passed':False,'error':str(e)}));raise
 print('PASS exact inactive package; runtime acceptance remains required')

if __name__=='__main__':main()
