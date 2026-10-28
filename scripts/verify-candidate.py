#!/usr/bin/env python3
"""Check that the current candidate still matches its recorded repair chain.

Reads docs/integration/proposed/completion-20261026/integrator/current-source-selection.json:
every pinned {path, sha256} must exist with that hash, chromium/tree/manifest.json must
hash to its chromiumTreeManifestSha256 (so a stale tree export is caught), and the
candidate app's whole inventory (recomputed with the repair executor's own helper, so
added or removed files count) must equal the latest repair receipt's. Read-only.
"""
import hashlib, importlib.util, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SELECTION = ROOT/'docs/integration/proposed/completion-20261026/integrator/current-source-selection.json'
LEGACY = '/Users/rcourson/Documents/Vibe/web'  # pre-rename root in older receipts
REVIEW = ROOT/'docs/integration/proposed/completion-20261026/runtime/authority-review/signing-execution-review.json'
APP = ROOT/'out/provided-candidate-completion-20261026-a1/Aux.app'
TREE_MANIFEST = ROOT/'chromium/tree/manifest.json'


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


def local(path, root=ROOT):
    return Path(str(root) + path[len(LEGACY):] if path.startswith(LEGACY + '/') else path)


def verify(selection_path=SELECTION, app=APP, review=REVIEW, tree_manifest=TREE_MANIFEST, root=ROOT):
    selection = json.loads(Path(selection_path).read_text())
    missing, changed, checked = [], [], 0
    for path, digest in pins(selection):
        file = local(path, root)
        if not file.is_file():
            missing.append(path)
        elif sha(file) != digest:
            changed.append(path)
        checked += 1
    tree_ok = Path(tree_manifest).is_file() and sha(tree_manifest) == selection.get('chromiumTreeManifestSha256')
    receipts = (json.loads(local(p, root).read_text()) for p, _ in pins(selection)
                if p.endswith('/receipt.json') and local(p, root).is_file())
    latest = next((r for r in receipts if r.get('inventorySha256') == selection['signedInventorySha256']), None)
    inventory, matches = 'no receipt matches signedInventorySha256', False
    if latest:
        helper = local(json.loads(Path(review).read_text())['inventoryHelper']['path'], root)
        spec = importlib.util.spec_from_file_location('ordinary_repair_inventory', helper)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        actual = module.inventory(Path(app))
        recorded = {r['path']: r for r in latest['files']}
        current = {r['path']: r for r in actual}
        drift = sorted(path for path in recorded.keys() | current.keys() if recorded.get(path) != current.get(path))
        matches = not drift and module.digest(actual) == selection['signedInventorySha256']
        inventory = f'{len(current)} entries, {len(drift)} differ' + (f' (first: {drift[:3]})' if drift else '')
    return {'pins': checked, 'missing': missing, 'changed': changed,
            'chromiumTree': 'current' if tree_ok else 'stale: re-export chromium/tree or update the pin',
            'inventory': inventory, 'passed': matches and tree_ok and not missing and not changed}


def main():
    result = verify()
    print(json.dumps({'pins': result['pins'], 'missing': len(result['missing']), 'changed': len(result['changed']),
                      'chromiumTree': result['chromiumTree'], 'inventory': result['inventory']}, indent=1))
    for label in ('missing', 'changed'):
        for item in result[label][:10]:
            print(label, item)
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
