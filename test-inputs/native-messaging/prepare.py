"""Stage into a NEW directory only; does not launch Aux, host, server or extension."""
import argparse
import json
from pathlib import Path
import shlex
import shutil
import sys

parser = argparse.ArgumentParser()
parser.add_argument('destination', type=Path)
args = parser.parse_args()
root = args.destination.expanduser().absolute()
root.mkdir(mode=0o700)  # Fail if existing; never overwrite an owner directory.
src = Path(__file__).resolve().parent
for name in ('allowed', 'denied', 'page'):
    shutil.copytree(src / name, root / name)
shutil.copy2(src / 'host.py', root / 'host.py')
launcher = root / 'launch-host'
launcher.write_text('#!/bin/sh\nexec ' + shlex.quote(sys.executable) + ' ' + shlex.quote(str(root / 'host.py')) + '\n')
launcher.chmod(0o700)
hosts = root / 'user-data' / 'NativeMessagingHosts'
hosts.mkdir(parents=True)
ids = json.loads((src / 'extension-ids.json').read_text())
manifest = {'name': 'dev.aux.test', 'description': 'Aux disposable dummy roundtrip',
            'path': str(launcher), 'type': 'stdio',
            'allowed_origins': ['chrome-extension://' + ids['allowed'] + '/']}
(hosts / 'dev.aux.test.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'root': str(root), 'user_data_dir': str(root / 'user-data'), 'ids': ids}, indent=2))
