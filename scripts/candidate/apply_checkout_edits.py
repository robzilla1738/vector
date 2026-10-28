#!/usr/bin/env python3
"""Apply count-checked text edits to the Chromium checkout, all or nothing.

An edits file is a JSON list (or {"edits": [...]}) of entries:

    {"path": "<checkout-relative>", "find": "<exact text>", "replace": "<text>", "count": N}
    {"path": "<checkout-relative>", "create": "<full file content>"}

Every edit is simulated in order first: `find` must occur exactly `count` times in
the file as left by the previous edits, `replace` must not already be present, and
a created file must not exist. Only when every edit passes are the files written.
`--check` stops after the simulation.

    apply_checkout_edits.py [--root SRC] [--check] EDITS.json [EDITS.json ...]
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from aux_chromium import chromium_src  # noqa: E402


class EditError(ValueError):
    pass


def load_edits(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding='utf-8'))
    edits = data['edits'] if isinstance(data, dict) else data
    if not isinstance(edits, list):
        raise EditError(f'{path}: expected a list of edits')
    return edits


def target(root: Path, rel: str) -> Path:
    if not rel or Path(rel).is_absolute() or '..' in Path(rel).parts:
        raise EditError(f'unsafe path {rel!r}')
    return root / rel


def plan(root: Path, edits: list[dict]) -> dict[Path, str]:
    """Returns the new content of every touched file, or raises EditError."""
    contents: dict[Path, str | None] = {}
    for i, edit in enumerate(edits):
        rel = edit.get('path', '')
        path = target(root, rel)
        where = f'edit {i} ({rel})'
        if path not in contents:
            contents[path] = path.read_bytes().decode('utf-8') if path.is_file() else None
        text = contents[path]
        if 'create' in edit:
            if text is not None:
                raise EditError(f'{where}: file already exists')
            contents[path] = edit['create']
            continue
        find, replace, count = edit['find'], edit['replace'], edit['count']
        if text is None:
            raise EditError(f'{where}: file does not exist')
        if not find or find == replace:
            raise EditError(f'{where}: empty or no-op find')
        found = text.count(find)
        if found != count:
            raise EditError(f'{where}: expected {count} of {find[:80]!r}, found {found}')
        if replace in text:
            raise EditError(f'{where}: replacement already present: {replace[:80]!r}')
        contents[path] = text.replace(find, replace)
    return {path: text for path, text in contents.items() if text is not None}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('edits', nargs='+', type=Path)
    parser.add_argument('--root', type=Path, default=None, help='checkout root (default: AUX_CHROMIUM_SRC or the durable checkout)')
    parser.add_argument('--check', action='store_true', help='verify every count, write nothing')
    args = parser.parse_args(argv)
    root = (args.root or chromium_src()).resolve()
    edits = [edit for path in args.edits for edit in load_edits(path)]
    try:
        result = plan(root, edits)
    except EditError as error:
        print(f'refused: {error}', file=sys.stderr)
        return 1
    if not args.check:
        for path, text in result.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(text.encode('utf-8'))
    print(f"{'verified' if args.check else 'applied'} {len(edits)} edits to {len(result)} files under {root}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
