#!/usr/bin/env python3
"""Private unsigned future build only. Never sign, install, launch or grant ES."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,os,shutil,subprocess,sys,time
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent

def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as stream:
  for chunk in iter(lambda:stream.read(4*1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def require(value,message):
 if not value:raise RuntimeError(message)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--root-reviewed-recipe-sha256',required=True);args=parser.parse_args()
 recipe_path=HERE/'recipe.json';require(sha(recipe_path)==args.root_reviewed_recipe_sha256,'Exact root-reviewed inactive recipe hash required')
 r=json.loads(recipe_path.read_text())
 require(r.get('sourceGatesClosed') is True,'Known finite source joins remain; this whole-link executor is inactive. Use compile-startup.py for source object checks only.')
 def verify():
  require(sha(recipe_path)==args.root_reviewed_recipe_sha256,'Recipe changed during operation')
  for path,expected in r['inputHashes'].items():require(sha(path)==expected,'Frozen build input changed: '+path)
 verify()
 require(r['activated'] is False and r['candidateChanged'] is False and r['reviewChanged'] is False and r['EntitlementRequired'] is True,'Only inactive unsigned proposal accepted')
 spec=importlib.util.spec_from_file_location('frozen_archive_format',HERE/'archive-format.py');archive=importlib.util.module_from_spec(spec);spec.loader.exec_module(archive)
 out=Path(r['output']);require(not out.exists() and not out.is_symlink(),'Fresh private future output required');out.mkdir(mode=0o700)
 receipt={'format':'aux.future-supervised-private-build.v1','recipeSha256':sha(recipe_path),'commands':[],'passed':False,'productSigned':False,'productExecuted':False,'activated':False,'candidateChanged':False,'reviewChanged':False,'EntitlementRequired':True,'AppleRequest':r['AppleRequest'],'runtimeAccepted':False}
 def run(command,cwd,kind):
  index=len(receipt['commands']);start=time.monotonic()
  with (out/f'command-{index}.log').open('wb') as log:done=subprocess.run(command,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
  receipt['commands'].append({'kind':kind,'argv':command,'cwd':str(cwd),'exitCode':done.returncode,'seconds':time.monotonic()-start})
  require(done.returncode==0,'Future build step failed: '+kind)
 try:
  a=r['archive'];source=Path(a['source']);require(sha(source)==a['sourceSha256'] and archive.members(source)==a['originalMembers'],'Actual original archive/member inventory changed')
  replacements=out/'replacements';replacements.mkdir(mode=0o700)
  for member,item in a['replacements'].items():
   require(member in [row['name'] for row in a['originalMembers']] and '/' not in member,'Exact existing archive member required')
   require(sha(item['path'])==item['sha256'],'Passed producer object changed')
   shutil.copy2(item['path'],replacements/member);require(sha(replacements/member)==item['sha256'],'Private replacement object differs')
  output=Path(a['output']);require(output.parent==out and not output.exists(),'Private archive output only')
  shutil.copy2(source,output);require(sha(output)==a['sourceSha256'],'Private original archive copy differs')
  run(['/usr/bin/ar','-rsv',str(output)]+list(a['replacements']),replacements,'replace exact private archive members')
  after=archive.members(output);require([x['name'] for x in after]==[x['name'] for x in a['originalMembers']],'Archive member order/coverage changed')
  for old,new in zip(a['originalMembers'],after):
   replacement=a['replacements'].get(old['name'])
   require(new['sha256']==(replacement['sha256'] if replacement else old['sha256']),'Unreviewed archive member changed: '+old['name'])
   if not replacement:require(new==old,'Unchanged archive member metadata differs')
  receipt['privateArchive']={'source':str(source),'sourceSha256':a['sourceSha256'],'path':str(output),'sha256':sha(output),'members':after,'allOtherMembersPreserved':True,'originalUnchanged':sha(source)==a['sourceSha256']}
  for index,command in enumerate(r['commands']):run(command,r['commandWorkingDirectories'][index],['compile current-user ES main','compile current-user fixed-linked Worker','compile paired parent reader object','link unsigned future daemon'][index])
  binary=out/'Aux Daemon'
  run(['/usr/bin/otool','-l',str(binary)],out,'inspect unsigned load commands')
  loads=(out/f'command-{len(receipt["commands"])-1}.log').read_text();require('LC_CODE_SIGNATURE' not in loads,'Unsigned artifact unexpectedly signed')
  run(['/usr/bin/nm','-u',str(binary)],out,'inspect unresolved native producer imports')
  undefined=(out/f'command-{len(receipt["commands"])-1}.log').read_text();require(not any(name in undefined for name in ['AuxNativeExec','AuxNativePty','AuxInitializeFixedPty']),'Native producer ABI remains unresolved')
  verify();require(sha(source)==a['sourceSha256'],'Original archive changed')
  receipt.update(passed=True,outputs={str(p):sha(p) for p in out.iterdir() if p.is_file() and (p.suffix in ['.o','.d','.a'] or p.name=='Aux Daemon')},reusedObjects=r['reuseObjects'],olderWorkerNotLinked=True,sourcePinsCheckedBeforeAndAfter=True)
 except Exception as error:receipt['error']=str(error);raise
 finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps({'receipt':str(out/'receipt.json'),'sha256':sha(out/'receipt.json'),'unsigned':True,'executed':False,'activated':False,'EntitlementRequired':True}))
if __name__=='__main__':main()
