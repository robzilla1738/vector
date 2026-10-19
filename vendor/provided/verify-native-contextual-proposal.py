#!/usr/bin/env python3
"""Replay contextual proposals in a disposable directory, never shared source."""
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

native = Path(sys.argv[1]).resolve()
proposals = Path(__file__).resolve().parents[2] / 'docs/integration/proposed'
sha = lambda data: hashlib.sha256(data).hexdigest()
with tempfile.TemporaryDirectory(prefix='aux-contextual-proposal-') as temporary:
    copy = Path(temporary)
    for name in ['omnibox-results', 'contextual-model', 'contextual-binding']:
        stem = 'native-provided-' + name
        manifest = json.loads((proposals / (stem + '.json')).read_text())
        for item in manifest['files']:
            relative = Path(item['path'])
            assert not relative.is_absolute() and '..' not in relative.parts
            target = copy / relative
            if not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes((native / relative).read_bytes())
            raw = target.read_bytes()
            assert sha(raw) == item['sourceSha256'], 'Source drift: ' + str(relative)
            text = raw.decode()
            for anchor in item['anchors']:
                assert text.count(anchor['find']) == anchor['count'], 'Count drift: ' + str(relative)
                text = text.replace(anchor['find'], anchor['replace'])
            assert sha(text.encode()) == item['outputSha256'], 'Anchor output drift'
        subprocess.run(['git', 'apply', str(proposals / (stem + '.patch'))], cwd=copy, check=True)
        for item in manifest['files']:
            assert sha((copy / item['path']).read_bytes()) == item['outputSha256']
        for item in manifest.get('newFiles', []):
            relative = Path(item['path'])
            assert not relative.is_absolute() and '..' not in relative.parts
            raw = (proposals / 'contextual-omnibox' / relative).read_bytes()
            assert sha(raw) == item['sha256'], 'New source drift: ' + str(relative)
            target = copy / relative
            assert not target.exists(), 'Unexpected existing source: ' + str(relative)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
    # The bridge must implement every current generated Page event, with exact
    # parameter types. This is schema-drift verification, not C++ compilation.
    generated = (native / 'out/AuxAside/gen/components/omnibox/browser/searchbox.mojom.h').read_text()
    start = generated.index('  virtual ~Page() = default;')
    generated = generated[start:generated.index('};', start)]
    interface = re.findall(r'virtual void (.*?) = 0;', generated, re.S)
    header = (copy / 'chrome/browser/extensions/api/aux_omnibox/provided_searchbox_page.h').read_text()
    declared = re.findall(r'void ([^;{}]*?) override;', header, re.S)
    normalize = lambda value: re.sub(r'\s+', '', value)
    assert {normalize(x) for x in interface} == {normalize(x) for x in declared}, 'Page schema drift'
    print(json.dumps({'proposals': ['omnibox-results', 'contextual-model', 'contextual-binding'],
                      'pageMethods': len(interface), 'newSources': 4,
                      'sharedSourceModified': False, 'compiled': False}))
