#!/usr/bin/env python3
"""Static binding inventory only; does not assert custody or runtime success."""
import hashlib
import json
from pathlib import Path

proposal = Path(__file__).resolve().parent
repository = proposal.parents[3]
manifest = json.loads((proposal / "source-pins.json").read_text())
for item in manifest["dependencies"]:
    assert hashlib.sha256((repository / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
for item in manifest["sources"]:
    assert hashlib.sha256((proposal / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
source = (proposal / "source/ExistingTerminalCskHandoff.swift").read_text()
assert source.count("withCskPublicationRoot { root in") == 2
assert source.count("capturedRoot: root") == 2
assert "capturedRoot: Data" not in source
assert 'terminal.evidence.mode == "existing-migration"' in source
assert "selected.record.phase == .selected" in source
assert "checkpoint.journal.phase == .ready" in source
assert "selected.record.authenticate(terminal)" in source
for forbidden in ["SecItem", "SecKey", "SecRandom", "state2LaunchAuthorized = true", "writerAdmissionVerified = true", "SecItemDelete", "prepareSoftwareP256Installation("]:
    assert forbidden not in source
assert source.count("underlying.addTarget(") == 1
assert source.index("try fence.validate()", source.index("func addTarget(")) < source.index("underlying.addTarget(")
assert source.index("try fence.validate()", source.index("underlying.addTarget(")) > source.index("underlying.addTarget(")
print("PASS: existing selected-terminal root consumer; no caller root, native provenance, execution or activation claim")
