#!/usr/bin/env python3
"""Bounded static instruction/CFG verification; never loads or runs the addon."""
import argparse, collections, hashlib, json, pathlib, re, struct
ROOT=pathlib.Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
def parse(data):
    result={}
    for line in data.decode().splitlines():
        match=re.match(r'^\s*([0-9a-f]+):\s+((?:[0-9a-f]{2} ){3}[0-9a-f]{2})\s+(\S+)\s*(.*)',line)
        if match:
            address=int(match[1],16)
            if address in result: raise ValueError('Duplicate instruction')
            result[address]={'bytes':bytes.fromhex(match[2]),'op':match[3],'args':match[4]}
    if not 1<=len(result)<=20000:raise ValueError('Instruction bound')
    return result

def successors(code,address):
    item=code[address];op,args=item['op'],item['args'];match=re.search(r'0x([0-9a-f]+)',args);target=int(match[1],16) if match else None
    if op in ('ret','brk','br'):return []
    if op=='b':return [target] if target in code else []
    if op.startswith('b.') or op in ('cbz','cbnz','tbz','tbnz'):return [x for x in (address+4,target) if x in code]
    return [address+4] if address+4 in code else []

def reachable(code,entry):
    seen=set();pending=[entry]
    while pending:
        address=pending.pop()
        if address in seen:continue
        seen.add(address);pending.extend(successors(code,address))
    return seen

def frame_key_writes(code,seen):
    writes=[]
    for address in sorted(seen):
        item=code[address]
        if not item['op'].startswith('st'):continue
        match=re.search(r'\[x19(?:, #(0x[0-9a-f]+))?\]',item['args'])
        if not match:continue
        offset=int(match[1],16) if match[1] else 0
        register=item['args'].split(',')[0].strip();width={'b':1,'h':2,'w':4,'s':4,'x':8,'d':8,'q':16}.get(register[:1],8)
        if item['op'].startswith('stp'):width*=2
        if offset<=0xc8<offset+width:writes.append(address)
    return writes

def mapped_offset(binary,address,length):
    if struct.unpack_from('<II',binary)!=(0xfeedfacf,0x0100000c):raise ValueError('Not ARM64 Mach-O')
    count=struct.unpack_from('<I',binary,16)[0];offset=32
    if count>1024:raise ValueError('Load command bound')
    for _ in range(count):
        command,size=struct.unpack_from('<II',binary,offset)
        if size<8 or offset+size>len(binary):raise ValueError('Invalid command')
        if command==0x19:
            name=binary[offset+8:offset+24].split(b'\0')[0];vm,_,fileoff,filesize=struct.unpack_from('<QQQQ',binary,offset+24)
            if name==b'__TEXT' and vm<=address and address+length<=vm+filesize:return fileoff+address-vm
        offset+=size
    raise ValueError('Non-file-backed text range')

def main():
    args=argparse.ArgumentParser();args.add_argument('--addon',required=True);options=args.parse_args()
    manifest=json.loads((ROOT/'flow-evidence.json').read_text());binary=pathlib.Path(options.addon).read_bytes()
    assert len(binary)<=32*1024*1024 and sha(binary)==manifest['sourceBinarySha256']
    codes={};seen_sets={}
    for function in manifest['functions']:
        data=(ROOT/function['artifact']).read_bytes();assert sha(data)==function['artifactSha256']
        code=parse(data);codes[function['id']]=code
        for address,item in code.items():
            offset=mapped_offset(binary,address,4);assert binary[offset:offset+4]==item['bytes']
        seen=reachable(code,function['entry']);seen_sets[function['id']]=seen
        assert len(seen)==function['reachableInstructionCount']
        assert sha(','.join(hex(x) for x in sorted(seen)).encode())==function['reachableAddressSetSha256']
        assert all(address not in seen for address in function['excludedP256HkdfCalls'])
        assert all(address in seen for address in function['requiredReachableCalls'])
        assert not any(code[address]['op']=='br' for address in seen),'Unresolved indirect branch'
    assert frame_key_writes(codes['unwrap'],seen_sets['unwrap'])==[0x3d320]
    for anchor in manifest['registerAnchors']:
        item=codes[anchor['function']][anchor['address']]
        normalized=item['op']+' '+item['args'].split(';')[0].strip()
        assert normalized==anchor['instruction'],anchor
    for call in manifest['calls']:
        offset=mapped_offset(binary,call['at'],4);instruction=struct.unpack_from('<I',binary,offset)[0];assert instruction>>26==0b100101
        displacement=instruction&0x03ffffff
        if displacement&0x02000000:displacement-=0x04000000
        assert call['at']+4*displacement==call['target']
    for entry in manifest['portSourceHashes']:
        assert sha((ROOT/entry['path']).read_bytes())==entry['sha256']
    source=(ROOT/'source/RecoveredPqAuthority.swift').read_text()
    assert not re.search(r'hkdfDerivedSymmetricKey|HKDF<|\.generate\(|MLKEM768\.PrivateKey\(\)|SecItem',source)
    p256=(ROOT/'../aux-native-p256-envelope-port/source/RecoveredP256Authority.swift').read_text()
    assert 'guard metadata.scheme == .p256 else { throw EnvelopePortError.pqNotRecovered }' in p256
    print('PASS: original instruction bytes, two conservative CFGs, direct key/AAD/container anchors, no P256 HKDF path, unchanged default refusal. No target/KEM execution.')
if __name__=='__main__':main()
