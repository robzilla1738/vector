"""Count/hash-checked inactive projection. Never modify any selected input."""
import hashlib,json,pathlib,difflib,shutil
HERE=pathlib.Path(__file__).resolve().parent
PREVIOUS=HERE.parent/'runtime-cache-validation'
COUNT=HERE.parent/'runtime-host-registration-count'
sha=lambda b:hashlib.sha256(b).hexdigest()
count=json.loads((COUNT/'manifest.json').read_text());raw=pathlib.Path(count['input']).read_bytes();assert sha(raw)==count['inputSha256']
text=raw.decode();assert text.count(count['old'])==1;text=text.replace(count['old'],count['new']);assert sha(text.encode())==count['outputSha256'];baseline=text
changes=[('#include <limits>','#include <limits>\n#include <algorithm>\n#include <atomic>\n#include <functional>\n#include <iterator>\n#include <CommonCrypto/CommonDigest.h>'),
('#include "AuxBrokerAwaitedNapi.inc"','#include "AuxBrokerAwaitedNapi.inc"\n#include "AuxRuntimeCacheInspection.inc"\n#include "AuxRuntimeCachePins.inc"\n#include "AuxRuntimeCacheAsync.inc"'),
('      {"captureStorageRoots",nullptr,CaptureStorageRoots,nullptr,nullptr,nullptr,napi_default,nullptr},','      {"captureStorageRoots",nullptr,CaptureStorageRoots,nullptr,nullptr,nullptr,napi_default,nullptr},\n      {"inspectRuntimeCache",nullptr,InspectRuntimeCache,nullptr,nullptr,nullptr,napi_default,nullptr},')]
for old,new in changes:assert text.count(old)==1;text=text.replace(old,new)
for name in ['AuxRuntimeCacheInspection.inc','AuxRuntimeCachePins.inc']:
 source=PREVIOUS/'source'/name
 expected=next(f['sha256'] for f in json.loads((PREVIOUS/'manifest.json').read_text())['files'] if f['path']=='source/'+name)
 assert sha(source.read_bytes())==expected
 shutil.copyfile(source,HERE/'source'/name)
(HERE/'source/AuxDevelopmentWorkerHost.cc').write_text(text)
(HERE/'host.patch').write_text(''.join(difflib.unified_diff(baseline.splitlines(True),text.splitlines(True),fromfile='a/AuxDevelopmentWorkerHost.cc',tofile='b/AuxDevelopmentWorkerHost.cc')))
(HERE/'host-overlay.json').write_text(json.dumps({'format':'aux.runtime-cache-async-host-overlay.v1','originalSha256':sha(raw),'baseAfterCountFixSha256':sha(baseline.encode()),'outputSha256':sha(text.encode()),'changes':[{'old':a,'new':b,'count':1} for a,b in changes]},indent=2)+'\n')
