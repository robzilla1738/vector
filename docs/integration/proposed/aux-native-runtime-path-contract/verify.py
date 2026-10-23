#!/usr/bin/env python3
"""Read pinned static code only; never load the daemon or runtime executables."""
import argparse
import hashlib
import json
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent


def digest(value):
    return hashlib.sha256(value).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, default=HERE.parents[3])
    root = parser.parse_args().source_root
    contract = json.loads((HERE / 'contract.json').read_text())
    for relative, expected in contract['inputs'].items():
        if digest((root / relative).read_bytes()) != expected:
            raise SystemExit('Changed static source: ' + relative)
    original = (root / 'out/provided-source-audit/daemon-original.mjs').read_text()
    staged = (root / 'out/provided-reuse-aux-recovery-utilities/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs').read_text()
    for span in contract['spans']:
        original_start = original.index(span['start'])
        original_end = original.index(span['end'], original_start)
        staged_start = staged.index(span['start'])
        staged_end = staged.index(span['end'], staged_start)
        before, after = original[original_start:original_end], staged[staged_start:staged_end]
        assert digest(before.encode()) == span['originalSha256']
        assert digest(after.encode()) == span['stagedSha256']
        assert before.replace('ASIDE_', 'AUX_').replace('Aside', 'Aux') == after
    assert original.count('prepareSessionSpawn(') == contract['prepareSessionSpawnOccurrences'] == 4
    assignments = re.findall(r'process\.env\.PATH\s*(?:=(?!=)|\?\?=|\|\|=|&&=)', staged)
    assert len(assignments) == contract['directProcessEnvPathAssignmentOccurrences'] == 0
    assert 'PATH:[path.join(ai,`bin`),process.env.PATH??``]' in staged
    assert 'path.resolve(Cn)!==path.resolve(di)' in staged
    assert 'ni=ti.state===`ready`' in staged
    print('PASS: three exact source-derived PATH contracts; no daemon/runtime/compiler executed')


if __name__ == '__main__':
    main()
