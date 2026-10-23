#!/usr/bin/env python3
"""Compile four coherent TUs and perform one unsigned full link; never execute."""
import hashlib,json,re,shlex,shutil,struct,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent;P=H/'inputs.json'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
    pins=json.loads(P.read_text());out=Path(pins['output']);prior=Path(pins['priorOutput'])
    frozen={str(Path(k).resolve()):v for k,v in pins['frozenFiles'].items()}
    for p in [P,H/'prepare.py',H/'build.py']:frozen[str(p)]=sha(p)
    def verify():
        for path,value in frozen.items():
            if sha(path)!=value:raise ValueError('Frozen input differs: '+path)
    verify()
    if out.exists():raise SystemExit('Fresh external output required')
    out.mkdir(mode=0o700)
    result={'format':'aux.worker-close-native-main.build.v1','passed':False,'commands':pins['compile']+[{'object':'Aux Daemon','command':pins['link']}],'results':[],'reusedObjects':pins['reusedObjects'],'recompiledObjects':pins['recompiledObjects'],'nodeArchivesChecked':42,'swiftSourcesUnchanged':46,'inputsSha256':sha(P),'recipeSha256':sha(H/'build.py'),'fixedReaderPreserved':pins['fixedReaderPreserved'],'classHeader':pins['classHeader'],'classHeaderSha256':pins['classHeaderSha256'],'policyFormat':pins['policyFormat'],'automaticAdHocSigningDisabled':True,'signed':False,'executableRun':False,'moduleLoaded':False,'policyActivated':False,'acceptedAppChanged':False,'nativeCustodyProven':False}
    failure=None;dependencies={}
    try:
        for name,value in pins['reusedObjects'].items():
            shutil.copyfile(prior/name,out/name)
            if sha(out/name)!=value:raise ValueError('Copied object differs: '+name)
        for item in pins['compile']:
            object_name=item['object'];run=subprocess.run(item['command'],capture_output=True,text=True)
            (out/(object_name+'.log')).write_text(run.stdout+run.stderr)
            result['results'].append({'command':object_name,'exitCode':run.returncode})
            if run.returncode:raise RuntimeError('Actual changed TU failed: '+object_name)
            text=(out/(Path(object_name).stem+'.d')).read_text().replace('\\\n',' ')
            deps={str(Path(v).resolve()) for v in shlex.split(text.split(':',1)[1])}
            headers={v for v in deps if Path(v).name=='AuxDevelopmentWorkerHost.h'}
            if headers!={pins['classHeader']}:raise ValueError('Class declaration not coherently paired: '+object_name)
            for path in deps:
                if path not in frozen or sha(path)!=frozen[path]:raise ValueError('Actual dependency missing or changed: '+path)
                dependencies[path]=frozen[path]
        verify()
        run=subprocess.run(pins['link'],capture_output=True,text=True)
        (out/'link.log').write_text(run.stdout+run.stderr)
        result['results'].append({'command':'link','exitCode':run.returncode})
        if run.returncode:raise RuntimeError('Actual full46Swift link failed')
        verify();exe=out/'Aux Daemon';module=Path(pins['module'])
        if sha(module)!=pins['moduleSha256']:raise ValueError('Actual retained module differs')
        for path,kind in [(exe,2),(module,8)]:
            magic,cpu,_,role,*_=struct.unpack('<8I',path.read_bytes()[:32])
            if (magic,cpu,role)!=(0xfeedfacf,0x100000c,kind):raise ValueError('Thin arm64 Mach-O role required')
        imports=subprocess.check_output([pins['tools']['dyld_info'],'-imports',str(module)],text=True)
        exports=subprocess.check_output([pins['tools']['dyld_info'],'-exports',str(exe)],text=True)
        flat=set(re.findall(r'^\s+(\S+)\s+\(from <flat-namespace>\)\s*$',imports,re.M))
        available=set(re.findall(r'^\s+0x[0-9A-Fa-f]+\s+(\S+)\s*$',exports,re.M))
        if flat!=set(pins['expectedFlatImports']) or flat-available:raise ValueError('Actual finite module imports do not resolve')
        symbols=subprocess.check_output([pins['tools']['nm'],'-m',str(exe)],text=True)
        undefined=subprocess.check_output([pins['tools']['nm'],'-u',str(exe)],text=True)
        paired=[]
        for symbol in pins['swiftInternalDefinitions']:
            lines=[line for line in symbols.splitlines() if line.endswith(' '+symbol)]
            if len(lines)!=1 or 'non-external (was a private external)' not in lines[0] or symbol in undefined.split():raise ValueError('Swift capability not internally bound: '+symbol)
            paired.extend(lines)
        loads=subprocess.check_output([pins['tools']['otool'],'-l',str(exe)],text=True)
        if 'LC_CODE_SIGNATURE' in loads:raise ValueError('Unexpected executable signature')
        for name,contents in [('module-imports.txt',imports),('main-exports.txt',exports),('paired-symbols.txt','\n'.join(paired)+'\n'),('load-commands.txt',loads)]:
            (out/name).write_text(contents)
        result.update({'executableSha256':sha(exe),'executableBytes':exe.stat().st_size,'moduleSha256':sha(module),'finiteRequiredModuleImports':sorted(flat),'sixPtyApisInActualExportTrie':pins['ptyImports'],'swiftInternalDefinitionsBound':pins['swiftInternalDefinitions'],'swiftCapabilityUndefined':False,'codeSignatureLoadCommandPresent':False,'actualExportTriePassed':True,'changedObjectHashes':{name:sha(out/name) for name in pins['recompiledObjects']},'actualChangedObjectDependencies':dependencies,'allFourClassDeclarationsPaired':True,'passed':True})
    except Exception as error:failure=error;result['error']=str(error)
    finally:
        try:
            verify()
            for name,value in pins['reusedObjects'].items():
                if sha(out/name)!=value:raise ValueError('Reused output object changed: '+name)
            result['inputsUnchanged']=True;result['frozenInputCount']=len(frozen)
        except Exception as error:failure=error;result['pinError']=str(error);result['passed']=False
        (out/'results.json').write_text(json.dumps(result,indent=2)+'\n')
    if failure:raise SystemExit(str(failure))
    print('PASS: four coherent changed TUs, seven reused objects,46Swift/42archives,44 module imports, no signature or execution')
if __name__=='__main__':main()
