#!/usr/bin/env python3
"""Compose pinned lane sources without mutating native sources."""
import argparse
import hashlib
import json
from pathlib import Path

here = Path(__file__).resolve().parent
repo = here.parents[4]
native = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
feature = here.parent
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
parser = argparse.ArgumentParser()
parser.add_argument('--predecessor')
args = parser.parse_args()
prior = {}
if args.predecessor:
    previous = json.loads(Path(args.predecessor).read_text())
    if not previous.get('applied'): raise RuntimeError('Successful predecessor required')
    prior = {entry['path']: entry['afterSha256'] for entry in previous['changes']}
    if previous.get('inputPins'): prior.update(previous['inputPins'])
entries = {}
def add(path, before, after, source, override=None):
    if path in entries:
        if override != entries[path]['afterSha256']:
            raise RuntimeError('Two writers for native source: ' + path)
        before = entries[path]['beforeSha256']
    if sha(source) != after:
        raise RuntimeError('Proposal changed since review: ' + path)
    if path in prior: before = prior[path]
    actual = native / path
    if (sha(actual) if actual.exists() else None) != before:
        raise RuntimeError('Selected predecessor changed: ' + path)
    entries[path] = {'path': path, 'beforeSha256': before,
                     'afterSha256': after, 'source': str(source.relative_to(repo))}

for entry in json.loads((feature/'frame/files.json').read_text())['files']:
    add(entry['path'],entry['baselineSha256'],entry['sourceSha256'],feature/'frame/source'/entry['path'])
for entry in json.loads((feature/'navigation/native-inputs.json').read_text())['files']:
    add(entry['path'],entry['beforeSha256'],entry['afterSha256'],feature/'navigation/source'/entry['path'])
organization = json.loads((feature/'organization/manifest.json').read_text())
for path, after in organization['files'].items():
    add(path, organization.get('consumerBaseline', {}).get(path), after, feature/'organization/source'/path)
for entry in json.loads((feature/'feature_store/files.json').read_text())['files']:
    add(entry['path'],entry['baselineSha256'],entry['sourceSha256'],feature/'feature_store/source'/entry['path'])
for entry in json.loads((feature/'routing/files.json').read_text())['files']:
    add(entry['path'],entry['baselineSha256'],entry['sourceSha256'],feature/'routing/source'/entry['path'])
for entry in json.loads((feature/'theme/files.json').read_text())['files']:
    add(entry['path'],entry['baselineSha256'],entry['sourceSha256'],feature/'theme/source'/entry['path'])
productivity_before = {entry['path']: entry['beforeSha256'] for entry in json.loads((feature/'productivity/native-cdp-hooks.json').read_text())['files']}
for source in sorted((feature/'productivity/source').rglob('*')):
    if source.is_file():
        path = str(source.relative_to(feature/'productivity/source'))
        add(path, productivity_before.get(path), sha(source), source)
for entry in json.loads((feature/'routing-ingress/files.json').read_text())['files']:
    add(entry['path'],entry['baselineSha256'],entry['sourceSha256'],feature/'routing-ingress/source'/entry['path'])
for entry in json.loads((feature/'preview/files.json').read_text())['files']:
    add(entry['path'],entry['baselineSha256'],entry['sourceSha256'],feature/'preview/source'/entry['path'])
for entry in json.loads((feature/'shortcuts/files.json').read_text())['files']:
    path=entry['path']
    add(path,entry['baselineSha256'],entry['sourceSha256'],feature/'shortcuts/source'/path,entry['baselineSha256'])
for entry in json.loads((feature/'split/manifest.json').read_text())['sources']:
    add(entry['path'],entry['baseline_sha256'],entry['sha256'],feature/'split/source'/entry['path'])
for source in sorted((feature/'developer/source').rglob('*')):
    if source.is_file():
        path=str(source.relative_to(feature/'developer/source'))
        add(path,None,sha(source),source)
for entry in json.loads((here/'shared-inputs.json').read_text())['files']:
    add(entry['path'],entry['beforeSha256'],entry['afterSha256'],repo/entry['source'],entry.get('overridesNativeSourceSha256'))
for source in sorted((here/'source/chrome/browser/aux/organization').glob('*')):
    name='chrome/browser/aux/organization/'+source.name
    if name in entries:
        if entries[name]['afterSha256'] != sha(source): raise RuntimeError('Root organization source mismatch: '+name)
    else: add(name,None,sha(source),source)
manifest={'format':'aux.browser-features.composition.v1','baselineCommit':'02ce77253',
          'files':[entries[path] for path in sorted(entries) if entries[path]['beforeSha256'] != entries[path]['afterSha256']],
          'inputPins':{path: entries[path]['afterSha256'] for path in sorted(entries)},'runtimeAccepted':False,
          'coldHookEnabled':False,'productSigned':False}
(here/'composition.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'manifest':str(here/'composition.json'),'inputs':len(entries),'changedFiles':len(manifest['files'])}))
