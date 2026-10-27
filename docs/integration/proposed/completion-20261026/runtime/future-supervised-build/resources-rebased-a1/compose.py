#!/usr/bin/env python3
"""Carry every rule the shipping candidate gained onto the frozen REPL cohort's daemon leaves."""
import ast, hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[7]
CMP = ROOT/'docs/integration/proposed/completion-20261026'
SOURCE = ROOT/'out/live-inputs/tmp-preserved/aux-future-final-resources-20261026-b1'
OUT = ROOT/'out/live-inputs/completion-20261026/future-resources-rebased-a1'
sha = lambda data: hashlib.sha256(data).hexdigest()
def lane(name):
    for node in ast.parse((CMP/f'desktop/{name}/prepare.py').read_text()).body:
        if isinstance(node, ast.Assign) and getattr(node.targets[0], 'id', '') == 'EDITS':
            return [{'find': a, 'replace': b, 'count': 1} for a, b in ast.literal_eval(node.value)]
    raise SystemExit('No EDITS in ' + name)
RULES = [('final-polish-a1', json.loads((CMP/'integration/ordinary-chat/final-polish-a1/rules.json').read_text())['daemon']),
         ('brand-sweep-a1', json.loads((CMP/'integration/ordinary-chat/brand-sweep-a1/rules.json').read_text())['daemon']),
         ('broker-shutdown-order-a1', lane('broker-shutdown-order-a1')),
         ('memory-close-settle-a1', lane('memory-close-settle-a1'))]
OUT.mkdir(parents=True, exist_ok=False)
receipt = {'format': 'aux.future-resources-rebase.v1', 'activated': False, 'rules': [n for n, _ in RULES], 'outputs': {}}
for name in ('index.mjs', 'aux-native-entry.mjs'):
    data = (SOURCE/name).read_bytes(); text = data.decode()
    for label, rules in RULES:
        for rule in rules:
            if text.count(rule['find']) != rule.get('count', 1):
                raise SystemExit(f'{name}: {label} rule drift: {rule["find"][:60]}')
            text = text.replace(rule['find'], rule['replace'])
    out = text.encode(); (OUT/name).write_bytes(out)
    receipt['outputs'][name] = {'inputSha256': sha(data), 'sha256': sha(out)}
(OUT/'receipt.json').write_text(json.dumps(receipt, indent=1)+'\n')
print(json.dumps(receipt['outputs']))
