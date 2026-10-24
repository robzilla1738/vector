"""Strict, inactive standard-isolation successor validation; no assembly entrypoint."""
import hashlib
import inspect
import json
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
        require(projection['format'] == 'aux.standard-daemon-projection.actual.v3'
                and projection['passed'] is True
                and projection['independentEntryMatchesProjection'] is True
                and projection['upstreamStagesPreserved'] is True
                and projection['newAnchorCountPerLeaf'] == 134
                and projection['appendedAnchorCountPerLeaf'] == 13
                and projection['totalAnchorCountPerLeaf'] == 166
                and projection['publisherHelpersUnchanged'] is True
                and projection['freshDescendantObserverRequired'] is True,
                'Actual independent standard projection required')
        for key in ['coldFeatureEnabled', 'runtimeAuthorityGranted', 'productExecuted', 'packaged']:
            require(projection[key] is False, 'Projection activation: ' + key)
        output = Path(projection['output'])
        require(str(output) == review['expectedProjectionOutput'], 'Projection destination changed')
        composition = read(pinned(output/'composition.json', projection['compositionSha256']))
        prior_ref = review['inputs']['previousStandardProjection']
        require(Path(prior_ref['path']) == root/'docs/integration/proposed/standard-profile-isolation/daemon-projection/actual-projection-a1.json',
                'Exact immutable a1 projection evidence required')
        prior_projection = document(prior_ref)
        require(prior_projection['format'] == 'aux.standard-daemon-projection.actual.v1'
                and prior_projection['passed'] is True
                and prior_projection['independentEntryMatchesProjection'] is True
                and prior_projection['newAnchorCountPerLeaf'] == 86,
                'Successful actual a1 predecessor required')
        for key in ['coldFeatureEnabled', 'runtimeAuthorityGranted', 'productExecuted', 'packaged']:
            require(prior_projection[key] is False, 'Predecessor activation: ' + key)
        require(composition['previousStandardProjection'] == prior_ref['path']
                and composition['previousStandardProjectionSha256'] == prior_ref['sha256']
                and projection['previousStandardProjectionSha256'] == prior_ref['sha256']
                and composition['previousStandardComposition'] == str(Path(prior_projection['output'])/'composition.json')
                and composition['previousStandardCompositionSha256'] == prior_projection['compositionSha256'],
                'Actual a1 provenance changed')
        prior = read(pinned(composition['previousStandardComposition'], prior_projection['compositionSha256']))
        require(prior['passed'] is True and len(prior['files']) == 2
                and composition['previousStandardProjectionInputs'] == prior['standardProjectionInputs']
                and composition['upstreamComposition'] == prior['upstreamComposition']
                and composition['upstreamCompositionSha256'] == prior['upstreamCompositionSha256']
                and composition['upstreamAdapterInputs'] == prior['upstreamAdapterInputs'],
                'Historical projection inputs changed')
        for row in prior['standardProjectionInputs']:
            require(row in composition['standardProjectionInputs'], 'Dropped a1 producer/input pin')
        managed_ref = review['inputs']['previousManagedProjection']
        require(Path(managed_ref['path']) == root/'docs/integration/proposed/standard-profile-isolation/daemon-projection-v2/actual-projection-a2.json',
                'Exact immutable a2 projection evidence required')
        managed_projection = document(managed_ref)
        require(managed_projection['format'] == 'aux.standard-daemon-projection.actual.v2'
                and managed_projection['passed'] is True
                and managed_projection['independentEntryMatchesProjection'] is True
                and managed_projection['upstreamStagesPreserved'] is True
                and managed_projection['newAnchorCountPerLeaf'] == 121
                and managed_projection['appendedAnchorCountPerLeaf'] == 35
                and managed_projection['totalAnchorCountPerLeaf'] == 153
                and managed_projection['publisherHelpersUnchanged'] is True
                and managed_projection['freshDescendantObserverRequired'] is True,
                'Successful complete a2 predecessor required')
        for key in ['coldFeatureEnabled', 'runtimeAuthorityGranted', 'productExecuted', 'packaged']:
            require(managed_projection[key] is False, 'Managed predecessor activation: ' + key)
        require(composition['previousManagedProjection'] == managed_ref['path']
                and composition['previousManagedProjectionSha256'] == managed_ref['sha256']
                and projection['previousManagedProjectionSha256'] == managed_ref['sha256']
                and composition['previousManagedComposition'] == str(Path(managed_projection['output'])/'composition.json')
                and composition['previousManagedCompositionSha256'] == managed_projection['compositionSha256'],
                'Actual a2 provenance changed')
        managed = read(pinned(composition['previousManagedComposition'], managed_projection['compositionSha256']))
        require(managed['passed'] is True and len(managed['files']) == 2
                and managed['appendedStages'] == ['refresh-and-skill', 'managed-producers']
                and managed['newAnchorCountPerLeaf'] == 121
                and managed['appendedAnchorCountPerLeaf'] == 35
                and managed['totalAnchorCountPerLeaf'] == 153
                and composition['previousManagedProjectionInputs'] == managed['standardProjectionInputs']
                and composition['previousManagedAppendedStages'] == managed['appendedStages'],
                'Complete a2 inputs/counts changed')
        for key in ['previousStandardProjection', 'previousStandardProjectionSha256',
                    'previousStandardComposition', 'previousStandardCompositionSha256',
                    'previousStandardProjectionInputs', 'upstreamComposition',
                    'upstreamCompositionSha256', 'upstreamAdapterInputs']:
            require(composition[key] == managed[key], 'Inherited a2 provenance changed: ' + key)
        for row in managed['standardProjectionInputs']:
            require(row in composition['standardProjectionInputs'], 'Dropped a2 producer/input pin')
        require(composition['appendedStages'] == ['interactive-oauth']
                and composition['newAnchorCountPerLeaf'] == 134
                and composition['appendedAnchorCountPerLeaf'] == 13
                and composition['totalAnchorCountPerLeaf'] == 166,
                'Exact interactive OAuth successor required')
        expected_stages = ['features', 'async-runtime-inspection', 'research-v1',
                           'background-writers', 'daemon-shutdown', 'runtime-coordination',
                           'refresh-and-skill', 'managed-producers', 'interactive-oauth']
        expected_counts = {'background-writers': 36, 'daemon-shutdown': 35,
                           'runtime-coordination': 15, 'refresh-and-skill': 15, 'managed-producers': 20,
                           'interactive-oauth': 13}
        require(checked['exactSourceStages'] == expected_stages
                and checked['newStageAnchorCounts'] == expected_counts, 'Exact reviewed source stages changed')
        immutable_ref = review['inputs']['standardProjectionV2Immutable']
        require(Path(immutable_ref['path']) == root/'docs/integration/proposed/standard-profile-isolation/daemon-projection-v2/immutable-inputs.json',
                'Exact reviewed v2 source producer required')
        immutable = document(immutable_ref)
        require(immutable['format'] == 'aux.standard.daemon-projection.immutable.v2'
                and immutable['previousProjection'] == prior_ref['path']
                and immutable['previousComposition'] == composition['previousStandardComposition']
                and immutable['loaderSha256'] == prior_projection['loaderSha256'],
                'V2 source review predecessor differs')
        for row in immutable['inputs']:
            require(row in composition['standardProjectionInputs'], 'Dropped reviewed successor input')
            pinned(row['path'], row['sha256'])
        oauth_ref = review['inputs']['standardProjectionV3Immutable']
        require(Path(oauth_ref['path']) == root/'docs/integration/proposed/standard-profile-isolation/daemon-projection-v3/immutable-inputs.json',
                'Exact reviewed v3 source producer required')
        oauth = document(oauth_ref)
        require(oauth['format'] == 'aux.standard.daemon-projection.immutable.v3'
                and oauth['previousProjection'] == managed_ref['path']
                and oauth['previousComposition'] == composition['previousManagedComposition']
                and oauth['loaderSha256'] == managed_projection['loaderSha256']
                and oauth['loaderSha256'] == prior_projection['loaderSha256']
                and oauth['stages'] == [{'name': 'interactive-oauth',
                    'module': 'docs/integration/proposed/standard-profile-isolation/interactive-oauth/source/transform.mjs',
                    'export': 'transformAuxInteractiveOAuth', 'count': 13}],
                'V3 exact source stage/predecessor differs')
        overlay_path = root/'docs/integration/proposed/standard-profile-isolation/interactive-oauth/overlay.json'
        overlay_sha = '7d3734a938e60305b07516620030dcd1c8576d76f796960725d47e312f93bc69'
        require(oauth['oauthOverlay'] == str(overlay_path)
                and oauth['oauthOverlaySha256'] == overlay_sha,
                'Exact reviewed OAuth overlay required')
        overlay = read(pinned(overlay_path, overlay_sha))
        require(overlay['stage'] == 'interactive-oauth' and overlay['changes'] == 13,
                'OAuth stage contract changed')
        for leaf in ['source', 'entry']:
            expected = next(x for x in overlay['daemonInputs'] if x['kind'] == leaf)
            require(oauth['expectedStages'][leaf] == [dict(name='interactive-oauth',
                        inputSha256=expected['inputSha256'], outputSha256=expected['outputSha256'],
                        changesSha256=expected['changesSha256'])]
                    and oauth['expectedOutputs'][leaf] == expected['outputSha256']
                    and managed_projection[leaf+'Sha256'] == expected['inputSha256'],
                    'OAuth exact paired source contract changed')
        for row in overlay['sourceFiles']:
            pinned(overlay_path.parent/row['path'], row['sha256'])
        for row in oauth['inputs']:
            require(row in composition['standardProjectionInputs'], 'Dropped reviewed OAuth input')
            pinned(row['path'], row['sha256'])
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
            prior_row = next(x for x in prior['files'] if x['kind'] == kind)
            require(len(prior_row['anchors']) == 118 and prior_row['addedAnchorCount'] == 86
                    and len(prior_row['stages']) == 6
                    and prior_row['afterSha256'] == prior_projection[kind+'Sha256']
                    and row['stages'][:6] == prior_row['stages']
                    and row['anchors'][:118] == prior_row['anchors']
                    and managed['previousStandardProjectionSha256'] == prior_ref['sha256'],
                    'The complete immutable a1 118-anchor prefix changed')
            pinned(prior_row['output'], prior_row['afterSha256'])
            managed_row = next(x for x in managed['files'] if x['kind'] == kind)
            require(len(managed_row['anchors']) == 153 and managed_row['addedAnchorCount'] == 121
                    and len(managed_row['stages']) == 8
                    and managed_row['previousAnchorCount'] == 118 and managed_row['appendedAnchorCount'] == 35
                    and managed_row['afterSha256'] == managed_projection[kind+'Sha256']
                    and row['stages'][:8] == managed_row['stages']
                    and row['anchors'][:153] == managed_row['anchors']
                    and row['previousAnchorCount'] == 153 and row['appendedAnchorCount'] == 13,
                    'The complete immutable a2 153-anchor prefix changed')
            pinned(managed_row['output'], managed_row['afterSha256'])
            require(row['input'] == previous[kind] and row['beforeSha256'] == previous[kind+'Sha256']
                    and row['stages'][:3] == old['stages']
                    and row['anchors'][:32] == old['anchors'], 'Original three stages changed')
            require(len(row['anchors']) == 166 and row['addedAnchorCount'] == 134
                    and [x['kind'] for x in row['stages']] == checked['exactSourceStages'],
                    'Exact nine-stage/166-anchor chain required')
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
                if stage['kind'] in ['refresh-and-skill', 'managed-producers', 'interactive-oauth']:
                    stage_review = oauth if stage['kind'] == 'interactive-oauth' else immutable
                    reviewed = next(x for x in stage_review['expectedStages'][kind] if x['name'] == stage['kind'])
                    require(stage['beforeSha256'] == reviewed['inputSha256']
                            and stage['afterSha256'] == reviewed['outputSha256']
                            and sha_bytes(json.dumps(anchors, ensure_ascii=False, separators=(',', ':')).encode())
                                == reviewed['changesSha256'], 'Exact reviewed appended source stage differs')
                text = replay(text, anchors)
                require(sha_bytes(text.encode()) == stage['afterSha256']
                        and pinned(stage['output'], stage['afterSha256']).read_text() == text,
                        'Stage output differs from literal replay')
            require(offset == 166 and sha_bytes(text.encode()) == row['afterSha256']
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
            prior_helper = next(x for x in prior['helpers'] if x['kind'] == item['kind'])
            managed_helper = next(x for x in managed['helpers'] if x['kind'] == item['kind'])
            require(item['previousManagedOutput'] == managed_helper['output']
                    and {k: v for k, v in item.items() if k not in ['output', 'previousManagedOutput']}
                        == {k: v for k, v in managed_helper.items() if k != 'output'},
                    'Publisher helper a2 provenance changed')
            pinned(managed_helper['output'], item['outputSha256'])
            require(item['previousOutput'] == prior_helper['output']
                    and {k: v for k, v in item.items() if k not in ['output', 'previousOutput', 'previousManagedOutput']}
                        == {k: v for k, v in prior_helper.items() if k != 'output'},
                    'Publisher helper bytes or original provenance changed')
            pinned(prior_helper['output'], item['outputSha256'])
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
                transform_pin = next(x for x in composition['upstreamAdapterInputs'] if root/x['path'] == transform)
                pinned(transform, transform_pin['sha256'])
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
        # Historical snapshot reads record BEFORE projection, not immutable paths.
        # Authenticate their retained baselines and replay all reviewed layers.
        scope_root = root/'docs/integration/proposed/standard-profile-isolation'
        source_root = Path(build['source'])
        changed = {x['path']: x for x in source['files']}
        input_pins = {x['path']: x['sha256'] for x in source['inputs']}
        require(len(input_pins) == len(source['inputs']), 'Duplicate browser source input')
        for row in source['inputs']:
            path = Path(row['path'])
            if path.is_relative_to(source_root):
                name = str(path.relative_to(source_root))
                require(name in changed and row['sha256'] == changed[name]['beforeSha256'],
                        'Unreviewed mutable snapshot input')
            else:
                pinned(path, row['sha256'])
        values = {}
        for lane_name in ['browser-drain', 'browser-drain-transport', 'browser-drain-final',
                          'browser-drain-after-mainloop', 'browser-drain-shutdown-snapshots']:
            lane = scope_root/lane_name
            manifest = read(pinned(lane/'manifest.json', input_pins[str(lane/'manifest.json')]))
            for item in manifest['files']:
                name = item['path']
                if name not in values:
                    require(item['beforeSha256'] == changed[name]['beforeSha256'],
                            'Retained baseline differs from historical read')
                    values[name] = pinned(lane/'baseline'/name, item['beforeSha256']).read_text()
                require(sha_bytes(values[name].encode()) == item['beforeSha256'],
                        'Browser layer before hash mismatch')
            edits = read(pinned(lane/'replacements.json', input_pins[str(lane/'replacements.json')]))
            for edit in edits:
                values[edit['path']] = replay(values[edit['path']],
                    [dict(find=edit['old'], replace=edit['new'], count=edit['count'])])
            for item in manifest['files']:
                require(sha_bytes(values[item['path']].encode()) == item['afterSha256'],
                        'Browser layer replay mismatch')
            for item in manifest.get('added', []):
                require(item['path'] not in values and changed[item['path']]['beforeSha256'] is None,
                        'Added browser leaf replaces existing source')
                values[item['path']] = pinned(lane/'source'/item['path'], item['sha256']).read_text()
        registrations = [
            ('content/browser/BUILD.gn', '    "aux_child_lifetime.h",',
             '    "aux_child_lifetime.h",\n    "aux_child_process_drain.cc",'),
            ('content/public/browser/BUILD.gn', '    "audio_stream_broker.h",',
             '    "audio_stream_broker.h",\n    "aux_child_process_drain.h",'),
            ('chrome/browser/ui/BUILD.gn', '        "aux_owned_browser_quiesce.cc",',
             '        "aux_browser_shutdown_drain.cc",\n        "aux_browser_shutdown_drain.h",\n        "aux_owned_browser_quiesce.cc",')]
        projection_root = Path(browser['sourceComposition']['path']).parent
        for name, before, after in registrations:
            row = changed[name]
            text = pinned(projection_root/name, row['afterSha256']).read_text()
            original = replay(text, [dict(find=after, replace=before, count=1)])
            require(sha_bytes(original.encode()) == row['beforeSha256']
                    and input_pins[str(source_root/name)] == row['beforeSha256'],
                    'GN registration reverse baseline mismatch')
            values[name] = replay(original, [dict(find=before, replace=after, count=1)])
        require(set(values) == set(changed), 'Browser composition replay omitted a leaf')
        for name, text in values.items():
            require(sha_bytes(text.encode()) == changed[name]['afterSha256']
                    and pinned(projection_root/name, changed[name]['afterSha256']).read_text() == text,
                    'Original browser projection equality failed')
        # The single actual compiler correction is a separate exact transition.
        fix_name = 'chrome/browser/ui/aux_browser_shutdown_drain.cc'
        fix_lane = scope_root/'integration/browser-shutdown-compile-fix'
        before_hash = 'db4d3302017b086c4fa3aa52a87b6aa82114eeeafe2d53d6342841c0178dc5b1'
        after_hash = 'c9ed04b825e5614fa50dead287c692678663960f2745e876f184a8bf2d124607'
        require(values[fix_name] == pinned(fix_lane/'baseline.cc', before_hash).read_text(),
                'Compiler fix baseline differs')
        fixed = replay(values[fix_name], [
            dict(find='  poll.Start(FROM_HERE, base::Milliseconds(25), base::BindRepeating([&] {',
                 replace='  poll.Start(FROM_HERE, base::Milliseconds(25), base::BindRepeating(\n'
                         '      [](ShutdownDrainState* state, base::RunLoop* loop, base::TimeTicks deadline) {', count=1),
            dict(find='      std::lock_guard<std::mutex> lock(state.mutex);\n'
                      '      state.observation = std::move(observed);\n      state.frozen = true;\n      loop.Quit();',
                 replace='      std::lock_guard<std::mutex> lock(state->mutex);\n'
                         '      state->observation = std::move(observed);\n      state->frozen = true;\n      loop->Quit();', count=1),
            dict(find='  }));\n  loop.Run();',
                 replace='  }, base::Unretained(&state), base::Unretained(&loop), deadline));\n  loop.Run();', count=1)])
        require(sha_bytes(fixed.encode()) == after_hash
                and pinned(fix_lane/'source.cc', after_hash).read_text() == fixed,
                'Exact compiler fix replay mismatch')
        values[fix_name] = fixed
        # Only the reviewed six-file descendant-uncertainty successor follows
        # the original compiler fix. No generic layer/manifest allowlist.
        descendant_lane = scope_root/'browser-descendant-uncertainty-a1'
        manifest_ref = review['inputs']['browserDescendantManifest']
        edits_ref = review['inputs']['browserDescendantReplacements']
        require(Path(manifest_ref['path']) == descendant_lane/'manifest.json'
                and Path(edits_ref['path']) == descendant_lane/'replacements.json',
                'Exact descendant uncertainty inputs required')
        descendant = document(manifest_ref); edits = document(edits_ref)
        names = {'chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h',
                 'chrome/browser/ui/aux_browser_shutdown_drain.cc',
                 'chrome/browser/ui/aux_owned_browser_quiesce.cc',
                 'content/browser/aux_child_lifetime.h',
                 'content/browser/aux_child_process_drain.cc',
                 'content/public/browser/aux_child_process_drain.h'}
        require(descendant['modifiedCount'] == 6 and descendant['addedCount'] == 0
                and descendant['countedAdaptations'] == 14
                and len(descendant['files']) == 6
                and {row['path'] for row in descendant['files']} == names
                and len(edits) == 14 and {row['path'] for row in edits} == names
                and all(row['count'] == 1 for row in edits),
                'Exact six-file/fourteen-edit descendant transition required')
        for row in descendant['files']:
            name = row['path']
            require(name in values and sha_bytes(values[name].encode()) == row['beforeSha256']
                    and pinned(descendant_lane/'baseline'/name, row['beforeSha256']).read_text() == values[name],
                    'Descendant transition does not follow reviewed compiler fix')
        for edit in edits:
            values[edit['path']] = replay(values[edit['path']],
                [dict(find=edit['old'], replace=edit['new'], count=edit['count'])])
        for row in descendant['files']:
            require(sha_bytes(values[row['path']].encode()) == row['afterSha256']
                    and pinned(descendant_lane/'source'/row['path'], row['afterSha256']).read_text() == values[row['path']],
                    'Descendant transition replay mismatch')
        predecessor = document(review['inputs']['standardNativePredecessorComposition'])
        require(Path(review['inputs']['standardNativePredecessorComposition']['path'])
                == scope_root/'integration/browser-composition-a2.json',
                'Exact a2 native predecessor required')
        next_inputs = dict(predecessor['inputPins'])
        for row in descendant['files']:
            require(next_inputs.get(row['path']) == row['beforeSha256'], 'Native predecessor pin changed')
            next_inputs[row['path']] = row['afterSha256']
        # Preserve the complete a3 checkpoint before the two-header race fix.
        a3_ref = review['inputs']['standardNativeDescendantComposition']
        require(Path(a3_ref['path']) == scope_root/'integration/browser-composition-a3.json',
                'Exact a3 descendant composition required')
        a3 = document(a3_ref)
        expected_files = [dict(row, source=str(descendant_lane/'source'/row['path'])) for row in descendant['files']]
        require(a3['predecessorComposition'] == review['inputs']['standardNativePredecessorComposition']
                and a3['files'] == expected_files and a3['inputPins'] == next_inputs,
                'Immutable a3 descendant transition changed')
        race_lane = scope_root/'browser-descendant-snapshot-race-a1'
        race_ref = review['inputs']['browserSnapshotRaceManifest']
        race_edits_ref = review['inputs']['browserSnapshotRaceReplacements']
        require(Path(race_ref['path']) == race_lane/'manifest.json'
                and Path(race_edits_ref['path']) == race_lane/'replacements.json',
                'Only the reviewed snapshot race overlay is permitted')
        race = document(race_ref); race_edits = document(race_edits_ref)
        race_files = [
            dict(path='chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h',
                 beforeSha256='dc0bff27eabee9b7ba16a28be96905164da6481fb23231d6bb5ef68a283537ea',
                 afterSha256='55a77918bbb40ba07a9fcf1b1e4d217b62f92d7e4f9d2bc7e6900205d9f4cb47'),
            dict(path='content/browser/aux_child_lifetime.h',
                 beforeSha256='5c5f5de0075eab2d96d7ca015ed6124e291183c0fbbf640dd428719b038a9a10',
                 afterSha256='446f4dac61201c937cae66c4f7515e4aac7bb8cbe0ce14f613cb7661028d2fc6')]
        require(race['modifiedCount'] == 2 and race['addedCount'] == 0
                and race['countedAdaptations'] == 2 and race['files'] == race_files
                and len(race_edits) == 2
                and [row['path'] for row in race_edits] == [row['path'] for row in race_files]
                and all(row['count'] == 1 for row in race_edits)
                and race['patchSha256'] == 'ae70adc6aaeb39d1b56c5672e890d5d924e898a9d37ebbabb2cf6f95a93ca3d4',
                'Exact two-header/two-edit race correction required')
        pinned(race_lane/'change.patch', race['patchSha256'])
        for row, edit in zip(race_files, race_edits):
            name = row['path']
            require(next_inputs[name] == row['beforeSha256']
                    and sha_bytes(values[name].encode()) == row['beforeSha256']
                    and pinned(race_lane/'baseline'/name, row['beforeSha256']).read_text() == values[name],
                    'Race correction does not follow exact a3 header bytes')
            values[name] = replay(values[name], [dict(find=edit['old'], replace=edit['new'], count=1)])
            require(sha_bytes(values[name].encode()) == row['afterSha256']
                    and pinned(race_lane/'source'/name, row['afterSha256']).read_text() == values[name],
                    'Snapshot race correction replay differs')
            next_inputs[name] = row['afterSha256']
        final_hashes = {name: sha_bytes(text.encode()) for name, text in values.items()}
        composed = document(review['inputs']['standardNativeComposition'])
        expected_files = [dict(row, source=str(race_lane/'source'/row['path'])) for row in race_files]
        require(review['inputs']['standardNativeComposition'] == browser['composition']
                and composed['predecessorComposition'] == a3_ref
                and composed['files'] == expected_files and composed['inputPins'] == next_inputs,
                'Browser composition changed beyond exact two-header race correction')
        require(build['nativeInputPinsPath'] == browser['fullInputPins']['path']
                and build['nativeInputPinsSha256'] == browser['fullInputPins']['sha256']
                and build['nativeInputPins']['featureCompositionSha256'] == browser['composition']['sha256'],
                'Full native receipt/composition mismatch')
        full = document(browser['fullInputPins'])
        require(full == build['nativeInputPins'] and len(composed['inputPins']) == 220, 'Full native pins mismatch')
        for row in source['files']:
            if row['path'].startswith('daemon/'):
                continue
            require(full['files'].get(row['path']) == final_hashes[row['path']], 'Standard browser input missing')
            pinned(Path(build['source'])/row['path'], final_hashes[row['path']])
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
