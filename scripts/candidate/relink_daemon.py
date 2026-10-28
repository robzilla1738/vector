#!/usr/bin/env python3
"""Rebuild the Aux Daemon executable with a changed AuxNativeDaemonMain.cc.

Reruns a recorded compile (compile.json: argv) and link (link.json: {cwd, argv}).
Only these change: the main source, the main.o and linked output paths (under
--out), and any link input named by --substitute OLD=NEW. Every other input
stays exactly as recorded. Use the link recipe of the executable currently in
the candidate, so earlier repairs carry forward. Writes the rewritten commands
and a receipt beside the outputs.

    relink_daemon.py --compile-recipe DIR --link-recipe DIR \
        --source AuxNativeDaemonMain.cc [--substitute OLD=NEW ...] --out DIR
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_one(argv: list[str], old: str, new: str) -> list[str]:
    if argv.count(old) != 1:
        raise ValueError(f'expected one {old} in the recorded command, found {argv.count(old)}')
    return [new if value == old else value for value in argv]


TMP = '/private/tmp/'
PRESERVED = Path(__file__).resolve().parents[2] / 'out/live-inputs/tmp-preserved'


def preserved(argv: list[str]) -> list[str]:
    """macOS purges /private/tmp, partly or fully; recorded inputs there use their preserved copies."""
    def one(value: str) -> str:
        # A Swift module cache records its own path; swiftc rebuilds it where it was.
        if TMP not in value or '/swift-cache' in value:
            return value
        head, tail = value.split(TMP, 1)
        copy = PRESERVED / tail
        return head + str(copy) if copy.exists() else value
    return [one(value) for value in argv]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--compile-recipe', type=Path, required=True)
    parser.add_argument('--link-recipe', type=Path, required=True)
    parser.add_argument('--substitute', action='append', default=[], help='OLD=NEW link input')
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    compile_argv = json.loads((args.compile_recipe / 'compile.json').read_text())
    link = json.loads((args.link_recipe / 'link.json').read_text())
    old_source = compile_argv[compile_argv.index('-c') + 1]
    old_object = next(value for value in link['argv'] if value.endswith('/main.o'))
    old_output = link['argv'][link['argv'].index('-o') + 1]
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    main_object, executable = out / 'main.o', out / Path(old_output).name
    compile_argv = replace_one(compile_argv, old_source, str(args.source.resolve()))
    compile_argv[compile_argv.index('-o') + 1] = str(main_object)
    if '-MF' in compile_argv:
        compile_argv[compile_argv.index('-MF') + 1] = str(out / 'main.d')
    link_argv = replace_one(replace_one(link['argv'], old_object, str(main_object)), old_output, str(executable))
    for pair in args.substitute:
        old, new = pair.split('=', 1)
        link_argv = replace_one(link_argv, old, str(Path(new).resolve()))
    compile_argv, link_argv = preserved(compile_argv), preserved(link_argv)
    (out / 'compile.json').write_text(json.dumps(compile_argv) + '\n')
    (out / 'link.json').write_text(json.dumps({'cwd': link['cwd'], 'argv': link_argv}) + '\n')
    for name, argv, cwd in (('compile', compile_argv, None), ('link', link_argv, link['cwd'])):
        result = subprocess.run(argv, cwd=cwd, capture_output=True, text=True)
        if result.returncode:
            print(f'{name} failed:\n{result.stderr[-4000:]}', file=sys.stderr)
            return 1
    receipt = {'format': 'aux.daemon-relink.v1', 'compileRecipe': str(args.compile_recipe.resolve()),
               'linkRecipe': str(args.link_recipe.resolve()), 'substitutions': args.substitute,
               'source': {'path': str(args.source.resolve()), 'sha256': sha256(args.source)},
               'executable': {'path': str(executable), 'sha256': sha256(executable)}}
    (out / 'receipt.json').write_text(json.dumps(receipt, indent=1) + '\n')
    print(executable)
    return 0


if __name__ == '__main__':
    sys.exit(main())
