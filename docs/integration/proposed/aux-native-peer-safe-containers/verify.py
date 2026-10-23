#!/usr/bin/env python3
"""Pin exact native-path unsafe-check successors; no compilation or execution."""
from pathlib import Path
import hashlib
import json
here=Path(__file__).resolve().parent
repo=here.parents[3]
pins=json.loads((here/'inputs.json').read_text())
for section in ('actualNativeInputs','files'):
    for name,expected in pins[section].items():
        path=Path(name) if name.startswith('/') else repo/name
        assert hashlib.sha256(path.read_bytes()).hexdigest()==expected,name
sources=here/'source/chrome/browser/aux'
t=(sources/'AuxNativePeerTransport.cc').read_text()
o=(sources/'AuxOwnedNativePeerChild.cc').read_text()
c=(sources/'AuxNativeParentColdLaunch.cc').read_text()
assert 'std::memcpy(' not in t and 'std::memcmp(' not in t
assert t.count('volatile uint8_t& owned_byte = byte;')==1
assert o.count('volatile uint8_t& owned_byte = byte;')==1
assert 'std::bit_cast<SelectedHomeReceived>(incoming)' in t
assert 'static_assert(sizeof(Received) <= sizeof(Incoming));' in t
assert 'std::copy_n(bytes.begin(), prefix.size(), prefix.begin());' in t
assert 'std::bit_cast<Received>(prefix)' in t
assert 'sizeof(Incoming) == sizeof(SelectedHomeReceived)' in t
assert 'std::is_trivially_copyable_v<Received>' in t
assert 'std::is_trivially_copyable_v<SelectedHomeReceived>' in t
assert 'message.size() != 51 || !std::equal(std::begin(domain), std::end(domain), message.begin())' in t
assert 'CFDataGetLength(bytes) == length' in t
assert 'CFDataGetBytes(bytes, CFRangeMake(0, length), observed.data())' in t
assert '(hash.size() != 20 && hash.size() != 32)' in t
assert '(CFDataGetLength(hash) != 20 && CFDataGetLength(hash) != 32)' in c
assert 'CFDataGetBytes(hash, CFRangeMake(0, CFDataGetLength(hash)), captured_hash.data())' in c
assert not any(x in t+o+c for x in ('UNSAFE_TODO','UNSAFE_BUFFERS(', '#pragma clang diagnostic', '-Wno-'))
# Nondiagnostic path handling is deliberately unchanged.
for name,begin,end in [('AuxNativePeerTransport.cc','std::optional<std::string> PhysicalPath(', '\nbool FreshChildLeaf('),('AuxNativeParentColdLaunch.cc','std::optional<std::string> Path(', '\nbase::apple::ScopedCFTypeRef<SecRequirementRef> Requirement(')]:
    new=(sources/name).read_text()
    key=next(x for x in pins['actualNativeInputs'] if x.endswith('/'+name))
    old=Path(key).read_text()
    assert new[new.index(begin):new.index(end,new.index(begin))]==old[old.index(begin):old.index(end,old.index(begin))]
print('PASS: exact three native baselines and seven diagnosed sites; no warning suppression, compile or runtime execution')
