#!/usr/bin/env python3
"""Assemble an exact inactive successor; never authorize startup or sign."""
import argparse,hashlib,json,os,pathlib,shutil,subprocess
P=pathlib.Path
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
  if magic not in [bytes.fromhex(x) for x in ['cffaedfe','feedfacf','cafebabe','bebafeca']]:continue
  loads=subprocess.check_output(['/usr/bin/otool','-l',str(p)],text=True)
  if 'LC_CODE_SIGNATURE' in loads:raise ValueError('signed native artifact '+str(p))
def pin(p,h):
 if P(p).is_symlink() or not P(p).is_file() or sha(p)!=h:raise ValueError('input pin '+str(p))
def main():
 a=argparse.ArgumentParser();a.add_argument('recipe');v=a.parse_args();recipe=P(v.recipe).resolve();r=json.loads(recipe.read_text());out=P(r['output']);baseline=P(r['baselineApp']);native=P(r['nativeApp']);receipt=P(r['nativeReceipt']);pin(receipt,r['nativeReceiptSha256']);build=json.loads(receipt.read_text())
 if not build['passed'] or build['signed'] or not build['sharedLinkConfigUnchanged'] or not build['appStableDuringInventory'] or not build['allInspectedMachoUnsigned']:raise ValueError('successful unsigned full build required')
 if out.exists() or not out.is_absolute() or out.resolve().is_relative_to(baseline.resolve()):raise ValueError('fresh separate output required')
 link=P(r['daemonReceipt']);pin(link,r['daemonReceiptSha256']);linked=json.loads(link.read_text())
 if not linked['passed'] or not linked['inputsUnchanged'] or linked['signed']:raise ValueError('successful unsigned daemon link required')
 if not any(x['sha256']==linked['executableSha256'] for x in r['replacements']):raise ValueError('linked daemon missing')
 if P(build['appPath']).resolve()!=native.resolve():raise ValueError('build app path mismatch')
 leaf_file=receipt.parent/'app-inventory.json';pin(leaf_file,build['appInventoryFileSha256']);leaves=json.loads(leaf_file.read_text())
 if digest(leaves)!=build['appInventorySha256']:raise ValueError('build inventory digest')
 for x in leaves:
  target=native/x['path']
  if x['type']=='file':pin(target,x['sha256'])
  elif not target.is_symlink() or os.readlink(target)!=x['target']:raise ValueError('native link changed')
 unsigned(native)
 base_inv=inventory(baseline);native_inv=inventory(native)
 if len(native_inv)!=len(leaves):raise ValueError('native inventory coverage mismatch')
 if digest(base_inv)!=r['baselineInventorySha256'] or digest(native_inv)!=r['nativeInventorySha256']:raise ValueError('app inventory mismatch')
 resources='Contents/Resources/aux';old=baseline/resources
 bundle=json.loads((old/'bundle.json').read_text());changes=[]
 if not r['replacements']:raise ValueError('explicit replacements required')
 for item in r['replacements']:
  rel=P(item['path'])
  if rel.is_absolute() or '..' in rel.parts:raise ValueError('relative replacement required')
  pin(old/rel,item['previousSha256']);pin(item['input'],item['sha256']);changes.append(item)
 # The caller's full build is the base: no warm native-object mixing.
 out.mkdir(mode=0o700);app=out/'Aux.app'
 subprocess.run(['/bin/cp','-cR',str(native),str(app)],check=True)
 if (app/resources).exists():raise ValueError('native seed contains unexpected supplied resources')
 subprocess.run(['/bin/cp','-cR',str(old),str(app/resources)],check=True)
 try:
  for item in changes:
   dst=app/resources/item['path']
   if not dst.resolve().is_relative_to((app/resources).resolve()):raise ValueError('replacement escape')
   shutil.copyfile(item['input'],dst);os.chmod(dst,item['mode']);pin(dst,item['sha256'])
   entries=[x for x in bundle['files'] if x['path']==item['path']]
   if len(entries)!=1:raise ValueError('unique bundle leaf required')
   entries[0].update(sha256=item['sha256'],mode=item['mode'],changeKinds=['integration'])
  bundle['successorIntegration']={'recipeSha256':sha(recipe),'daemonReceiptSha256':sha(link),'nativeReceiptSha256':sha(receipt),'dormant':True,'runtimeAuthorityGranted':False,'replacements':changes}
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
