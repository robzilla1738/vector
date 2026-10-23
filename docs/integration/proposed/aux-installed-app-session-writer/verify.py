#!/usr/bin/env python3
"""Check exact app-writer source pairing and shared nested submission windows."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    pins = json.loads((HERE / 'inputs.json').read_text())
    native = Path(pins['sourceRoot'])
    anchors = 0
    for item in pins['files']:
        original = (native / item['path']).read_bytes()
        output = (HERE / 'source' / item['path']).read_bytes()
        assert sha(original) == item['inputSha256'], item['path']
        text = original.decode()
        for edit in item['edits']:
            assert text.count(edit['find']) == edit['count'], edit['name']
            text = text.replace(edit['find'], edit['replace'])
            anchors += 1
        assert text.encode() == output and sha(output) == item['outputSha256']
    assert sha((HERE / 'followup.patch').read_bytes()) == pins['patchSha256']
    source = (HERE / 'source/chrome/browser/ui/aux_profile_switch_session_rebuild.cc').read_text()
    writes = source.split('void LoadedSessionWriterParticipant::BeginFinalWrites() {', 1)[1]
    writes = writes.split('void LoadedSessionWriterParticipant::DidWrite(', 1)[0]
    assert writes.count('write_submission_.Begin();') == 1
    assert writes.count('write_submission_.Finish();') == 1
    assert (writes.index('write_submission_.Begin();') <
            writes.index('SessionServiceFactory::GetForProfileIfExisting') <
            writes.index('AppSessionServiceFactory::GetForProfileIfExisting') <
            writes.index('write_submission_.Finish();'))
    closes = source.split('void LoadedSessionWriterParticipant::BeginManagerCloses() {', 1)[1]
    closes = closes.split('void LoadedSessionWriterParticipant::DidClose(', 1)[0]
    assert closes.count('close_submission_.Begin();') == 1
    assert closes.count('close_submission_.Finish();') == 1
    assert (closes.index('close_submission_.Begin();') <
            closes.index('services_[i]->CloseCommandWriterAdmissionAndObserve') <
            closes.index('app_services_[i]->CloseCommandWriterAdmissionAndObserve') <
            closes.index('close_submission_.Finish();'))
    assert 'AppSessionServiceFactory::GetForProfile(' not in source
    assert 'AppSessionServiceFactory::ShutdownForProfile' not in source
    assert 'WebAppProvider' not in source
    app_write = source.split('void LoadedSessionWriterParticipant::DidAppWrite(', 1)[1]
    assert 'result_.profiles[index].app_session.write = std::move(result);' in app_write
    assert 'result_.profiles[index].write = ' not in app_write.split('BeginManagerCloses()', 1)[0]
    print(f'PASS: two exact source pins/{anchors} anchors; existing-only app lookup; '
          'independent native outcomes and common nested submission guards')


if __name__ == '__main__':
    main()
