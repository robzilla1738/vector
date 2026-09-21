#!/usr/bin/env python3
"""Build an isolated macOS development host; no install, signing, or profile migration."""
import argparse
import pathlib
import plistlib
import shutil
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("--sdk", type=pathlib.Path, required=True)
parser.add_argument("--output", type=pathlib.Path, required=True)
parser.add_argument("--build-dir", type=pathlib.Path, help="Reuse compiled SDK objects across fresh development bundles")
args = parser.parse_args()
sdk, output = args.sdk.resolve(), args.output.resolve()
source = pathlib.Path(__file__).resolve().parent
if "152.0.7+g83ffcba+chromium-152.0.7977.83_macosarm64" not in sdk.name:
    parser.error("Use the pinned macOS ARM64 SDK described in README.md")
app = output / "Aux Host Candidate.app"
if app.exists():
    parser.error("Choose a fresh output directory; existing apps are never overwritten")
build = args.build_dir.resolve() if args.build_dir else output / "build"
subprocess.run(["cmake", "-S", str(source), "-B", str(build),
                f"-DCEF_ROOT={sdk}", "-DCMAKE_BUILD_TYPE=Release"], check=True)
subprocess.run(["cmake", "--build", str(build), "--parallel", "6"], check=True)

def bundle(path, executable, binary, identifier):
    contents = path / "Contents"
    (contents / "MacOS").mkdir(parents=True)
    (contents / "Resources").mkdir()
    shutil.copy2(binary, contents / "MacOS" / executable)
    with (contents / "Info.plist").open("wb") as file:
        plistlib.dump({"CFBundleExecutable": executable, "CFBundleIdentifier": identifier,
                      "CFBundleName": executable, "CFBundlePackageType": "APPL",
                      "CFBundleVersion": "1", "NSHighResolutionCapable": True,
                      "LSMinimumSystemVersion": "12.0"}, file)

bundle(app, "Aux Host Candidate", build / "aux-host", "dev.aux.host-candidate")
frameworks = app / "Contents" / "Frameworks"
frameworks.mkdir()
shutil.copytree(sdk / "Release" / "Chromium Embedded Framework.framework",
                frameworks / "Chromium Embedded Framework.framework", symlinks=True)
for suffix in ["", " (Alerts)", " (GPU)", " (Plugin)", " (Renderer)"]:
    name = "Aux Host Candidate Helper" + suffix
    identifier = "dev.aux.host-candidate.helper" + ("." + suffix.strip(" ()").lower() if suffix else "")
    bundle(frameworks / (name + ".app"), name, build / "aux-host-helper", identifier)
print(app)
