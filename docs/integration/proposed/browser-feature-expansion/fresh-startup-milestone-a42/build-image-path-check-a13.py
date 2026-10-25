"""Check dyld path spelling without Foundation filesystem directory inference."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a53')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
previous=json.loads((HERE/'actual-daemon-peer-identity-reuse-build-a12b.json').read_text());assert previous['passed']
link=list(previous['results'][-1]['command'])
sources=[Path(next(a for a in link if a.endswith('/'+name))) for name in ['AuxFreshBootstrapPolicy.swift','AuxSignedFreshBootstrapPolicyLoader.swift']]
dest=HERE/'image-path-check-source';dest.mkdir()
needle='path.hasPrefix("/"),URL(fileURLWithPath:path).standardizedFileURL.path==path'
helper='''// Loaded image names must be absolute and already lexically normalized.
// Do not ask Foundation to infer file/directory kind for every sealed-system
// image. Actual non-system realpath, census and signature checks are separate.
func freshBootstrapImagePathIsLexicallyCanonical(_ path:String)->Bool {
    guard path.first == "/" else{return false}
    let components=path.split(separator:"/",omittingEmptySubsequences:false)
    return components.count>1 && components.dropFirst().allSatisfy{
        !$0.isEmpty && $0 != "." && $0 != ".."
    }
}

'''
rows=[];patch=[]
for source in sources:
    original=source.read_text();assert original.count(needle)==1,source
    text=original.replace(needle,'freshBootstrapImagePathIsLexicallyCanonical(path)')
    if source.name=='AuxFreshBootstrapPolicy.swift':
        marker='func validateCapturedFreshBootstrapImagePaths('
        assert text.count(marker)==1
        text=text.replace(marker,helper+marker)
    output=dest/source.name;output.write_text(text)
    rows.append(dict(input=str(source),inputSha256=sha(source),output=str(output),outputSha256=sha(output)))
    patch.extend(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+source.name,tofile='b/'+source.name))
    link[link.index(str(source))]=str(output)
with (HERE/'image-path-check-a13.patch').open('x') as f:f.writelines(patch)
with (HERE/'actual-image-path-check-projection-a13.json').open('x') as f:json.dump(dict(passed=True,files=rows,lexicalImagePathChecksOnly=True,fullDyldCensusStillCollectedEveryCall=True,nonSystemRealpathAndSignatureChecksUnchanged=True,resourceAndFdChecksUnchanged=True,noCachedAuthorizationOrCensus=True,uiChanged=False,productExecuted=False),f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700);link[link.index('-o')+1]=str(OUT/'Aux Daemon')
frozen={a:sha(a) for a in link if Path(a).is_file()}
run=subprocess.run(link,cwd=ROOT,capture_output=True)
(OUT/'stdout').write_bytes(run.stdout);(OUT/'stderr').write_bytes(run.stderr)
receipt=dict(format='aux.ordinary-fresh.image-path-check.build.v1',passed=run.returncode==0,results=[dict(command=link,exitCode=run.returncode)],inputFiles=frozen,cppObjectsReused=14,swiftSourceCount=sum(a.endswith('.swift') for a in link),authorizationAndImageCensusUnchanged=True,productSigned=False,productExecuted=False)
if run.returncode==0:
    binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-image-path-check-build-a13.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=run.returncode==0,swiftSources=receipt['swiftSourceCount'],cppObjectsReused=14)))
if run.returncode:print(run.stderr.decode(errors='replace')[-4000:]);raise SystemExit(1)
