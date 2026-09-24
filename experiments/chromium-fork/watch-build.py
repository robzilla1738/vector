#!/usr/bin/env python3
"""Keep one isolated Aux Chromium proof compile alive across agent sessions.

The existing Siso process is never touched. If it disappears before the build
records completion, resume Ninja against the same output directory and objects.
The launch job runs this watcher once; a failed resumed build stays failed so a
real compiler error can be diagnosed instead of looping forever.
"""

import argparse
import datetime
import os
from pathlib import Path
import subprocess
import time


def stamp():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def original_running(pid):
    result = subprocess.run(
        ["/bin/ps", "-p", str(pid), "-o", "stat=", "-o", "command="],
        capture_output=True, text=True, check=False,
    )
    line = result.stdout.strip()
    return result.returncode == 0 and line and not line.startswith("Z") and "siso ninja" in line


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pid", type=int, required=True)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--depot-tools", type=Path, required=True)
    args = parser.parse_args()
    source = args.source.resolve()
    output = source / "out/AuxProof"
    metadata = output / "aux-build-metadata.txt"
    log = output / "aux-build.log"
    if not (output / "build.ninja").is_file() or not log.is_file():
        raise SystemExit("AuxProof output or build log is missing; refusing a new build")

    print(f"watching existing Siso PID {args.pid} at {stamp()}", flush=True)
    while original_running(args.pid):
        time.sleep(20)
    time.sleep(5)  # let the original build script write its completion marker
    if "completed=" in metadata.read_text(errors="replace"):
        print(f"original build completed at {stamp()}; no resume needed", flush=True)
        return

    env = os.environ.copy()
    env["PATH"] = f"{args.depot_tools.resolve()}:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    env.setdefault("HOME", str(Path.home()))
    env.setdefault("DEVELOPER_DIR", "/Applications/Xcode-beta.app/Contents/Developer")
    command = ["/usr/bin/nice", "-n", "10", "/usr/bin/time", "-l",
               str(args.depot_tools.resolve() / "autoninja"), "-C", "out/AuxProof", "chrome", "-j", "8"]
    print(f"resuming same AuxProof output at {stamp()}", flush=True)
    with metadata.open("a") as report:
        report.write(f"watchdog_resumed={stamp()}\n")
    with log.open("a") as output_log:
        output_log.write(f"\n[aux-watchdog] Resume after original Siso PID {args.pid} exited at {stamp()}\n")
        output_log.flush()
        result = subprocess.run(command, cwd=source, env=env, stdout=output_log,
                                stderr=subprocess.STDOUT, check=False)
    with metadata.open("a") as report:
        report.write(f"watchdog_resume_exit={result.returncode}\n")
        if result.returncode == 0:
            report.write(f"completed={stamp()}\n")
    print(f"resume exited {result.returncode} at {stamp()}", flush=True)
    raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()
