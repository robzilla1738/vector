#!/usr/bin/env python3
"""Prepare a style-only successor of the applied, not compiled carrier parent."""
import argparse, hashlib, importlib.util, json, subprocess, tempfile
from pathlib import Path
HERE = Path(__file__).resolve().parent

def sha(raw): return hashlib.sha256(raw).hexdigest()
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--artifact-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    repo, output = args.artifact_root.resolve(), args.output.resolve()
    pins = json.loads((HERE/'inputs.json').read_text())
    for name, expected in pins['inputs'].items():
        if sha((repo/name).read_bytes()) != expected: raise ValueError('Input differs: '+name)
    parent = repo/'out/native-reuse-composition-aux-carrier-custody-review'
    parent_raw = (parent/'manifest.json').read_bytes()
    parent_manifest = json.loads(parent_raw)
    native = Path(parent_manifest['sourceRoot']).resolve()
    if output.exists() or native == output or native in output.parents:
        raise ValueError('Fresh output outside native checkout required')
    for name, expected in pins['nativeInputs'].items():
        if sha((native/name).read_bytes()) != expected: raise ValueError('Native input differs: '+name)
    if (native/pins['newSource']).exists(): raise ValueError('New source already exists')
    framework = native/'out/AuxFast/Aux.app/Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'
    if sha(framework.read_bytes()) != pins['frameworkSha256']: raise ValueError('Framework differs')
    spec = importlib.util.spec_from_file_location('extend_native',repo/'scripts/extend-provided-native.py')
    extend = importlib.util.module_from_spec(spec); spec.loader.exec_module(extend)
    before, after = {}, {}
    for name in ['installation_carrier_custody.h','installation_carrier_custody.cc']:
        path=Path('chrome/browser/aux')/name
        before[path]=extend.read_source(native,path)
        after[path]=(HERE/'source'/name).read_bytes()
    gn=Path('chrome/browser/aux/BUILD.gn');before[gn]=extend.read_source(native,gn)
    text=before[gn].decode();anchor='    "installation_carrier_custody.h",'
    if text.count(anchor)!=1: raise ValueError('GN anchor differs')
    after[gn]=text.replace(anchor,'    "installation_carrier_custody.cc",\n'+anchor).encode()
    records=[{'path':str(p),'baselineSha256':extend.digest(before[p]),'outputSha256':sha(after[p])} for p in before]
    with tempfile.TemporaryDirectory(prefix='aux-carrier-style-') as tmp:
        tmp=Path(tmp);patch=extend.cumulative_patch(before,after)
        (tmp/'repair.patch').write_bytes(patch)
        (tmp/'metadata.json').write_text(json.dumps({'version':1,'files':records},indent=2)+'\n')
        subprocess.run(['python3',str(repo/'scripts/extend-provided-native.py'),str(parent),
            '--patch',str(tmp/'repair.patch'),'--metadata',str(tmp/'metadata.json'),
            '--output',str(output)],check=True)
        (output/'repair.patch').write_bytes(patch)
        (output/'repair-metadata.json').write_bytes((tmp/'metadata.json').read_bytes())
        manifest=json.loads((output/'manifest.json').read_text())
        manifest['steps'][-1]['patch']=str(output/'repair.patch')
        (output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    mapping=[]
    for path,raw in before.items():
        if raw is not None:
            p=output/'review-before'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
        p=output/'review-after'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(after[path])
        mapping.append({'path':str(path),'beforeSha256':extend.digest(raw),'afterSha256':sha(after[path]),
            'backup':str(Path('review-before')/path) if raw is not None else None})
    receipt={'version':1,'parentCompositionSha256':sha(parent_raw),
        'parentAppliedNotCompiled':True,'currentFrameworkSha256':pins['frameworkSha256'],
        'successorCompositionSha256':sha((output/'manifest.json').read_bytes()),
        'verifiedParentSources':len(parent_manifest['files']),'successorSources':len(manifest['files']),
        'unchangedBinaryAssets':len(manifest['binaryAssets']),'changedSources':len(records),
        'appliedToNative':False,'compiled':False,'fixturesRepeated':False,'uiAssetModification':False,
        'backupMapping':mapping}
    (output/'review-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps(receipt,indent=2))
if __name__=='__main__':main()
