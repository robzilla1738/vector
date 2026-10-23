#!/usr/bin/env python3
"""Static source/SDK checks only; never opens kqueue/spawns/loads an addon."""
import hashlib,json,pathlib
p=pathlib.Path(__file__).resolve().parent
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
d=json.loads((p/'sources.json').read_text())
for item in d['upstream'].values():assert sha(p/item['localPath'])==item['sha256']
s=(p/'upstream/pty.cc').read_text();helper=(p/'upstream/spawn-helper.cc').read_text()
assert json.loads((p/'upstream/package.json').read_text())['version']=='1.1.0'
assert 'POSIX_SPAWN_START_SUSPENDED' not in s
assert s.index('pty_posix_spawn(argv, env, term, &winp, &master, &pid, &err);') < s.index('if (pty_nonblock(master) == -1)') < s.index('SetupExitCallback(napiEnv, cb, pid);')
assert s.count('SetupExitCallback(napiEnv, cb, pid);')==1
assert 'waitpid(pid, &stat_loc, 0)' in s and 'th->join();' in s
assert 'execvp(file, argv);' in helper
kernel=d['kernel']['bsd/kern/kern_event.c']['anchors']
assert any('knote_set_error(kn, ENOTSUP)' in a['snippet'] for a in kernel)
for item in json.loads((p/'sdk.json').read_text())['files']:
 f=pathlib.Path(item['path']);assert sha(f)==item['sha256'],str(f)
 text=f.read_text()
 for anchor in item['anchors']:assert anchor in text,anchor
print('PASS: exact official MIT source, unsupported kernel NOTE_TRACK and actual SDK API pins; STATIC ONLY, no native operation')
