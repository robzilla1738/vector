"""Apply the named-schema correction and paired real worker/frontend controller."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-ui-worker-integration-20261024-a6b'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
OUT.mkdir(mode=0o700)
previous = HERE / 'source-composition.json'
composition = json.loads(previous.read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
plans = []
for folder_name in ['ui-worker-schema-type-fix-a2', 'ui-worker-controller-integration-a1']:
    folder = HERE.parents[1] / 'standard-profile-isolation' / folder_name
    plan = folder / 'source-plan.json'
    plans.append({'path': str(plan), 'sha256': sha(plan)})
    for row in json.loads(plan.read_text())['files']:
        name, expected = row['path'], row['inputSha256']
        source, target = folder / 'source' / name, ROOT / name
        assert sha(target) == expected and sha(source) == row['outputSha256'], name
        text = target.read_text()
        for anchor in row['anchors']:
            assert text.count(anchor['find']) == anchor['count'], name
            text = text.replace(anchor['find'], anchor['replace'], anchor['count'])
        assert text.encode() == source.read_bytes(), name
        backup = OUT / 'before' / name
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, backup)
        shutil.copy2(source, target)
        composition['selectedFiles'][name] = {'path': str(source), 'sha256': row['outputSha256'],
            'inputSha256': expected, 'changed': True}
composition.update(previousComposition=str(previous), previousCompositionSha256=sha(previous),
                   successorPlans=plans)
composition['laneFiles'].append('chrome/browser/aux/ui_storage_migration_controller.cc')
(HERE / 'source-composition-a2.json').write_text(json.dumps(composition, indent=2) + '\n')
generation = json.loads((HERE / 'actual-native-generation-a1.json').read_text())
command = generation['results'][1]['command']
run = subprocess.run(command, cwd=ROOT, capture_output=True)
(OUT / 'generation.stdout').write_bytes(run.stdout)
(OUT / 'generation.stderr').write_bytes(run.stderr)
receipt = {'passed': not run.returncode, 'command': command, 'cwd': str(ROOT),
           'exitCode': run.returncode, 'sourceCompositionSha256': sha(HERE / 'source-composition-a2.json'),
           'previousGenerationFailure': str(HERE / 'actual-native-generation-a1.json'),
           'productExecuted': False, 'fullBrowserBuilt': False}
(HERE / 'actual-native-generation-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
if run.returncode:
    print((run.stdout + run.stderr).decode(errors='replace')[-5000:])
    raise SystemExit(run.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile-native-a2.py')]))
