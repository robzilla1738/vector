from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'source-evidence.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
for item in manifest['ranges']:
    assert sha((root / 'evidence' / item['listing']).read_bytes()) == item['listingSha256']
for item in manifest['currentNativeExcerpts']:
    assert sha((root / 'evidence' / item['snapshot']).read_bytes()) == item['snapshotSha256']
assert manifest['nativeModified'] is False
assert not (root / 'native.patch').exists()
print('PASS: three supplied native range pins and actual155 excerpts; evidence only, no geometry change or runtime claim.')
