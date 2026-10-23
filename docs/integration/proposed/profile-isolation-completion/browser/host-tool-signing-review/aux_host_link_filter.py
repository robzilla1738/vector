"""Review-only exact-output linker filter; importing never executes a tool."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
BUILD_ROOT = pathlib.Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/out/AuxFast')
FLAG = '-Wl,-no_adhoc_codesign'

def normalize(value):
    path = pathlib.PurePosixPath(value)
    if path.is_absolute():
        path = path.relative_to(BUILD_ROOT)
    if '..' in path.parts:
        raise ValueError('output traversal refused')
    return str(path)

def inventories():
    host = {normalize(x['output']) for file in ['host-output-allowlist.json', 'host-proc-macro-allowlist.json'] for x in json.loads((ROOT / file).read_text())}
    product = {normalize(x) for x in json.loads((ROOT / 'excluded-product-outputs.json').read_text())}
    if host & product:
        raise ValueError('overlapping output classes')
    return host, product

def filter_arguments(argv, cwd):
    if pathlib.Path(cwd).resolve() != BUILD_ROOT:
        raise ValueError('unexpected linker working directory')
    if argv.count('-o') != 1:
        raise ValueError('one explicit output required')
    index = argv.index('-o')
    if index + 1 >= len(argv):
        raise ValueError('missing output')
    output = normalize(argv[index + 1])
    host, product = inventories()
    if output not in host | product:
        raise ValueError('unreviewed link output: ' + output)
    if argv.count(FLAG) != 1:
        raise ValueError('one unsigned baseline flag required')
    if any('adhoc_codesign' in arg and arg != FLAG for arg in argv):
        raise ValueError('conflicting signing flag')
    if output in product:
        return list(argv)
    return [arg for arg in argv if arg != FLAG]


def filter_rust_link_flags(output, flags, cwd):
    normalized = normalize(str(output))
    if not (normalized.startswith('clang_arm64_for_rust_host_build_tools/') and normalized.endswith('.dylib')):
        return list(flags)
    macros = {normalize(x['output']) for x in json.loads((ROOT / 'host-proc-macro-allowlist.json').read_text())}
    if normalized not in macros:
        raise ValueError('unreviewed host macro output')
    # Apply the identical output/cwd/flag checks before Rust expands link args.
    filtered = filter_arguments(['driver', *flags, '-o', str(output)], cwd)
    return filtered[1:-2]
