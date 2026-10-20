#!/usr/bin/env python3
"""Verify original source pins and independently materialize the new files."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda raw: hashlib.sha256(raw).hexdigest()
evidence = json.loads((root / "source-evidence.json").read_text())
binary = Path(evidence["binary"]).read_bytes()
assert sha(binary) == evidence["binarySha256"]
for item in evidence["ranges"]:
    start, end = int(item["start"], 16), int(item["endExclusive"], 16)
    assert sha(binary[start:end]) == item["bytesSha256"]
    assert sha((root / "evidence" / (item["name"] + ".asm")).read_bytes()) == item["assemblySha256"]
assert sha(Path(evidence["locale"]["path"]).read_bytes()) == evidence["locale"]["sha256"]
manifest = json.loads((root / "manifest.json").read_text())
with tempfile.TemporaryDirectory(prefix="aux-tabs-actions-") as temporary:
    subprocess.run(["git", "apply", str(root / "native.patch")], cwd=temporary, check=True)
    for item in manifest["files"]:
        assert item["baselineSha256"] is None
        raw = (Path(temporary) / item["path"]).read_bytes()
        assert sha(raw) == item["outputSha256"]
        assert raw == (root / "port" / item["path"]).read_bytes()
print("PASS original byte/locale pins and independent new-file replay; no actions executed")
