#!/usr/bin/env python3
"""Verify the exact current native inputs and narrow non-creating accessor."""
import hashlib
import json
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    pins = json.loads((HERE / 'inputs.json').read_text())
    native = Path(pins['nativeSourceRoot'])
    assert sha(Path(pins['parentManifest']).read_bytes()) == pins['parentManifestSha256']

    for item in pins['files']:
        before = (native / item['path']).read_bytes()
        after = (HERE / 'source' / item['path']).read_bytes()
        assert sha(before) == item['inputSha256'], item['path']
        assert before.decode().count(item['find']) == item['count']
        assert before.decode().replace(item['find'], item['replace']).encode() == after
        assert sha(after) == item['outputSha256']

    assert sha((HERE / 'followup.patch').read_bytes()) == pins['patchSha256']
    implementation = (HERE / 'source/chrome/browser/browser_process_impl.cc').read_text()
    body = re.search(
        r'ProfileManager\* BrowserProcessImpl::profile_manager_if_initialized\(\) \{(.*?)\n\}',
        implementation, re.S).group(1)
    assert body.strip() == (
        'DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);\n'
        '  return profile_manager_.get();')

    declaration = (HERE / 'source/chrome/browser/browser_process.h').read_text()
    assert ('virtual ProfileManager* profile_manager_if_initialized() { return nullptr; }'
            in declaration)
    aggregate = (HERE / 'source/chrome/browser/ui/aux_owned_browser_quiesce.cc').read_text()
    assert 'g_browser_process->profile_manager()' not in aggregate
    assert aggregate.count('g_browser_process->profile_manager_if_initialized()') == 1
    print('PASS: four exact current-input edits; real accessor is sequence-checked '
          'get-only; conservative default; aggregate has no lazy manager call')


if __name__ == '__main__':
    main()
