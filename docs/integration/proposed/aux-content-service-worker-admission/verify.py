#!/usr/bin/env python3
"""Verify exact source reuse, paired private dispatch, and non-creating stop."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    pins = json.loads((HERE / 'inputs.json').read_text())
    native = Path(pins['nativeSourceRoot'])
    anchors = 0
    for item in pins['files']:
        output = (HERE / 'source' / item['path']).read_bytes()
        assert sha(output) == item['outputSha256'], item['path']
        if item['inputSha256'] is not None:
            before = (native / item['path']).read_bytes()
            assert sha(before) == item['inputSha256'], item['path']
            text = before.decode()
            for edit in item['edits']:
                assert text.count(edit['find']) == edit['count'], edit['name']
                text = text.replace(edit['find'], edit['replace'])
                anchors += 1
            assert text.encode() == output, item['path']
    assert sha((HERE / 'followup.patch').read_bytes()) == pins['patchSha256']
    embedded = (HERE / 'source/content/browser/service_worker/embedded_worker_instance.cc').read_text()
    assert embedded.count('bool EmbeddedWorkerInstance::SendStartWorker(') == 1
    assert embedded.count('if (!SendStartWorker(std::move(params))) {') == 1
    assert 'if (!aux_migration::ServiceWorkerStartsAllowedForMigration())\n    return false;\n  client_->StartWorker' in embedded
    glue = (HERE / 'source/content/browser/service_worker/aux_service_worker_migration.cc').read_text()
    assert 'GetStoragePartition' not in glue and 'GetDefaultStoragePartition' not in glue
    assert 'context->StopAlreadyOwnedWorkersForMigration(base::BindOnce(' in glue
    assert 'const scoped_refptr<ServiceWorkerContextWrapper> context_;' in glue
    assert 'observation->Finish();' in glue and 'ObserveServiceWorkerStartCallbackLost' in glue
    print(f'PASS: {len(pins["files"])} exact source pins, {anchors} counted anchors; '
          'paired message dispatch and existing-context retention, no partition factory')


if __name__ == '__main__':
    main()
