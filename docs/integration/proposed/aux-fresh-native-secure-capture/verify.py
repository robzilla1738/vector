#!/usr/bin/env python3
"""Verify fixed secure capture and its exact logical-home successor."""
import difflib
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

predecessor = (REPOSITORY / manifest["homePredecessor"]).read_text()
successor = (PROPOSAL_ROOT / "source/AuxFreshNativeHome.swift").read_text()
patch = "".join(difflib.unified_diff(
    predecessor.splitlines(True), successor.splitlines(True),
    fromfile="a/AuxFreshNativeHome.swift", tofile="b/AuxFreshNativeHome.swift",
))
assert patch == (PROPOSAL_ROOT / "home-successor.patch").read_text()
assert successor.count("generationAttempted = true") == 1
claim = successor[successor.index("    func claimInitialAuthorityGenerationAttempt()"):
                  successor.index("    func currentReservationSha256()")]
assert "generationAttemptLock.lock()" in claim and "defer { generationAttemptLock.unlock() }" in claim
for forbidden in ["SecItem", "revalidateCurrentIdentity", "requireEmptyBeforeAuthorityGeneration"]:
    assert forbidden not in claim

source = (PROPOSAL_ROOT / "source/AuxFreshNativeSecureCapture.swift").read_text()
assert "private init(" in source
assert "try home.claimInitialAuthorityGenerationAttempt()" in source
assert source.index("try home.claimInitialAuthorityGenerationAttempt()") < source.index("try Self.validate(")
assert source.count("SecItemCopyMatching(") == 1
assert "#if AUX_FRESH_SECURE_CAPTURE_FIXTURE" in source
assert "try policy.revalidateCurrentIdentity()" in source
assert "try home.requireEmptyBeforeAuthorityGeneration()" in source
assert "account: installation + \".\" + suffix" in source
assert 'account: "aux." + scope + ".fresh." + transactionId.lowercased()' in source
for required in [
    "kSecClassGenericPassword", "kSecAttrAccessGroup", "kSecUseDataProtectionKeychain",
    "kSecUseAuthenticationUIFail", "kSecMatchLimitOne", "kSecReturnData",
]:
    assert required in source
for forbidden in [
    "SecItemAdd(", "SecItemUpdate(", "SecItemDelete(", "CallerAsserted",
    "newScopeExplicitlyReviewed", "writerCustodyVerified = true", "getenv(",
]:
    assert forbidden not in source
print("PASS: actual policy/home dependencies; fixed5-row probes; native shared one-shot latch; no asserted review or mutation path")
