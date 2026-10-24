"""Project the exact compiler corrections without regenerating unchanged APIs."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-ui-worker-integration-20261024-a6c'
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
OUT.mkdir(mode=0o700)
previous = HERE / 'source-composition-a2.json'
composition = json.loads(previous.read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
plans = []
for folder_name in ['ui-native-worker-compile-fix-a2', 'native-renderer-cache-compile-fix-a8b']:
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
                   compilerCorrectionPlans=plans)
(HERE / 'source-composition-a3.json').write_text(json.dumps(composition, indent=2) + '\n')
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile-native-a3.py')]))
