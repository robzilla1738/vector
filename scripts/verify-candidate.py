#!/usr/bin/env python3
"""Check that the current candidate still matches its recorded repair chain.

Reads docs/integration/proposed/completion-20261026/integrator/current-source-selection.json:
every pinned {path, sha256} must exist with that hash, and the candidate app's
whole inventory must equal the latest repair receipt's. Read-only.
"""
import hashlib, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SELECTION = ROOT/'docs/integration/proposed/completion-20261026/integrator/current-source-selection.json'
LEGACY = '/Users/rcourson/Documents/Vibe/web'  # pre-rename root in older receipts


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as stream:
        for block in iter(lambda: stream.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()


def pins(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            yield value['path'], value['sha256']
        for item in value.values():
            yield from pins(item)
    elif isinstance(value, list):
        for item in value:
            yield from pins(item)


def local(path):
    return Path(str(ROOT) + path[len(LEGACY):] if path.startswith(LEGACY + '/') else path)


def main():
    selection = json.loads(SELECTION.read_text())
    missing, changed, checked = [], [], 0
    for path, digest in pins(selection):
        file = local(path)
        if not file.is_file():
            missing.append(path)
        elif sha(file) != digest:
            changed.append(path)
        checked += 1
    app = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
    latest = max((json.loads(local(p).read_text()) for p, _ in pins(selection)
                  if p.endswith('/receipt.json') and local(p).is_file()
                  and json.loads(local(p).read_text()).get('inventorySha256') == selection['signedInventorySha256']),
                 key=lambda r: 0, default=None)
    inventory = 'no receipt matches signedInventorySha256'
    if latest:
        rows = {r['path']: r for r in latest['files']}
        drift = [p for p, r in rows.items() if r['type'] == 'file' and (not (app/p).is_file() or sha(app/p) != r['sha256'])]
        inventory = f'{len(rows)} entries, {len(drift)} differ' + (f' (first: {drift[:3]})' if drift else '')
    print(json.dumps({'pins': checked, 'missing': len(missing), 'changed': len(changed), 'inventory': inventory}, indent=1))
    for label, items in (('missing', missing), ('changed', changed)):
        for item in items[:10]:
            print(label, item)
    return 1 if missing or changed or not latest or 'differ (' in inventory else 0


if __name__ == '__main__':
    sys.exit(main())
