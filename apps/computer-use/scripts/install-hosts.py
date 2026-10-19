#!/usr/bin/env python3
"""Register only in an explicitly selected browser data directory."""
import argparse
import json
import os
from pathlib import Path
import plistlib
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument("--helper-app", required=True, type=Path)
parser.add_argument("--browser-user-data-dir", required=True, type=Path)
args = parser.parse_args()
app = args.helper_app.resolve(strict=True)
with (app / "Contents/Info.plist").open("rb") as handle:
    plist = plistlib.load(handle)
executable = app / "Contents/MacOS" / plist["CFBundleExecutable"]
if plist["CFBundleIdentifier"] != "dev.aux.computer-use" or not executable.is_file():
    raise SystemExit("Select the independently built Aux Computer Use.app")
directory = args.browser_user_data_dir.expanduser().resolve() / "NativeMessagingHosts"
directory.mkdir(parents=True, exist_ok=True, mode=0o700)
manifest = {"name": "dev.aux.computer_use", "description": "Aux local computer and vault helper", "path": str(executable), "type": "stdio", "allowed_origins": plist["AuxNativeMessagingOrigins"]}
fd, temporary = tempfile.mkstemp(prefix=".aux-host-", dir=directory)
with os.fdopen(fd, "w") as handle:
    json.dump(manifest, handle, indent=2)
    handle.write("\n")
    handle.flush()
    os.fsync(handle.fileno())
target = directory / "dev.aux.computer_use.json"
os.replace(temporary, target)
print(target)
