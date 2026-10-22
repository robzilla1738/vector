#!/usr/bin/env python3
"""Run only the five owned-child lifecycle cases; never launch the browser."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--composition', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
options = parser.parse_args()
raw = (options.composition / 'manifest.json').read_bytes()
composition = json.loads(raw)
native = Path(composition['sourceRoot']).resolve()
binary = native / 'out/AuxFast/daemon_lifecycle_tests'
output = options.output.resolve()
if output.exists() or binary.resolve() != binary or not binary.is_file():
    raise ValueError('Fresh receipt and regular built fixture required')
sha = lambda value: hashlib.sha256(value).hexdigest()
def file_sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()

binary_sha = file_sha(binary)
sources = {}
for name in ['daemon_supervisor.cc', 'daemon_supervisor.h',
             'daemon_supervisor_lifecycle_unittest.cc', 'BUILD.gn']:
    relative = 'chrome/browser/aux/' + name
    expected = next(item['outputSha256'] for item in composition['files']
                    if item['path'] == relative)
    actual = sha((native / relative).read_bytes())
    if actual != expected:
        raise ValueError('Fixture/production source changed: ' + relative)
    sources[relative] = actual
cases = ['NoOwnedProcessPostsNarrowTerminalResult',
         'QueuedLaunchCannotEnterAfterQuiesce',
         'AdmittedChildReplyDrainsBeforeAcknowledgement',
         'ReapedChildDoesNotInventExitZero',
         'FailedOwnershipDrainRetainsHandleAndFailure']
expected_names = {'DaemonSupervisorLifecycleTest.' + name for name in cases}
output.parent.mkdir(parents=True, exist_ok=True)
summary = output.with_suffix('.summary.json')
log = output.with_suffix('.log')
if summary.exists() or log.exists():
    raise ValueError('Fresh summary/log destinations required')
with tempfile.TemporaryDirectory(prefix='aux-native-lifecycle-proof-') as scratch:
    command = [str(binary), '--gtest_filter=DaemonSupervisorLifecycleTest.*',
               '--test-launcher-jobs=1', '--test-launcher-batch-limit=1',
               '--test-launcher-retry-limit=0',
               '--test-launcher-summary-output=' + str(summary)]
    result = subprocess.run(command, cwd=scratch,
                            env={'HOME': scratch, 'TMPDIR': scratch,
                                 'PATH': '/usr/bin:/bin'},
                            capture_output=True, text=True, timeout=90)
    log.write_text(result.stdout + result.stderr)
    print(result.stdout[-5000:] + result.stderr[-2000:])
    if result.returncode != 0:
        raise SystemExit('Native lifecycle fixture failed; see ' + str(log))
data = json.loads(summary.read_text())
iterations = data.get('per_iteration_data', [])
if len(iterations) != 1 or set(iterations[0]) != expected_names:
    raise ValueError('Expected exactly the five filtered lifecycle cases')
if any(len(attempts) != 1 or attempts[0].get('status') != 'SUCCESS'
       for attempts in iterations[0].values()):
    raise ValueError('Every lifecycle case must pass on its only attempt')
if file_sha(binary) != binary_sha or any(
        sha((native / name).read_bytes()) != value for name, value in sources.items()):
    raise ValueError('Fixture binary or production sources changed during execution')
record = {'version': 1, 'scope': 'owned-direct-daemon-only',
          'compositionSha256': sha(raw), 'sources': sources,
          'binary': str(binary), 'binarySha256': binary_sha,
          'exitCode': result.returncode, 'passedCases': sorted(expected_names),
          'summarySha256': sha(summary.read_bytes()), 'logSha256': sha(log.read_bytes()),
          'syntheticChildrenOnly': True, 'realDaemonContacted': False,
          'applicationLaunched': False, 'allWritersVerified': False,
          'nativeAuthorityMigrationAccepted': False, 'runtimeAcceptance': False}
with output.open('x') as stream:
    json.dump(record, stream, indent=2)
    stream.write('\n')
print(json.dumps({'receipt': str(output), 'passedCases': len(expected_names),
                  'scope': record['scope'], 'runtimeAcceptance': False}))
