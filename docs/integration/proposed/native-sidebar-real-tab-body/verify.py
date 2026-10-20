#!/usr/bin/env python3
import hashlib
import json
import re
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((ROOT / 'source-evidence.json').read_text())
for entry in evidence['sourcePins']:
    assert sha(Path(entry['path']).read_bytes()) == entry['sha256'], entry['path']
assert sha(Path(evidence['original']['path']).read_bytes()) == evidence['original']['sha256']
assert 'bl\t0x7fb6840' in (ROOT / 'original-body-mount.asm').read_text()
assert 'bl\t0x7fb4934' in (ROOT / 'original-strip-constructor.asm').read_text()
manifest = json.loads((ROOT / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-real-sidebar-body-') as temporary:
    stage = Path(temporary)
    for entry in manifest['files']:
        data = (ROOT / 'baseline' / entry['path']).read_bytes()
        assert sha(data) == entry['baselineSha256']
        target = stage / entry['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    subprocess.run(['git', 'init', '-q', str(stage)], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', '--check', str(ROOT / 'native.patch')], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', str(ROOT / 'native.patch')], check=True)
    for entry in manifest['files']:
        output = (stage / entry['path']).read_bytes()
        assert sha(output) == entry['outputSha256']
        assert output == (ROOT / 'port' / entry['path']).read_bytes()
    frame = stage / 'chrome/browser/ui/views/frame'
    region = (frame / 'vertical_tab_strip_region_view.cc').read_text()
    header = (frame / 'vertical_tab_strip_region_view.h').read_text()
    assert not re.search(r'\baux_sidebar_\b', region + header)
    assert 'RebindAuxProfileSwitch()' not in region
    assert 'pinned_tab_entries_->PauseForProfileSwitch();' in region
    assert 'pinned_tab_entries_->RebindAfterProfileSwitch();' in region
    assert 'CloseAuxProfileMenu(browser_view()->browser());' in region
    provider = (stage / 'chrome/browser/ui/browser_window/internal/browser_window_features_aux_profile_switch.cc').read_text()
    assert 'plan->vertical->RebindAuxProfileSwitch' not in provider
    assert provider.count('plan->vertical->EndAuxProfileSwitch') == 2
print('PASS: five pinned outputs, supplied native body mount, real pin/menu lifecycle and removed independent body phase; source-only')
