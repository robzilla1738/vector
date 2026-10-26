"""Existing Apple utilities in a synthetic filesystem only, no product code."""
from pathlib import Path
import tempfile,subprocess,json,re,os,hashlib
HERE=Path(__file__).resolve().parent
source=(HERE/'source/AuxAccountMemoryHelper.mm').read_text();profile=re.search(r'constexpr char kSeatbelt\[\]=R"SB\((.*?)\)SB";',source,re.S).group(1)
root=Path(tempfile.mkdtemp(prefix='aux-memory-ancestor-boundary-a11-',dir='/private/tmp'))
task=root/'Tasks';users=task/'u';account=users/'7';memory=account/'memory';other=users/'8';models=task/'models';family=models/'fixed-model';model=family/'generation';control=root/'Control';data=root/'User Data';cache=root/'Cache'
for path in [memory,other,model,control,data,cache]:path.mkdir(parents=True,mode=0o700)
for path in [account/'private.txt',other/'private.txt',memory/'saved.txt',model/'weights.bin',control/'private.txt',data/'private.txt',cache/'private.txt']:
 path.write_text('aux synthetic fixture\n');path.chmod(0o600)
ancestors=[task,users,account,models,family]
for path in ancestors:subprocess.run(['/usr/bin/xattr','-w','com.aux.fixture','aux synthetic fixture',str(path)],check=True,capture_output=True)
params={'AUX_CONTROL':control,'AUX_BROWSER_DATA':data,'AUX_BROWSER_CACHE':cache,'AUX_TASK':task,'AUX_MEMORY':memory,'AUX_MODEL':model,'AUX_TASK_USERS':users,'AUX_MEMORY_ACCOUNT':account,'AUX_MODELS_ROOT':models,'AUX_MODEL_FAMILY':family}
results=[]
def case(label,argv,allowed):
 tool=argv[0];args=['/usr/bin/sandbox-exec']
 for key,value in {'AUX_MEMORY_IMAGE':tool,**params}.items():args+=['-D',key+'='+str(value)]
 args+=['-p',profile,*[str(x) for x in argv]]
 result=subprocess.run(args,capture_output=True,text=True)
 actual=result.returncode==0
 results.append({'case':label,'expectedAllowed':allowed,'exitCode':result.returncode,'passed':actual==allowed,'stdout':result.stdout[:512],'stderr':result.stderr[:512]})
for i,path in enumerate(ancestors):
 case('stat exact ancestor '+str(i),['/usr/bin/stat','-f','%HT',path],True)
 case('deny listing exact ancestor '+str(i),['/bin/ls','-A',path],False)
 case('deny xattr exact ancestor '+str(i),['/usr/bin/xattr','-p','com.aux.fixture',path],False)
case('deny current account sibling contents',['/bin/cat',account/'private.txt'],False)
case('deny other account metadata',['/usr/bin/stat','-f','%HT',other],False)
case('deny other account data',['/bin/cat',other/'private.txt'],False)
case('allow own memory data',['/bin/cat',memory/'saved.txt'],True)
case('allow selected model data',['/bin/cat',model/'weights.bin'],True)
case('allow own memory write',['/usr/bin/touch',memory/'created'],True)
case('deny model write',['/usr/bin/touch',model/'created'],False)
case('deny own memory hardlink',['/bin/ln',memory/'saved.txt',memory/'linked'],False)
for label,path in [('control',control),('browser data',data),('browser cache',cache)]:
 case('deny '+label+' metadata',['/usr/bin/stat','-f','%HT',path],False)
 case('deny '+label+' data',['/bin/cat',path/'private.txt'],False)
 case('deny '+label+' write',['/usr/bin/touch',path/'created'],False)
result={'format':'aux.exact-memory-ancestor-system-boundary.v1','fixtureRoot':str(root),'profileSha256':hashlib.sha256(profile.encode()).hexdigest(),'existingAppleSystemUtilitiesOnly':True,'productOrHelperExecuted':False,'ownerStateAccessed':False,'newExecutableBuilt':False,'passed':all(row['passed'] for row in results),'caseCount':len(results),'results':results}
(HERE/'actual-boundary.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='results'},indent=2))
for row in results:
 if not row['passed']:print(json.dumps(row))
raise SystemExit(0 if result['passed'] else 1)
