"""Pin four replacements in the actual daemon source context; do not link/run."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
inputs = json.loads((HERE / 'inputs.json').read_text())
plan = json.loads((HERE / 'source-plan.json').read_text())
receipt = json.loads((HERE / 'actual-typecheck-a3.json').read_text())
assert receipt['passed'] and receipt['sourcePlanSha256'] == sha(HERE / 'source-plan.json')
assert receipt['commandSha256'] == sha(HERE / 'typecheck-command.json')
assert sha(inputs['predecessorManifest']) == inputs['predecessorManifestSha256']
replacements = {row['path']: row for row in plan['files']}
sources = []
for row in inputs['sourceFiles']:
    assert sha(row['path']) == row['sha256']
    replacement = replacements.get(row['path'])
    if replacement:
        assert replacement['inputSha256'] == row['sha256']
        assert sha(replacement['output']) == replacement['outputSha256']
    sources.append({'predecessor': row['path'], 'predecessorSha256': row['sha256'],
                    'path': replacement['output'] if replacement else row['path'],
                    'sha256': replacement['outputSha256'] if replacement else row['sha256'],
                    'changed': replacement is not None})
assert len(sources) == 48 and sum(row['changed'] for row in sources) == 4
result = {'format': 'aux.ui-native-capture-journal.daemon-source-composition.v1',
          'predecessorManifest': inputs['predecessorManifest'],
          'predecessorManifestSha256': inputs['predecessorManifestSha256'],
          'sourcePlanSha256': sha(HERE / 'source-plan.json'),
          'typecheckReceiptSha256': sha(HERE / 'actual-typecheck-a3.json'),
          'sources': sources, 'sourceAssociationPassed': True,
          'sourceCount': 48, 'changedSourceCount': 4,
          'linked': False, 'packageIntegrated': False, 'nativeApiExecuted': False,
          'filesystemFixtureExecuted': False, 'migrationActivationAuthorized': False,
          'runtimeAcceptance': False}
(HERE / 'daemon-source-composition.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'sourceAssociationPassed': True, 'sourceCount': 48, 'changedSourceCount': 4, 'linked': False}))
