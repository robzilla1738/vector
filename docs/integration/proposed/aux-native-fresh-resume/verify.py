#!/usr/bin/env python3
"""Check the inactive resumed-only source composition; no runtime acceptance."""
import hashlib
import json
from pathlib import Path

proposal = Path(__file__).resolve().parent
repository = proposal.parents[3]
manifest = json.loads((proposal / "source-pins.json").read_text())
assert manifest["inputCount"] == len(manifest["inputs"]) == 25
for item in manifest["inputs"] + manifest["baselines"]:
    assert hashlib.sha256((repository / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
resumed = (proposal / "source/AuxResumedFreshNativeHome.swift").read_text()
for forbidden in ["SecItem", "mkdir(", "mkdirat(", "O_CREAT", "O_EXCL", "claimInitialAuthorityGeneration", "takeAbsentForGeneration", "prepare("]:
    assert forbidden not in resumed, forbidden
assert "private init(" in resumed
assert "AuxAuthenticatedFreshBootstrapPolicy" in resumed
assert "O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK" in resumed
assert "func readExistingInitialJournal()" in resumed
context = (proposal / "source/AuxNativeFreshStageCoordinator.swift").read_text()
start = context.index("static func resume(")
end = context.index("func revalidateNativeStageBinding()", start)
resume = context[start:end]
assert resume.index("AuxResumedFreshNativeHome.reopen") < resume.index("readExistingInitialJournal")
assert resume.index("AuxNativeFreshTargetBoundary(context: context)") < resume.index("return context")
assert "private enum NativeOwner" in context
assert "case resumed(AuxResumedFreshNativeHome)" in context
for file in ["AuxFreshNativeHome.swift", "AuxResumedFreshNativeHome.swift"]:
    assert "AuxNativeFreshReservationLeaseRegistry.lease(parentFD: parentFD, reservationFD: reservationFD)" in (proposal / "source" / file).read_text()
driver = (proposal / "source/AuxNativeFreshTargetCoordinator.swift").read_text()
assert "context.capture" not in driver
assert "context.targetProgressLease" in driver
assert "context.duplicateRetainedHomeDescriptor()" in driver
print("PASS:25 pinned production inputs; private resumed-only FD/context seam and shared native alias lease; no execution claim")
