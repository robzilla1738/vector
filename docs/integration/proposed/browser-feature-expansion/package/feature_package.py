#!/usr/bin/env python3
"""Prepare/assemble a fresh inactive feature successor using existing gates."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
sys.dont_write_bytecode = True
ROOT = Path(os.environ.get('AUX_FEATURE_PACKAGE_REPOSITORY', Path(__file__).resolve().parents[5])).resolve()
PACKAGE = ROOT / 'docs/integration/proposed/profile-isolation-delivery/package'
PROTECTED = ROOT / 'docs/integration/proposed/profile-isolation-protected-startup/integration'
RESOURCES = Path('Contents/Resources/aux')
CLI = 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli'
DEVELOPMENT_POLICY = {'mode': 'development', 'origins': {
    'api': 'https://dev-cloud.getaux.co', 'share': 'https://dev-cloud.getaux.co'}}
SPEC = importlib.util.spec_from_file_location('previous_assembler', PACKAGE / 'assemble.py')
legacy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(legacy)


def read(path):
    return json.loads(Path(path).read_text())


def reference(path):
    p = Path(path).resolve()
    legacy.pin(p, legacy.sha(p))
    return {'path': str(p), 'sha256': legacy.sha(p)}


def resolve(ref):
    legacy.pin(ref['path'], ref['sha256'])
    return Path(ref['path'])


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify_feature_native(build, composition):
    require(build.get('format') == 'aux.chromium.unsigned-full-build.v1',
            'Fresh full native app receipt required; object-only receipts are insufficient')
    for key in ['passed', 'sharedLinkConfigUnchanged', 'appStableDuringInventory', 'allInspectedMachoUnsigned']:
        require(build.get(key) is True, 'Native full-build gate: ' + key)
    require(build.get('signed') is False and build.get('appExecuted') is False,
            'Unsigned unexecuted native successor required')
    verify_guarded_native(build)
    require(composition.get('format') == 'aux.browser-features.composition.v1', 'Feature composition required')
    pins = composition['inputPins']
    require(bool(pins), 'Empty feature native pin set')
    for name, value in pins.items():
        require(build['nativeInputPins']['files'].get(name) == value,
                'Full build does not include current feature source: ' + name)
        legacy.pin(Path(build['source']) / name, value)
    for item in composition['files']:
        legacy.pin(ROOT / item['source'], item['afterSha256'])
        require(pins.get(item['path']) == item['afterSha256'], 'Composition source/pin mismatch')


def verify_guarded_native(build):
    """Successor of the old exact validator: only three reviewed source changes."""
    pins = Path(build['nativeInputPinsPath'])
    require(pins.is_absolute(), 'Explicit full native input manifest path required')
    legacy.pin(pins, build['nativeInputPinsSha256'])
    inputs = read(pins)
    require(inputs == build['nativeInputPins'], 'Native frozen input receipt mismatch')
    barrier = ROOT / 'docs/integration/proposed/profile-isolation-custody/barrier'
    expected = {name: item['after'] for name, item in read(barrier / 'sources.json').items()}
    gn = read(barrier / 'integration/gn-registration.json')
    expected[gn['path']] = gn['afterSha256']
    review = read(Path(__file__).with_name('guard-transition.json'))
    patch = Path(__file__).with_name('guard-transition.patch')
    legacy.pin(patch, review['patchSha256'])
    permitted = {'chrome/browser/aux/AuxSelectedStateHome.cc',
                 'chrome/browser/aux/AuxSelectedStateHome.h', 'chrome/browser/aux/BUILD.gn'}
    require({x['path'] for x in review['files']} == permitted and len(review['files']) == 3,
            'Exact reviewed native guard transition required')
    with tempfile.TemporaryDirectory(prefix='aux-feature-guard-replay-') as temp:
        tree = Path(temp)
        for item in review['files']:
            legacy.pin(ROOT / item['baseline'], item['beforeSha256'])
            legacy.pin(ROOT / item['source'], item['afterSha256'])
            if item['path'] in expected:
                require(expected[item['path']] == item['beforeSha256'], 'Original barrier source mismatch')
            target = tree / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / item['baseline'], target)
        subprocess.run(['git', 'apply', '--check', str(patch)], cwd=tree, check=True)
        subprocess.run(['git', 'apply', str(patch)], cwd=tree, check=True)
        for item in review['files']:
            legacy.pin(tree / item['path'], item['afterSha256'])
            expected[item['path']] = item['afterSha256']
    for name, value in expected.items():
        require(inputs['files'].get(name) == value, 'Final native defense/registration missing: ' + name)
    # Reverse every exact GN edit already frozen in the three-file review.
    # The platform defense changes only by the two participant sources; the
    # separate profile-updater/shortcut targets also need their reviewed deps.
    gn_item = next(x for x in review['files'] if x['path'] == 'chrome/browser/aux/BUILD.gn')
    text = (ROOT / gn_item['source']).read_text()
    inverse = [
        ('    "feature_store/feature_write_participant.cc",\n    "feature_store/feature_write_participant.h",\n', ''),
        ('  public_deps = [ "//chrome/browser/ui:aux_profile_search_headers", "//base", "//chrome/browser/profiles:profile",\n',
         '  public_deps = [ "//base", "//chrome/browser/profiles:profile",\n'),
        ('      ":keyboard_shortcut_parser",\n      ":platform",\n      ":profile_identity",\n      "//crypto",\n      "//chrome/browser/ui:aux_profile_search_headers",\n',
         '      ":keyboard_shortcut_parser",\n'),
        ('    frameworks = [ "AppKit.framework", "Carbon.framework" ]\n',
         '    frameworks = [ "AppKit.framework" ]\n'),
    ]
    for find, replacement in inverse:
        require(text.count(find) == 1, 'Unique reviewed GN edit required')
        text = text.replace(find, replacement)
    require(text.encode() == (ROOT / gn_item['baseline']).read_bytes(), 'Unreviewed platform GN mutation')


def stage_inputs(stage, profile):
    manifest = read(stage / 'manifest.json')
    require(manifest.get('implementation') == 'supplied' and manifest.get('identityProfile') == 'aux-v1'
            and manifest.get('stateIdentityVersion') == 2 and manifest.get('featureProfile') == profile
            and manifest.get('productionReady') is False, 'Explicit inactive Aux-v2 stage required')
    require(manifest.get('cloudPolicy') == DEVELOPMENT_POLICY,
            'Exact existing development service configuration required; this does not activate services')
    for item in manifest['adaptationInputs'] + manifest['brandInputs']:
        legacy.pin(ROOT / item['path'], item['sha256'])
    return manifest


def leaf_map(root):
    return {item['path']: item for item in legacy.inventory(root)}


def resource_deltas(baseline_stage, feature_stage, baseline_app):
    before = stage_inputs(baseline_stage, 'baseline')
    after = stage_inputs(feature_stage, 'desktop-v1')
    require(before['adaptationInputs'] == after['adaptationInputs'] and before['brandInputs'] == after['brandInputs'],
            'Baseline and feature stages must use identical current source inputs')
    require(before['cloudPolicy'] == after['cloudPolicy'], 'Stage service configuration mismatch')
    require(before['finalApp'] == after['finalApp'], 'Stage final-app target mismatch')
    output = []
    # Do not merge new stage native/addon/runtime trees into a protected package.
    # Only supplied Agent JS and the CLI SEA receive feature overlays.
    for scope, target in [('ui/agent', 'apps/extension/dist'),
                          ('apps/cli/Aux CLI.app', 'apps/cli/Aux CLI.app')]:
        left = leaf_map(baseline_stage / scope)
        right = leaf_map(feature_stage / scope)
        require(left.keys() == right.keys(), 'Feature stage adds/removes product leaves: ' + scope)
        for name, old in left.items():
            new = right[name]
            destination = str(Path(target) / name)
            # The packaged executable is the unchanged native pre-home wrapper.
            if scope.startswith('apps/cli') and name == 'Contents/MacOS/aux-cli':
                destination += '-sea'
            if old == new:
                continue
            require(old['type'] == new['type'] == 'file' and old['mode'] == new['mode'],
                    'Only same-mode regular feature replacements allowed')
            allowed = scope == 'ui/agent' and Path(name).suffix in {'.js', '.mjs'}
            allowed |= scope.startswith('apps/cli') and name == 'Contents/MacOS/aux-cli'
            packaged = baseline_app / RESOURCES / destination
            previous_hash = old['sha256']
            if scope == 'ui/agent' and name == 'manifest.json':
                # Stager's exact revision ledger authenticates final Agent bytes.
                # Revision-only drift is expected; grants/identity must not drift.
                manifests = [read(packaged), read(baseline_stage/scope/name), read(feature_stage/scope/name)]
                for manifest in manifests:
                    require(manifest.get('version_name') == '1.26.1016.1852', 'Unexpected Agent source version')
                    version = manifest.pop('version', None)
                    require(isinstance(version, str) and version.startswith('1.26.1016.'), 'Unexpected Agent revision')
                require(manifests[0] == manifests[1] == manifests[2], 'Agent identity/permissions manifest drift')
                previous_hash = legacy.sha(packaged)
                allowed = True
            require(allowed, 'Unexpected feature product delta (CSS/assets/addons prohibited): ' + destination)
            legacy.pin(packaged, previous_hash)
            require(packaged.stat().st_mode & 0o777 == old['mode'], 'Baseline packaged mode mismatch')
            output.append({'path': destination, 'previousSha256': previous_hash,
                           'input': str(feature_stage / scope / name), 'sha256': new['sha256'], 'mode': new['mode']})
    require(any(x['path'].startswith('apps/extension/dist/') for x in output), 'Missing feature Agent UI deltas')
    require(any(x['path'] == CLI + '-sea' for x in output), 'Missing feature CLI SEA delta')
    return output


def feature_records(bundle, replacements, wrapper):
    """Map the one staged CLI SEA record to its installed payload name."""
    sea = [item for item in replacements if item['path'] == CLI + '-sea']
    require(len(sea) == 1, 'Exact CLI SEA replacement required')
    records = bundle['files']
    require(not any(item['path'] == CLI + '-sea' for item in records),
            'Expected original staged CLI metadata before native-wrapper mapping')
    old = [item for item in records if item['path'] == CLI]
    require(len(old) == 1 and old[0]['type'] == 'file'
            and old[0]['sha256'] == sea[0]['previousSha256']
            and old[0]['mode'] == sea[0]['mode'],
            'Original CLI metadata must authenticate the exact retained SEA payload')
    target = 'apps/cli/Aux CLI.app'
    components = [item for item in bundle['components'] if item['target'] == target]
    require(len(components) == 1 and components[0]['records']
            == sum(item['path'].startswith(target + '/') for item in records),
            'Exact original CLI component count required')
    old[0]['path'] = CLI + '-sea'
    records.append({'path': CLI, 'type': 'file', 'sha256': wrapper['sha256'],
                    'mode': wrapper['mode'], 'source': 'reviewed-native-pre-home-wrapper',
                    'changeKinds': ['integration']})
    components[0]['records'] += 1
    for replacement in replacements:
        found = [item for item in records if item['path'] == replacement['path']]
        require(len(found) == 1 and found[0]['type'] == 'file'
                and found[0]['sha256'] == replacement['previousSha256']
                and found[0]['mode'] == replacement['mode'],
                'Unique exact previous packaged feature record required: ' + replacement['path'])


def verify_composed_pair_leaf(base, pair, item):
    kind = item['kind']
    require(pair[kind + 'Sha256'] == item['afterSha256'],
            'Paired leaf differs from independent feature composition')
    expected = Path(item['output']).resolve()
    if kind == 'entry':
        receipt_path = Path(base['entryReceipt']).resolve()
        legacy.pin(receipt_path, base['entryReceiptSha256'])
        receipt = read(receipt_path)
        require(receipt.get('passed') is True and receipt.get('defaultEntryRefusalPreserved') is True
                and receipt.get('entrySha256') == item['afterSha256'],
                'Successful projected entry must equal independently composed entry')
        expected = receipt_path.parent / 'aux-native-entry.mjs'
    require(Path(pair[kind]).resolve() == expected,
            'Paired leaf must use the exact composed source or receipt-bound projected entry')
    legacy.pin(expected, item['afterSha256'])


def verify(recipe):
    require(recipe.get('format') == 'aux.browser-features.inactive-package.recipe.v1', 'Unknown feature recipe')
    require(Path(recipe['repository']).resolve() == ROOT, 'Recipe repository mismatch')
    for name in ['assembler', 'preparer', 'tool', 'guardReview', 'guardPatch', 'toolchainReview']:
        resolve(recipe[name])
    require(resolve(recipe['assembler']) == PACKAGE / 'assemble.py', 'Exact previous assembler required')
    require(resolve(recipe['preparer']) == PACKAGE / 'prepare.py', 'Exact previous preparer required')
    base_path = resolve(recipe['baseRecipe'])
    base = read(base_path)
    protected_recipe = read(PROTECTED / 'package-recipe.json')
    require(base['baselineApp'] == protected_recipe['baselineApp']
            and base['baselineInventorySha256'] == protected_recipe['baselineInventorySha256'],
            'Original final-local baseline required; runtime metadata must still be absent')
    require(base['format'] == 'aux.inactive-successor.recipe.v1', 'Prepared protected recipe required')
    # These are the existing source, frozen-native, runtime, and admission gates.
    pair = legacy.verify_pair(base)
    require(pair.get('nativeBrowserReceiptSha256') == base['nativeReceiptSha256'],
            'Source pair must bind this exact full native browser receipt')
    legacy.runtime_changes(base)
    native_receipt = Path(base['nativeReceipt'])
    legacy.pin(native_receipt, base['nativeReceiptSha256'])
    build = read(native_receipt)
    composition_path = resolve(recipe['nativeComposition'])
    composition = read(composition_path)
    require(build['nativeInputPins'].get('featureCompositionSha256') == legacy.sha(composition_path),
            'Full native input manifest must bind the exact feature composition')
    verify_feature_native(build, composition)
    daemon = read(resolve(recipe['daemonComposition']))
    require(daemon.get('passed') is True and daemon.get('coldFeatureEnabled') is False
            and daemon.get('runtimeAuthorityGranted') is False and daemon.get('productExecuted') is False,
            'Checked inactive feature daemon source composition required')
    predecessor = PROTECTED / 'source-pair.json'
    require(Path(daemon['predecessorSourcePair']).resolve() == predecessor, 'Protected-startup predecessor required')
    legacy.pin(predecessor, daemon['predecessorSourcePairSha256'])
    previous = read(predecessor)
    require({x['kind'] for x in daemon['files']} == {'source', 'entry'} and len(daemon['files']) == 2,
            'Exact two composed daemon inputs required')
    for item in daemon['files']:
        kind = item['kind']
        legacy.pin(item['input'], item['beforeSha256'])
        legacy.pin(item['output'], item['afterSha256'])
        require(item['beforeSha256'] == previous[kind + 'Sha256']
                and Path(item['input']).resolve() == Path(previous[kind]).resolve(), 'Daemon predecessor mismatch')
        verify_composed_pair_leaf(base, pair, item)
    native_inputs_path = resolve(recipe['daemonInputs'])
    native_inputs = read(native_inputs_path)
    linked = read(base['daemonReceipt'])
    legacy.pin(base['daemonReceipt'], base['daemonReceiptSha256'])
    require(linked['manifestSha256'] == legacy.sha(native_inputs_path)
            and linked.get('inputsUnchanged') is True and linked.get('passed') is True
            and linked.get('signed') is False and linked.get('policyActivated') is False,
            'Fresh inactive daemon link must bind its actual native inputs')
    protected_inputs = read(PROTECTED / 'daemon-inputs.json')
    for path, value in protected_inputs['frozenFiles'].items():
        require(native_inputs['frozenFiles'].get(path) == value,
                'Protected daemon input changed; separate exact review required: ' + path)
    alias_path = resolve(recipe['toolchainReview'])
    require(alias_path == Path(__file__).with_name('toolchain-alias-review.json'),
            'Exact existing toolchain alias review required')
    alias = read(alias_path)
    compiler = '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++'
    require(alias.get('format') == 'aux.browser-features.frozen-toolchain-alias.v1'
            and alias['path'] == compiler and alias['linkTarget'] == 'clang'
            and alias['resolved'] == str(Path(compiler).with_name('clang')),
            'Only the original clang++ toolchain alias is permitted')
    require(Path(compiler).is_symlink()
            and protected_inputs['frozenFiles'].get(compiler) == alias['sha256']
            and native_inputs['frozenFiles'].get(compiler) == alias['sha256'],
            'Original frozen compiler alias type and bytes required')
    for path, value in native_inputs['frozenFiles'].items():
        source = Path(path)
        if source.is_symlink():
            require(path == compiler and value == alias['sha256']
                    and os.readlink(source) == alias['linkTarget']
                    and source.resolve() == Path(alias['resolved']),
                    'Frozen toolchain alias changed; no product/source aliases allowed')
            legacy.pin(alias['resolved'], value)
        else:
            legacy.pin(path, value)
    for kind in ['loader', 'pty']:
        require(pair[kind + 'Sha256'] == previous[kind + 'Sha256'], 'Unrelated native module/loader replacement refused')
    for name in ['baselineStage', 'featureStage']:
        stage = Path(recipe[name]['path'])
        require(legacy.digest(legacy.inventory(stage)) == recipe[name]['inventorySha256'], 'Stage inventory changed: ' + name)
    baseline_app = Path(base['baselineApp'])
    actual = resource_deltas(Path(recipe['baselineStage']['path']), Path(recipe['featureStage']['path']), baseline_app)
    require(actual == recipe['replacements'], 'Feature replacement recipe differs')
    require(stage_inputs(Path(recipe['featureStage']['path']), 'desktop-v1')['finalApp'] == str(Path(base['output']) / 'Aux.app'),
            'Stage must name this exact eventual inactive app')
    wrapper = recipe['cliWrapper']
    require(wrapper['path'] == CLI, 'Native CLI wrapper path changed')
    legacy.pin(baseline_app / RESOURCES / CLI, wrapper['sha256'])
    require((baseline_app / RESOURCES / CLI).stat().st_mode & 0o777 == wrapper['mode'], 'CLI wrapper mode changed')
    feature_records(read(baseline_app / RESOURCES / 'bundle.json'), actual, wrapper)
    # Every native CLI addon remains covered by the final exact unrelated-leaf comparison.
    require(legacy.digest(legacy.inventory(baseline_app)) == base['baselineInventorySha256'], 'Baseline app inventory changed')
    return base_path, base


def prepare(args):
    base = read(args.base_recipe)
    wrapper = Path(base['baselineApp']) / RESOURCES / CLI
    r = {'format': 'aux.browser-features.inactive-package.recipe.v1', 'repository': str(ROOT),
         'assembler': reference(PACKAGE / 'assemble.py'), 'preparer': reference(PACKAGE / 'prepare.py'),
         'tool': reference(__file__), 'guardReview': reference(Path(__file__).with_name('guard-transition.json')),
         'guardPatch': reference(Path(__file__).with_name('guard-transition.patch')),
         'toolchainReview': reference(Path(__file__).with_name('toolchain-alias-review.json')), 'baseRecipe': reference(args.base_recipe),
         'nativeComposition': reference(args.native_composition), 'daemonComposition': reference(args.daemon_composition),
         'daemonInputs': reference(args.daemon_inputs),
         'cliWrapper': {'path': CLI, 'sha256': legacy.sha(wrapper), 'mode': wrapper.stat().st_mode & 0o777},
         'testable': False, 'runtimeAuthorityGranted': False, 'productSigningAuthorized': False}
    for name, value in [('baselineStage', args.baseline_stage), ('featureStage', args.feature_stage)]:
        stage = Path(value).resolve()
        r[name] = {'path': str(stage), 'inventorySha256': legacy.digest(legacy.inventory(stage))}
    r['replacements'] = resource_deltas(Path(args.baseline_stage).resolve(), Path(args.feature_stage).resolve(), Path(base['baselineApp']))
    verify(r)
    with Path(args.recipe).open('x') as out:
        out.write(json.dumps(r, indent=2) + '\n')
    print('Prepared exact inactive feature recipe; no package assembled or activated')


def assemble(args):
    recipe_path = Path(args.recipe).resolve()
    recipe = read(recipe_path)
    base_path, base = verify(recipe)
    out = Path(base['output'])
    require(not out.exists(), 'Fresh inactive output required')
    # Existing assembler revalidates full native inventories, Mach-O signature
    # absence, all protected source/entry/link/runtime gates and input immutability.
    original_validator, original_argv = legacy.verify_frozen_native, sys.argv
    try:
        legacy.verify_frozen_native = verify_guarded_native
        sys.argv = [str(PACKAGE / 'assemble.py'), str(base_path)]
        legacy.main()
    finally:
        legacy.verify_frozen_native, sys.argv = original_validator, original_argv
    prior_receipt = out / 'receipt.json'
    prior = read(prior_receipt)
    require(prior.get('passed') is True and prior.get('testable') is False, 'Inactive base assembly failed')
    prior_receipt.rename(out / 'base-assembly-receipt.json')
    app = out / 'Aux.app'
    resources = app / RESOURCES
    before = legacy.inventory(app)
    try:
        # Recheck sources after the potentially long copy; never silently accept drift.
        verify(recipe)
        bundle_path = resources / 'bundle.json'
        bundle = read(bundle_path)
        feature_records(bundle, recipe['replacements'], recipe['cliWrapper'])
        for item in recipe['replacements']:
            target = resources / item['path']
            require(target.resolve().is_relative_to(resources.resolve()) and not target.is_symlink(), 'Feature destination escapes')
            legacy.pin(target, item['previousSha256'])
            legacy.pin(item['input'], item['sha256'])
            records = [x for x in bundle['files'] if x['path'] == item['path']]
            require(len(records) == 1, 'Unique packaged feature leaf required')
            shutil.copyfile(item['input'], target)
            os.chmod(target, item['mode'])
            legacy.pin(target, item['sha256'])
            records[0].update(sha256=item['sha256'], mode=item['mode'], changeKinds=['integration'])
        legacy.pin(resources / CLI, recipe['cliWrapper']['sha256'])
        bundle['browserFeatureIntegration'] = {'format': 'aux.browser-features.package.v1',
            'recipeSha256': legacy.sha(recipe_path), 'featureProfile': 'desktop-v1',
            'nativeComposition': recipe['nativeComposition'], 'daemonComposition': recipe['daemonComposition'],
            'featureStage': recipe['featureStage'], 'cliWrapper': recipe['cliWrapper'],
            'replacements': recipe['replacements'], 'runtimeAuthorityGranted': False, 'testable': False}
        bundle_path.write_text(json.dumps(bundle, indent=2) + '\n')
        after = legacy.inventory(app)
        changed = {str(RESOURCES / x['path']) for x in recipe['replacements']} | {str(RESOURCES / 'bundle.json')}
        require([x for x in before if x['path'] not in changed] == [x for x in after if x['path'] not in changed],
                'Unrelated packaged leaf changed; native wrapper, addons, runtime and CSS/assets must remain exact')
        verify(recipe)
        result = {'format': 'aux.browser-features.inactive-package.v1', 'passed': True,
            'recipeSha256': legacy.sha(recipe_path), 'baseAssemblyReceiptSha256': legacy.sha(out / 'base-assembly-receipt.json'),
            'files': after, 'inventorySha256': legacy.digest(after), 'testable': False,
            'runtimeAuthorityGranted': False, 'appExecuted': False, 'productSigned': False,
            'acceptedAppReplaced': False, 'unchangedNativeWrapperAndUnrelatedResources': True}
        with (out / 'receipt.json').open('x') as receipt:
            receipt.write(json.dumps(result, indent=2) + '\n')
    except Exception as error:
        (out / 'feature-failure.json').write_text(json.dumps({'passed': False, 'testable': False, 'error': str(error)}, indent=2) + '\n')
        raise
    print('Assembled inactive feature candidate; runtime acceptance and signing remain separate')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('prepare')
    for name in ['base-recipe', 'native-composition', 'daemon-composition', 'daemon-inputs', 'baseline-stage', 'feature-stage', 'recipe']:
        p.add_argument('--' + name, required=True)
    sub.add_parser('assemble').add_argument('recipe')
    args = parser.parse_args()
    (prepare if args.command == 'prepare' else assemble)(args)


if __name__ == '__main__':
    main()
