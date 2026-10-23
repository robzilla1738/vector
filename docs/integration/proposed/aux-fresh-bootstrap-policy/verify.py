#!/usr/bin/env python3
"""Count-pinned source checks, not signed authentication or runtime admission."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pins=json.loads((HERE/'source-pins.json').read_text())
for item in pins['productionSources']+pins['baselineSourcePins']:
    assert sha(HERE/item['path'])==item['sha256'],item['path']
    if 'actualSourcePath' in item:
        assert sha(ROOT/item['actualSourcePath'])==item['sha256'],item['actualSourcePath']
for item in pins['dependencies']:
    assert sha(ROOT/item['path'])==item['sha256'],item['path']
assert sha(HERE/'source-review.patch')==pins['sourceReviewPatchSha256']
loader=(HERE/'source/AuxSignedFreshBootstrapPolicyLoader.swift').read_text()
policy=(HERE/'source/AuxFreshBootstrapPolicy.swift').read_text()
for token in ['SecCodeCheckValidity(dynamic,dynamicFlags,requirement)','SecStaticCodeCheckValidity(staticCode,flags,requirement)','SecCodeValidateFileResource(staticCode,AuxFreshBootstrapIdentity.resourceRelative as CFString,bytes as CFData,[])','AuxFreshBootstrapPolicyContents.decode(bytes)','policy.accessGroup==captured.accessGroups[0]','try images(bundle:bundle,policy:policy,requirement:requirement);try privateParent(policy.canonicalPrivateParent)','fileprivate init(contents:AuxFreshBootstrapPolicyContents','return try AuxFreshNativeHome.create(inCanonicalPrivateParent:contents.canonicalPrivateParent)']:
    assert token in loader,token
body=loader.split('static func load()throws->AuxAuthenticatedFreshBootstrapPolicy {')[1]
assert body.index('SecCodeCheckValidity')<body.index('SecStaticCodeCheckValidity')<body.index('SecCodeValidateFileResource')<body.index('AuxFreshBootstrapPolicyContents.decode')<body.index('try images(')<body.index('return .init(')
assert loader.index('try revalidateCurrentIdentity()')<loader.index('return try AuxFreshNativeHome.create(')
assert loader.count('func revalidateCurrentIdentity()throws')==1
assert sha(HERE/'source-pins-initial.json')==pins['historicalInitialPinsSha256']
assert loader.count('AuxFreshNativeHome.create(')==1
assert 'generationId' not in policy and 'targetHashes' not in policy and 'AuxRuntimeSelection' not in policy
assert 'canonicalPrivateParent' in policy and 'authoritySelection="aux.fresh.authority.host-availability.v1"' in policy
for forbidden in ['SecItemCopyMatching','SecItemAdd','SecItemUpdate','SecItemDelete','SecKeyCreateRandomKey','AuxFreshFourRowPreparation.prepareForCurrentHost(']:
    assert forbidden not in loader+policy,forbidden
print('PASS:source pins, sealed-auth-before-parse ordering, exact group binding, typed fresh-home handoff, no future-key fields/protected operations')
