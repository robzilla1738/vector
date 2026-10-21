import hashlib,json,subprocess,tempfile
from pathlib import Path
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-direct-plan-') as directory:
    temporary=Path(directory)
    subprocess.run(['git','apply','--check',str(root/'tooling.patch')],cwd=temporary,check=True)
    subprocess.run(['git','apply',str(root/'tooling.patch')],cwd=temporary,check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None
        assert hashlib.sha256((temporary/row['path']).read_bytes()).hexdigest()==row['outputSha256']
print('PASS: exact new-file proposal hashes and disposable patch replay; no launch or authority validation')
