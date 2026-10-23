#!/usr/bin/env python3
"""Check the inactive native filesystem producer and its static source pins."""
import hashlib
import json
from pathlib import Path

PROPOSAL_ROOT = Path(__file__).resolve().parent
manifest = json.loads((PROPOSAL_ROOT / "source-pins.json").read_text())
for item in manifest["files"]:
    actual = hashlib.sha256((PROPOSAL_ROOT / item["path"]).read_bytes()).hexdigest()
    assert actual == item["sha256"], item["path"]

source = (PROPOSAL_ROOT / "source/AuxFreshNativeHome.swift").read_text()
assert "private init(" in source
assert "O_RDWR | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK" in source
assert source.index("reservationFD = openat(") < source.index("try writeAll(")
assert source.index("try sync(reservationFD)") < source.index("guard mkdirat(")
assert "SHA256.hash(data: Data(home.utf8))" in source
assert "try requireEmptyDirectory(homeFD)\n            return AuxFreshNativeHome(" in source
assert "captured.prefix(count) == reservationBytes" in source
assert "fstatat(parent, name, &entry, AT_SYMLINK_NOFOLLOW)" in source
assert "F_DUPFD_CLOEXEC" in source
for forbidden in [
    "SecItem", "SecureEnclave", "import Security", "flock(", "unlink(",
    "unlinkat(", "rmdir(", "posix_spawn", "Process()", "setenv(", "getenv(",
    "newScopeExplicitlyReviewed: true", "CallerAssertedFreshAdmission(",
]:
    assert forbidden not in source, forbidden
assert not manifest["authorityGenerated"]
assert not manifest["protectedCallsExecuted"]
print("PASS: pinned real-FD producer; exclusive durable reservation, no overwrite/adopt/authority/launch path")
