"""Use actual inherited ARC configuration, then generate and compile the batch."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-cli-storage-integration-20261024-a12b'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
OUT.mkdir(mode=0o700)
previous = HERE / 'source-composition.json'
composition = json.loads(previous.read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
folder = HERE.parents[1] / 'standard-profile-isolation/cli-native-gn-compile-fix-a2'
plan = folder / 'source-plan.json'
correction = json.loads(plan.read_text())
assert sha(correction['actualDefaultConfig']['path']) == correction['actualDefaultConfig']['sha256']
for row in correction['files']:
    name, source, target = row['path'], folder / 'source' / row['path'], ROOT / row['path']
    assert sha(target) == row['inputSha256'] and sha(source) == row['outputSha256']
    data = target.read_text()
    for anchor in row['anchors']:
        assert data.count(anchor['find']) == anchor['count']
        data = data.replace(anchor['find'], anchor['replace'], anchor['count'])
    assert data.encode() == source.read_bytes()
    backup = OUT / 'before' / name
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(target, backup)
    shutil.copy2(source, target)
    composition['selectedFiles'][name] = {'path': str(source), 'sha256': row['outputSha256'],
        'inputSha256': row['inputSha256'], 'changed': True}
composition.update(previousComposition=str(previous), previousCompositionSha256=sha(previous),
                   correctionPlanSha256=sha(plan))
(HERE / 'source-composition-a2.json').write_text(json.dumps(composition, indent=2) + '\n')
command = [str(ROOT / 'buildtools/mac/gn'), 'gen', str(ROOT / 'out/AuxFast')]
run = subprocess.run(command, cwd=ROOT, capture_output=True)
(OUT / 'generation.stdout').write_bytes(run.stdout)
(OUT / 'generation.stderr').write_bytes(run.stderr)
receipt = {'passed': not run.returncode, 'command': command, 'cwd': str(ROOT),
           'exitCode': run.returncode, 'sourceCompositionSha256': sha(HERE / 'source-composition-a2.json'),
           'productExecuted': False, 'fullBrowserBuilt': False}
(HERE / 'actual-native-generation-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
if run.returncode:
    print((run.stdout + run.stderr).decode(errors='replace')[-5000:])
    raise SystemExit(run.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile-a2.py')]))
