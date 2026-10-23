#!/usr/bin/env python3
"""Static exact-source mapping only; never applies, compiles or runs native code."""
import hashlib,json
from pathlib import Path
here=Path(__file__).resolve().parent
repo=here.parents[3]
manifest=json.loads((here/'mapping.json').read_text())
for item in manifest['files']:
    source=repo/item['preparedSource']
    assert hashlib.sha256(source.read_bytes()).hexdigest()==item['sha256'],source
    if item['origin']:
        assert source.read_bytes()==(repo/item['origin']).read_bytes(),item['origin']
gn=(here/'source/chrome/browser/aux/legacy_inbox_fixture/BUILD.gn').read_text()
assert 'testonly = true' in gn
assert gn.count('"//base"')==gn.count('"//crypto"')==1
assert not manifest['shippingDependency']
print(f"{len(manifest['files'])} exact source mappings verified; optional target unbuilt")
