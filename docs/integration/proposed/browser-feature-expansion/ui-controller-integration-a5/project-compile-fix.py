"""Project the five actual compiler corrections; keep failed inputs immutable."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
FOLDER = HERE.parents[1] / 'standard-profile-isolation/ui-controller-compile-fix-a1'
OUT = ROOT.parent / 'ui-controller-compile-fix-20261024-a1'
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((FOLDER / 'source-plan.json').read_text())
composition = json.loads((HERE / 'source-composition.json').read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'], name
for row in plan['files']:
    name = row['path']
    source = FOLDER / 'source' / name
    assert sha(ROOT / name) == row['inputSha256'] and sha(source) == row['outputSha256']
    backup = OUT / 'before' / name
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / name, backup)
    shutil.copy2(source, ROOT / name)
    assert sha(ROOT / name) == row['outputSha256']
    composition['selectedFiles'][name] = {'path': str(source), 'sha256': row['outputSha256'],
                                        'inputSha256': row['inputSha256'], 'changed': True}
composition['compilerFixPlanSha256'] = sha(FOLDER / 'source-plan.json')
(HERE / 'source-composition-a2.json').write_text(json.dumps(composition, indent=2) + '\n')
(HERE / 'actual-compile-fix-projection-a1.json').write_text(json.dumps({
    'passed': True, 'planSha256': composition['compilerFixPlanSha256'], 'sourceBeforeImages': str(OUT / 'before'),
    'newCompositionSha256': sha(HERE / 'source-composition-a2.json'), 'productExecuted': False}, indent=2) + '\n')
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile-canonical-a3.py')]))
