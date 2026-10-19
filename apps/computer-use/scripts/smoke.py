#!/usr/bin/env python3
"""Read-only permission/capability smoke; never captures screens or reads contacts/messages."""
from pathlib import Path
import json
import os
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
executable = root / "dist/Aux Computer Use.app/Contents/MacOS/aux-computer-use"
with tempfile.TemporaryDirectory(prefix="aux-helper-smoke-") as directory:
    env = {"PATH": "/usr/bin:/bin", "HOME": directory, "TMPDIR": directory, "AUX_HELPER_ARTIFACT_DIR": directory}
    requests = [{"id": "ready", "method": "ping"}, {"id": "permissions", "method": "permissions.status"}, {"id": "private", "method": "vault.biometryStatus", "params": {"accountId": 0, "vaultId": "master-v1"}}]
    result = subprocess.run([str(executable), "--stdio"], input="".join(json.dumps(row) + "\n" for row in requests), text=True, capture_output=True, timeout=20, env=env, check=True)
    rows = [json.loads(line) for line in result.stdout.splitlines()]
    assert rows[0]["result"]["service"] == "aux-computer-use"
    assert rows[1]["result"]["fullDiskAccess"] == "unknown"
    assert rows[1]["result"]["semanticCapture"] in ("available", "permission-required")
    assert rows[2]["error"]["code"] == "UNAUTHORIZED"
    payload = json.dumps({"id": 1, "method": "capabilities"}).encode()
    framed = subprocess.run([str(executable), "--native-messaging"], input=struct.pack("<I", len(payload)) + payload, capture_output=True, timeout=20, env=env, check=True).stdout
    length = struct.unpack("<I", framed[:4])[0]
    assert len(framed[4:]) == length
    assert json.loads(framed[4:])["result"]["privateTransportRequired"] is True
print("Aux helper permission-status and native framing smoke passed")
