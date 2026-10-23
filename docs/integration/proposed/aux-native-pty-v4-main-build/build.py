#!/usr/bin/env python3
"""Serialized real full Swift relink, unsigned and never executed or loaded."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import subprocess
H = Path(__file__).resolve().parent
P = H / 'inputs.json'
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    pins = json.loads(P.read_text())
    out,prior = Path(pins['output']),Path(pins['priorOutput'])
    frozen = dict(pins['frozenFiles'])
    for p in [P,H/'prepare.py',H/'build.py']:
        frozen[str(p)] = sha(p)
    def verify():
        for path,value in frozen.items():
            if sha(Path(path)) != value:
                raise ValueError('Frozen input differs: '+path)
    verify()
    if out.exists():
        raise SystemExit('Fresh external output required')
    out.mkdir(mode=0o700)
    result = {'format':'aux.pty-v4-native-main.build.v1','passed':False,
      'commands':[pins['link']],'results':[],'cppRecompiled':False,'reusedObjects':pins['reusedObjects'],
      'nodeArchivesChecked':42,'priorActualHeaderDependenciesChecked':pins['priorActualHeaderDependenciesChecked'],
      'inputsSha256':sha(P),'recipeSha256':sha(H/'build.py'),
      'policySource':pins['policySource'],'policySourceSha256':pins['policySourceSha256'],
      'loaderSource':pins['loaderSource'],'loaderSourceSha256':pins['loaderSourceSha256'],
      'policyFormat':pins['policyFormat'],'fixedReaderPreserved':pins['fixedReaderPreserved'],
      'automaticAdHocSigningDisabled':True,'signed':False,'executableRun':False,'moduleLoaded':False,
      'policyActivated':False,'acceptedAppChanged':False,'nativeCustodyProven':False}
    failure = None
    try:
        for name,value in pins['reusedObjects'].items():
            shutil.copyfile(prior/name,out/name)
            if sha(out/name) != value:
                raise ValueError('Copied object differs')
        p = subprocess.run(pins['link'],capture_output=True,text=True)
        (out/'link.log').write_text(p.stdout+p.stderr)
        result['results'].append({'command':'link','exitCode':p.returncode})
        if p.returncode:
            raise RuntimeError('Actual full46Swift link failed')
        verify()
        exe,module = out/'Aux Daemon',Path(pins['module'])
        if sha(module) != pins['moduleSha256']:
            raise ValueError('Actual retained module differs')
        for path,kind in [(exe,2),(module,8)]:
            magic,cpu,_,role,*_ = struct.unpack('<8I',path.read_bytes()[:32])
            if (magic,cpu,role) != (0xfeedfacf,0x100000c,kind):
                raise ValueError('Thin arm64 Mach-O role required')
        imports = subprocess.check_output([pins['tools']['dyld_info'],'-imports',str(module)],text=True)
        exports = subprocess.check_output([pins['tools']['dyld_info'],'-exports',str(exe)],text=True)
        flat = set(re.findall(r'^\s+(\S+)\s+\(from <flat-namespace>\)\s*$',imports,re.M))
        available = set(re.findall(r'^\s+0x[0-9A-Fa-f]+\s+(\S+)\s*$',exports,re.M))
        if flat != set(pins['expectedFlatImports']) or flat-available:
            raise ValueError('Actual finite module imports do not resolve in export trie')
        symbols = subprocess.check_output([pins['tools']['nm'],'-m',str(exe)],text=True)
        undefined = subprocess.check_output([pins['tools']['nm'],'-u',str(exe)],text=True)
        paired=[]
        for symbol in pins['swiftInternalDefinitions']:
            lines=[line for line in symbols.splitlines() if line.endswith(' '+symbol)]
            if len(lines)!=1 or 'non-external (was a private external)' not in lines[0] or symbol in undefined.split():
                raise ValueError('Swift capability not actually internally bound: '+symbol)
            paired.extend(lines)
        loads=subprocess.check_output([pins['tools']['otool'],'-l',str(exe)],text=True)
        if 'LC_CODE_SIGNATURE' in loads:
            raise ValueError('Unexpected executable signature')
        for name,contents in [('module-imports.txt',imports),('main-exports.txt',exports),('paired-symbols.txt','\n'.join(paired)+'\n'),('load-commands.txt',loads)]:
            (out/name).write_text(contents)
        result.update({'executableSha256':sha(exe),'executableBytes':exe.stat().st_size,
         'moduleSha256':sha(module),'finiteRequiredModuleImports':sorted(flat),
         'sixPtyApisInActualExportTrie':pins['ptyImports'],
         'swiftInternalDefinitionsBound':pins['swiftInternalDefinitions'],
         'swiftCapabilityUndefined':False,'codeSignatureLoadCommandPresent':False,
         'actualExportTriePassed':True,'passed':True})
    except Exception as error:
        failure=error
        result['error']=str(error)
    finally:
        try:
            verify()
            for name,value in pins['reusedObjects'].items():
                if sha(out/name)!=value:
                    raise ValueError('Reused output object changed')
            result['inputsUnchanged']=True
        except Exception as error:
            failure=error
            result['pinError']=str(error)
            result['passed']=False
        (out/'results.json').write_text(json.dumps(result,indent=2)+'\n')
    if failure:
        raise SystemExit(str(failure))
    print('PASS: real unsigned full46Swift v4 link,11 unchanged objects,44 actual imports resolved,4 internally bound Swift capabilities; no execution')
if __name__=='__main__':
    main()
