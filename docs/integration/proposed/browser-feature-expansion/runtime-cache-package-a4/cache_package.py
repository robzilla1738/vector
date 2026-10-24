#!/usr/bin/env python3
"""Exact inactive runtime-cache successor; never launches or signs products."""
import argparse
import importlib.util
import inspect
import json
import os
from pathlib import Path
import runpy
import sys
sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = Path(os.environ.get('AUX_FEATURE_PACKAGE_REPOSITORY', '/Users/rcourson/Documents/Vibe/web')).resolve()
PACKAGE = ROOT / 'docs/integration/proposed/browser-feature-expansion/package'
SPEC = importlib.util.spec_from_file_location('feature_package', PACKAGE / 'feature_package.py')
f = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(f)
sys.modules['feature_package'] = f
m = f.legacy
read, ref, resolve, require = f.read, f.reference, f.resolve, f.require
ORIGINAL_RUNTIME = m.runtime_changes
ORIGINAL_VERIFY = f.verify
PREFIX = 'apps/daemon/Aux Daemon.app/Contents/Resources/native/'


def verify_link_tool_alias(path, digest):
    review = read(HERE / 'review.json')
    aliases = read(resolve(review['inputs']['linkToolAliases']))
    require(aliases['format'] == 'aux.runtime-cache.existing-link-tool-aliases.v1', 'Exact link-tool aliases required')
    original_path = resolve(review['inputs']['protectedInputs'])
    original = read(original_path)
    require(aliases['protectedInputsSha256'] == m.sha(original_path), 'Original tool operand manifest changed')
    expected = {original['commands'][0][0], original['otool'], original['nm']}
    require(len(aliases['files']) == 3 and {item['path'] for item in aliases['files']} == expected,
            'Only the three original link/check tool operands may be aliases')
    records = [item for item in aliases['files'] if item['path'] == str(path)]
    require(len(records) == 1, 'No product/source alias allowed')
    item = records[0]
    require(path.is_symlink() and os.readlink(path) == item['linkTarget']
            and path.resolve() == Path(item['resolved']) and digest == item['sha256'],
            'Existing link-tool alias changed')
    m.pin(item['resolved'], digest)


# Keep the original verifier file and every other check intact. The successor
# manifest additionally pins three original compiler/checker tool aliases that
# the predecessor named as operands but did not include in frozenFiles.
_original = inspect.getsource(ORIGINAL_VERIFY)
_before = '''        if source.is_symlink():
            require(path == compiler and value == alias['sha256']'''
_after = '''        if source.is_symlink() and path != compiler:
            verify_link_tool_alias(source, value)
        elif source.is_symlink():
            require(path == compiler and value == alias['sha256']'''
require(_original.count(_before) == 1, 'Original frozen-alias verifier anchor changed')
_scope = {}
f.verify_link_tool_alias = verify_link_tool_alias
exec(compile(_original.replace(_before, _after, 1), str(HERE / 'cache-link-alias-verifier'), 'exec'), f.__dict__, _scope)
SUCCESSOR_VERIFY = _scope['verify']


def review_inputs():
    review = read(HERE / 'review.json')
    require(review['format'] == 'aux.runtime-cache-package.review.v1', 'Exact review required')
    for item in review['inputs'].values():
        resolve(item)
    require(resolve(review['inputs']['featureTool']) == PACKAGE / 'feature_package.py', 'Original feature tool required')
    require(resolve(review['inputs']['assembler']) == f.PACKAGE / 'assemble.py', 'Original assembler required')
    require(resolve(review['inputs']['basePreparer']) == PACKAGE / 'prepare_base.py', 'Original base preparer required')
    verify_research_projection(review)
    return review


def verify_research_projection(review):
    # This successor permits only the fixed reviewed research stage after the
    # immutable async adaptation; final leaves are no longer async intermediates.
    manifest_path = resolve(review['inputs']['researchManifest'])
    require(manifest_path == ROOT/'docs/integration/proposed/browser-feature-expansion/research-v1/manifest.json',
            'Fixed research manifest required')
    research = read(manifest_path)
    expected = {item['kind']: item for item in research['daemonInputs']}
    require(set(expected) == {'source', 'entry'} and len(research['daemonInputs']) == 2,
            'Exact reviewed research leaves required')
    projection = read(resolve(review['inputs']['projection']))
    require(projection.get('passed') is True and projection.get('productExecuted') is False
            and projection.get('runtimeAuthorityGranted') is False and projection.get('packaged') is False,
            'Actual inactive research projection required')
    output = Path(projection['output'])
    require(str(output) == review['expectedProjectionOutput'], 'Exact fresh research output required')
    composition_path = output/'composition.json'
    m.pin(composition_path, projection['compositionSha256'])
    composition = read(composition_path)
    require(composition.get('researchManifest') == str(manifest_path)
            and composition.get('researchManifestSha256') == m.sha(manifest_path),
            'Research projection is not bound to reviewed implementation')
    rows = {item['kind']: item for item in composition['files']}
    require(set(rows) == {'source', 'entry'} and len(composition['files']) == 2,
            'Exact independently composed leaves required')
    for kind, item in rows.items():
        stages = item['stages']
        require([stage['kind'] for stage in stages] == ['features', 'async-runtime-inspection', 'research-v1'],
                'Exact feature/async/research chain required')
        async_stage, final_stage = stages[1:]
        require(async_stage['afterSha256'] == expected[kind]['inputSha256']
                and final_stage['beforeSha256'] == expected[kind]['inputSha256']
                and final_stage['input'] == async_stage['output']
                and final_stage['afterSha256'] == expected[kind]['outputSha256']
                and item['afterSha256'] == expected[kind]['outputSha256']
                and projection[kind+'Sha256'] == expected[kind]['outputSha256'],
                'Reviewed research result or immutable async intermediate changed')
        m.pin(async_stage['output'], expected[kind]['inputSha256'])
        m.pin(item['output'], expected[kind]['outputSha256'])


def verify_link(link_result, plan_path, review):
    result, plan = read(link_result), read(plan_path)
    require(result.get('format') == 'aux.runtime-cache-async-relink.result.v1', 'Actual async relink receipt required')
    for key in ['passed', 'compiled', 'linked', 'dependenciesMatch', 'inputsUnchanged', 'sameModuleABI', 'samePrivateDefinitions']:
        require(result.get(key) is True, 'Actual relink gate: ' + key)
    for key in ['signed', 'executableRun', 'moduleLoaded', 'acceptedAppChanged', 'policyActivated', 'fullWriterIsolationProven']:
        require(result.get(key) is False, 'Unexpected relink activation: ' + key)
    require(result['planSha256'] == m.sha(plan_path), 'Actual relink plan mismatch')
    relink = review.get('relink')
    require(isinstance(relink, dict), 'Final corrected relink review has not been frozen')
    require(set(relink) == {'plan', 'runner', 'host'}, 'Exact three relink review references required')
    for name, item in relink.items():
        require(str(resolve(item)) == review['reservedRelinkPaths'][name], 'Unexpected relink review path')
    require(resolve(relink['plan']) == plan_path.resolve(), 'Exact frozen corrected relink plan required')
    require(result['runnerSha256'] == relink['runner']['sha256'], 'Reviewed relink runner required')
    host = resolve(relink['host'])
    require(Path(plan['newSource']).resolve() == host and plan['frozenFiles'].get(str(host)) == m.sha(host), 'Exact reviewed host required')
    require(result['compileCommand'] == plan['compileCommand'] and result['compileExitCode'] == 0, 'Actual compile recipe mismatch')
    old = read(f.PROTECTED / 'daemon-inputs.json')
    for path, digest in old['frozenFiles'].items():
        require(plan['frozenFiles'].get(path) == digest, 'Protected relink input drift: ' + path)
    inputs_path = Path(result['daemonInputManifest'])
    m.pin(inputs_path, result['daemonInputManifestSha256'])
    inputs = read(inputs_path)
    for path, digest in plan['frozenFiles'].items():
        require(inputs['frozenFiles'].get(path) == digest, 'Link does not retain reviewed input: ' + path)
    require(inputs['commands'] == [plan['linkCommand']], 'Actual link recipe mismatch')
    link_path = Path(result['daemonLinkReceipt'])
    m.pin(link_path, result['daemonLinkReceiptSha256'])
    link = read(link_path)
    previous = read(f.PROTECTED / 'daemon-link.json')
    require(link.get('passed') is True and link.get('inputsUnchanged') is True and link.get('signed') is False
            and link.get('policyActivated') is False, 'Successful inactive daemon link required')
    require(link['manifestSha256'] == m.sha(inputs_path) and link['recipeSha256'] == previous['recipeSha256'], 'Actual link input/checker mismatch')
    for key in ['moduleSha256', 'resolvedModuleImports', 'privateDefinitionsBound']:
        require(link[key] == previous[key], 'Paired native module boundary changed: ' + key)
    require(link['executableSha256'] == result['executableSha256'], 'Actual daemon output mismatch')
    return inputs_path, link_path


def runtime_changes(base):
    review = review_inputs()
    path = Path(base['runtimeIntegrationManifest'])
    m.pin(path, base['runtimeIntegrationManifestSha256'])
    manifest = read(path)
    require(manifest.get('format') == 'aux.runtime-cache-package.runtime.v1', 'Exact successor runtime manifest required')
    require(resolve(manifest['review']) == HERE / 'review.json' and resolve(manifest['tool']) == Path(__file__).resolve(), 'Runtime wrapper/review mismatch')
    require(manifest.get('testable') is False and manifest.get('runtimeAuthorityGranted') is False
            and manifest.get('runtimeExecuted') is False, 'Runtime acceptance cannot be inferred')
    oldbase = read(resolve(review['inputs']['protectedRecipe']))
    old_items = {item['path']: item for item in ORIGINAL_RUNTIME(oldbase)}
    require(base['baselineApp'] == oldbase['baselineApp'] and base['baselineInventorySha256'] == oldbase['baselineInventorySha256'], 'Original pre-metadata baseline required')
    overlay = read(resolve(review['inputs']['sourceOverlay']))
    entries = {x['kind']: x for x in overlay['files']}
    expected = []
    projection = read(resolve(review['inputs']['projection']))
    projected = Path(projection['output'])
    for name, kind in [('runtime-bootstrap.cjs', 'bootstrap'), ('runtime-seed.cjs', 'seed')]:
        item = entries[kind]
        source = projected / 'native' / name
        m.pin(source, item['outputSha256'])
        previous = old_items[PREFIX + name]['previousSha256'] if kind == 'bootstrap' else item['inputSha256']
        expected.append(dict(path=PREFIX+name, input=str(source), previousSha256=previous,
                             sha256=item['outputSha256'], mode=0o644, mustBeAbsent=False))
    expected.append(old_items[PREFIX+'runtime-text-root.json'])
    require(manifest['runtimeIntegration'] == expected, 'Exactly two reviewed replacements plus unchanged absent metadata required')
    m.pin(base['runtimeIntegrationEvidence'], base['runtimeIntegrationEvidenceSha256'])
    # This is the real compile/link result, NOT a fabricated runtime integration test.
    inputs, linked = verify_link(Path(base['runtimeIntegrationEvidence']), resolve(manifest['relinkPlan']), review)
    require(Path(base['daemonReceipt']).resolve() == linked.resolve() and base['daemonReceiptSha256'] == m.sha(linked), 'Runtime/daemon pair mismatch')
    require(base['nativeReceiptSha256'] == review['inputs']['browserReceipt']['sha256'], 'Exact a18 native browser required')
    require(base['sourceReceiptSha256'] == projection['sourceReceiptSha256'] and base['entryReceiptSha256'] == projection['entryReceiptSha256'], 'Exact independently projected source/entry required')
    pair = m.verify_pair(base)
    require(pair.get('nativeHostApiChanged') is True and pair.get('pairedModuleAbiChanged') is False, 'Actual changed host API and unchanged module ABI must be explicit')
    require(pair.get('nativeBrowserReceiptSha256') == base['nativeReceiptSha256'], 'Browser pair mismatch')
    for item in expected:
        m.pin(item['input'], item['sha256'])
    return expected


def verify(recipe):
    require(resolve(recipe['runtimeCacheTool']) == Path(__file__).resolve()
            and resolve(recipe['runtimeCacheReview']) == HERE/'review.json', 'Successor wrapper/review must be pinned')
    base_path, base = SUCCESSOR_VERIFY(recipe)
    review = review_inputs()
    actual_paths = [item['path'] for item in recipe['replacements']]
    require(review['expectedFeatureResourceDeltas'] == 16
            and len(actual_paths) == 16
            and sorted(actual_paths) == review['expectedFeatureResourcePaths'],
            'Exact sixteen named feature resource deltas required')
    manifest = read(base['runtimeIntegrationManifest'])
    actual_inputs, _ = verify_link(Path(base['runtimeIntegrationEvidence']), resolve(manifest['relinkPlan']), review_inputs())
    require(resolve(recipe['daemonInputs']) == actual_inputs.resolve(), 'Feature and runtime link inputs differ')
    return base_path, base


def prepare_base(args, extra):
    review = review_inputs()
    link_result = Path(args.link_result).resolve()
    plan = Path(args.relink_plan).resolve()
    verify_link(link_result, plan, review)
    oldbase = read(resolve(review['inputs']['protectedRecipe']))
    old_items = {x['path']: x for x in ORIGINAL_RUNTIME(oldbase)}
    projection = read(resolve(review['inputs']['projection']))
    overlay = {x['kind']: x for x in read(resolve(review['inputs']['sourceOverlay']))['files']}
    items = []
    for name, kind in [('runtime-bootstrap.cjs', 'bootstrap'), ('runtime-seed.cjs', 'seed')]:
        item = overlay[kind]
        items.append(dict(path=PREFIX+name, input=str(Path(projection['output'])/'native'/name),
                          previousSha256=old_items[PREFIX+name]['previousSha256'] if kind == 'bootstrap' else item['inputSha256'],
                          sha256=item['outputSha256'], mode=0o644, mustBeAbsent=False))
    items.append(old_items[PREFIX+'runtime-text-root.json'])
    manifest = dict(format='aux.runtime-cache-package.runtime.v1', review=ref(HERE/'review.json'),
                    tool=ref(__file__), relinkPlan=ref(plan), runtimeIntegration=items,
                    testable=False, runtimeAuthorityGranted=False, runtimeExecuted=False,
                    evidenceMeaning='Actual compiler/link success only; no runtime integration acceptance')
    with Path(args.runtime_manifest).open('x') as out:
        out.write(json.dumps(manifest, indent=2)+'\n')
    # Original base preparer and all its guards run in this process, with only
    # the exact runtime leaf validator replaced. No original files are changed.
    sys.argv = [str(PACKAGE/'prepare_base.py'), *extra,
                '--runtime-integration', str(Path(args.runtime_manifest).resolve()),
                '--runtime-evidence', str(link_result)]
    runpy.run_path(str(PACKAGE/'prepare_base.py'), run_name='__main__')


def prepare_feature(args):
    # Interpose only construction-time verification to pin successor references;
    # original prepare performs all original stage/delta/native checks.
    def initial(recipe):
        recipe.update(runtimeCacheTool=ref(__file__), runtimeCacheReview=ref(HERE/'review.json'))
        return verify(recipe)
    f.verify = initial
    f.prepare(args)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    s = p.add_subparsers(dest='command', required=True)
    b = s.add_parser('prepare-base')
    for name in ['link-result', 'relink-plan', 'runtime-manifest']:
        b.add_argument('--'+name, required=True)
    q = s.add_parser('prepare')
    for name in ['base-recipe', 'native-composition', 'daemon-composition', 'daemon-inputs', 'baseline-stage', 'feature-stage', 'recipe']:
        q.add_argument('--'+name, required=True)
    s.add_parser('verify').add_argument('recipe')
    s.add_parser('assemble').add_argument('recipe')
    s.add_parser('check-inputs')
    args, extra = p.parse_known_args()
    if args.command != 'prepare-base':
        require(not extra, 'Unknown arguments')
    review_inputs()
    m.runtime_changes = runtime_changes
    f.verify = verify
    if args.command == 'check-inputs':
        print('Reviewed inputs match; no pairing, assembly or runtime claim')
    elif args.command == 'prepare-base':
        prepare_base(args, extra)
    elif args.command == 'prepare':
        prepare_feature(args)
    elif args.command == 'verify':
        verify(read(args.recipe))
    else:
        f.assemble(args)


if __name__ == '__main__':
    main()
