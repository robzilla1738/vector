#!/usr/bin/env python3
"""Pinned source-only v3 checks. Does not compile/load native code or run Node."""
from pathlib import Path
import hashlib
import json
here=Path(__file__).resolve().parent
repo=here.parents[3]
pins=json.loads((here/'inputs.json').read_text())
for section in ('files','baseline','sourceEvidence'):
    for name,expected in pins[section].items():
        path=Path(name) if name.startswith('/') else repo/name
        assert hashlib.sha256(path.read_bytes()).hexdigest()==expected,name
policy=(here/'source/AuxFreshBootstrapPolicy.swift').read_text()
loader=(here/'source/AuxSignedFreshBootstrapPolicyLoader.swift').read_text()
base=repo/'docs/integration/proposed/aux-native-embedded-image-preparation/source'
old_policy=(base/'AuxFreshBootstrapPolicy.swift').read_text()
old_loader=(base/'AuxSignedFreshBootstrapPolicyLoader.swift').read_text()
# Old finite signature contracts are unchanged; PTY has its own strict identity.
for name in ('validateCapturedFreshBootstrapSignature','validateCapturedFreshBootstrapPdfSignature','validateCapturedFreshBootstrapPdfBytes','validateCapturedFreshBootstrapMacUtilitySignature','validateCapturedFreshBootstrapMacUtilityBytes'):
    start=old_policy.index('func '+name+'(')
    end=old_policy.index('\n}',start)+2
    assert old_policy[start:end] in policy,name
assert 'let ptyVersion=object["format"] as? String=="aux.fresh.bootstrap.policy.v3"' in policy
assert 'if ptyVersion {pty=try AuxFreshBootstrapPtyArtifacts.decode(object)} else {pty=nil}' in policy
assert 'if ptyVersion {keys.formUnion(["ptyModule","ptySpawnHelper"])}' in policy
assert 'role == .daemon,object["nativeHostLayout"] as? String=="embedded-daemon"' in policy
for item in ('modulePath','helperPath','moduleIdentifier','helperIdentifier','moduleSourceSha256','helperSourceSha256'):
    assert policy.count('static let '+item+'=')==1,item
assert 'fields["architecture"] as? String=="arm64"' in policy
assert 'captured.flags & 0x10000 != 0' in policy
assert 'captured.entitlements.isEmpty,captured.applicationIdentifier.isEmpty,captured.accessGroups.isEmpty' in policy
assert 'hash != source' in policy
# Current original-team artifacts cannot be declared the future Aux artifact.
assert '8CPD4K4TBB' not in policy+loader
assert 'if policy.ptyArtifacts != nil {result[' in policy
expected=policy[policy.index('func freshBootstrapExpectedImageIdentifiers'):policy.index('func validateCapturedFreshBootstrapImagePaths')]
assert 'helperPath' not in expected
# A helper is never a daemon dyld image or an owned/observed running process.
assert 'if !helper {\n                    guard let handle=dlopen(path,RTLD_NOW|RTLD_LOCAL)' in loader
assert 'for name in ["napi_register_module_v1","node_api_module_get_api_version_v1"]' in loader
assert 'dlsym(handle,name)' in loader and 'String(cString:raw)==path' in loader
assert 'posix_spawn' not in loader and 'waitpid' not in loader
# Root-owned namespace is held before any trusted PTY constructor can run.
assert 'if let pty=policy.contents.ptyArtifacts {resources += [pty.module.relativePath,pty.helper.relativePath]}' in loader
assert loader.index('guard item.st_uid==0,item.st_mode & 0o022==0') < loader.index('if !helper {')
assert '"build/Release/pty.node","build/Debug/pty.node"' in loader
assert 'errno==ENOENT' in loader
assert loader.index('let sealed=SecCodeValidateFileResource(ownStatic,relative') < loader.index('if !helper {')
assert 'try revalidateCustody()\n                if !helper {' in loader
# The original v1/v2 native module load loop is byte-identical.
a='        for (leaf,identifier,bytes) in [("aux-pdf.node"'
start=old_loader.index(a)
end=old_loader.index('        try revalidateCustody()\n        let final=try load()',start)
assert old_loader[start:end] in loader
assert 'Array(bytes[0..<8])==[0xcf,0xfa,0xed,0xfe,0x0c,0x00,0x00,0x01]' in loader
assert '(executable ? [2,0,0,0]:[8,0,0,0])' in loader
assert 'freshBootstrapDigest(data)==artifact.sha256' in loader
print('PASS: source-pinned v3-only policy/finite resource preparation; no compilation, loading, signing or helper execution')
