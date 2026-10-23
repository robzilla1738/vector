#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
p=Path(__file__).resolve().parent;m=json.loads((p/'inputs.json').read_text());rel=m['nativePath']
a=p/'baseline'/rel;b=p/'source'/rel
assert hashlib.sha256(a.read_bytes()).hexdigest()==m['actualNativeBaselineSha256']
assert hashlib.sha256(b.read_bytes()).hexdigest()==m['successorSha256']
with tempfile.TemporaryDirectory(prefix='aux-selected-buffer-patch-') as d:
 q=Path(d)/rel;q.parent.mkdir(parents=True);q.write_bytes(a.read_bytes())
 subprocess.run(['patch','-p1','--batch','-i',str(p/'safe-buffers.patch')],cwd=d,check=True,capture_output=True)
 assert q.read_bytes()==b.read_bytes()
s=b.read_text()
assert 'std::strcmp' not in s and 'std::memcmp' not in s and 'owned_bytes[index]' not in s
assert s.count('volatile uint8_t& owned_byte = byte;')==1
assert s.count('std::prev(std::end(prefix))')==1
assert s.count('retained.st_dev != current.st_dev || retained.st_ino != current.st_ino')==1
print('actual baseline and successor pinned; patch reproduces exact one-file successor; compile pending')
