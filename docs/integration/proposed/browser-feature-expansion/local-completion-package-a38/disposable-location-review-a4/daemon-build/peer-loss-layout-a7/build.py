"""Match the linked Node Environment ABI; rebuild main only and link unsigned."""
from pathlib import Path
import hashlib,json,subprocess,time,sys,re
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=HERE.parent/'ordinary-storage-a6'
MAIN_PRIOR=ROOT/'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/actual-daemon-peer-shutdown-build-a19.json'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a67')
OLD_BINARY_SHA='9604e41509998559a5bbfbb75a66ba91494d4b95e0f32c07f0ba2766a1776abf'
FIELDS=['isolate_data_','task_queues_async_','is_stopping_','can_call_into_js_','native_immediates_','native_immediates_threadsafe_mutex_','native_immediates_threadsafe_','native_immediates_interrupts_','task_queues_async_initialized_','principal_realm_']
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as stream:
  while chunk:=stream.read(1024*1024):h.update(chunk)
 return h.hexdigest()
def offsets(path):
 result=subprocess.run(['/usr/bin/dwarfdump',*[f'--name={field}' for field in FIELDS],str(path)],check=True,capture_output=True,text=True).stdout
 values={}
 for block in result.split('\n\n'):
  if 'DW_TAG_member' not in block or 'src/env.h' not in block:continue
  name=re.search(r'DW_AT_name\s+\("([^"]+)"\)',block);value=re.search(r'DW_AT_data_member_location[^\n]*0x([0-9a-fA-F]+)',block)
  if name and value and name[1] in FIELDS:
   assert name[1] not in values or values[name[1]]==int(value[1],16)
   values[name[1]]=int(value[1],16)
 assert set(values)==set(FIELDS),{'missing':sorted(set(FIELDS)-set(values))}
 return values,result
if __name__=='__main__':
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text());fix=json.loads((HERE/'source-plan.json').read_text());profile=json.loads((HERE/'node-base-profile.json').read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json') and actual['binarySha256']==OLD_BINARY_SHA==sha(actual['binary'])
 for group in ['inputFiles','predecessorDependencyPins']:
  for path,digest in prior[group].items():assert sha(path)==digest,path
 assert sha(profile['targetMakefile'])==profile['targetMakefileSha256'] and sha(HERE/'node-base-profile.json')==fix['nodeBaseProfileSha256']
 row=fix['files'][0];source=HERE/'source/AuxNativeDaemonMain.cc';assert sha(row['path'])==row['inputSha256'] and sha(source)==row['outputSha256']
 text=Path(row['path']).read_text()
 for anchor in row['anchors']:assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
 assert text==source.read_text()
 main_receipt=json.loads(MAIN_PRIOR.read_text());assert main_receipt['passed'];original=list(main_receipt['results'][0]['command']);command=list(original)
 command[command.index('-c')+1]=str(source);command[command.index('-o')+1]=str(OUT/'main.o');command[command.index('-MF')+1]=str(OUT/'main.d')
 added=[flag for flag in profile['releaseDefines']+profile['releaseIncludes'] if flag not in command];command+=added
 command+=['-gdwarf-2']
 assert '-DHAVE_INSPECTOR=1' in command and '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1' in command
 link=list(prior['commands'][1]);old_link=list(link);old_main=next(arg for arg in link if arg.endswith('/main.o'));link[link.index(old_main)]=str(OUT/'main.o')
 output_index=link.index('-o')+1;old_output=link[output_index];link[output_index]=str(OUT/'Aux Daemon')
 assert [(a,b) for a,b in zip(old_link,link) if a!=b]==[(old_main,str(OUT/'main.o')),(old_output,str(OUT/'Aux Daemon'))]
 assert '-no_adhoc_codesign' in link and sum(arg.endswith('.swift') for arg in link)==50
 worker=next(arg for arg in link if arg.endswith('/worker-host.o'));assert sha(worker)==actual['workerObjectSha256']
 # Keep the two proven ordinary include sources pinned; their actual A66 object
 # is reused byte-identically, not regenerated with another include context.
 includes=json.loads((PRIOR/'actual-selected-includes.json').read_text())
 for entry in includes['selectedIncludes']:assert sha(entry['selectedPath'])==entry['expectedSha256']
 archive=Path('/private/tmp/aux-isolated-node-archives-20261023/libnode_base.a')
 assert not OUT.exists(),f'Preserve prior output: {OUT}'
 OUT.mkdir(mode=0o700)
 env=OUT/'linked-env.o';env.write_bytes(subprocess.run(['/usr/bin/ar','-p',str(archive),'env.o'],check=True,capture_output=True).stdout)
 expected,expected_text=offsets(env);assert expected['native_immediates_threadsafe_mutex_']==0xa18
 (HERE/'actual-linked-env-layout.txt').write_text(expected_text)
 pins={arg:sha(arg) for cmd in [command,link] for arg in cmd if Path(arg).is_file()};pins[str(archive)]=sha(archive);pins[profile['targetMakefile']]=sha(profile['targetMakefile'])
 plan={'format':'aux.peer-loss.actual-node-layout-build.v1','previousPlanSha256':sha(PRIOR/'build-plan.json'),'previousBinarySha256':OLD_BINARY_SHA,'sourcePlanSha256':sha(HERE/'source-plan.json'),'nodeBaseProfileSha256':sha(HERE/'node-base-profile.json'),'commands':[command,link],'addedActualNodeBaseArguments':added,'dwarfVerificationArgument':'-gdwarf-2','inputFiles':pins,'originalMainCommand':original,'expectedEnvironmentOffsets':expected,'linkedEnvObjectSha256':sha(env),'unchangedSwiftSourceCount':50,'unchangedOtherNativeObjectCount':14,'ordinaryWorkerObject':worker,'ordinaryWorkerObjectSha256':sha(worker),'shutdownListenerAndJoinBodyUnchanged':True,'productExecuted':False,'productSigned':False}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n');start=time.monotonic();results=[];layout=None
 for label,cmd in [('main',command),('link',link)]:
  with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:
   result=subprocess.run(cmd,cwd=ROOT,stdout=stdout,stderr=stderr)
  results.append({'label':label,'exitCode':result.returncode})
  if result.returncode:break
  if label=='main':
   observed,observed_text=offsets(OUT/'main.o');assert observed==expected,{'compiled':observed,'linked':expected}
   (HERE/'actual-main-env-layout.txt').write_text(observed_text)
   layout={'format':'aux.actual-node-environment-layout-match.v1','actualLinkedEnvObjectSha256':sha(env),'compiledMainObjectSha256':sha(OUT/'main.o'),'linkedOffsets':expected,'compiledOffsets':observed,'allTenRelevantMembersMatch':True,'failedMainMutexOffset':'0x968','correctMutexOffset':'0xa18'}
   (HERE/'actual-layout-match.json').write_text(json.dumps(layout,indent=2)+'\n')
 receipt={'format':'aux.peer-loss.node-layout-build-result.v1','passed':len(results)==2 and all(row['exitCode']==0 for row in results),'results':results,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'sourcePlanSha256':sha(HERE/'source-plan.json'),'layout':layout,'unchangedSwiftSourceCount':50,'unchangedOtherNativeObjectCount':14,'ordinaryIncludesAndWorkerObjectUnchanged':True,'shutdownListenerAndJoinBodyUnchanged':True,'productExecuted':False,'productSigned':False,'originalRootAccessed':False}
 for path,digest in pins.items():assert sha(path)==digest,path
 for group in ['inputFiles','predecessorDependencyPins']:
  for path,digest in prior[group].items():assert sha(path)==digest,path
 assert sha(actual['binary'])==OLD_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon';macho=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True);loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True);signed=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  assert 'Mach-O 64-bit executable arm64' in macho.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout and signed.returncode!=0 and 'not signed at all' in signed.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signed.returncode,codesignDisplayStderr=signed.stderr.strip(),inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
