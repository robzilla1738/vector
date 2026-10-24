#!/usr/bin/env python3
"""Literal/source graph checks only. Never generates GN or invokes native tools."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
sha = lambda value: hashlib.sha256(value).hexdigest()
m = json.loads((root / 'manifest.json').read_text())
changes = json.loads((root / 'replacements.json').read_text())
assert sha((root / 'replacements.json').read_bytes()) == m['replacementsSha256']
assert sha((root / 'change.patch').read_bytes()) == m['patchSha256']
assert len(changes) == m['countedAdaptations'] == 7
for row in m['files']:
    before = (root / 'baseline' / row['path']).read_bytes()
    after = (root / 'source' / row['path']).read_bytes()
    assert sha(before) == row['beforeSha256']
    assert sha(after) == row['afterSha256']
    text = before.decode()
    for edit in changes:
        if edit['path'] == row['path']:
            assert text.count(edit['old']) == edit['count'] == 1
            text = text.replace(edit['old'], edit['new'], 1)
    assert text.encode() == after
for row in m['newFiles']:
    assert sha((root / 'source' / row['path']).read_bytes()) == row['sha256']
for row in m['sourceInputs'] + m['graphEvidence']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256'], row['path']
base = (root / 'source/base/BUILD.gn').read_text()
engine = base.split('source_set("aux_browser_descendant_engine") {', 1)[1].split('\n  }', 1)[0]
assert '"//chrome:chrome_app_executable"' in engine
assert '"//chrome:chrome_app"' in engine
assert 'configs -= [ "//build/config/compiler:no_exceptions" ]' in engine
assert 'configs += [ "//build/config/compiler:exceptions" ]' in engine
assert 'deps = [ ":aux_browser_descendant_client" ]' in engine
client = base.split('source_set("aux_browser_descendant_client") {', 1)[1].split('\n  }', 1)[0]
assert '.cc"' not in client and 'deps' not in client
chrome_before = (root / 'baseline/chrome/BUILD.gn').read_text()
chrome = (root / 'source/chrome/BUILD.gn').read_text()
# Every change is inside the primary app/verifier span; helper registration and
# framework registrations remain byte-identical on both sides of that span.
start = '  mac_app_bundle("chrome_app") {'
end = '  compiled_action("chrome_app_strings") {'
assert chrome.split(start, 1)[0] == chrome_before.split(start, 1)[0]
assert chrome.split(end, 1)[1] == chrome_before.split(end, 1)[1]
assert chrome.count('"AUX_BROWSER_DESCENDANT_CUSTODY"') == 1
assert chrome.count('"//base:aux_browser_descendant_engine"') == 1
assert 'ldflags += [ "-Wl,-rpath,@executable_path/../Frameworks" ]' in chrome
result = {'literalReplayPassed': True, 'countedAdaptations': 7,
          'primaryOnlyRegistrationSourceCheck': True,
          'compiled': False, 'gnGenerated': False, 'runtimeAccepted': False}
print(json.dumps(result, indent=2))
