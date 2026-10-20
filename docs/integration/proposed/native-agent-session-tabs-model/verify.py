#!/usr/bin/env python3
"""Replay only owned new files and verify the immutable original byte pins."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / "manifest.json").read_text())
evidence = json.loads((root / "source-evidence.json").read_text())
binary = Path(evidence["binary"]).read_bytes()
assert hashlib.sha256(binary).hexdigest() == evidence["binarySha256"]
for item in evidence["ranges"]:
    block = binary[int(item["start"], 16):int(item["end"], 16)]
    assert hashlib.sha256(block).hexdigest() == item["sha256"]
with tempfile.TemporaryDirectory(prefix="aux-session-tabs-model-") as temporary:
    subprocess.run(["git", "apply", "--unsafe-paths", str(root / "native.patch")],
                   cwd=temporary, check=True)
    for item in manifest["files"]:
        assert item["baselineSha256"] is None
        output = Path(temporary, item["path"]).read_bytes()
        assert hashlib.sha256(output).hexdigest() == item["outputSha256"]
print("PASS: original byte pins and independent new-file patch replay")
