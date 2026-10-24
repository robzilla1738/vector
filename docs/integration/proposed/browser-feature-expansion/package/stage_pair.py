#!/usr/bin/env python3
"""Stage both current supplied profiles into new directories, without running apps."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
sys.dont_write_bytecode = True
import feature_package as f

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--source-snapshot', required=True, help='Existing pinned static source snapshot, never owner profile roots')
p.add_argument('--output', required=True, help='Fresh stage-pair parent directory')
p.add_argument('--final-app', required=True, help='Future fresh inactive output/Aux.app path')
p.add_argument('--node', required=True, help='Absolute existing Node executable; not a product executable')
a = p.parse_args()
output = Path(a.output).absolute()
final = Path(a.final_app).absolute()
f.require(not output.exists() and not final.exists(), 'Fresh stage/output app paths required')
f.require(final.name == 'Aux.app' and not final.resolve().is_relative_to(output.resolve()), 'Separate final Aux.app path required')
f.require(Path(a.node).is_absolute() and Path(a.node).is_file(), 'Explicit existing Node tool required')
snapshot = Path(a.source_snapshot).resolve()
f.require(snapshot.is_dir(), 'Existing pinned static source snapshot required')
output.mkdir(mode=0o700)
report = {'format':'aux.browser-features.stage-pair.v1', 'passed':False,
          'stager':f.reference(f.ROOT/'scripts/stage-provided.mjs'), 'sourceSnapshot':str(snapshot),
          'finalApp':str(final), 'productExecuted':False, 'commands':[]}
try:
    for profile in ['baseline','desktop-v1']:
        command = [a.node, str(f.ROOT/'scripts/stage-provided.mjs'), '--source-snapshot', str(snapshot),
                   '--output', str(output/profile), '--app-path', str(final), '--identity-profile', 'aux-v1',
                   '--state-identity-version', '2', '--feature-profile', profile]
        report['commands'].append(command)
        subprocess.run(command, cwd=f.ROOT, check=True)
        f.stage_inputs(output/profile, profile)
    f.resolve(report['stager'])
    report['stages'] = {profile:{'path':str(output/profile),
        'inventorySha256':f.legacy.digest(f.legacy.inventory(output/profile))} for profile in ['baseline','desktop-v1']}
    report['passed'] = True
except Exception as error:
    report['error'] = str(error)
    raise
finally:
    (output/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print('Staged exact current baseline and desktop-v1 resources; no product execution or package acceptance')
