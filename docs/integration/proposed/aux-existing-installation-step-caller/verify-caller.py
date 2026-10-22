#!/usr/bin/env python3
"""Offline source composition/ordering checks only; no mutation or Security calls."""
import hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parent
manifest=json.loads((ROOT/'source-pins.json').read_text())
for entry in manifest['files']:
    data=(ROOT/entry['path']).read_bytes()
    assert len(data)<=1024*1024 and hashlib.sha256(data).hexdigest()==entry['sha256']
source=(ROOT/'source/ExistingInstallationMigrationStepCaller.swift').read_text()
assert not re.search(r'\bSecItem\w*\s*\(|Data\(contentsOf|FileManager|PrivateKey\(',source)
assert source.index('if stopped(current){return .stopped(current)}')<source.index('var captures=try capture()')
assert source.index('let request=try AdditiveInstallationTransaction.addRequest')<source.index('status=try security.addOnly')
assert source.index('store.loadCurrent()?.sha256==current.sha256')<source.index('status=try security.addOnly')
assert source.index('capturedAddStatus(current.journal')<source.index('captures=try capture()',source.index('status=try security.addOnly'))
for boundary in ['ExternalInstallationSecurityExecutor.captureOriginals(review)','ExternalInstallationSecurityExecutor.addOnly(request,review:review)','ExistingP256SigningAuthority','ExistingP256Authority','ExistingPqSigningAuthority','ExistingPqAuthority','AuxNativeEnvelopeV2.open(envelope,authority:kem)','AuxNativePqEnvelopeV2.open(envelope,authority:kem)','case uncertainAdd','let activeSelectionPerformed=false','let authorityProvenanceVerified=false']:
    assert boundary in source
assert source.index('if enteredPhase == .intent{return .uncertainAdd')<source.index('status=try security.addOnly')
assert source.count('defer{root.resetBytes(in:0..<root.count)}')==2
print('PASS: pinned existing-only caller composition, durable-intent/status ordering, concrete readback authentication and no default activation.')
