from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
repo = root.parents[3]
evidence = json.loads((root / 'evidence.json').read_text())
for item in evidence['historicalInputs']:
    assert hashlib.sha256(Path(item['path']).read_bytes()).hexdigest() == item['sha256']
for item in evidence['existingSourcePins']:
    assert hashlib.sha256((repo / item['path']).read_bytes()).hexdigest() == item['sha256']
assert evidence['nativeModified'] is False
assert not (root / 'native.patch').exists()
print('PASS: historical image/AX hashes and existing native source pins; bounded inference, no native patch or runtime claim.')
