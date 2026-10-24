"""Strict, inactive standard-isolation successor validation; no assembly entrypoint."""
import hashlib
import inspect
import os
from pathlib import Path
import re
import shlex


def install(env):
    """Replace only the three reviewed validators in the copied wrapper."""
    f, m = env['f'], env['m']
    read, resolve, require = env['read'], env['resolve'], env['require']
    root, here = env['ROOT'], env['HERE']
    original_guard = f.verify_guarded_native
    sha_bytes = lambda value: hashlib.sha256(value).hexdigest()

    def pinned(path, digest):
        path = Path(path)
        require(isinstance(digest, str) and re.fullmatch('[0-9a-f]{64}', digest),
                'Unfrozen digest: ' + str(path))
        m.pin(path, digest)
        return path

    def document(reference):
        return read(pinned(reference['path'], reference['sha256']))

    def standard(review):
        value = document(review['inputs']['standardReview'])
        require(value['format'] == 'aux.standard-isolation.package-review.v1',
                'Exact standard package review required')
        require(value['testable'] is False and value['runtimeAuthorityGranted'] is False
                and value['productExecuted'] is False and value['productSigned'] is False,
                'Package review cannot authorize activation')
        # These are fixed source/recipe inputs, not mutable pending result files.
        for row in value['reviewedInputs']:
            pinned(row['path'], row['sha256'])
        return value

    def replay(text, anchors):
        for edit in anchors:
            before, after, count = edit['find'], edit['replace'], edit['count']
            require(isinstance(before, str) and before and isinstance(after, str)
                    and type(count) is int and count > 0 and text.count(before) == count,
                    'Source anchor/count changed')
            text = text.replace(before, after)
        return text

    def verify_research_projection(review):
        checked = standard(review)
        projection = document(review['inputs']['projection'])
        require(projection == checked['sourceProjection'], 'Reviewed projection changed')
        require(projection['format'] == 'aux.standard-daemon-projection.actual.v1'
                and projection['passed'] is True
                and projection['independentEntryMatchesProjection'] is True
                and projection['upstreamStagesPreserved'] is True
                and projection['newAnchorCountPerLeaf'] == 86,
                'Actual independent standard projection required')
        for key in ['coldFeatureEnabled', 'runtimeAuthorityGranted', 'productExecuted', 'packaged']:
            require(projection[key] is False, 'Projection activation: ' + key)
        output = Path(projection['output'])
        require(str(output) == review['expectedProjectionOutput'], 'Projection destination changed')
        composition = read(pinned(output/'composition.json', projection['compositionSha256']))
        previous = document(review['inputs']['protectedPair'])
        require(composition['predecessorSourcePair'] == review['inputs']['protectedPair']['path']
                and composition['predecessorSourcePairSha256'] == review['inputs']['protectedPair']['sha256'],
                'Protected predecessor mismatch')
        upstream = read(pinned(composition['upstreamComposition'], composition['upstreamCompositionSha256']))
        for row in composition['upstreamAdapterInputs'] + composition['adapterInputs']:
            pinned(root/row['path'], row['sha256'])
        for row in composition['standardProjectionInputs']:
            pinned(row['path'], row['sha256'])
        rows = {row['kind']: row for row in composition['files']}
        require(set(rows) == {'source', 'entry'} and len(composition['files']) == 2,
                'Exactly two projected leaves required')
        for kind, row in rows.items():
            old = next(x for x in upstream['files'] if x['kind'] == kind)
            require(row['input'] == previous[kind] and row['beforeSha256'] == previous[kind+'Sha256']
                    and row['stages'][:3] == old['stages']
                    and row['anchors'][:32] == old['anchors'], 'Original three stages changed')
            require(len(row['anchors']) == 118 and row['addedAnchorCount'] == 86
                    and [x['kind'] for x in row['stages']] == checked['exactSourceStages'],
                    'Exact six-stage/118-anchor chain required')
            text = pinned(row['input'], row['beforeSha256']).read_text()
            offset = 0
            for stage in row['stages']:
                anchors = row['anchors'][:27] if stage['kind'] == 'features' else stage['anchors']
                require(row['anchors'][offset:offset+len(anchors)] == anchors,
                        'Stage/whole-leaf anchor association mismatch')
                offset += len(anchors)
                require(sha_bytes(text.encode()) == stage['beforeSha256'], 'Stage input mismatch')
                if stage['kind'] in checked['newStageAnchorCounts']:
                    require(len(anchors) == checked['newStageAnchorCounts'][stage['kind']]
                            and all(x['count'] == 1 for x in anchors), 'New stage count changed')
                text = replay(text, anchors)
                require(sha_bytes(text.encode()) == stage['afterSha256']
                        and pinned(stage['output'], stage['afterSha256']).read_text() == text,
                        'Stage output differs from literal replay')
            require(offset == 118 and sha_bytes(text.encode()) == row['afterSha256']
                    == projection[kind+'Sha256']
                    and pinned(row['output'], row['afterSha256']).read_text() == text,
                    'Final projection mismatch')
        source_receipt = read(pinned(output/'source-receipt.json', projection['sourceReceiptSha256']))
        entry_receipt = read(pinned(output/'projected-entry/results.json', projection['entryReceiptSha256']))
        require(source_receipt['passed'] is True and source_receipt['coldRefusalPreserved'] is True
                and source_receipt['executed'] is False and source_receipt['uiChanged'] is False
                and source_receipt['compositionReceiptSha256'] == projection['compositionSha256']
                and source_receipt['composedSha256'] == projection['sourceSha256'], 'Source receipt mismatch')
        for key in ['passed', 'ordinarySourceUnchanged', 'defaultEntryRefusalPreserved', 'dormant']:
            require(entry_receipt[key] is True, 'Original projector gate: ' + key)
        for key in ['executed', 'appChanged', 'runtimeAuthorityGranted', 'packaged']:
            require(entry_receipt[key] is False, 'Original projector activation: ' + key)
        require(entry_receipt['syntaxExitCode'] == 0
                and entry_receipt['sourceSha256'] == projection['sourceSha256']
                and entry_receipt['sourceReceiptSha256'] == projection['sourceReceiptSha256']
                and entry_receipt['entrySha256'] == projection['entrySha256']
                and entry_receipt['loaderSha256'] == projection['loaderSha256'], 'Projector/source association mismatch')
        require(pinned(output/'projected-entry/aux-native-entry.mjs', projection['entrySha256']).read_bytes()
                == Path(rows['entry']['output']).read_bytes(), 'Independent and original-projector entry differ')
        pinned(output/'projected-entry/aux-owned-native.cjs', projection['loaderSha256'])
        require(projection['loaderSha256'] == checked['sourceProjection']['loaderSha256'], 'Loader changed')
        require(len(composition['helpers']) == 2, 'Exactly two runtime helpers required')
        for item in composition['helpers']:
            expected = next(x for x in checked['runtimeHelpers'] if x['kind'] == item['kind'])
            for key in ['input', 'inputSha256', 'output', 'outputSha256', 'publisherOverlay', 'publisherOverlaySha256']:
                require(item[key] == expected[key], 'Runtime helper association changed: ' + key)
            old = item['upstream']
            old_text = pinned(old['input'], old['inputSha256']).read_text()
            old_edits = [dict(find=x['before'], replace=x['after'], count=x['count']) for x in old['edits']]
            old_text = replay(old_text, old_edits)
            if item['kind'] == 'bootstrap':
                # The frozen original transform appends this export separately
                # from its edit array; preserve its exact bytes, not rstrip.
                transform = root/'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-integration/transform.mjs'
                prior = next(x for x in composition['upstreamAdapterInputs'] if root/x['path'] == transform)
                pinned(transform, prior['sha256'])
                tail = "\nObject.defineProperty(module.exports, 'inspectRetainedRuntime', {value: async function inspectRetainedRuntime(destination) {\n  return inspectWithAuthority(captureNativeRuntime(), destination);\n}});\n"
                require(tail.replace('\n', '\\n') in transform.read_text(), 'Original export adaptation changed')
                old_text += tail
            require(old_text == pinned(item['input'], item['inputSha256']).read_text(),
                    'Original async helper adaptation differs')
            require(replay(Path(item['input']).read_text(), item['edits'])
                    == pinned(item['output'], item['outputSha256']).read_text(), 'Publisher helper differs')
            pinned(item['publisherOverlay'], item['publisherOverlaySha256'])
            pinned(item['preparedOutput'], item['outputSha256'])

    def pin_native(path, digest, review):
        source = Path(path)
        if not source.is_symlink():
            pinned(source, digest)
            return
        alias = document(review['inputs']['toolchainReview'])
        if path == alias['path']:
            require(os.readlink(source) == alias['linkTarget'] and str(source.resolve()) == alias['resolved']
                    and digest == alias['sha256'], 'Exact compiler alias changed')
            pinned(alias['resolved'], digest)
        else:
            env['verify_link_tool_alias'](source, digest)

    def dependencies(path):
        text = re.sub(r'\\\n', ' ', Path(path).read_text())
        require(':' in text, 'Malformed compiler dependency record')
        return {str(Path(x).resolve()) for x in shlex.split(text.split(':', 1)[1])}

    def verify_link(compile_result, plan_path, review):
        checked = standard(review)
        native = checked['native']
        require(Path(plan_path).resolve() == Path(native['compilePlan']['path']).resolve(), 'Wrong compile plan')
        plan = document(native['compilePlan'])
        require(plan['format'] == 'aux.standard-daemon.compile-plan.v1', 'Native plan format')
        require(Path(compile_result).resolve() == Path(native['compileOutput'])/'results.json', 'Wrong compile result')
        # Root freezes real result pins only after completion; absence/null rejects.
        result = document(review['inputs']['standardCompileResult'])
        require(Path(review['inputs']['standardCompileResult']['path']).resolve() == Path(compile_result).resolve(),
                'Compile result reference mismatch')
        require(result['format'] == 'aux.standard-daemon.compile.v1'
                and result['planSha256'] == m.sha(plan_path), 'Compile plan receipt mismatch')
        for key in ['productSigned', 'productExecuted', 'runtimeAuthorityGranted']:
            require(result[key] is False, 'Compile activation: ' + key)
        require(plan['replacements'] == native['replacements'] and len(plan['commands']) == 6,
                'Exact object replacements/units required')
        names = [x['name'] for x in native['compileUnits']]
        require([x['name'] for x in plan['commands']] == names, 'Compile unit order changed')
        actual = result['commands']
        require([x['name'] for x in actual] == [n+'-dependencies' for n in names] + names + ['link'],
                'Actual six scans and six compiles required')
        for i, unit in enumerate(plan['commands']):
            command = unit['command']; expected_unit = native['compileUnits'][i]
            require(unit['source'] == expected_unit['source'] and command[command.index('-o')+1] == expected_unit['object']
                    and command.count(expected_unit['source']) == 1, 'Compile operand changed')
            scan = []; k = 0
            while k < len(command):
                if command[k] in ['-o', '-MF']: k += 2; continue
                if command[k] in ['-c', '-MMD']: k += 1; continue
                scan.append(command[k]); k += 1
            scan += ['-MM', '-MF', str(Path(native['compileOutput'])/(unit['name']+'.scan.d')),
                     '-MT', unit['name']+'.o']
            require(actual[i]['command'] == scan and actual[i]['exitCode'] == 0
                    and actual[i+6]['command'] == command and actual[i+6]['exitCode'] == 0,
                    'Actual compile or dependency scan failed/changed')
        # The first link failure remains true historical evidence, never promoted.
        require(result['passed'] is False and actual[-1]['exitCode'] != 0,
                'Expected immutable failed aggregate history changed')
        inputs_path = pinned(native['linkManifest']['path'], native['linkManifest']['sha256'])
        inputs = read(inputs_path)
        link_path = resolve(review['inputs']['standardLinkResult'])
        require(link_path == Path(native['linkOutput'])/'results.json', 'Wrong successor link receipt')
        link = read(link_path); previous = document(review['inputs']['protectedLink'])
        require(link['format'] == 'aux.profile-isolation.continuation.link.v1'
                and link['passed'] is True and link['inputsUnchanged'] is True,
                'Actual completed successful successor link required')
        for key in ['signed', 'executableRun', 'moduleLoaded', 'acceptedAppChanged', 'policyActivated', 'fullWriterIsolationProven']:
            require(link[key] is False, 'Link activation: ' + key)
        require(link['manifestSha256'] == m.sha(inputs_path) and link['recipeSha256'] == previous['recipeSha256']
                and link['commands'] == inputs['commands'] and link['results'] == [{'index': 0, 'exitCode': 0}],
                'Original checker, exact command and successful result required')
        checker = root/'docs/integration/proposed/profile-isolation-continuation/build/link-daemon.py'
        pinned(checker, previous['recipeSha256'])
        require(len(inputs['commands']) == 1, 'Exactly one link required')
        command = inputs['commands'][0]
        require(inputs['privateDefinitions'] == native['privateDefinitionsExact']
                and link['privateDefinitionsBound'] == native['privateDefinitionsExact']
                and native['privateDefinitionsExact'][:7] == previous['privateDefinitionsBound']
                and native['privateDefinitionsExact'][7:] == ['_AuxDevelopmentOwnerCleanSettlementStatus',
                    '_AuxObserveDevelopmentMainLoopReturned', '_AuxCompleteDevelopmentOwnerBrowserCleanShutdown'],
                'Exact private definition extension required')
        for key in ['moduleSha256', 'resolvedModuleImports']:
            require(link[key] == previous[key], 'Original module boundary changed: ' + key)
        require(inputs['module'] == native['unchangedModule']['path'], 'Module path changed')
        document_ref = native['unchangedModule']; pinned(document_ref['path'], document_ref['sha256'])
        require(link['moduleSha256'] == document_ref['sha256'], 'Module digest mismatch')
        old = document(review['inputs']['protectedInputs'])
        for path, digest in old['frozenFiles'].items():
            require(inputs['frozenFiles'].get(path) == digest, 'Protected frozen input dropped/changed: ' + path)
        for path, digest in plan['frozenNewSources'].items():
            require(inputs['frozenFiles'].get(path) == digest, 'Compiled source closure changed: ' + path)
        for path, digest in inputs['frozenFiles'].items():
            pin_native(path, digest, review)
        composition = document(plan['sourceComposition'])
        require(inputs['standardIsolationSourceComposition'] == plan['sourceComposition'], 'Native composition mismatch')
        for row in composition['inputs'] + composition['outputs']:
            pinned(row['path'], row['sha256'])
        for unit in native['compileUnits']:
            base = Path(native['compileOutput'])/unit['name']
            scanned = dependencies(str(base)+'.scan.d'); compiled = dependencies(str(base)+'.d')
            require(scanned == compiled and scanned, 'Actual compiled dependency closure differs from scan')
            for path in compiled:
                require(path in inputs['frozenFiles'], 'Unfrozen compiled dependency: ' + path)
                pin_native(path, inputs['frozenFiles'][path], review)
        # Reconstruct exact ordered operands from the immutable a4 native tuple.
        historical = next(x for x in checked['reviewedInputs'] if x['path'].endswith('/runtime-cache-package-a4/review.json'))
        a4 = document(historical); prior_plan = document(a4['relink']['plan'])
        old_command = prior_plan['linkCommand']
        expected = []; changed_swift = []
        new_by_name = {Path(x).name: x for x in native['changedSwiftSources']}
        for value in old_command:
            if value in native['replacements']: value = native['replacements'][value]
            elif value.endswith('.swift') and Path(value).name in new_by_name:
                value = new_by_name[Path(value).name]; changed_swift.append(value)
            elif value == old_command[old_command.index('-o')+1]: value = str(Path(native['linkOutput'])/'Aux Daemon')
            elif value == old_command[old_command.index('-module-cache-path')+1]: value = str(Path(native['linkOutput'])/'swift-cache')
            expected.append(value)
        expected += [native['newObject'], '-lEndpointSecurity']
        require(command == expected and changed_swift == native['changedSwiftSources'], 'Ordered native link tuple changed')
        require(len([x for x in command if x.endswith('.o')]) == 13
                and len([x for x in command if x.endswith('.swift')]) == 48,
                'Exact 13 native/48 Swift operands required')
        require(command[command.index('-o')+1] == str(Path(native['linkOutput'])/'Aux Daemon'), 'Link output changed')
        pinned(Path(native['linkOutput'])/'Aux Daemon', link['executableSha256'])
        return inputs_path, link_path

    def update_guard_expected(expected, build):
        review = read(here/'review.json'); checked = standard(review)
        browser = checked['browser']; source = document(browser['sourceComposition'])
        require(source['files'] == browser['sourceChanges'] and len(source['files']) == 26,
                'Exact reviewed browser source composition required')
        for row in source['inputs']:
            pinned(row['path'], row['sha256'])
        composed = document(review['inputs']['standardNativeComposition'])
        require(review['inputs']['standardNativeComposition'] == browser['composition'], 'Browser composition changed')
        require(build['nativeInputPinsPath'] == browser['fullInputPins']['path']
                and build['nativeInputPinsSha256'] == browser['fullInputPins']['sha256']
                and build['nativeInputPins']['featureCompositionSha256'] == browser['composition']['sha256'],
                'Full native receipt/composition mismatch')
        full = document(browser['fullInputPins'])
        require(full == build['nativeInputPins'] and len(composed['inputPins']) == 220, 'Full native pins mismatch')
        for row in source['files']:
            if row['path'].startswith('daemon/'):
                continue
            require(full['files'].get(row['path']) == row['afterSha256'], 'Standard browser input missing')
            pinned(Path(build['source'])/row['path'], row['afterSha256'])
        changed = {x['path']: x for x in source['files']}
        intersect = set(expected) & set(changed)
        require(intersect == {'chrome/browser/extensions/api/messaging/launch_context_posix.cc'},
                'Unreviewed native defense intersection')
        for name in intersect:
            row = changed[name]
            require(expected[name] == row['beforeSha256'], 'Original defense baseline changed')
            lane = root/'docs/integration/proposed/standard-profile-isolation/browser-drain'
            manifest = read(lane/'manifest.json')
            item = next(x for x in manifest['files'] if x['path'] == name)
            require(item['beforeSha256'] == row['beforeSha256'] and item['afterSha256'] == row['afterSha256'],
                    'Defense change is not the exact reviewed transition')
            text = pinned(lane/'baseline'/name, item['beforeSha256']).read_text()
            changes = [x for x in read(lane/'replacements.json') if x['path'] == name]
            require(changes, 'Missing defense transition anchors')
            text = replay(text, [dict(find=x['old'], replace=x['new'], count=x['count']) for x in changes])
            require(sha_bytes(text.encode()) == item['afterSha256']
                    and pinned(lane/'source'/name, item['afterSha256']).read_text() == text,
                    'Defense transition replay differs')
            expected[name] = item['afterSha256']

    # Preserve the original three-file replay, defense checks and GN inverses.
    # Only update the expected digest after exact reviewed intersection replay;
    # never rewrite, substitute or fabricate build receipts/pin dictionaries.
    original = inspect.getsource(original_guard)
    anchor = '    for name, value in expected.items():\n'
    require(original.count(anchor) == 1, 'Original guard expected-map seam changed')
    scope = dict(f.__dict__)
    scope['_standard_guard_updates'] = update_guard_expected
    exec(compile(original.replace(anchor, '    _standard_guard_updates(expected, build)\n'+anchor, 1),
                 str(here/'standard-guard-validator'), 'exec'), scope)
    env['verify_research_projection'] = verify_research_projection
    env['verify_link'] = verify_link
    f.verify_guarded_native = scope['verify_guarded_native']
