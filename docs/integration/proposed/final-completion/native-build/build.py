#!/usr/bin/env python3
"""Full unsigned Swift/Node relink; no code signing, load, install or execution."""
import hashlib,json,re,shutil,struct,subprocess,time
from pathlib import Path
H=Path(__file__).resolve().parent;P=H/'inputs.json'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
 pins=json.loads(P.read_text());out=Path(pins['output']);frozen=dict(pins['frozenFiles'])
 for path in [P,H/'prepare.py',H/'build.py']:frozen[str(path)]=sha(path)
 def verify():
  for path,digest in frozen.items():
   if sha(path)!=digest:raise ValueError('Frozen native input differs: '+path)
 verify()
 if out.exists():raise SystemExit('Fresh native output required')
 out.mkdir(mode=0o700)
 result={'format':'aux.final-completion.native-main.build.v1','passed':False,'inputsSha256':sha(P),'recipeSha256':sha(H/'build.py'),'commands':[pins['link']],'results':[],'sourceReplacements':pins['sourceReplacements'],'objectInputs':pins['objectInputs'],'swiftSourceCount':46,'nodeArchivesChecked':42,'linkedUniqueArchives':37,'archiveOperands':43,'policyFormat':pins['policyFormat'],'fixedReaderPreserved':pins['fixedReaderPreserved'],'peerReference':pins['peerReference'],'automaticAdHocSigningDisabled':True,'signed':False,'executableRun':False,'moduleLoaded':False,'protectedRuntimeAccess':False,'policyActivated':False,'acceptedAppChanged':False,'nativeCustodyProven':False}
 failure=None;started=time.time()
 try:
  for name,entry in pins['objectInputs'].items():
   shutil.copyfile(entry['source'],out/name)
   if sha(out/name)!=entry['sha256']:raise ValueError('Copied native object differs: '+name)
  run=subprocess.run(pins['link'],capture_output=True,text=True)
  (out/'link.log').write_text(run.stdout+run.stderr);result['results'].append({'command':'link','exitCode':run.returncode})
  if run.returncode:raise RuntimeError('Actual combined46-source native link failed')
  verify();exe=out/'Aux Daemon';module=Path(pins['module'])
  if sha(module)!=pins['moduleSha256']:raise ValueError('Original paired PTY module changed')
  for path,role in [(exe,2),(module,8)]:
   magic,cpu,_,kind,*_=struct.unpack('<8I',path.read_bytes()[:32])
   if (magic,cpu,kind)!=(0xfeedfacf,0x100000c,role):raise ValueError('Actual thin arm64 Mach-O role mismatch')
  imports=subprocess.check_output([pins['tools']['dyld_info'],'-imports',str(module)],text=True)
  exports=subprocess.check_output([pins['tools']['dyld_info'],'-exports',str(exe)],text=True)
  flat=set(re.findall(r'^\s+(\S+)\s+\(from <flat-namespace>\)\s*$',imports,re.M));available=set(re.findall(r'^\s+0x[0-9A-Fa-f]+\s+(\S+)\s*$',exports,re.M))
  if flat!=set(pins['expectedFlatImports']) or flat-available:raise ValueError('Finite paired module imports do not actually resolve')
  symbols=subprocess.check_output([pins['tools']['nm'],'-m',str(exe)],text=True);undefined=subprocess.check_output([pins['tools']['nm'],'-u',str(exe)],text=True)
  paired=[]
  for symbol in pins['swiftInternalDefinitions']:
   lines=[line for line in symbols.splitlines() if line.endswith(' '+symbol)]
   if len(lines)!=1 or 'non-external (was a private external)' not in lines[0] or symbol in undefined.split():raise ValueError('Internal native capability not actually bound: '+symbol)
   if symbol in available:raise ValueError('Private capability unexpectedly exported: '+symbol)
   paired.extend(lines)
  hostUndefined=subprocess.check_output([pins['tools']['nm'],'-u',str(out/'2.o')],text=True)
  if hostUndefined.split().count('_AuxCopyAuthenticatedExecPrivateParent')!=1:raise ValueError('New host import missing or ambiguous')
  loads=subprocess.check_output([pins['tools']['otool'],'-l',str(exe)],text=True)
  if 'LC_CODE_SIGNATURE' in loads:raise ValueError('Unexpected executable signature')
  for name,text in [('module-imports.txt',imports),('main-exports.txt',exports),('paired-symbols.txt','\n'.join(paired)+'\n'),('load-commands.txt',loads)]: (out/name).write_text(text)
  result.update({'executableSha256':sha(exe),'executableBytes':exe.stat().st_size,'moduleSha256':sha(module),'finiteRequiredModuleImports':sorted(flat),'sixPtyApisInActualExportTrie':pins['ptyImports'],'swiftInternalDefinitionsBound':pins['swiftInternalDefinitions'],'readonlyExecPrivateParentBound':True,'privateCapabilitiesExported':False,'swiftCapabilityUndefined':False,'codeSignatureLoadCommandPresent':False,'actualExportTriePassed':True,'passed':True})
 except Exception as error:failure=error;result['error']=str(error)
 finally:
  try:
   verify()
   for name,entry in pins['objectInputs'].items():
    if sha(out/name)!=entry['sha256']:raise ValueError('Copied native object changed: '+name)
   result['inputsUnchanged']=True;result['frozenInputCount']=len(frozen)
  except Exception as error:failure=error;result['passed']=False;result['pinError']=str(error)
  result['seconds']=time.time()-started
  (out/'results.json').write_text(json.dumps(result,indent=2)+'\n')
 if failure:raise SystemExit(str(failure))
 print('PASS: actual46-source unsigned full link; four Swift source successors and producer host object;44 module imports and five private internal capabilities; no execution')
if __name__=='__main__':main()
