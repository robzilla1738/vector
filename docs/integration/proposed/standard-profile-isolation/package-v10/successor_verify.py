"""Finite, reviewed transitions after the unchanged v6 historical validators."""
import hashlib
import json
from pathlib import Path


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


class Successors:
    def __init__(self, env, standard, pinned, document, replay, pin_native, dependencies):
        self.env, self.standard, self.pin, self.doc = env, standard, pinned, document
        self.replay, self.pin_native, self.dependencies = replay, pin_native, dependencies
        self.require, self.read, self.sha = env['require'], env['read'], env['m'].sha
        self.root = env['ROOT']
        self.scope = self.root/'docs/integration/proposed/standard-profile-isolation'

    def pin_browser_input(self, path, digest):
        # One existing SDK linker alias, not a product/source path exception.
        path = Path(path)
        alias = Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/lib/libbsm.tbd')
        if path != alias:
            return self.pin(path, digest)
        target = alias.with_name('libbsm.0.tbd')
        self.require(path.is_symlink() and path.readlink() == Path('libbsm.0.tbd')
            and path.resolve() == target and not target.is_symlink()
            and digest == '12b45397e34d2d80e6df3a3ff926f9b71abd01e060aaef80fafc9ec3f91282c3',
            'Exact original libbsm SDK alias required')
        self.pin(target, digest)
        return path

    def contract(self, review):
        ref = review['inputs']['successorContract']
        self.require(Path(ref['path']) == self.scope/'package-v10/successor-contract.json', 'Fixed v9 contract required')
        c = self.doc(ref)
        self.require(c['format'] == 'aux.standard-isolation.package-v10.contract.v1' and c['complete'] is True, 'Completed exact V9 contract required')
        self.require([s['actualInput'] for s in c['nativeStages']] ==
            ['nativeCredentialActual','nativeObserverActual','nativeCrashActual'], 'Exact native successor order required')
        self.require([Path(s['composition']['path']).name for s in c['browserTransitions']] ==
            ['browser-composition-a5.json','browser-composition-a6.json','browser-composition-a7.json','browser-composition-a8.json'], 'Exact browser successor order required')
        expected_layers = [
            ['content-policy-ack-v1','content-policy-ack-v2','meta-connection-lifetime-a1',
             'meta-connection-lifetime-a2','native-host-stderr-a1','content-policy-ack-gn-a1'],
            ['content-policy-ack-v3'],
            ['browser-native-host-custody-a1','browser-custody-content-a5',
             'browser-native-host-reservation-refusal-a1','browser-crashpad-close-a1',
             'browser-crashpad-system-handler-a1','browser-custody-gn-a1',
             'content-policy-ack-v4','content-policy-ack-v4-custody','meta-connection-lifetime-a3'],
            ['native-host-constructor-a1','browser-custody-compiler-a1']]
        self.require([[layer['name'] for layer in stage['layers']] for stage in c['browserTransitions']]
                     == expected_layers, 'Exact finite browser layers required')
        for row in c['inputs']:
            self.pin_browser_input(row['path'], row['sha256'])
        return c

    def verify_stages(self, review):
        req = self.require
        receipt_ref = review['inputs']['freshStageReceipt']
        receipt = self.doc(receipt_ref)
        stage_root = self.root/'out/standard-profile-finish-stage-pair-20261024'
        req(Path(review['expectedStagePair']) == stage_root
            and Path(receipt_ref['path']) == stage_root/'receipt.json'
            and receipt['format'] == 'aux.browser-features.stage-pair.v1'
            and receipt['passed'] is True and receipt['productExecuted'] is False
            and receipt['finalApp'] == review['expectedApp'], 'Fresh resource stage association required')
        evidence = self.doc(review['inputs']['freshStageEquivalence'])
        req(evidence['format'] == 'aux.standard-final-resource-stage.equivalence.v1'
            and evidence['passed'] is True and evidence['receipt'] == receipt_ref['path']
            and evidence['receiptSha256'] == receipt_ref['sha256'], 'Actual fresh-stage equivalence required')
        req(set(receipt['stages']) == {'baseline','desktop-v1'}
            and [r['profile'] for r in evidence['profiles']] == ['baseline','desktop-v1'], 'Exact two resource profiles required')
        for key in ['appAssembled','appExecuted','signed','runtimeAcceptance']:
            req(evidence[key] is False, 'Stage evidence cannot substitute product acceptance')
        for row in evidence['profiles']:
            profile = row['profile']; stage = stage_root/profile
            req(receipt['stages'][profile]['path'] == str(stage)
                and row['agentResourceBytesAndModesIdentical'] is True,
                'Fresh stage identity/accepted UI comparison differs')
            manifest = self.read(self.pin(stage/'manifest.json',row['freshManifestSha256']))
            req(manifest['finalApp'] == review['expectedApp'] and manifest['featureProfile'] == profile
                and manifest['productionReady'] is False, 'Stage manifest target differs')
            req(row['agentVersion'] == ('1.26.1016.1869' if profile == 'desktop-v1' else '1.26.1016.1865'),
                'Reviewed Agent revision changed')
        # The original package verifier still checks the actual full inventories;
        # these receipts establish provenance, not a replacement inventory gate.

    def verify_source(self, review, previous_review):
        q, read, pin, req = self.sha, self.read, self.pin, self.require
        contract = self.contract(review)
        self.verify_stages(review)
        projection = self.doc(review['inputs']['projection'])
        previous = self.doc(previous_review['inputs']['projection'])
        out, oldout = Path(projection['output']), Path(previous['output'])
        req(str(out) == review['expectedProjectionOutput'] == '/private/tmp/aux-standard-daemon-projection-20261024-a5', 'Fresh exact a5 source required')
        c = read(pin(out/'composition.json', projection['compositionSha256']))
        old = read(pin(oldout/'composition.json', previous['compositionSha256']))
        req(projection['format'] == 'aux.standard-daemon-projection.actual.v5' and projection['passed'] is True
            and c['passed'] is True, 'Actual completed v5 projection required')
        for key in ['independentEntryMatchesProjection', 'upstreamStagesPreserved', 'publisherHelpersUnchanged',
                    'freshDescendantObserverRequired', 'nativeCredentialLockRequired', 'ownedMetaContextRequired']:
            req(projection[key] is True, 'Required source gate: '+key)
        for key in ['productExecuted', 'runtimeAuthorityGranted', 'packaged', 'coldFeatureEnabled']:
            req(projection[key] is False, 'Source must remain inactive: '+key)
        for key, n in [('newAnchorCountPerLeaf',165),('appendedAnchorCountPerLeaf',15),('totalAnchorCountPerLeaf',197)]:
            req(projection[key] == c[key] == n, 'Exact source chain count: '+key)
        checked = self.standard(review)
        req(checked['sourceProjection']==projection and checked['runtimeArtifacts']==c['artifacts'], 'Reviewed exact source tuple differs')
        req(c['previousProviderProjection'] == previous_review['inputs']['projection']['path']
            and c['previousProviderProjectionSha256'] == previous_review['inputs']['projection']['sha256']
            and c['previousProviderComposition'] == str(oldout/'composition.json')
            and c['previousProviderCompositionSha256'] == previous['compositionSha256']
            and c['previousProviderProjectionInputs'] == old['standardProjectionInputs']
            and c['previousProviderAppendedStages'] == old['appendedStages']
            and c['previousProviderArtifacts'] == old['artifacts'], 'Immutable 182-anchor predecessor changed')
        for key in ['previousStandardProjection','previousStandardProjectionSha256','previousStandardComposition',
                    'previousStandardCompositionSha256','previousStandardProjectionInputs','previousManagedProjection',
                    'previousManagedProjectionSha256','previousManagedComposition','previousManagedCompositionSha256',
                    'previousManagedProjectionInputs','previousManagedAppendedStages','previousInteractiveProjection',
                    'previousInteractiveProjectionSha256','previousInteractiveComposition','previousInteractiveCompositionSha256',
                    'previousInteractiveProjectionInputs','previousInteractiveAppendedStages','predecessorSourcePair',
                    'predecessorSourcePairSha256','upstreamComposition','upstreamCompositionSha256',
                    'upstreamAdapterInputs']:
            req(c[key] == old[key], 'Historical source association changed: '+key)
        immutable_ref = review['inputs']['standardProjectionV5Immutable']
        req(Path(immutable_ref['path']) == self.scope/'daemon-projection-v5/immutable-inputs.json', 'Fixed producer required')
        immutable = self.doc(immutable_ref)
        req(immutable['format'] == 'aux.standard.daemon-projection.immutable.v5'
            and immutable['previousProjection'] == c['previousProviderProjection']
            and immutable['previousComposition'] == c['previousProviderComposition'], 'Source producer ancestry changed')
        stages = contract['sourceStages']
        req(checked['exactSourceStages']==self.standard(previous_review)['exactSourceStages']+[s['name'] for s in stages], 'Reviewed source stage catalog changed')
        req(immutable['stages'] == stages and c['appendedStages'] == [s['name'] for s in stages], 'Only two reviewed stages allowed')
        for row in immutable['inputs']:
            req(row in c['standardProjectionInputs'], 'Missing producer dependency')
            pin(row['path'], row['sha256'])
        for row in c['standardProjectionInputs']: pin(row['path'], row['sha256'])
        expected_adapters = [dict(path=str(Path(row['path']).relative_to(self.root)),sha256=row['sha256'])
            for row in c['standardProjectionInputs'] if Path(row['path']).is_relative_to(self.root)]
        req(c['adapterInputs'] == expected_adapters
            and c['adapterInputs'][:len(old['adapterInputs'])] == old['adapterInputs'],
            'Exact extended producer inputs or immutable adapter prefix changed')
        req(len(c['files']) == 2 and {r['kind'] for r in c['files']} == {'source','entry'}, 'Exactly two leaves required')
        for row in c['files']:
            kind = row['kind']; prior = next(r for r in old['files'] if r['kind']==kind)
            req(row['input'] == prior['input'] and row['beforeSha256'] == prior['beforeSha256']
                and row['anchors'][:182] == prior['anchors'] and row['stages'][:12] == prior['stages']
                and row['previousAnchorCount'] == 182 and row['appendedAnchorCount'] == 15
                and row['addedAnchorCount'] == 165 and len(row['anchors']) == 197 and len(row['stages']) == 14,
                'Complete 182-anchor prefix or exact extension changed')
            text = pin(prior['output'], prior['afterSha256']).read_text(); edits = []
            for stage, expected, evaluated in zip(row['stages'][12:], stages, immutable['expectedStages'][kind]):
                a = stage['anchors']; edits += a
                req(stage['kind'] == expected['name'] == evaluated['name'] and len(a) == expected['count']
                    and all(x['count']==1 for x in a) and digest(a) == evaluated['changesSha256']
                    and stage['beforeSha256'] == evaluated['inputSha256']
                    and stage['afterSha256'] == evaluated['outputSha256'], 'Reviewed two-stage source differs')
                req(hashlib.sha256(text.encode()).hexdigest() == stage['beforeSha256'], 'Stage baseline differs')
                text = self.replay(text,a)
                req(hashlib.sha256(text.encode()).hexdigest()==stage['afterSha256']
                    and pin(stage['output'],stage['afterSha256']).read_text()==text, 'Exact literal stage replay differs')
            req(row['anchors'][182:] == edits and row['afterSha256'] == projection[kind+'Sha256']
                == immutable['expectedOutputs'][kind] and pin(row['output'],row['afterSha256']).read_text()==text,
                'Final independent source leaf differs')
        req(len(c['helpers']) == 2, 'Two unchanged publisher helpers required')
        for helper in c['helpers']:
            prior = next(x for x in old['helpers'] if x['kind']==helper['kind'])
            req(helper['previousProviderOutput'] == prior['output']
                and {k:v for k,v in helper.items() if k not in ['output','previousProviderOutput']}
                == {k:v for k,v in prior.items() if k!='output'}, 'Publisher helper derivation changed')
            pin(helper['output'],helper['outputSha256'])
        req(len(c['artifacts']) == 1, 'One shim artifact required')
        a = c['artifacts'][0]; prior = old['artifacts'][0]
        req(a['previousArtifact'] == prior and a['previousAnchorCount'] == 4 and a['appendedAnchorCount'] == 5
            and a['anchors'][:4] == prior['anchors'] and len(a['anchors'])==9
            and a['input'] == prior['input'] and a['inputSha256'] == prior['inputSha256']
            and a['stage']=='native-credential-lock' and a['packageRelativePath']==prior['packageRelativePath'], 'Exact nine-anchor shim ancestry required')
        req(a['stages'] == contract['shimStages'], 'Only exact original4 and new5 shim stages allowed')
        req(a['overlay'] == contract['shimOverlay']['path'] and a['overlaySha256']==contract['shimOverlay']['sha256'], 'Shim overlay changed')
        text = self.replay(pin(a['input'],a['inputSha256']).read_text(),a['anchors'])
        req(a['output']==str(out/'native/aux-chatgpt.cjs') and a['outputSha256']==contract['shimOutputSha256']
            and pin(a['output'],a['outputSha256']).read_text()==text, 'Nine-anchor shim replay differs')
        sr = read(pin(out/'chatgpt-shim-receipt.json',projection['chatgptShimReceiptSha256']))
        req(sr['format']=='aux.standard-chatgpt-shim.derivation.v2' and sr['passed'] is True
            and sr['changesSha256']==digest(a['anchors']) and sr['appendedChangesSha256']==digest(a['anchors'][4:])
            and sr['previousReceipt']==str(oldout/'chatgpt-shim-receipt.json')
            and sr['previousReceiptSha256']==previous['chatgptShimReceiptSha256']
            and sr['executed'] is False and sr['packaged'] is False, 'Shim receipt chain changed')
        for k,v in a.items(): req(sr[k]==v,'Shim receipt field differs: '+k)
        source = read(pin(out/'source-receipt.json',projection['sourceReceiptSha256']))
        entry = read(pin(out/'projected-entry/results.json',projection['entryReceiptSha256']))
        req(source['passed'] is True and source['coldRefusalPreserved'] is True and source['executed'] is False
            and source['uiChanged'] is False and source['compositionReceiptSha256']==projection['compositionSha256']
            and source['composedSha256']==projection['sourceSha256']
            and source['chatgptShimSha256']==a['outputSha256']
            and source['chatgptShimReceiptSha256']==projection['chatgptShimReceiptSha256'], 'Actual source receipt mismatch')
        for key in ['passed','ordinarySourceUnchanged','defaultEntryRefusalPreserved','dormant']: req(entry[key] is True,'Entry gate '+key)
        for key in ['executed','appChanged','runtimeAuthorityGranted','packaged']: req(entry[key] is False,'Entry activation '+key)
        req(entry['syntaxExitCode']==0 and entry['sourceSha256']==projection['sourceSha256']
            and entry['sourceReceiptSha256']==projection['sourceReceiptSha256']
            and entry['entrySha256']==projection['entrySha256']
            and projection['loaderSha256']==previous['loaderSha256']==entry['loaderSha256'], 'Independent entry/source/loader pair differs')
        pin(out/'projected-entry/aux-native-entry.mjs',projection['entrySha256'])
        pin(out/'projected-entry/aux-owned-native.cjs',projection['loaderSha256'])

    def verify_native(self, review, old_inputs_path, old_link_path):
        req, read, pin = self.require, self.read, self.pin
        contract = self.contract(review)
        previous_inputs, previous_link = read(old_inputs_path), read(old_link_path)
        current_path = old_inputs_path
        module_digest = previous_link['moduleSha256']
        module_imports = previous_link['resolvedModuleImports']
        req(len(module_imports)==50, 'Original fifty module imports required')
        for stage in contract['nativeStages']:
            actual = self.doc(review['inputs'][stage['actualInput']])
            req(actual['format']==stage['format'] and actual['passed'] is True
                , 'Native stage did not complete')
            if stage['actualInput']=='nativeCrashActual':
                plan = self.doc(stage['receiptPins']['planSha256'])
                composition = self.doc(stage['sourceComposition'])
                req(plan['sourceComposition']==stage['sourceComposition']
                    and composition['predecessorLinkInputs']['sha256']==self.sha(current_path), 'Crash source/native predecessor differs')
                for row in composition['sourceFiles']: pin(row['path'],row['sha256'])
            else:
                req(actual['baseLinkInputsSha256']==self.sha(current_path), 'Native stage has wrong actual predecessor')
            for key in ['productExecuted','productSigned','runtimeAuthorityGranted']:
                req(actual[key] is False, 'Native stage activation: '+key)
            for key, ref in stage['receiptPins'].items():
                req(actual[key]==ref['sha256'], 'Native review/source association changed: '+key)
                pin(ref['path'],ref['sha256'])
            commands = actual['commands']
            req(commands[-1]['command']==stage['linkInvocation'], 'Exact original link-checker invocation required')
            req([x['name'] for x in commands]==stage['commandNames'] and all(x['exitCode']==0 for x in commands),
                'Every exact native command must complete successfully')
            for unit in stage['units']:
                comp = next(x for x in commands if x['name']==unit['commandName'])
                scan = next(x for x in commands if x['name']==unit['scanName'])
                req(comp['command']==unit['compile'] and scan['command']==unit['scan'], 'Native command differs from exact reviewed operands')
                deps = self.dependencies(unit['dependencyFile'])
                req(deps and deps==self.dependencies(unit['scanFile']), 'Actual dependency scan/compile closure differs')
                for path in deps:
                    # Checked below against the actual final frozen input map.
                    req(Path(path).is_file(), 'Missing compiled dependency')
            input_path = pin(stage['linkManifest'],actual['linkManifestSha256'])
            if stage['actualInput']=='nativeCrashActual':
                req(actual['linkReceipt']==stage['linkReceiptRef']['path'], 'Crash receipt path differs')
                link_path=pin(actual['linkReceipt'],stage['linkReceiptRef']['sha256'])
            else:
                req(actual['linkManifest']==stage['linkManifest'], 'Native manifest path differs')
                link_path=pin(actual['linkReceipt'],actual['linkReceiptSha256'])
            inputs, link = read(input_path), read(link_path)
            req(str(input_path)==stage['linkManifest'] and str(link_path)==stage['linkReceipt'], 'Native output path changed')
            req(link['format']=='aux.profile-isolation.continuation.link.v1' and link['passed'] is True
                and link['inputsUnchanged'] is True and link['manifestSha256']==actual['linkManifestSha256']
                and link['recipeSha256']==previous_link['recipeSha256'], 'Original successful linker/checker required')
            for key in ['signed','executableRun','moduleLoaded','acceptedAppChanged','policyActivated','fullWriterIsolationProven']:
                req(link[key] is False, 'Link activation: '+key)
            req(len(inputs['commands'])==1 and link['commands']==inputs['commands']
                and link['results']==[{'index':0,'exitCode':0}], 'Exact successful link command required')
            before = previous_inputs['commands'][0]
            expected = [stage['operandReplacements'].get(x,x) for x in before] + stage['appendedOperands']
            for insertion in stage.get('insertedOperands',[]): expected.insert(insertion['index'],insertion['value'])
            req(inputs['commands'][0]==expected, 'Unreviewed native link operand change')
            req(all(before.count(x)==1 for x in stage['operandReplacements']), 'Native replacement operand is absent/ambiguous')
            req(len([x for x in expected if x.endswith('.swift')])==48
                and len([x for x in expected if x.endswith('.o')])==stage['objectCount'], 'Exact original Swift/native object count changed')
            definitions = previous_inputs['privateDefinitions'] + stage['addedPrivateDefinitions']
            req(inputs['privateDefinitions']==definitions and link['privateDefinitionsBound']==definitions,
                'Private C definition boundary changed')
            req(link['moduleSha256']==module_digest and link['resolvedModuleImports']==module_imports
                and inputs['module']==previous_inputs['module'], 'Original module ABI/imports changed')
            for path,value in previous_inputs['frozenFiles'].items():
                req(inputs['frozenFiles'].get(path)==value, 'Dropped or altered prior native frozen operand: '+path)
            for path,value in inputs['frozenFiles'].items(): self.pin_native(path,value,review)
            for unit in stage['units']:
                for path in self.dependencies(unit['dependencyFile']):
                    req(path in inputs['frozenFiles'], 'Unfrozen actual compiled dependency: '+path)
                obj = unit['compile'][unit['compile'].index('-o')+1]
                req(obj in inputs['frozenFiles'] and obj in expected, 'Actual compiled object is not linked/pinned')
            output = expected[expected.index('-o')+1]
            pin(output,link['executableSha256'])
            previous_inputs, previous_link, current_path = inputs, link, input_path
        req(len(contract['nativeStages'])==3, 'Credential, observer, crash transitions all required')
        req(str(link_path)=='/private/tmp/aux-standard-daemon-link-20261024-a6/results.json', 'Final a6 native tuple required')
        return input_path, link_path

    def verify_browser(self, review, build, expected, old_composition, historical_values):
        req, read, pin = self.require, self.read, self.pin
        contract = self.contract(review)
        values = dict(historical_values)
        pins = dict(old_composition['inputPins'])
        previous_ref = review['inputs']['previousNativeComposition']
        for transition in contract['browserTransitions']:
            composition = self.doc(transition['composition'])
            req(composition['predecessorComposition']==previous_ref, 'Browser predecessor chain changed')
            before_pins = dict(pins); changed = {}; initial = {}
            for layer in transition['layers']:
                # Layer inputs and exact anchor bytes are pinned by this fixed contract;
                # the finite path list is not provided by the build receipt.
                anchors = self.doc(layer['anchors'])
                if isinstance(anchors,dict): anchors=[dict(edit,path=row['path']) for row in anchors['files'] for edit in row.get('changes',[])]
                req(isinstance(anchors,list) and len(anchors)==layer['anchorCount'], 'Exact browser layer anchor count changed')
                skipped = layer.get('skipPaths',[])
                req(skipped == [] or (layer['name'] in ['browser-native-host-custody-a1','browser-native-host-reservation-refusal-a1','content-policy-ack-v4'] and skipped==['content/browser/aux_child_lifetime.h']),
                    'No arbitrary browser-layer exclusions')
                files = {x['path']:x for x in layer['files']}
                req(set(x['path'] for x in anchors)-set(skipped) <= set(files), 'Unknown browser anchor target')
                for name,row in files.items():
                    if name in skipped: continue
                    if name not in initial: initial[name]=row['beforeSha256']
                    req(name not in pins or pins[name]==row['beforeSha256'], 'Browser layer does not follow actual pinned baseline: '+name)
                    if row['beforeSha256'] is None:
                        req(name not in pins and name not in values, 'New leaf overwrites existing input')
                        text=''
                    elif name in values:
                        text=values[name]
                        req(hashlib.sha256(text.encode()).hexdigest()==row['beforeSha256'], 'Retained browser value mismatch')
                    else:
                        text=pin(row['baseline'],row['beforeSha256']).read_text()
                    selected = [x for x in anchors if x['path']==name]
                    if selected:
                        text=self.replay(text,[dict(find=x.get('old',x.get('before',x.get('find'))),
                            replace=x.get('new',x.get('after',x.get('replace'))),count=x['count']) for x in selected])
                    else:
                        req(row['beforeSha256'] is None, 'Changed existing leaf has no anchors')
                        text=pin(row['source'],row['afterSha256']).read_text()
                    req(hashlib.sha256(text.encode()).hexdigest()==row['afterSha256']
                        and pin(row['source'],row['afterSha256']).read_text()==text, 'Browser exact replay differs: '+name)
                    values[name]=text; pins[name]=row['afterSha256'];changed[name]=row
            expected_files = [dict(path=name,beforeSha256=initial[name],afterSha256=pins[name],source=row['source'])
                              for name,row in changed.items()]
            req(composition['files']==expected_files and composition['inputPins']==pins, 'Finite browser composition differs')
            for key in ['runtimeAccepted','coldHookEnabled','productSigned']: req(composition[key] is False,'Browser activation '+key)
            previous_ref=transition['composition']
        req(len(contract['browserTransitions'])==4 and previous_ref==review['inputs']['standardNativeComposition'], 'Complete a5/a6/a7/a8 browser chain required')
        checked=self.standard(review); browser=checked['browser']; full=self.doc(browser['fullInputPins'])
        req(browser['composition']==previous_ref and build['nativeInputPinsPath']==browser['fullInputPins']['path']
            and build['nativeInputPinsSha256']==browser['fullInputPins']['sha256'] and full==build['nativeInputPins']
            and full['featureCompositionSha256']==previous_ref['sha256'], 'Actual full browser receipt association changed')
        expected_full = dict(self.doc(contract['previousFullBrowserPins'])['files'])
        for row in contract['browserAdditionalPins']:
            req(row['path'] not in expected_full or expected_full[row['path']]==row['sha256'], 'Unrelated extra native pin drift')
            expected_full[row['path']]=row['sha256']
        expected_full.update(pins)
        req(full['files']==expected_full, 'Full build inputs differ from exact replayed source and policy map')
        for name,value in expected_full.items(): self.pin_browser_input(Path(build['source'])/name,value)
        # Only the existing guarded launch-context leaf intersects these transitions.
        intersections=set(expected)&set(values)
        req(intersections=={'chrome/browser/extensions/api/messaging/launch_context_posix.cc', 'chrome/browser/aux/AuxSelectedStateHome.cc'}, 'Unexpected guarded-source intersection')
        for name in intersections: expected[name]=pins[name]
