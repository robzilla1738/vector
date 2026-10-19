#!/usr/bin/env python3
"""Serialize native build commands across lanes without reclaiming live locks."""
import fcntl
import subprocess
import sys

if len(sys.argv) < 2:
    raise SystemExit('Usage: python3 scripts/native-build.py <build command> [args...]')
with open('/tmp/aux-build.lock', 'a') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    raise SystemExit(subprocess.call(sys.argv[1:]))
