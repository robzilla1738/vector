"""Correct two exact placeholders and generate the complete paired Mojo headers."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-backend-lease-integration-20261024-a7b'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()

OUT.mkdir(mode=0o700)
previous = HERE / 'source-composition.json'
composition = json.loads(previous.read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(row['path']) == row['sha256'] == sha(ROOT / name), name
proposal = HERE.parents[1] / 'standard-profile-isolation/native-dom-placeholder-fix-a7b'
plan = proposal / 'source-plan.json'
for row in json.loads(plan.read_text())['files']:
    name = row['path']
    source = proposal / 'source' / name
    target = ROOT / name
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
    composition['selectedFiles'][name] = {
        'path': str(source), 'sha256': row['outputSha256'],
        'inputSha256': row['inputSha256'], 'changed': True}
composition.update(previousComposition=str(previous), previousCompositionSha256=sha(previous),
                   correctionPlanSha256=sha(plan))
(HERE / 'source-composition-a2.json').write_text(json.dumps(composition, indent=2) + '\n')
headers = ['gen/components/services/storage/public/mojom/' + name + '.mojom' + suffix
           for name in ['local_storage_control', 'session_storage_control']
           for suffix in ['.h', '-shared.h', '-shared-internal.h']]
command = [str(ROOT / 'third_party/ninja/ninja'), '-C', str(ROOT / 'out/AuxFast'), '-j4', *headers]
result = subprocess.run(command, capture_output=True)
(OUT / 'generation.stdout').write_bytes(result.stdout)
(OUT / 'generation.stderr').write_bytes(result.stderr)
receipt = {'passed': not result.returncode, 'exitCode': result.returncode, 'command': command,
           'headers': {name: sha(ROOT / 'out/AuxFast' / name) for name in headers}
                      if not result.returncode else {},
           'productExecuted': False, 'fullBrowserBuilt': False}
(HERE / 'actual-generation-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
if result.returncode:
    print(result.stderr.decode(errors='replace')[-4000:])
    raise SystemExit(result.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile-a2.py')]))
