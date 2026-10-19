#!/usr/bin/env python3
from pathlib import Path
import json
import argparse
import plistlib
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
if sys.platform != "darwin":
    raise SystemExit("Aux Password Importer requires macOS")
arguments = argparse.ArgumentParser()
arguments.add_argument("--probe-exchange-entitlement", action="store_true", help="Build an isolated ad hoc eligibility probe, never the normal helper")
options = arguments.parse_args()
output = root / ("out/credential-exchange-entitled-probe" if options.probe_exchange_entitlement else "dist")
app = output / "Aux Password Importer.app"
macos = app / "Contents/MacOS"
macos.mkdir(parents=True, exist_ok=True)
executable = macos / "aux-password-importer"
shared_protocol = root.parent / "computer-use/Sources/Protocol.swift"
subprocess.run(["xcrun", "swiftc", "-swift-version", "5", "-O", "-target", "arm64-apple-macos14.0", str(shared_protocol), *map(str, sorted((root / "Sources").glob("*.swift"))), "-framework", "AppKit", "-framework", "AuthenticationServices", "-framework", "Security", "-framework", "UniformTypeIdentifiers", "-lsqlite3", "-o", str(executable)], check=True)
identities = json.loads((root.parents[1] / "docs/design/extension-identities.json").read_text())
plist = {"CFBundleIdentifier": "dev.aux.password-importer", "CFBundleName": "Aux Password Importer", "CFBundleDisplayName": "Aux Password Importer", "CFBundleExecutable": executable.name, "CFBundlePackageType": "APPL", "CFBundleShortVersionString": "0.1.0", "CFBundleVersion": "1", "LSMinimumSystemVersion": "14.0", "LSUIElement": True, "NSUserActivityTypes": ["ASCredentialExchangeActivity"], "AuxNativeMessagingOrigins": [f"chrome-extension://{identity['id']}/" for identity in identities.values()]}
with (app / "Contents/Info.plist").open("wb") as handle:
    plistlib.dump(plist, handle)
resources = app / "Contents/Resources"
resources.mkdir(parents=True, exist_ok=True)
(resources / "NOTICE.md").write_text("# Aux Password Importer 0.1.0\n\nOriginal Aux clean-room module. Copyright 2026 Aux contributors.\nSource and local-build license terms are supplied with the Aux workspace.\nPrivate protocol: apps/password-importer/PROTOCOL.md.\nThis locally ad hoc signed app contains independently authored resources.\n")
extension = app / "Contents/PlugIns/Aux Credential Import.appex"
extension_macos = extension / "Contents/MacOS"
extension_macos.mkdir(parents=True, exist_ok=True)
subprocess.run(["xcrun", "swiftc", "-swift-version", "5", "-O", "-target", "arm64-apple-macos14.0", "-application-extension", "-emit-library", "-module-name", "AuxCredentialImport", str(root / "Extension/Provider.swift"), "-framework", "AuthenticationServices", "-o", str(extension_macos / "AuxCredentialImport")], check=True)
extension_plist = {
    "CFBundleIdentifier": "dev.aux.password-importer.credential-provider",
    "CFBundleName": "Aux Credential Import", "CFBundleExecutable": "AuxCredentialImport",
    "CFBundlePackageType": "XPC!", "CFBundleShortVersionString": "0.1.0", "CFBundleVersion": "1",
    "LSMinimumSystemVersion": "14.0",
    "NSExtension": {"NSExtensionPointIdentifier": "com.apple.authentication-services-credential-provider-ui",
                    "NSExtensionPrincipalClass": "AuxCredentialImportProviderViewController",
                    "NSExtensionAttributes": {"ASCredentialProviderExtensionCapabilities": {
                        "SupportsPasswords": False, "SupportsPasskeys": False,
                        "SupportsCredentialExchange": True, "SupportedCredentialExchangeVersions": ["1.0"]}}}}
with (extension / "Contents/Info.plist").open("wb") as handle:
    plistlib.dump(extension_plist, handle)
entitlements = output / "exchange.entitlements.plist"
with entitlements.open("wb") as handle:
    plistlib.dump({"com.apple.developer.authentication-services.autofill-credential-provider": True} if options.probe_exchange_entitlement else {}, handle)
subprocess.run(["codesign", "--force", "--sign", "-", "--entitlements", str(entitlements), str(extension)], check=True)
subprocess.run(["codesign", "--force", "--sign", "-", "--entitlements", str(entitlements), str(app)], check=True)
print(app)
