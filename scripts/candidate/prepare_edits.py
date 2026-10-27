#!/usr/bin/env python3
"""Copy sealed candidate leaves and apply exact, count-checked text edits.

Each edit must match its `find` exactly `count` times, and its `replace` must not
already be present, so an edit never silently applies to drifted or already
edited bytes. Output: the edited leaves, a preparation receipt with before and
after hashes, and the `--resource TARGET=SOURCE` arguments for freeze-plan.py.
Nothing in the candidate is modified.

    prepare_edits.py --app Aux.app --edits edits.json --out DIR
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

FORMAT = 'aux.candidate-edits.v1'


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def apply_edits(text: str, edits: list[dict]) -> str:
    for edit in edits:
        find, replace, count = edit['find'], edit['replace'], edit['count']
        found = text.count(find)
        if found != count:
            raise ValueError(f'expected {count} of {find[:80]!r}, found {found}')
        if replace and replace != find and replace in text and find not in replace:
            raise ValueError(f'replacement already present: {replace[:80]!r}')
        text = text.replace(find, replace)
    return text


def prepare(app: Path, spec: dict, out: Path) -> dict:
    if spec.get('format') != FORMAT:
        raise ValueError(f'edits file must have format {FORMAT}')
    out.mkdir(parents=True, exist_ok=False)
    files = []
    for leaf in spec['files']:
        target = leaf['target']
        source = app / target
        before = source.read_bytes()
        after = (leaf['content'] if 'content' in leaf else apply_edits(before.decode('utf-8'), leaf['edits'])).encode('utf-8')
        destination = out / Path(target).name
        if destination.exists():
            raise ValueError(f'two targets share the output name {destination.name}')
        destination.write_bytes(after)
        files.append({'target': target, 'path': str(destination), 'beforeSha256': sha256(before), 'sha256': sha256(after),
                      **({'replacedWhole': True} if 'content' in leaf else {'edits': leaf['edits']})})
    receipt = {'format': 'aux.candidate-edits.preparation.v1', 'app': str(app), 'purpose': spec.get('purpose', ''), 'files': files}
    (out / 'preparation-receipt.json').write_text(json.dumps(receipt, indent=1) + '\n')
    return receipt


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--app', type=Path, required=True)
    parser.add_argument('--edits', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    try:
        receipt = prepare(args.app.resolve(), json.loads(args.edits.read_text()), args.out.resolve())
    except (ValueError, OSError, KeyError) as error:
        print(f'prepare_edits: {error}', file=sys.stderr)
        return 1
    for file in receipt['files']:
        print(f"--resource={file['target']}={file['path']}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
