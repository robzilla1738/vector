from pathlib import Path
import json,hashlib,subprocess,time,os,sys,signal,stat,importlib.util,datetime,re
R=Path('/tmp/aux-browser-runtime-builder-ce77c017');S=Path('/Users/rcourson/aux-chromium-stable/chromium/src');OUT=R/'release/test-artifacts/builder-ce77-assertion-batch';OUT.mkdir(parents=True,exist_ok=True)
assert Path.cwd().resolve()==R.resolve() and not (OUT/'state.json').exists(),'one fresh attempt only'
def sha(p):
 p=Path(p);before=p.lstat();assert stat.S_ISREG(before.st_mode),str(p)
 with os.fdopen(os.open(p,os.O_RDONLY|os.O_NOFOLLOW),'rb') as f:
  opened=os.fstat(f.fileno());value=hashlib.file_digest(f,'sha256').hexdigest();after_open=os.fstat(f.fileno())
 after=p.lstat();assert signature(before)==signature(opened)==signature(after_open)==signature(after),str(p)
 return value
def signature(st):return(st.st_dev,st.st_ino,st.st_mode,st.st_size,st.st_mtime_ns)
PAIR=R/'release/test-artifacts/builder-ce77-runtime-helper/pair-proof.json';assert sha(PAIR)=='f3948981c177e577054464b5419eb23cd352eb166d32e66b54e37513cf2a7a9d';pair=json.loads(PAIR.read_text())
PROPOSAL=R/'release/test-artifacts/builder-ce77-native-test-plan/assertion-batch-proposal.json';assert sha(PROPOSAL)=='a38db1537d99abcf3ae7d3a03ae57bcc61239026f39e44eaa6129f9f184ce465';proposal=json.loads(PROPOSAL.read_text())
PREP=R/'release/test-artifacts/builder-ce77-stage-preflight/prep-proof.json';assert sha(PREP)=='c98c06555b6e67a196d4dbf42775ff36705e6c5a6aea2473ea9747af1dada68e';prep=json.loads(PREP.read_text())
WATCH=Path('/tmp/aux-builder-generated-watch/watch.py');assert sha(WATCH)=='482a680db2fd98a1ee592bac72c4c15f1d5fdc59a78445d0026f3c07669bb1c6'
spec=importlib.util.spec_from_file_location('watch',WATCH);w=importlib.util.module_from_spec(spec);spec.loader.exec_module(w);owner=json.loads(w.SLOT.read_text());assert owner['token']==os.environ['AUX_NATIVE_SLOT_TOKEN']
expected={str(S/p):v for p,v in pair['native'].items()};expected.update(pair['generated']);expected.update(pair['componentLibraries']);expected.update(pair['binaries']);expected.update({str(Path(pair['runtimeRoot'])/p):v for p,v in pair['runtimeFiles'].items()})
for item in prep['shellFiles']:expected[str(S/'chrome/browser/resources/aux/assets'/item['path'])]=item['sha256']
expected[str(R/'tests/host/native-window.swift')]=pair['helperSourceSha256'];expected[pair['helperExecutable']]=pair['helperExecutableSha256'];expected[str(S/'out/AuxDev/args.gn')]=pair['argsSha256'];expected[str(S/'out/AuxDev/gen/base/version_info/version_info_values.h')]=pair['versionHeaderSha256']
metadata={};guards=[]
def guard(full=False):
 current=json.loads(w.SLOT.read_text());assert current['pid']==owner['pid'] and current['startedAt']==owner['startedAt'] and current['token']==os.environ['AUX_NATIVE_SLOT_TOKEN'],'slot changed'
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()==pair['identity']['commit']
 assert not subprocess.check_output(['git','status','--porcelain','--untracked-files=all'],cwd=R,text=True).strip(),'frozen source dirty'
 for p,v in expected.items():
  sig=signature(Path(p).lstat());assert stat.S_ISREG(sig[2]),p
  if p in metadata:assert sig==metadata[p],f'metadata drift: {p}'
  if full or p not in metadata or p in pair['generated']:assert sha(p)==v,f'byte drift: {p}'
  metadata[p]=sig
 assert set(pair['runtimeFiles'])=={str(p.relative_to(pair['runtimeRoot'])) for p in Path(pair['runtimeRoot']).rglob('*') if p.is_file()},'runtime closure changed'
 guards.append({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fullHash':full,'files':len(expected)})
 (OUT/'guards.json').write_text(json.dumps(guards,indent=2)+'\n')
def group_rows(pgid):
 rows={}
 for line in subprocess.check_output(['ps','-axo','pid=,ppid=,pgid=,lstart=,comm='],text=True).splitlines():
  f=line.strip().split(None,8)
  if len(f)==9 and int(f[2])==pgid:rows[int(f[0])]={'ppid':int(f[1]),'pgid':int(f[2]),'started':' '.join(f[3:8]),'comm':f[8]}
 return rows
state={'candidate':pair['identity'],'ownerPid':owner['pid'],'controllerPid':os.getpid(),'phase':'preflight','results':[],'qualification':False,'additionalTargetsNotExecuted':proposal['additionalRequiredTargets']};child=None;interrupted=False;watch=None;flags=[OUT/p for p in ['watch-arm','watch-ready','watch-stop','watch-done']]
def save():(OUT/'state.json').write_text(json.dumps(state,indent=2)+'\n')
def stop_group():
 if child is None:return
 # Only the process group created by this retained Popen handle. No global process-name signalling.
 if child.poll() is None:
  assert os.getpgid(child.pid)==child.pid
  os.killpg(child.pid,signal.SIGTERM)
  try:child.wait(timeout=5)
  except subprocess.TimeoutExpired:
   assert os.getpgid(child.pid)==child.pid;os.killpg(child.pid,signal.SIGKILL);child.wait()
 residual=group_rows(child.pid)
 for pid,row in residual.items():
  if group_rows(child.pid).get(pid)==row:
   try:os.kill(pid,signal.SIGTERM)
   except ProcessLookupError:pass
 deadline=time.monotonic()+5
 while group_rows(child.pid) and time.monotonic()<deadline:time.sleep(.1)
 # Kill only the same identities recorded before cleanup, never a reidentified row.
 for pid,row in residual.items():
  if group_rows(child.pid).get(pid)==row:
   try:os.kill(pid,signal.SIGKILL)
   except ProcessLookupError:pass
 state['ownedResidualCleanup']=residual;save()
 # The controller and its parent native slot stay live until a genuine group-empty receipt.
 # Reidentified/new rows are not signalled. Preserve debt and wait for actual absence.
 debt_reported=False
 while group_rows(child.pid):
  state['cleanupDebt']={'group':child.pid,'remaining':group_rows(child.pid),'slotRetained':True};save()
  if not debt_reported:print('CLEANUP DEBT: retaining controller and native slot until actual owned-group absence',flush=True);debt_reported=True
  time.sleep(.25)
 state.pop('cleanupDebt',None);state['groupEmptyReceipt']={'group':child.pid,'monotonicNs':time.monotonic_ns()};save()
def on_signal(signum,frame):
 global interrupted
 interrupted=True;state['interrupt']=signal.Signals(signum).name;save()
signal.signal(signal.SIGINT,on_signal);signal.signal(signal.SIGTERM,on_signal)
def run_child(name,command,evidence):
 global child
 guard();assert not interrupted and watch.poll() is None and not flags[2].exists(),'drift/interrupt before child'
 evidence.mkdir(parents=True,exist_ok=True);assert not (evidence/'controller-result.json').exists()
 with (evidence/'stdout.log').open('wb') as stdout,(evidence/'stderr.log').open('wb') as stderr:
  child=subprocess.Popen(command,cwd=R,stdout=stdout,stderr=stderr,start_new_session=True);record={'name':name,'command':command,'pid':child.pid,'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownedProcessObservations':[]};state['activeChild']=record;save()
  while child.poll() is None:
   rows=group_rows(child.pid)
   if rows!=record.get('lastOwnedProcesses'):record['lastOwnedProcesses']=rows;record['ownedProcessObservations'].append({'monotonicNs':time.monotonic_ns(),'processes':rows});save()
   if interrupted or watch.poll() is not None or flags[2].exists():
    stop_group();raise RuntimeError('owned stop on interrupt/generated drift/watcher failure')
   time.sleep(.25)
 record['exitCode']=child.returncode;record['endedUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();record['remainingOwnedProcesses']=group_rows(child.pid)
 if record['remainingOwnedProcesses']:
  stop_group();record['cleanupError']='owned process group remains after child exit';(evidence/'controller-result.json').write_text(json.dumps(record,indent=2)+'\n');state['results'].append(record);save();raise RuntimeError(record['cleanupError'])
 guard();(evidence/'controller-result.json').write_text(json.dumps(record,indent=2)+'\n');state['results'].append(record);state.pop('activeChild',None);save();print('DIAGNOSTIC',name,'exit',child.returncode,flush=True)
 return record
def validate_native(evidence,batch):
 expected_cases=set(batch['filter'].split(':'));summary=evidence/'launcher-summary.json';actual={};format_name='gtest raw'
 if summary.exists():
  raw=json.loads(summary.read_text());format_name='launcher summary'
  iterations=raw.get('per_iteration_data',[])
  for iteration in iterations:
   for case,attempts in iteration.items():actual.setdefault(case,[]).extend(attempts)
  statuses={case:[attempt.get('status') for attempt in attempts] for case,attempts in actual.items()}
  passed={case for case,values in statuses.items() if values==['SUCCESS']}
 else:
  raw=(evidence/'stdout.log').read_text(errors='replace');runs=re.findall(r'^\[ RUN      \] (\S+)',raw,re.M);oks=re.findall(r'^\[       OK \] (\S+)',raw,re.M)
  actual={case:[] for case in runs};statuses={case:['SUCCESS'] if oks.count(case)==1 and runs.count(case)==1 else ['NOT_SINGLE_SUCCESS'] for case in actual};passed={case for case,values in statuses.items() if values==['SUCCESS']}
 result={'format':format_name,'expectedCases':sorted(expected_cases),'actualCases':sorted(actual),'statuses':statuses,'exactSetMatches':set(actual)==expected_cases,'everyCaseSingleSuccess':passed==expected_cases,'passed':set(actual)==expected_cases and passed==expected_cases}
 (evidence/'assertion-validation.json').write_text(json.dumps(result,indent=2)+'\n');return result

guard(full=True);save();config={'candidate':pair['identity']['commit'],'ownerPid':owner['pid'],'ownerStartedAt':owner['startedAt'],'files':[{'path':p,'sha256':v} for p,v in pair['generated'].items()]};(OUT/'watch-config.json').write_text(json.dumps(config,indent=2)+'\n')
watch=subprocess.Popen(['python3',str(WATCH),'--config',str(OUT/'watch-config.json'),'--arm',str(flags[0]),'--ready',str(flags[1]),'--stop',str(flags[2]),'--done',str(flags[3]),'--output',str(OUT/'watch')],stdout=(OUT/'watch.stdout').open('wb'),stderr=(OUT/'watch.stderr').open('wb'))
try:
 flags[0].touch();end=time.monotonic()+5
 while not flags[1].exists():
  assert watch.poll() is None and not flags[2].exists() and time.monotonic()<end,'watch arm refused';time.sleep(.05)
 state['phase']='native_assertions';save()
 for batch in proposal['linkedNativeBatches']:
  name=batch['binary'];evidence=OUT/'native'/name
  record=run_child(name,[str(S/'out/AuxDev'/name),'--gtest_filter='+batch['filter'],*batch['arguments'],'--test-launcher-summary-output='+str(evidence/'launcher-summary.json')],evidence)
  record['expectedCompiledCases']=batch['compiledCases'];
  try:record['nativeAssertionValidation']=validate_native(evidence,batch)
  except (ValueError,KeyError,TypeError) as error:record['nativeAssertionValidation']={'passed':False,'rawSummaryError':repr(error)}
  record['diagnosticPassed']=record['exitCode']==0 and record['nativeAssertionValidation']['passed'];save()
 state['phase']='physical_journeys';save()
 for batch in proposal['physicalJourneys']:
  output=Path(batch['command'][-1]);assert not output.exists(),'fresh journey output required'
  record=run_child(batch['id'],batch['command'],OUT/'journeys'/batch['id']);manifest=output/'manifest.json'
  if manifest.exists():
   value=json.loads(manifest.read_text());record['manifest']=str(manifest);record['manifestSha256']=sha(manifest);record['cleanupErrors']=value.get('cleanupErrors',[]);record['primaryError']=value.get('error');save()
   if record['cleanupErrors']:raise RuntimeError('journey cleanupErrors; stopping batch')
  else:record['manifestMissing']=True;save()
 guard(full=True);state['phase']='completed';save()
except BaseException as error:
 state['phase']='stopped';state['stopError']=repr(error);stop_group();save();raise
finally:
 flags[3].touch();state['watcherExitCode']=watch.wait(timeout=5);state['cleanupCompletedBeforeParentSlotRelease']=child is None or not group_rows(child.pid);assert state['cleanupCompletedBeforeParentSlotRelease'];save()
assert state['watcherExitCode']==0 and not flags[2].exists()
state['diagnosticFailures']=[r['name'] for r in state['results'] if r.get('diagnosticPassed',r.get('exitCode')==0 and not r.get('manifestMissing')) is not True];save()
artifacts={str(p):sha(p) for p in OUT.rglob('*') if p.is_file()}
for batch in proposal['physicalJourneys']:
 output=Path(batch['command'][-1])
 if output.exists():artifacts.update({str(p):sha(p) for p in output.rglob('*') if p.is_file()})
terminal={'pairProofSha256':sha(PAIR),'controllerSha256':sha(Path(__file__)),'stateSha256':sha(OUT/'state.json'),'actualResults':state['results'],'diagnosticFailures':state['diagnosticFailures'],'ownedGroupEmpty':child is None or not group_rows(child.pid),'slotRetainedUntilControllerReturns':True,'artifactSha256':artifacts,'qualification':False}
(OUT/'terminal-proof.json').write_text(json.dumps(terminal,indent=2)+'\n')
print('BATCH TERMINAL',str(OUT/'terminal-proof.json'),sha(OUT/'terminal-proof.json'),flush=True)
sys.exit(1 if state['diagnosticFailures'] else 0)
