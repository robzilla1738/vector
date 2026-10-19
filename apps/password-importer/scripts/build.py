#!/usr/bin/env python3
from pathlib import Path
import json
import plistlib
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
if sys.platform != "darwin":
    raise SystemExit("Aux Password Importer requires macOS")
app = root / "dist/Aux Password Importer.app"
macos = app / "Contents/MacOS"
macos.mkdir(parents=True, exist_ok=True)
executable = macos / "aux-password-importer"
shared_protocol = root.parent / "computer-use/Sources/Protocol.swift"
subprocess.run(["xcrun", "swiftc", "-swift-version", "5", "-O", "-target", "arm64-apple-macos14.0", str(shared_protocol), *map(str, sorted((root / "Sources").glob("*.swift"))), "-framework", "AppKit", "-framework", "UniformTypeIdentifiers", "-lsqlite3", "-o", str(executable)], check=True)
identities = json.loads((root.parents[1] / "docs/design/extension-identities.json").read_text())
plist = {"CFBundleIdentifier": "dev.aux.password-importer", "CFBundleName": "Aux Password Importer", "CFBundleDisplayName": "Aux Password Importer", "CFBundleExecutable": executable.name, "CFBundlePackageType": "APPL", "CFBundleShortVersionString": "0.1.0", "CFBundleVersion": "1", "LSMinimumSystemVersion": "14.0", "LSUIElement": True, "AuxNativeMessagingOrigins": [f"chrome-extension://{identity['id']}/" for identity in identities.values()]}
with (app / "Contents/Info.plist").open("wb") as handle:
    plistlib.dump(plist, handle)
resources = app / "Contents/Resources"
resources.mkdir(parents=True, exist_ok=True)
(resources / "NOTICE.md").write_text("# Aux Password Importer 0.1.0\n\nOriginal Aux clean-room module. Copyright 2026 Aux contributors.\nSource and local-build license terms are supplied with the Aux workspace.\nPrivate protocol: apps/password-importer/PROTOCOL.md.\nThis locally ad hoc signed app contains independently authored resources.\n")
subprocess.run(["codesign", "--force", "--sign", "-", str(app)], check=True)
print(app)
