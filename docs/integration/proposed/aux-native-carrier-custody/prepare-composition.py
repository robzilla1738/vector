#!/usr/bin/env python3
"""Verify current compiled parent and prepare an unapplied carrier successor."""
import argparse, hashlib, importlib.util, json, subprocess, tempfile
from pathlib import Path
HERE = Path(__file__).resolve().parent

def sha(data): return hashlib.sha256(data).hexdigest()
def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--artifact-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    options = parser.parse_args()
    repo, output = options.artifact_root.resolve(), options.output.resolve()
    pins = json.loads((HERE / 'composition-inputs.json').read_text())
    for path, expected in pins['inputs'].items():
        if sha((repo / path).read_bytes()) != expected:
            raise ValueError('Pinned composition input differs: ' + path)
    parent = repo / 'out/native-reuse-composition-aux-lifecycle-callbacks'
    parent_bytes = (parent / 'manifest.json').read_bytes()
    manifest = json.loads(parent_bytes)
    native = Path(manifest['sourceRoot']).resolve()
    build = json.loads((repo / 'out/aux-lifecycle-native-build.json').read_bytes())
    if build['buildExitCode'] != 0 or build['compositionSha256'] != sha(parent_bytes):
        raise ValueError('Build receipt does not match parent composition')
    framework = Path(build['buildRoot']) / 'Aux.app/Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'
    if sha(framework.read_bytes()) != pins['frameworkSha256']:
        raise ValueError('Current compiled framework differs')
    if output.exists() or native == output or native in output.parents:
        raise ValueError('Fresh output outside native checkout required')
    gn_path = pins['gnPath']
    gn_raw = (native / gn_path).read_bytes()
    if sha(gn_raw) != pins['gnSha256']: raise ValueError('GN source differs')
    preparer = load_module('carrier_prepare', HERE / 'prepare.py')
    extender = load_module('carrier_extend', repo / 'scripts/extend-provided-native.py')
    with tempfile.TemporaryDirectory(prefix='aux-carrier-composition-') as temporary:
        temporary = Path(temporary)
        proposed = temporary / 'sources'
        preparer.prepare(native, proposed)
        gn = preparer.once(gn_raw.decode(), '    "installation_auth.h",',
            '    "installation_auth.h",\n    "installation_carrier_custody.h",')
        gn += '''
# Direct-carrier custody, using actual native launch/wait and production reaper.
executable("installation_carrier_lifecycle_tests") {
  testonly = true
  sources = [ "installation_carrier_lifecycle_unittest.cc" ]
  deps = [
    ":platform",
    "//base",
    "//mojo/core/test:run_all_unittests",
    "//base/test:test_support",
    "//testing/gtest",
  ]
}
'''
        (proposed / gn_path).write_text(gn)
        fixture_path = 'chrome/browser/aux/installation_carrier_lifecycle_unittest.cc'
        (proposed / fixture_path).write_bytes((HERE / 'test/installation_carrier_lifecycle_unittest.cc').read_bytes())
        before, after = {}, {}
        for target in sorted(proposed.rglob('*')):
            if target.is_file():
                name = target.relative_to(proposed)
                before[name] = extender.read_source(native, name)
                after[name] = target.read_bytes()
        patch = extender.cumulative_patch(before, after)
        patch_file = temporary / 'carrier.patch'
        metadata_file = temporary / 'metadata.json'
        patch_file.write_bytes(patch)
        records = [{'path':str(p), 'baselineSha256':extender.digest(before[p]),
                    'outputSha256':sha(after[p])} for p in before]
        metadata_file.write_text(json.dumps({'version':1,'files':records},indent=2)+'\n')
        # Existing extender independently authenticates ALL parent source/assets,
        # applies/replays on temporary copies, and never edits the native root.
        subprocess.run(['python3', str(repo / 'scripts/extend-provided-native.py'),
            str(parent), '--patch', str(patch_file), '--metadata', str(metadata_file),
            '--output', str(output)],check=True)
        (output / 'carrier.patch').write_bytes(patch)
        (output / 'carrier-metadata.json').write_bytes(metadata_file.read_bytes())
        # Durable step references must not point at deleted temporary files.
        composed = json.loads((output/'manifest.json').read_text())
        composed['steps'][-1]['patch'] = str(output/'carrier.patch')
        (output/'manifest.json').write_text(json.dumps(composed,indent=2)+'\n')
        mapping = []
        for name, raw in before.items():
            if raw is not None:
                target = output / 'review-before' / name
                target.parent.mkdir(parents=True,exist_ok=True)
                target.write_bytes(raw)
            target = output / 'review-after' / name
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(after[name])
            mapping.append({'path':str(name),'beforeSha256':extender.digest(raw),
                            'afterSha256':sha(after[name]),
                            'backup':str(Path('review-before')/name) if raw is not None else None})
        receipt = {'version':1,'parentCompositionSha256':sha(parent_bytes),
            'parentBuildReceiptSha256':pins['inputs']['out/aux-lifecycle-native-build.json'],
            'currentFrameworkSha256':pins['frameworkSha256'],
            'successorCompositionSha256':sha((output/'manifest.json').read_bytes()),
            'changedSources':len(mapping),'verifiedParentSources':len(manifest['files']),
            'binaryAssetsUnchanged':len(manifest['binaryAssets']),
            'appliedToNative':False,'compiled':False,'fixtureExecuted':False,
            'uiAssetModification':False,'backupMapping':mapping}
        (output/'review-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
        print(json.dumps(receipt,indent=2))
if __name__ == '__main__': main()
