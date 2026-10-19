#!/usr/bin/env python3
"""Disposable private-pipe/capability and public SDK mapping checks; no OS chooser."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import uuid

root = Path(__file__).resolve().parents[1]
app = root / "dist/Aux Password Importer.app"
with tempfile.TemporaryDirectory(prefix="aux-exchange-smoke-") as temporary:
    home = Path(temporary)
    token = "synthetic-helper-auth-" + uuid.uuid4().hex
    environment = {"PATH": "/usr/bin:/bin:/usr/sbin:/sbin", "HOME": str(home), "TMPDIR": str(home), "AUX_HELPER_AUTH_TOKEN": token}
    scope = {"sessionId": str(uuid.uuid4()), "accountId": 1, "profileId": "fixture-profile", "vaultId": "fixture-vault"}
    calls = [{"id": "capabilities", "method": "capabilities"},
             {"id": "denied", "method": "exchange.begin", "params": scope},
             {"id": "unsupported", "method": "exchange.begin", "params": scope, "auth": token}]
    process = subprocess.Popen([str(app / "Contents/MacOS/aux-password-importer"), "--stdio"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=environment)
    try:
        output, diagnostics = process.communicate("".join(json.dumps(call) + "\n" for call in calls), timeout=35)
    except subprocess.TimeoutExpired:
        process.terminate()
        process.communicate(timeout=10)
        raise
    assert process.returncode == 0, f"Normal ad hoc helper failed ({process.returncode})"
    replies = {reply["id"]: reply for reply in map(json.loads, output.splitlines())}
    assert replies["denied"]["error"]["code"] == "UNAUTHORIZED"
    assert replies["capabilities"]["result"]["nativeCredentialExchange"] == {"supported": False, "reason": "os-authorized-signing-required"}
    assert replies["unsupported"]["error"]["code"] == "PRECONDITION_FAILED"
    print("Private pipe and safe unsigned capability refusal passed")
    main = home / "main.swift"
    shutil.copyfile(root / "tests/ExchangeFixture.swift", main)
    executable = home / "exchange-fixture"
    sources = [root.parent / "computer-use/Sources/Protocol.swift", root / "Sources/Importer.swift", root / "Sources/CredentialExchange.swift", main]
    subprocess.run(["xcrun", "swiftc", "-swift-version", "5", "-target", "arm64-apple-macos14.0", *map(str, sources), "-framework", "AppKit", "-framework", "AuthenticationServices", "-framework", "Security", "-framework", "UniformTypeIdentifiers", "-lsqlite3", "-o", str(executable)], check=True)
    subprocess.run([str(executable)], check=True, env=environment)
