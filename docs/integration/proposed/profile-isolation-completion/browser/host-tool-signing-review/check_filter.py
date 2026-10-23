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
