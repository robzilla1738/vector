#!/usr/bin/env python3
"""Freeze existing browser link inputs and link private unsigned successors only."""
from pathlib import Path
import argparse,concurrent.futures,hashlib,json,os,re,shlex,subprocess,time,sys,shutil
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');BUILD=ROOT/'out/AuxFast';LLVM=ROOT/'third_party/llvm-build/Release+Asserts/bin'
PRODUCERS=Path('/private/tmp/aux-future-browser-producers-20261026-b1');PARENT=Path('/private/tmp/aux-future-supervised-native-20261026-b1/parent-policy.o')
def sha(p):
 h=hashlib.sha256()
 with Path(p).open('rb') as f:
  for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
 return h.hexdigest()
def require(value,message):
 if not value:raise RuntimeError(message)
def thin_members(p):
 # GNU thin archives embed only the symbol/name tables, never member payloads.
 with p.open('rb') as f:
  if f.read(8)!=b'!<thin>\n':return None
  data=f.read()
 cursor=0;names=None;result=[]
 while cursor<len(data):
  header=data[cursor:cursor+60];require(len(header)==60 and header[58:60]==b'`\n','Invalid thin header: '+str(p));cursor+=60
  name=header[:16].decode().strip();size=int(header[48:58])
  if name in ['/','//','/SYM64/']:
   if name=='//':names=data[cursor:cursor+size]
   cursor+=size+(size%2);continue
  if name.startswith('/'):
   require(names is not None and name[1:].isdigit(),'Invalid thin name reference');start=int(name[1:]);name=names[start:names.index(b'/\n',start)].decode()
  else:name=name.removesuffix('/')
  member=Path(name);result.append(member if member.is_absolute() else p.parent/member)
 require(cursor==len(data),'Thin archive framing mismatch');return result
def words(v):return shlex.split(v.replace('$:',':').replace('$ ',' '))
def read_target(name,rule):
 p=BUILD/'obj/chrome'/name;values={};inputs=None
 for line in p.read_text().splitlines():
  if line.startswith('build ') and ': '+rule+' ' in line:
   raw=line.split(': '+rule+' ',1)[1].split(' |',1)[0];inputs=shlex.split(raw.replace('$ ','\\ '));continue
  if ' = ' in line and not line.startswith('build '):key,value=line.strip().split(' = ',1);values[key]=value
 require(inputs is not None,'Missing exact link target');return p,values,inputs
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);parser.add_argument('--startup-producers');parser.add_argument('--reuse-primary-receipt');parser.add_argument('--baseline-receipt');args=parser.parse_args();out=Path(args.output);require(not out.exists(),'Fresh private output required');out.mkdir(mode=0o700)
receipt={'format':'aux.future-browser-private-link.v1','passed':False,'signed':False,'executed':False,'sharedSourceChanged':False,'commands':[]}
pins={};archive_inventory={}
def pin(path):
 p=Path(path);p=p if p.is_absolute() else BUILD/p;p=Path(os.path.abspath(p))
 if str(p) in pins:return
 require(p.is_file(),'Missing link operand: '+str(p));pins[str(p)]=None
 if p.suffix=='.a':
  members=thin_members(p)
  if members is not None:
   archive_inventory[str(p)]=list(map(str,members))
   for member in members:pin(member)
def hashes(paths):
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:return dict(zip(paths,pool.map(sha,paths)))
def run(command,kind):
 index=len(receipt['commands']);start=time.monotonic();print(kind,flush=True)
 with (out/f'command-{index}.log').open('wb') as log:done=subprocess.run(command,cwd=BUILD,stdout=log,stderr=subprocess.STDOUT)
 receipt['commands'].append({'kind':kind,'argv':command,'exitCode':done.returncode,'seconds':time.monotonic()-start});require(done.returncode==0,'Failed: '+kind)
try:
 if args.baseline_receipt:pin(Path(args.baseline_receipt))
 for p in [HERE/'link-browser.py',HERE/'private-browser-link-driver.py',HERE/'browser-source-plan.json',PRODUCERS/'receipt.json',PARENT.parent/'receipt.json',BUILD/'toolchain.ninja',ROOT/'build/toolchain/apple/linker_driver.py',LLVM/'clang++',LLVM/'ld64.lld',LLVM/'llvm-ar']:pin(p)
 producer_receipt=json.loads((PRODUCERS/'receipt.json').read_text());require(producer_receipt['passed'],'Producer proof required')
 for p,h in producer_receipt['outputs'].items():require(sha(p)==h,'Producer changed: '+p);pin(p)
 parent_receipt=json.loads((PARENT.parent/'receipt.json').read_text());require(parent_receipt['passed'] and sha(PARENT)==parent_receipt['outputs'][str(PARENT)],'Parent proof object changed');pin(PARENT)
 old_ui=BUILD/'obj/chrome/browser/ui/libui.a';pin(old_ui);members=thin_members(old_ui);require(members is not None,'Expected actual thin UI archive')
 old_drain=BUILD/'obj/chrome/browser/ui/ui/aux_browser_shutdown_drain.o';require(members.count(old_drain)==1,'Exactly one original drain member required');new_members=[PRODUCERS/'aux_browser_shutdown_drain.o' if p==old_drain else p for p in members];private_ui=out/'libui.a'
 replacement={
 'obj/chrome/browser/core/chrome_browser_main.o':PRODUCERS/'chrome_browser_main.o',
 'obj/chrome/browser/aux/platform/daemon_supervisor.o':PRODUCERS/'daemon_supervisor.o',
 'obj/chrome/browser/aux/platform/AuxOwnedNativePeerChild.o':PRODUCERS/'AuxOwnedNativePeerChild.o',
 'obj/chrome/browser/aux/platform/AuxSelectedStateHome.o':PRODUCERS/'AuxSelectedStateHome.o',
 'obj/chrome/chrome_app_executable/chrome_exe_main_mac.o':PRODUCERS/'chrome_exe_main_mac.o',
 'obj/base/aux_browser_descendant_engine/aux_browser_descendant_bridge.o':PRODUCERS/'aux_browser_descendant_bridge.o',
 'obj/chrome/browser/ui/libui.a':private_ui}
 reused_primary=None;startup_receipt=None
 if args.startup_producers:
  folder=Path(args.startup_producers);startup_receipt=folder/'receipt.json';proof=json.loads(startup_receipt.read_text())
  require(proof['passed'] and proof['sourcePlanSha256']==sha(HERE/'startup-observation-plan.json'),'Accepted startup producer proof required');pin(startup_receipt);pin(HERE/'startup-observation-plan.json')
  require(set(Path(p).name for p in proof['outputs'])=={'AuxNativeParentColdLaunch.o','AuxSelectedStateHome.o'},'Exactly two startup producer outputs required')
  for path,expected in proof['outputs'].items():
   require(sha(path)==expected,'Startup producer changed');pin(path)
   replacement['obj/chrome/browser/aux/platform/'+Path(path).name]=Path(path)
 if args.reuse_primary_receipt:
  primary_receipt=Path(args.reuse_primary_receipt);proof=json.loads(primary_receipt.read_text());require(proof['passed'],'Successful primary receipt required');pin(primary_receipt)
  matches=[(Path(p),h) for p,h in proof['outputs'].items() if Path(p).name=='Aux'];require(len(matches)==1,'Exactly one passed primary required');primary,expected=matches[0];require(sha(primary)==expected,'Passed primary changed');pin(primary)
  shutil.copy2(primary,out/'Aux');require(sha(out/'Aux')==expected,'Private primary copy differs')
  reused_primary={'source':str(primary),'sha256':expected,'receipt':str(primary_receipt),'receiptSha256':sha(primary_receipt)}
 old_swift=['obj/chrome/browser/aux/native_peer_policy/aux_parent_sealed_policy/'+n+'.o' for n in ['AuxAuthenticatedChildParentPolicyReader','AuxFreshBootstrapPolicy','AuxStrictEnvelopeObject']]
 links=[]
 for name,rule,label in [('chrome_app_executable.ninja','link','Aux'),('chrome_framework_shared_library.ninja','solink','Aux Framework')]:
  if rule=='link' and reused_primary:continue
  ninja,values,inputs=read_target(name,rule);pin(ninja)
  for p in inputs:pin(p)
  if rule=='solink':require(all(inputs.count(p)==1 for p in old_swift),'Exact three old parent Swift objects required')
  new=[]
  for p in inputs:
   if p in old_swift:
    if p==old_swift[0]:new.append(str(PARENT))
   else:new.append(str(replacement.get(p,p)))
  # The new WMO object has no Swift debug module. Do not attach the predecessor's
  # stale AST; this only removes debug metadata, not any executable input.
  additions=[]
  for key in ['frameworks','solibs','libs']:additions+=words(values.get(key,''))
  for arg in additions:
   if not arg.startswith('-') and (BUILD/arg).is_file():pin(arg)
  rlibs=words(values.get('rlibs',''))
  for p in rlibs:pin(p)
  rsp=out/(label+'.rsp');rsp.write_text('\n'.join(shlex.quote(x) for x in new+additions)+'\n')
  command=[sys.executable,str(HERE/'private-browser-link-driver.py'),str(out),'-Wcrl,driver,'+str(LLVM/'clang++'),'-Wcrl,strippath,'+str(LLVM/'llvm-strip'),'-Wcrl,installnametoolpath,'+str(LLVM/'llvm-install-name-tool')]
  if rule=='solink':command+=['-Wcrl,otoolpath,'+str(LLVM/'llvm-otool'),'-Wcrl,nmpath,'+str(LLVM/'llvm-nm'),'-Wcrl,tocname,'+str(out/(label+'.TOC')),'-shared']
  ldflags=words(values['ldflags'])
  require(ldflags.count('-mmacos-version-min=13.0')==1,'Expected existing Mac deployment target')
  ldflags=[('-mmacos-version-min=27.0' if flag=='-mmacos-version-min=13.0' else flag) for flag in ldflags]
  command+=ldflags+['-o',str(out/label),'@'+str(rsp)]+rlibs
  require('-Wl,-no_adhoc_codesign' in command,'Unsigned linker flag required')
  links.append({'label':label,'command':command,'responseFile':str(rsp),'responseSha256':sha(rsp),'originalSwiftDebugMetadata':values.get('swiftmodules',''),'predecessorAstOmitted':rule=='solink'})
 print('Freezing '+str(len(pins))+' actual link inputs',flush=True);pins=hashes(list(pins))
 recipe={'format':'aux.future-browser-private-link-recipe.v1','cwd':str(BUILD),'links':links,'inputHashes':pins,'thinArchives':archive_inventory,'uiReplacement':{'source':str(old_ui),'output':str(private_ui),'before':list(map(str,members)),'after':list(map(str,new_members))},'deploymentTarget':'macOS 27.0, arm64; matches accepted M-series scope','baselineReceipt':args.baseline_receipt,'reusedPrimary':reused_primary,'startupProducerReceipt':str(startup_receipt) if startup_receipt else None,'sourceRecompiled':False,'signed':False,'executed':False};(out/'recipe.json').write_text(json.dumps(recipe,indent=2)+'\n');receipt['recipeSha256']=sha(out/'recipe.json')
 run([str(LLVM/'llvm-ar'),'rcsT',str(private_ui),*map(str,new_members)],'private UI archive with one changed member')
 require(thin_members(private_ui)==new_members,'Private archive member order or paths changed')
 for link in links:run(link['command'],'unsigned '+link['label']+' link')
 for label in [item['label'] for item in links]:
  run(['/usr/bin/otool','-l',str(out/label)],label+' load commands')
  require('LC_CODE_SIGNATURE' not in (out/f'command-{len(receipt["commands"])-1}.log').read_text(),'Unexpected signature')
  run([str(LLVM/'llvm-nm'),'-u',str(out/label)],label+' unresolved symbols')
  require(not re.search(r'\b_Aux(?:Native|GetBrowserDescendant|GetActualCli|Authenticated)',(out/f'command-{len(receipt["commands"])-1}.log').read_text()),'Unresolved Aux producer ABI')
 print('Verifying frozen inputs after link',flush=True);require(hashes(list(pins))==pins,'A frozen input changed during link')
 receipt.update(passed=True,outputs={str(out/name):sha(out/name) for name in ['Aux','Aux Framework','libui.a']},unchangedUiMembersPreserved=len(members)-1,inputPinsCheckedBeforeAndAfter=True,daemonCohortReceipt=str(PARENT.parent/'receipt.json'),activationPackageComplete=False,baselineReceipt=args.baseline_receipt,reusedPrimary=reused_primary,startupProducerReceipt=str(startup_receipt) if startup_receipt else None)
except Exception as error:receipt['error']=str(error);raise
finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'receipt':str(out/'receipt.json')}))
