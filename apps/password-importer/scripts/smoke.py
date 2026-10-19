#!/usr/bin/env python3
"""Only synthetic exports and a disposable marked SQLite fixture are read."""
from pathlib import Path
import json
import os
import secrets
import sqlite3
import subprocess
import tempfile
import zipfile

root = Path(__file__).resolve().parents[1]
executable = root / "dist/Aux Password Importer.app/Contents/MacOS/aux-password-importer"
with tempfile.TemporaryDirectory(prefix="aux-import-fixture-") as directory:
    path = Path(directory)
    token = secrets.token_hex(32)
    env = {"PATH": "/usr/bin:/bin", "HOME": directory, "TMPDIR": directory, "AUX_HELPER_AUTH_TOKEN": token}
    process = subprocess.Popen([str(executable), "--stdio"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, env=env)
    def call(method, params=None, authorized=True):
        request = {"id": secrets.token_hex(8), "method": method, "params": params or {}}
        if authorized:
            request["auth"] = token
        process.stdin.write(json.dumps(request) + "\n")
        process.stdin.flush()
        row = json.loads(process.stdout.readline())
        assert row["id"] == request["id"]
        return row
    assert call("import.prepare", {}, authorized=False)["error"]["code"] == "UNAUTHORIZED"
    csv = path / "fixture.csv"
    csv.write_text('Title,URL,Username,Password,Notes,OTPAuth\r\n"Site, one",https://example.invalid,user,fixture-secret,"First line\nSecond ""quoted"" line",\r\n')
    prepared = call("import.prepare", {"authorized": True, "path": str(csv), "format": "csv"})["result"]
    assert prepared["count"] == 1 and "fixture-secret" not in json.dumps(prepared)
    committed = call("import.commit", {"jobId": prepared["jobId"], "accepted": True})["result"]
    assert committed["items"][0]["password"] == "fixture-secret"
    assert committed["items"][0]["notes"] == 'First line\nSecond "quoted" line'
    encrypted = path / "encrypted.json"
    encrypted.write_text(json.dumps({"encrypted": True, "items": []}))
    assert call("import.prepare", {"authorized": True, "path": str(encrypted), "format": "bitwarden-json"})["error"]["code"] == "PRECONDITION_FAILED"
    onepassword = path / "fixture.1pux"
    data = {"accounts": [{"vaults": [{"attrs": {"uuid": "fixture-vault"}, "items": [{"uuid": "fixture-item", "overview": {"title": "Fixture login", "url": "https://example.invalid"}, "details": {"loginFields": [{"designation": "username", "value": "fixture-user"}, {"designation": "password", "value": "fixture-1p-secret"}]}}]}]}]}
    with zipfile.ZipFile(onepassword, "w") as archive:
        archive.writestr("export.data", json.dumps(data))
        archive.writestr("../must-not-extract.txt", "Not extracted")
    prepared = call("import.prepare", {"authorized": True, "path": str(onepassword), "format": "1password-1pux"})["result"]
    assert prepared["count"] == 1 and "fixture-1p-secret" not in json.dumps(prepared)
    assert not (path.parent / "must-not-extract.txt").exists()
    (path / ".aux-fixture.json").write_text(json.dumps({"format": "chromium-login-fixture", "version": 1}))
    database = path / "Login Data"
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE logins (origin_url TEXT,username_value TEXT,password_value BLOB,date_created INTEGER)")
        connection.execute("INSERT INTO logins VALUES (?,?,?,?)", ("https://example.invalid", "fixture-user", b"fixture-clear-value", 13222310400000000))
        connection.execute("INSERT INTO logins VALUES (?,?,?,?)", ("https://encrypted.invalid", "fixture-user", b"v10not-a-real-ciphertext", 13222310400000000))
    prepared = call("import.prepare", {"authorized": True, "path": str(database), "format": "chromium-fixture"})["result"]
    assert prepared["count"] == 1 and prepared["errors"][0]["code"] == "SOURCE_KEY_REQUIRED"
    items = call("import.commit", {"jobId": prepared["jobId"], "accepted": True})["result"]["items"]
    assert items[0]["createdAt"] == 1577836800000
    process.stdin.close()
    assert process.wait(timeout=20) == 0
print("Aux importer synthetic CSV/1PUX/SQLite review and encrypted-source refusal passed")
