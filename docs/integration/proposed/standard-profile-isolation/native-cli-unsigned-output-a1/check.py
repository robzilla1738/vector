"""Check classification without running a linker or product."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/build/toolchain/apple')
spec = importlib.util.spec_from_file_location('aux_link_filter_review', ROOT / 'aux_host_link_filter.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
host, product = module.inventories()
assert len(host) == 68 and len(product) == 21
before_path = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/native-cohort-integration-20261024-a19/before/build/toolchain/apple/excluded-product-outputs.json')
before = json.loads(before_path.read_text())
assert len(before) == 20
assert {module.normalize(name) for name in before} | {'native_cli_open'} == product
for name in host:
    args = ['driver', module.FLAG, '-o', name]
    assert module.filter_arguments(args, module.BUILD_ROOT) == ['driver', '-o', name]
for name in product:
    args = ['driver', module.FLAG, '-o', name]
    assert module.filter_arguments(args, module.BUILD_ROOT) == args
try:
    module.filter_arguments(['driver', module.FLAG, '-o', 'unreviewed-product'], module.BUILD_ROOT)
except ValueError:
    pass
else:
    raise AssertionError('Unknown output accepted')
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
result = {'passed': True, 'productOutputs': 21, 'unchangedHostOutputs': 68,
    'newProductRemainsUnsigned': True, 'unknownOutputRefused': True,
    'filterLogicSha256': sha(ROOT / 'aux_host_link_filter.py'),
    'outputInventorySha256': sha(ROOT / 'excluded-product-outputs.json'),
    'nativeApiExecuted': False, 'productExecuted': False, 'signingPerformed': False}
(HERE / 'actual-static-check.json').write_text(json.dumps(result, indent=2) + '\n')
print('Exact classification passes: 68 host outputs unchanged; all 21 products retain the unsigned flag.')
