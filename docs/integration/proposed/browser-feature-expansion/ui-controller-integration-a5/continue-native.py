"""Continue after the preserved GN working-directory refusal, without reprojecting."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = ROOT.parent / 'native-ui-controller-integration-20261024-a5'
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
composition = json.loads((HERE / 'source-composition.json').read_text())
for name, row in composition['selectedFiles'].items():
    assert sha(ROOT / name) == row['sha256'] == sha(row['path']), name
command = [str(ROOT / 'buildtools/mac/gn'), 'gen', str(ROOT / 'out/AuxFast')]
run = subprocess.run(command, cwd=ROOT, capture_output=True)
(OUT / 'generated-a2.stdout').write_bytes(run.stdout)
(OUT / 'generated-a2.stderr').write_bytes(run.stderr)
receipt = {'passed': run.returncode == 0, 'command': command, 'cwd': str(ROOT),
           'exitCode': run.returncode, 'priorFailure': str(HERE / 'actual-generation-a1.json'),
           'sourceCompositionSha256': sha(HERE / 'source-composition.json'),
           'productExecuted': False, 'fullBrowserBuilt': False, 'coldFeatureEnabled': False}
(HERE / 'actual-generation-a2.json').write_text(json.dumps(receipt, indent=2) + '\n')
if run.returncode:
    print((run.stdout + run.stderr).decode(errors='replace')[-6000:])
    raise SystemExit(run.returncode)
raise SystemExit(subprocess.call([sys.executable, str(HERE / 'compile.py')]))
