#!/usr/bin/env python3
"""Build the independently authored Aux macOS helper with ad hoc local signing."""
from pathlib import Path
import plistlib
import json
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
if sys.platform != "darwin":
    raise SystemExit("Aux Computer Use requires macOS")
app = root / "dist" / "Aux Computer Use.app"
macos = app / "Contents" / "MacOS"
macos.mkdir(parents=True, exist_ok=True)
executable = macos / "aux-computer-use"
subprocess.run(["xcrun", "swiftc", "-swift-version", "5", "-O", "-target", "arm64-apple-macos14.0", *map(str, sorted((root / "Sources").glob("*.swift"))), "-framework", "AppKit", "-framework", "ApplicationServices", "-framework", "Contacts", "-framework", "Carbon", "-framework", "Security", "-framework", "LocalAuthentication", "-framework", "UserNotifications", "-o", str(executable)], check=True)
plist = {"CFBundleIdentifier": "dev.aux.computer-use", "CFBundleName": "Aux Computer Use", "CFBundleDisplayName": "Aux Computer Use", "CFBundleExecutable": executable.name, "CFBundlePackageType": "APPL", "CFBundleShortVersionString": "0.1.0", "CFBundleVersion": "1", "LSMinimumSystemVersion": "14.0", "LSUIElement": True, "NSContactsUsageDescription": "Aux looks up contacts only when you request a contact task.", "NSAppleEventsUsageDescription": "Aux controls another app only for the operation you approve.", "NSFaceIDUsageDescription": "Aux uses device biometry to unlock the local vault you enrolled."}
identities = json.loads((root.parents[1] / "docs/design/extension-identities.json").read_text())
plist["AuxNativeMessagingOrigins"] = [f"chrome-extension://{identity['id']}/" for identity in identities.values()]
with (app / "Contents" / "Info.plist").open("wb") as handle:
    plistlib.dump(plist, handle)
resources = app / "Contents/Resources"
resources.mkdir(parents=True, exist_ok=True)
(resources / "NOTICE.md").write_text("# Aux Computer Use 0.1.0\n\nOriginal Aux clean-room module. Copyright 2026 Aux contributors.\nSource and local-build license terms are supplied with the Aux workspace.\nPrivate protocol: apps/computer-use/PROTOCOL.md.\nThis locally ad hoc signed app contains independently authored resources.\n")
subprocess.run(["codesign", "--force", "--sign", "-", str(app)], check=True)
print(app)
