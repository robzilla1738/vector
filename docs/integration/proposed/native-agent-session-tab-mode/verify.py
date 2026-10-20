#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

p = Path(__file__).resolve().parent
manifest = json.loads((p / "manifest.json").read_text())
evidence = json.loads((p / "source-evidence.json").read_text())
binary = Path(evidence["binary"]).read_bytes()
assert hashlib.sha256(binary).hexdigest() == evidence["binarySha256"]
for item in evidence["ranges"]:
    assert hashlib.sha256(binary[int(item["start"], 16):int(item["end"], 16)]).hexdigest() == item["sha256"]
with tempfile.TemporaryDirectory(prefix="aux-agent-row-mode-") as temporary:
    work = Path(temporary)
    for item in manifest["files"]:
        source = p / "baseline" / item["path"]
        assert hashlib.sha256(source.read_bytes()).hexdigest() == item["baselineSha256"]
        target = work / item["path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    subprocess.run(["git", "apply", "--unsafe-paths", str(p / "native.patch")], cwd=work, check=True)
    for item in manifest["files"]:
        assert hashlib.sha256((work / item["path"]).read_bytes()).hexdigest() == item["outputSha256"]
print("PASS: exact source pins and independent three-file patch replay")
