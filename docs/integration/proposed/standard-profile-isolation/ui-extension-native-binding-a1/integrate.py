"""Replay the registered predecessor series before registering the binding delta."""
import difflib
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path('/private/tmp/aux-ui-extension-binding-series-replay-20261024-a2')
sha = lambda data: hashlib.sha256(data).hexdigest()


def git(*args):
    return subprocess.run(['git', *map(str, args)], check=True, capture_output=True).stdout


assert (REPO / 'AGENTS.md').is_file()
base = git('-C', ROOT, 'rev-parse', 'HEAD').decode().strip()
assert base == '0e66b94549a8bd85f03fbdf189b752d6e7b63c32'
production = json.loads((HERE / 'source-plan.json').read_text())
tests = json.loads((HERE / 'test-source-plan-a2.json').read_text())
assert tests['productionPlanSha256'] == sha((HERE / 'source-plan.json').read_bytes())
overlay = Path(production['overlay'])
files = {row['path']: row for row in production['files'] + tests['files']}
assert len(files) == 13
series = REPO / 'chromium/patches/series'
before = series.read_bytes()
entry = 'aux/0107-aux-ui-extension-native-binding.patch'
canonical = series.parent / entry
assert entry.encode() not in before and not canonical.exists()
OUT.mkdir(mode=0o700)
tree = OUT / 'tree'
tree.mkdir()
originals = {}
prerequisites = []
for name, row in files.items():
    output = (overlay / name).read_bytes()
    assert sha(output) == row['outputSha256']
    if row['inputSha256'] is None:
        assert not (ROOT / name).exists()
        continue
    upstream = git('-C', ROOT, 'show', base + ':' + name)
    original = (ROOT / name).read_bytes()
    assert sha(original) == row.get('originalSha256', row['inputSha256']), name
    if original != upstream:
        # Preserve the existing startup registration; this delta is not ours.
        assert name == 'extensions/browser/BUILD.gn'
        anchor = b'    "service_worker/service_worker_keepalive.h",\n'
        assert upstream.count(anchor) == 1
        assert original == upstream.replace(anchor, anchor + b'    "service_worker/service_worker_start_admission.h",\n')
        header = ROOT / 'extensions/browser/service_worker/service_worker_start_admission.h'
        assert header.is_file()
        prerequisites.append({'path': name, 'upstreamSha256': sha(upstream),
                              'workingInputSha256': sha(original),
                              'requiredHeader': str(header), 'requiredHeaderSha256': sha(header.read_bytes()),
                              'registeredByThisPatch': False})
    originals[name] = original
    path = tree / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(original)
git('-C', tree, 'init', '-q')
git('-C', tree, 'add', '--all')
include = ['--include=' + name for name in files]
predecessors = []
for line in before.decode().splitlines():
    if not line.strip() or line.startswith('#'):
        continue
    path = series.parent / line
    affected = [row.split('\t', 2)[2] for row in git('apply', '--numstat', path).decode().splitlines()]
    overlap = sorted(set(affected).intersection(files))
    if not overlap:
        continue
    git('-C', tree, 'apply', '--check', *include, path)
    git('-C', tree, 'apply', *include, path)
    predecessors.append({'patch': line, 'sha256': sha(path.read_bytes()), 'paths': overlap})

patch = []
for name, row in sorted(files.items()):
    old = (tree / name).read_bytes() if (tree / name).exists() else None
    assert (sha(old) if old is not None else None) == row['inputSha256'], name
    new = (overlay / name).read_bytes()
    patch.append(f'diff --git a/{name} b/{name}\n')
    if old is None:
        patch.append('new file mode 100644\n')
    patch.extend(difflib.unified_diff((old or b'').decode().splitlines(True), new.decode().splitlines(True),
                                    fromfile='a/' + name if old is not None else '/dev/null', tofile='b/' + name))
candidate = OUT / 'candidate.patch'
candidate.write_text(''.join(patch))
git('-C', tree, 'apply', '--check', candidate)
git('-C', tree, 'apply', candidate)
for name, row in files.items():
    assert sha((tree / name).read_bytes()) == row['outputSha256']
for name, original in originals.items():
    assert (ROOT / name).read_bytes() == original
git('-C', tree, 'apply', '--reverse', '--check', candidate)
canonical.write_bytes(candidate.read_bytes())
series.write_bytes(before + (b'' if before.endswith(b'\n') else b'\n') + entry.encode() + b'\n')
receipt = {'format': 'aux.ui-extension-binding.series.actual.v1', 'passed': True,
           'base': base, 'output': str(OUT), 'patch': str(canonical),
           'patchSha256': sha(canonical.read_bytes()), 'seriesBeforeSha256': sha(before),
           'seriesAfterSha256': sha(series.read_bytes()), 'predecessorsReplayed': predecessors,
           'existingNativePrerequisites': prerequisites,
           'upstreamOnlyReplayClaimed': False,
           'sourcePlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
           'testSourcePlanSha256': sha((HERE / 'test-source-plan-a2.json').read_bytes()),
           'files': [{'path': name, 'inputSha256': row['inputSha256'], 'outputSha256': row['outputSha256']}
                     for name, row in sorted(files.items())],
           'exactReplayPassed': True, 'reverseCheckPassed': True,
           'nativeCheckoutChanged': False, 'unitFixtureRegistered': True,
           'fullBrowserBuilt': False, 'testsExecuted': False, 'productExecuted': False,
           'profileAuthorityIntegrated': False, 'runtimeAcceptance': False}
(HERE / 'actual-series-integration-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({key: value for key, value in receipt.items() if key != 'files'}))
