"""Make the complete pinned host successor replayable with unique-context anchors."""
from pathlib import Path
import hashlib
import json
from counted_projection import counted_anchors

HERE = Path(__file__).resolve().parent
HOST = HERE.parent / 'runtime/native-host'
original_plan = HOST / 'changes.json'
plan = json.loads(original_plan.read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
files = []
for row in plan['files']:
    output = (HOST / 'source' / row['path']).read_bytes()
    if sha(output) != row['after']:
        raise ValueError('Pinned host successor changed: ' + row['path'])
    anchors = []
    if row['before'] is not None:
        baseline = HOST / 'baseline' / row['path']
        original = (baseline if baseline.exists() else Path(row['input'])).read_bytes()
        if sha(original) != row['before']:
            raise ValueError('Pinned host predecessor changed: ' + row['path'])
        anchors = counted_anchors(original.decode(), output.decode())
    files.append(dict(path=row['path'], inputSha256=row['before'], outputSha256=row['after'],
                      input=row['input'], anchors=anchors))
result = dict(format='aux.native.counted-projection.v1', overlayRoot=str(HOST / 'source'),
              originalPlan=str(original_plan), originalPlanSha256=sha(original_plan.read_bytes()),
              completeExactReplay=True, sourceBehaviorChanged=False, nativeTreeChanged=False, files=files)
(HERE / 'native-host-counted.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'passed': True, 'files': len(files), 'uniqueCountedAnchors': sum(len(row['anchors']) for row in files)}))
