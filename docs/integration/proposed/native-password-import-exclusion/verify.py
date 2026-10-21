#!/usr/bin/env python3
"""Bounded exact patch replay; not runtime/import acceptance."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
here=Path(__file__).resolve().parent
entries=json.loads((here/'files.json').read_text())['files']
with tempfile.TemporaryDirectory(prefix='aux-import-scope-') as directory:
 root=Path(directory)
 for f in entries:
  old=(here/'baseline'/f['path']).read_bytes();new=(here/'source'/f['path']).read_bytes()
  assert hashlib.sha256(old).hexdigest()==f['baselineSha256']
  assert hashlib.sha256(new).hexdigest()==f['outputSha256']
  target=root/f['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(old)
 subprocess.run(['git','apply',str(here/'native.patch')],cwd=root,check=True)
 for f in entries:assert (root/f['path']).read_bytes()==(here/'source'/f['path']).read_bytes()
s=(here/'source/chrome/browser/extensions/api/aux_browser_import/import_service.cc').read_text()
assert 'job->categories = {"bookmarks", "history", "cookies"};' in s
assert 'value.GetString() == "passwords"' in s
assert 'for (const char* kind : {"history", "bookmarks"})' in s
s=(here/'source/chrome/browser/extensions/api/aux_browser_import/firefox_import.cc').read_text()
assert 'selected->services_supported & ~user_data_importer::PASSWORDS' in s
s=(here/'source/chrome/browser/extensions/api/aux_browser_import/chromium_clone_worker.cc').read_text()
assert '"passwords", *key' not in s
s=(here/'source/chrome/browser/extensions/api/aux_browser_import/safari_import.cc').read_text()
assert '/*include_passwords=*/false' in s
assert 'ProfilePasswordStoreFactory::GetForProfile' not in s
assert 'AccountPasswordStoreFactory::GetForProfile' not in s
print(f'{len(entries)} pinned files, exact replay and targeted source invariants PASS; native/runtime acceptance pending')
