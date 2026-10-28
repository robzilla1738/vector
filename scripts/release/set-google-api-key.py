#!/usr/bin/env python3
"""Put the Safe Browsing API key into one Chromium build directory's args.gn.

    set-google-api-key.py <src>/out/AuxRelease [--ref op://Agents/Aux Safe Browsing API key/credential]

The key is read with op-agents and written only to that local args.gn, which never leaves this Mac
(the public repo's flags files carry no key). Nothing is printed except which file changed.
"""
import argparse
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_REF = 'op://Agents/Aux Safe Browsing API key/credential'


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('out_dir', type=Path)
    parser.add_argument('--ref', default=DEFAULT_REF)
    args = parser.parse_args()
    gn = args.out_dir / 'args.gn'
    if not gn.is_file():
        raise SystemExit(f'{gn} does not exist')
    read = subprocess.run(['op-agents', 'read', args.ref], capture_output=True, text=True)
    key = read.stdout.strip()
    if read.returncode or not re.fullmatch(r'[A-Za-z0-9_\-]{20,80}', key):
        raise SystemExit('could not read a well-formed API key from 1Password')
    lines = [line for line in gn.read_text().splitlines() if not line.startswith('google_api_key')]
    lines.append(f'google_api_key = "{key}"')
    gn.write_text('\n'.join(lines) + '\n')
    gn.chmod(0o600)
    print(f'google_api_key set in {gn}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
