#!/usr/bin/env python3
"""Replay the pinned two-divider integration without touching Chromium."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / "manifest.json").read_text())
with tempfile.TemporaryDirectory(prefix="aux-two-dividers-") as directory:
    target = Path(directory)
    for item in manifest["files"]:
        baseline = root / "baseline" / item["path"]
        assert hashlib.sha256(baseline.read_bytes()).hexdigest() == item["baselineSha256"]
        output = target / item["path"]
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(baseline, output)
    subprocess.run(["git", "apply", "--unsafe-paths", str(root / "native.patch")], cwd=target, check=True)
    for item in manifest["files"]:
        output = (target / item["path"]).read_bytes()
        assert hashlib.sha256(output).hexdigest() == item["outputSha256"]
        assert output == (root / "port" / item["path"]).read_bytes()
print("PASS: two-file divider patch replay and exact pinned output hashes")
