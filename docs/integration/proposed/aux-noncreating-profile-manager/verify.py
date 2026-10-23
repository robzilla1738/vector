#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,re
here=Path(__file__).resolve().parent;pins=json.loads((here/'inputs.json').read_text());native=Path(pins['nativeSourceRoot']);sha=lambda raw:hashlib.sha256(raw).hexdigest()
assert sha(Path(pins['parentManifest']).read_bytes())==pins['parentManifestSha256']
for item in pins['files']:
 before=(native/item['path']).read_bytes();after=(here/'source'/item['path']).read_bytes()
 assert sha(before)==item['inputSha256'],item['path'];assert before.decode().count(item['find'])==item['count'];assert before.decode().replace(item['find'],item['replace']).encode()==after;assert sha(after)==item['outputSha256']
assert sha((here/'followup.patch').read_bytes())==pins['patchSha256']
impl=(here/'source/chrome/browser/browser_process_impl.cc').read_text();body=re.search(r'ProfileManager\* BrowserProcessImpl::profile_manager_if_initialized\(\) \{(.*?)\n\}',impl,re.S).group(1)
assert body.strip()=='DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);\n  return profile_manager_.get();'
assert 'virtual ProfileManager* profile_manager_if_initialized() { return nullptr; }' in (here/'source/chrome/browser/browser_process.h').read_text()
aggregate=(here/'source/chrome/browser/ui/aux_owned_browser_quiesce.cc').read_text();assert 'g_browser_process->profile_manager()' not in aggregate;assert aggregate.count('g_browser_process->profile_manager_if_initialized()')==1
print('PASS: four exact current-input edits; real accessor is sequence-checked get-only; conservative default; aggregate has no lazy manager call')
