"""Pure argument checks. No compiler/linker/signing process is run."""
from aux_host_link_filter import filter_arguments, inventories, BUILD_ROOT, FLAG
host, product = inventories()
for output in host | product:
    args = ['linker_driver.py', '-Wcrl,driver,clang++', FLAG, '-o', output, '@input.rsp']
    expected = args if output in product else [x for x in args if x != FLAG]
    assert filter_arguments(args, BUILD_ROOT) == expected
    absolute = args.copy(); absolute[4] = str(BUILD_ROOT / output)
    assert filter_arguments(absolute, BUILD_ROOT) == (absolute if output in product else [x for x in absolute if x != FLAG])
for args, cwd in [(['driver', FLAG, '-o', 'unreviewed'], BUILD_ROOT), (['driver', FLAG, '-o', '../protoc'], BUILD_ROOT), (['driver', '-o', 'protoc'], BUILD_ROOT), (['driver', FLAG, '-o', 'protoc', '-o', 'Aux'], BUILD_ROOT), (['driver', FLAG, '-o', 'protoc'], '/tmp'), (['driver', FLAG, '-Wl,-adhoc_codesign', '-o', 'protoc'], BUILD_ROOT)]:
    try: filter_arguments(args, cwd)
    except ValueError: pass
    else: raise AssertionError('unsafe arguments accepted')
print(f'Pure filter checks passed: {len(host)} host, {len(product)} product, 6 refusal cases; no execution')

from aux_host_link_filter import filter_rust_link_flags
import json
from pathlib import Path
for entry in json.loads((Path(__file__).parent/'host-proc-macro-allowlist.json').read_text()):
    assert filter_rust_link_flags(entry['output'], ['--target=arm64-apple-macos', FLAG], BUILD_ROOT) == ['--target=arm64-apple-macos']
assert filter_rust_link_flags('obj/product.rlib', [FLAG], BUILD_ROOT) == [FLAG]
try: filter_rust_link_flags('clang_arm64_for_rust_host_build_tools/unknown.dylib', [FLAG], BUILD_ROOT)
except ValueError: pass
else: raise AssertionError('unapproved macro accepted')
print('All20macro default-linker routes passed; other outputs unchanged')
