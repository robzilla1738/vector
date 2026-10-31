#!/usr/bin/env python3
"""Rebase the Aux Chromium tree onto a new Chromium stable tag, in a fresh separate checkout.

  chromium-rebase.py <fresh-src> <tag>            fetch <tag> and the current base, check out <tag>
                                                  (detached), apply chromium/tree/aux.patch with
                                                  git apply --3way, extract added.tar.gz, and report
                                                  conflicts by area; then print the next steps
  chromium-rebase.py <src> <tag> --dry-run        only check applicability: replay the patch onto <tag>
                                                  in a temporary index (adds loose objects only;
                                                  HEAD, index and working files are untouched)

Options: --tree <dir> (default chromium/tree). Exit status 1 when anything conflicts.
Never runs against the durable checkout or AUX_CHROMIUM_SRC. See docs/source/chromium-updates.md.
"""
import argparse, importlib.util, json, os, re, subprocess, sys, tempfile, tarfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))
import aux_chromium  # noqa: E402

spec = importlib.util.spec_from_file_location('chromium_tree', SCRIPTS/'chromium-tree.py')
tree = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tree)

AREAS = ('aux-owned', 'branding', 'platform')
AUX_NAME = re.compile(r'(^|/)aux([_./-]|$)', re.IGNORECASE)
BRANDING_PREFIXES = ('chrome/app/theme/', 'chrome/app/resources/', 'chrome/browser/resources/', 'components/resources/',
                     'chrome/installer/mac/', 'build/mac/')
BRANDING_FILES = ('BRANDING', 'Info.plist', 'chromium_strings.grd', 'generated_resources.grd', 'components_chromium_strings.grd')
BRANDING_SUFFIXES = ('.grd', '.grdp', '.xtb', '.png', '.icns', '.ico', '.svg', '.icon')


def git(src, *args, env=None, check=True):
    return subprocess.run(['git', '-C', str(src), *args], capture_output=True, text=True, env=env, check=check)


def refuse_protected(src):
    """The durable checkout holds owner work: a rebase only ever touches a separate checkout."""
    src = src.resolve()
    for protected in {aux_chromium.DURABLE_SRC, aux_chromium.LEGACY_TMP_SRC, aux_chromium.chromium_src()}:
        protected = Path(protected).resolve()
        if src == protected or protected.is_relative_to(src) or src.is_relative_to(protected):
            raise SystemExit(f'Refusing {src}: it is or overlaps the protected checkout {protected}. Use a fresh separate checkout.')


def area(path, aux_owned):
    """Aux-owned sources (new files, aux-named paths), branding edits, or edits to upstream platform code."""
    name = path.rsplit('/', 1)[-1]
    if path in aux_owned or AUX_NAME.search(path):
        return 'aux-owned'
    if path.startswith(BRANDING_PREFIXES) or name in BRANDING_FILES or name.endswith(BRANDING_SUFFIXES):
        return 'branding'
    return 'platform'


def patch_entries(patch):
    """Paths in aux.patch, and the ones it creates."""
    paths, created, current = set(), set(), None
    for line in patch.splitlines():
        if line.startswith('diff --git '):
            current = line.split(' b/', 1)[1]
            paths.add(current)
        elif line.startswith('new file mode') and current:
            created.add(current)
    return paths, created


def failures(stderr):
    """Paths git apply could not apply at all (as opposed to applying with conflicts)."""
    pattern = re.compile(r'^error: (.+?): (patch does not apply|does not exist in index|already exists in (?:index|working directory)|does not match index)$')
    return {match.group(1) for match in map(pattern.match, stderr.splitlines()) if match}


def group(entries, aux_owned):
    report = {name: [] for name in AREAS}
    for path, kind in sorted(entries):
        report[area(path, aux_owned)].append({'path': path, 'kind': kind})
    return report


def existing(src, rev, paths):
    """Which of these paths already exist in rev (upstream added a file Aux also adds)."""
    if not paths:
        return set()
    query = ''.join(f'{rev}:{path}\n' for path in paths)
    done = subprocess.run(['git', '-C', str(src), 'cat-file', '--batch-check'], input=query, capture_output=True, text=True, check=True)
    return {path for path, line in zip(paths, done.stdout.splitlines()) if not line.endswith(' missing')}


def fetch(src, tag, base):
    # A plain fetch into a --no-history checkout would walk the tag's whole history.
    shallow = git(src, 'rev-parse', '--is-shallow-repository').stdout.strip() == 'true'
    depth = ['--depth=1'] if shallow else []
    git(src, 'fetch', '--no-tags', *depth, 'origin', f'+refs/tags/{tag}:refs/tags/{tag}')
    # 3-way merges need the base's preimage blobs.
    if git(src, 'cat-file', '-e', f'{base}^{{commit}}', check=False).returncode:
        git(src, 'fetch', '--no-tags', *depth, 'origin', base)


def apply_patch(src, patch, *options, env=None):
    """git apply --3way, setting aside paths it cannot apply: one such path otherwise aborts the whole patch."""
    failed = set()
    while True:
        done = git(src, 'apply', *options, '--3way', '--binary', *(f'--exclude={path}' for path in sorted(failed)), str(patch), env=env, check=False)
        stuck = failures(done.stderr) - failed
        if not stuck:
            return done, failed
        failed |= stuck


def rebase(src, tag, tree_dir, dry_run=False):
    refuse_protected(src)
    manifest = json.loads((tree_dir/'manifest.json').read_text())
    patch = tree_dir/'aux.patch'
    patched, created = patch_entries(patch.read_text(errors='replace'))
    with tarfile.open(tree_dir/'added.tar.gz') as archive:
        added = sorted(m.name for m in archive.getmembers())
    aux_owned = created | set(added)
    rev = f'refs/tags/{tag}'
    if git(src, 'rev-parse', '--verify', '--quiet', f'{rev}^{{commit}}', check=False).returncode:
        if dry_run:
            raise SystemExit(f'{tag} is not in {src}; fetch it first or run without --dry-run')
        fetch(src, tag, manifest['base'])
    collisions = existing(src, rev, added)
    if dry_run:
        with tempfile.TemporaryDirectory() as scratch:
            env = {**os.environ, 'GIT_INDEX_FILE': str(Path(scratch)/'index')}
            git(src, 'read-tree', rev, env=env)
            done, failed = apply_patch(src, patch, '--cached', env=env)
            unmerged = {line.split('\t', 1)[1] for line in git(src, 'ls-files', '-u', env=env).stdout.splitlines()}
    else:
        if git(src, 'status', '--porcelain', '--untracked-files=no').stdout.strip():
            raise SystemExit('The fresh checkout has local changes; start from a clean one')
        git(src, 'checkout', '--quiet', '--detach', rev)
        done, failed = apply_patch(src, patch)
        unmerged = set(git(src, 'diff', '--name-only', '--diff-filter=U').stdout.split('\n')) - {''}
        tree.extract(tree_dir/'added.tar.gz', src, skip=collisions)
    entries = [(p, 'conflict') for p in unmerged] + [(p, 'failed') for p in failed] + [(p, 'exists upstream') for p in collisions]
    return {'tag': tag, 'checkout': str(src), 'dryRun': dry_run, 'base': manifest['base'],
            'patched': len(patched), 'added': len(added), 'applied': not failed,
            'conflicts': group(entries, aux_owned), 'gitApply': done.stderr.strip().splitlines()[-20:]}


NEXT = '''
Next steps (docs/source/chromium-updates.md):
 1. Resolve conflicts in {src}: Aux-owned sources first, then branding, then platform edits. If the patch
    listed a path as failed, upstream removed or moved it: port that part of aux.patch by hand.
 2. Sync dependencies: (cd {src} && gclient sync -D --with_branch_heads --with_tags), depot_tools from
    /Users/rcourson/Documents/Vibe/aux-chromium-durable/depot_tools.
 3. Update every pinned version: chromium/version.txt, base.json (via export), and the Framework
    Versions/<version> paths in scripts/ (git grep -l 155.0.8059.85 -- scripts vendor chromium).
 4. Build: python3 scripts/native-build.py autoninja -C {src}/out/AuxFast chrome
    (gn args from chromium/flags.aux.gn; one native build at a time).
 5. Re-export: python3 scripts/chromium-tree.py export {src} chromium/tree --new-base, and record its
    manifestSha256 in the build receipt.
 6. Reseal: the new Framework lives under a new Versions/ folder, outside the same-scope executor's
    approved targets, so it needs a new signing review (or the Developer ID release signing). Then
    set chromiumTreeManifestSha256 in current-source-selection.json and run verify-candidate.py.
 7. Focused checks: pnpm test, startup/quit/abort-relaunch, split restore, palette, sign-in, and the
    Sparkle update from the previous build with the daemon running.
 8. Ship as a Sparkle update only after Robert approves publishing it.
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('src', type=Path)
    parser.add_argument('tag')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--tree', type=Path, default=SCRIPTS.parent/'chromium/tree')
    args = parser.parse_args()
    report = rebase(args.src.resolve(), args.tag, args.tree.resolve(), args.dry_run)
    print(json.dumps(report, indent=1))
    if not args.dry_run:
        print(NEXT.format(src=args.src.resolve()))
    return 1 if any(report['conflicts'].values()) or not report['applied'] else 0


if __name__ == '__main__':
    sys.exit(main())
