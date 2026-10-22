#!/usr/bin/env python3
"""Checks frozen source/instruction evidence; does not load or run the addon."""
import argparse,hashlib,importlib.util,json,pathlib,re,struct
ROOT=pathlib.Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--addon',required=True);parser.add_argument('--daemon-js',required=True);options=parser.parse_args()
    manifest=json.loads((ROOT/'signing-evidence.json').read_text())
    binary_path=pathlib.Path(options.addon);assert binary_path.stat().st_size<=32*1024*1024
    binary=binary_path.read_bytes();assert sha(binary)==manifest['binarySha256']
    js_path=pathlib.Path(options.daemon_js);assert js_path.stat().st_size<=64*1024*1024
    js=js_path.read_bytes();assert sha(js)==manifest['daemonJsSha256']
    for anchor in manifest['jsAnchors']:assert js.decode().count(anchor['text'])==anchor['count']
    spec=importlib.util.spec_from_file_location('instruction_evidence',ROOT/'../aux-native-pq-continuation/verify-continuation.py');evidence=importlib.util.module_from_spec(spec);spec.loader.exec_module(evidence)
    codes={}
    for artifact in manifest['artifacts']:
        data=(ROOT/artifact['path']).read_bytes();assert len(data)<=512*1024 and sha(data)==artifact['sha256']
        code=evidence.parse(data);assert len(code)==artifact['instructionCount']
        assert sorted(code)==list(range(artifact['start'],artifact['end'],4))
        for address,item in code.items():
            offset=evidence.mapped_offset(binary,address,4);assert binary[offset:offset+4]==item['bytes']
        codes[artifact['path']]=code
    for anchor in manifest['anchors']:
        item=codes[anchor['path']][anchor['at']];assert item['op']+'\t'+item['args']==anchor['instruction']
        if 'blTarget' in anchor:
            word=struct.unpack('<I',item['bytes'])[0];assert word>>26==0b100101
            delta=word&0x03ffffff
            if delta&0x02000000:delta-=0x04000000
            assert anchor['at']+4*delta==anchor['blTarget']
    for item in manifest['sourceHashes']:
        source=(ROOT/item['path']).read_bytes();assert sha(source)==item['sha256']
        assert not re.search(rb'\bSecItem\w*\s*\(|\.generate\(|PrivateKey\(\)',source)
    cdp=(ROOT/'evidence/cdp-sign.asm').read_text()
    assert not re.search(r'symbol stub for: .*?(SHA256|hkdf|HashFunction)',cdp)
    print('PASS: three complete original functions, signing/import/encoding operands, frozen JS challenge contract, source pins. No addon or Security execution.')
if __name__=='__main__':main()
