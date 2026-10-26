#!/usr/bin/env python3
"""Replay only the fixed memory helper's authenticated exclusion metadata repair."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
INPUTS = [
    (ROOT / 'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/daemon-build/diagnostics-a5/source/AuxSignedFreshBootstrapPolicyLoader.swift',
     '99b0273b17ff1567b4fcf0e0fd6e82c1be0578dfddc84558c306d544c3810007'),
    (Path('/private/tmp/aux-browser-only-daemon-build-20261025-a66/source/AuxMemoryMainOwner.inc'),
     '97d451aa3a7a604e0d3fa2c11f0ce8bb7caf25ccde36d248d7b38d5dc561bf47'),
]

old_guard = '''        guard policy.contents.role == .daemon, policy.contents.embeddedDaemon,
              policy.contents.includesRebuiltPtyModule else { throw AuxFreshBootstrapPolicyError.policy }
        let path = policy.contents.canonicalPrivateParent
'''
new_guard = '''        guard policy.contents.role == .daemon, policy.contents.embeddedDaemon,
              policy.contents.includesRebuiltPtyModule else { throw AuxFreshBootstrapPolicyError.policy }
        return try authenticatedPrivateParent(policy)
    }
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    fileprivate static func memoryControlParent() throws -> String {
        let policy = try load()
        guard policy.contents.role == .daemon, policy.contents.embeddedDaemon,
              let location = policy.contents.nativeUserLocation,
              policy.contents.canonicalPrivateParent == location.controlRoot else {
            throw AuxFreshBootstrapPolicyError.policy
        }
        return try authenticatedPrivateParent(policy)
    }
#endif
    private static func authenticatedPrivateParent(_ policy: AuxAuthenticatedFreshBootstrapPolicy) throws -> String {
        let path = policy.contents.canonicalPrivateParent
'''
old_export = '''@_cdecl("AuxCopyAuthenticatedExecPrivateParent")
'''
new_export = '''// Only the finite memory owner calls this metadata producer. It grants no exec,
// PTY, account or path-selection capability; the actual owner brackets its use.
@_cdecl("AuxCopyAuthenticatedMemoryControlParent")
func AuxCopyAuthenticatedMemoryControlParent(_ output: UnsafeMutablePointer<CChar>?,
                                            _ capacity: UInt32,
                                            _ count: UnsafeMutablePointer<UInt32>?) -> Int32 {
    guard getpid() == auxImagePreparationProcess, let count else { return -1 }
    count.pointee = 0
    guard let output, capacity > 1, capacity <= 4096 else { return -1 }
    output.pointee = 0
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    auxImagePreparationLock.lock(); let prepared = auxImagePreparationComplete; auxImagePreparationLock.unlock()
    guard prepared else { return -1 }
    do {
        let bytes = try AuxSignedFreshBootstrapPolicyLoader.memoryControlParent().utf8CString
        guard bytes.count > 1, bytes.count <= Int(capacity), bytes.count <= 4096 else { return -1 }
        for index in bytes.indices { output[index] = bytes[index] }
        count.pointee = UInt32(bytes.count)
        return 0
    } catch { return -1 }
#else
    return -1
#endif
}
@_cdecl("AuxCopyAuthenticatedExecPrivateParent")
'''
old_include = '#include "AuxRegisteredMemoryAccountOwner.h"\n'
new_include = '''#include "AuxRegisteredMemoryAccountOwner.h"
// Native-only sealed control-root metadata; this is not a launch admission API.
extern "C" int32_t AuxCopyAuthenticatedMemoryControlParent(
    char* output, uint32_t capacity, uint32_t* count_including_nul);
'''
old_call = '  return Current() && AuxCopyAuthenticatedExecPrivateParent(output, capacity, count) == 0 && Current();\n'
new_call = '  return Current() && AuxCopyAuthenticatedMemoryControlParent(output, capacity, count) == 0 && Current();\n'
TRANSFORMS = [(old_guard, new_guard), (old_export, new_export)], [(old_include, new_include), (old_call, new_call)]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    rows, patch = [], []
    for (source, expected), replacements in zip(INPUTS, TRANSFORMS):
        original = source.read_bytes()
        assert sha(original) == expected, f'Changed input: {source}'
        before = original.decode()
        after, anchors = before, []
        for old, new in replacements:
            assert after.count(old) == 1, f'Anchor count changed: {source.name}'
            after = after.replace(old, new, 1)
            anchors.append({'old': old, 'new': new, 'count': 1})
        restored = after
        for old, new in reversed(replacements):
            assert restored.count(new) == 1
            restored = restored.replace(new, old, 1)
        assert restored == before
        output = HERE / 'source' / source.name
        output.write_text(after)
        rows.append({'input': str(source), 'inputSha256': expected,
                     'output': str(output), 'outputSha256': sha(after.encode()),
                     'anchors': anchors})
        patch.extend(difflib.unified_diff(before.splitlines(True), after.splitlines(True),
                                         fromfile='a/' + source.name, tofile='b/' + source.name))
    (HERE / 'source.patch').write_text(''.join(patch))
    (HERE / 'projection.json').write_text(json.dumps({'format': 'aux.counted-source-projection.v1', 'files': rows}, indent=2) + '\n')
    (HERE / 'checks.json').write_text(json.dumps({'exactInputHashes': True, 'singleCountAnchors': 4,
        'forwardReplay': True, 'reverseReplay': True, 'nativeCompilation': 'parent-owned; not run',
        'runtimeAcceptance': 'pending actual fixed helper indexing/search/close'}, indent=2) + '\n')
    for row in rows:
        print(Path(row['output']).name, row['outputSha256'])


if __name__ == '__main__':
    main()
