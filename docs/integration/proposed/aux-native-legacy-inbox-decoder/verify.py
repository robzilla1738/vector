#!/usr/bin/env python3
"""Static pinned-input verification only; no compilation or native execution."""
from pathlib import Path
import hashlib, json
root = Path(__file__).resolve().parents[4]
proposal = Path(__file__).resolve().parent
manifest = json.loads((proposal / "inputs.json").read_text())
for item in manifest["inputs"]:
    assert hashlib.sha256((root / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
source = (proposal / "source/chrome/browser/notifications/aux_legacy_inbox_codec.cc").read_text()
assert source.count('constexpr std::string_view kLegacyPrefix = "ASIDEAI1"') == 1
assert source.count('std::string_view(), &plaintext') == 1
assert source.count('auto replacement = SealInboxV2') == 1
assert source.count('auto reopened = OpenInboxV2') == 1
for forbidden in ["SecItem", "SecRandom", "sqlite", "RunCarrier", "withCskPublicationRoot"]:
    assert forbidden not in source, forbidden
print(f"{len(manifest['inputs'])} source pins verified; native fixture remains deferred")
