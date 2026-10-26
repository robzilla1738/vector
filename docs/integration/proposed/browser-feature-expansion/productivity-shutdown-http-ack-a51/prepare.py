#!/usr/bin/env python3
"""Close only the existing authenticated shutdown ACK's HTTP connection."""
import argparse
import hashlib
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PACKAGE = Path('/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development')
PINS = {'index.mjs': 'd945364420cdec5fd7f6b256af9dc6bb1c26cca605106f19d5856aca3e4572f7',
        'aux-native-entry.mjs': 'f9dddbe77bac7c637ae2fbe1cc37f1c18af9e44ce1f595ff643885df9d010238'}
BEFORE = 'ei.post(`/shutdown`,ei=>(Cn.requestShutdown?.(),ei.json({status:`shutting_down`})))'
AFTER = 'ei.post(`/shutdown`,ei=>(Cn.requestShutdown?.(),ei.header(`Connection`,`close`),ei.json({status:`shutting_down`})))'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    if args.output:
        output = args.output
        output.mkdir(parents=True, exist_ok=False)
    else:
        output = Path(tempfile.mkdtemp(prefix='aux-shutdown-http-ack-a51-', dir='/private/tmp'))
    rows = []
    for leaf, pin in PINS.items():
        source = PACKAGE / leaf
        original = source.read_bytes()
        assert sha(original) == pin, f'Input changed: {source}'
        before = original.decode()
        assert before.count(BEFORE) == 1, f'Anchor count changed: {leaf}'
        after = before.replace(BEFORE, AFTER, 1)
        assert after.count(AFTER) == 1
        assert after.replace(AFTER, BEFORE, 1) == before
        target = output / leaf
        target.write_text(after)
        rows.append({'input': str(source), 'inputSha256': pin, 'output': str(target),
                     'outputSha256': sha(after.encode()),
                     'anchors': [{'before': BEFORE, 'after': AFTER, 'count': 1}]})
    (HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.shutdown-http-ack.v1',
        'files': rows, 'authChanged': False, 'responseStatusBodyChanged': False,
        'timeoutsChanged': False, 'otherConnectionsTerminated': False,
        'productExecuted': False}, indent=2) + '\n')
    (HERE / 'checks.json').write_text(json.dumps({'exactInputHashes': True,
        'singleCountAnchorsPerLeaf': 1, 'forwardReplay': True, 'reverseReplay': True,
        'syntax': 'pending node --check only',
        'runtimeAcceptance': 'parent-owned actual HTTP close and normal Quit pending'}, indent=2) + '\n')
    print(json.dumps({'directory': str(output), 'files': [
        {key: row[key] for key in ('output', 'outputSha256')} for row in rows]}))


if __name__ == '__main__':
    main()
