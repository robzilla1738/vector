#!/usr/bin/env python3
"""Verify the inactive native-v2 decoder and exact dependency inventory."""
import hashlib
import json
from pathlib import Path

PROPOSAL_ROOT = Path(__file__).resolve().parent
REPOSITORY = PROPOSAL_ROOT.parents[3]
manifest = json.loads((PROPOSAL_ROOT / "source-pins.json").read_text())
for item in manifest["files"]:
    assert hashlib.sha256((PROPOSAL_ROOT / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
for item in manifest["dependencies"]:
    assert hashlib.sha256((REPOSITORY / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
source = (PROPOSAL_ROOT / "source/AuxNativeFreshTargetBoundary.swift").read_text()
assert source.count("SecItemAdd(") == 1
assert source.count("SecItemCopyMatching(") == 1
for forbidden in ["SecItemUpdate(", "SecItemDelete(", "CallerAsserted", "prepare(admission:", "state2LaunchAuthorized = true"]:
    assert forbidden not in source
assert "private struct DecodedNativeFreshStage" in source
assert 'object["format"] as? String == "aux.install.native-fresh.secure-stage.v2"' in source
for binding in ["reservationTransactionId", "reservationSha256", "policySha256", "scope", "candidateSha256", "publicDescriptor", "targetHashes"]:
    assert 'object["' + binding + '"]' in source
assert 'Set(try strictEnvelopeObject(metadataBytes).keys) == ["scheme", "key_storage"]' in source
assert 'bytes.base64EncodedString() == text' in source
assert 'nativeBootstrapHash(bytes) == journal.targetHashes[row]' in source
assert "signer.verifies(signature: signer.signature(for: challenge)" in source
assert "authority = try .p256(" in source and "authority = try .pq(" in source
assert "try intent.consumeOnceForNativeBoundary()" in source
assert source.index("try intent.consumeOnceForNativeBoundary()") < source.index("status = SecItemAdd(")
assert 'payload: payload' in source and 'let payload = decoded.payloads[intent.row]' in source
assert "bytes == decoded.payloads[row]" in source
assert 'decoded.makeCommandCore(payloads: payloads)' in source
assert "try context.revalidateNativeStageBinding()" in source
assert "#if AUX_NATIVE_FRESH_TARGET_BOUNDARY_FIXTURE" in source
print("PASS: exact native-v2 binding/authority decoder and create-only owned-payload dispatch; no review conversion/update/delete/factory path")
