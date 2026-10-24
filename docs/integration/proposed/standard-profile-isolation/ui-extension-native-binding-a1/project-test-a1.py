"""Register the focused decorator fixture in the existing extension unit target."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
plan = json.loads((HERE / 'source-plan.json').read_text())
overlay = Path(plan['overlay'])
sha = lambda value: hashlib.sha256(value).hexdigest()
name = 'extensions/browser/BUILD.gn'
original = (ROOT / name).read_bytes()
before = b'    "api/storage/settings_quota_unittest.cc",'
after = b'    "api/storage/aux_ui_migration_unittest.cc",\n' + before
assert original.count(before) == 1
output = original.replace(before, after)
(overlay / name).parent.mkdir(parents=True, exist_ok=True)
(overlay / name).write_bytes(output)
fixture = 'extensions/browser/api/storage/aux_ui_migration_unittest.cc'
code = (HERE / 'migration_unittest.cc').read_bytes()
(overlay / fixture).write_bytes(code)
result = {'format': 'aux.ui-extension-native-binding.tests.source.v1',
          'productionPlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
          'files': [{'path': name, 'inputSha256': sha(original), 'outputSha256': sha(output),
                     'anchors': [{'find': before.decode(), 'replace': after.decode(), 'count': 1}]},
                    {'path': fixture, 'inputSha256': None, 'outputSha256': sha(code)}]}
(HERE / 'test-source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
diff = list(difflib.unified_diff(original.decode().splitlines(True), output.decode().splitlines(True),
                               fromfile='a/' + name, tofile='b/' + name))
diff.extend(['diff --git a/' + fixture + ' b/' + fixture + '\n', 'new file mode 100644\n'])
diff.extend(difflib.unified_diff([], code.decode().splitlines(True), fromfile='/dev/null', tofile='b/' + fixture))
(HERE / 'tests.patch').write_text(''.join(diff))
print(json.dumps({'files': 2, 'fixtureRegistered': True, 'executed': False}))
