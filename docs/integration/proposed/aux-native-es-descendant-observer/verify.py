#!/usr/bin/env python3
import hashlib,json,pathlib
p=pathlib.Path(__file__).resolve().parent
pins=json.loads((p/'inputs.json').read_text())
for rel,h in pins['files'].items():assert hashlib.sha256((p/rel).read_bytes()).hexdigest()==h,rel
for item in pins['sdk']:
 f=pathlib.Path(item['path']);assert hashlib.sha256(f.read_bytes()).hexdigest()==item['sha256'],str(f)
s=(p/'source/AuxEsDescendantObserver.cc').read_text()
assert s.count('es_new_descendants_client(')==1
assert 'es_new_client(' not in s
assert '__builtin_available(macOS 27.0, *)' in s
assert 'message->version < 4' in s
assert 'message->event.exec.target' in s and 'process->start_time' in s
assert 'state->client = nullptr;' in s and 'State::ReleaseRetention(state);' in s
assert 'ES_EVENT_TYPE_AUTH_' not in s and 'waitpid(' not in s
assert 'std::nullopt' in s
print('PASS: pinned actual ES producer/SDK, observational-only source; NO compile, client creation or OS effects')
