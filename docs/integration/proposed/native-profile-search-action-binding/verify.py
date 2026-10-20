#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((ROOT / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-search-binding-') as temporary:
    stage = Path(temporary)
    for entry in manifest['files']:
        relative = entry['path']
        baseline = (ROOT / 'baseline' / relative).read_bytes()
        assert sha(baseline) == entry['baselineSha256']
        target = stage / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(baseline)
    subprocess.run(['git', 'init', '-q', str(stage)], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', '--check', str(ROOT / 'native.patch')], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', str(ROOT / 'native.patch')], check=True)
    for entry in manifest['files']:
        output = (stage / entry['path']).read_bytes()
        assert sha(output) == entry['outputSha256']
        assert output == (ROOT / 'port' / entry['path']).read_bytes()
        text = output.decode()
        assert text.index('GetAuxProfileSearchBrowser(sender)') < text.index('GetBrowserForTabContents(*sender)')
        assert text.index('sender->Close();') < text.index('browser->GetWindow()->Activate();')
        assert text.index('browser = browser_weak.get();') > text.index('sender->Close();')
        assert text.count('action->IsEnabled(contents)') == 2
        assert text.count('#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)') == 3
for source in json.loads((ROOT / 'source-evidence.json').read_text())['currentSources']:
    assert sha(Path(source['path']).read_bytes()) == source['sha256'], source['path']
print('PASS: exact replay, preserved caller boundary, positive search lookup and real close ordering; no native build/runtime execution')
