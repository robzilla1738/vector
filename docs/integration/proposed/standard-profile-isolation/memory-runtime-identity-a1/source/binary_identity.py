#!/usr/bin/env python3
"""Exact Mach-O metadata-only unsigned derivation; never executes the input."""
import hashlib, json, re, struct, sys
from pathlib import Path
INPUT_SHA = 'c6a883c7b43f4db4199812ac98168af82b8ec4ec204b51bc82fcb07b125e08f1'

def digest(b): return hashlib.sha256(b).hexdigest()
def uleb(b, pos, end):
    value = shift = 0
    for _ in range(10):
        if pos >= end: raise ValueError('truncated ULEB')
        v = b[pos]; pos += 1; value |= (v & 127) << shift
        if not v & 128: return value, pos
        shift += 7
    raise ValueError('oversized ULEB')
def enc(v):
    out = bytearray()
    while v > 127: out.append((v & 127) | 128); v >>= 7
    out.append(v); return bytes(out)
def decode(data):
    result = {}
    def visit(pos, prefix, ancestry):
        if pos in ancestry or len(ancestry) > 256: raise ValueError('export cycle/depth')
        start = pos; length, pos = uleb(data, pos, len(data)); end = pos + length
        if end >= len(data): raise ValueError('terminal bounds')
        if length:
            if prefix in result: raise ValueError('duplicate export')
            result[prefix] = data[pos:end]
        pos = end; count = data[pos]; pos += 1
        for _ in range(count):
            end = data.index(0, pos); edge = data[pos:end].decode('ascii'); pos = end + 1
            child, pos = uleb(data, pos, len(data))
            if not edge: raise ValueError('empty export edge')
            visit(child, prefix + edge, ancestry | {start})
    visit(0, '', set()); return result

def renamed(name):
    # Rust legacy symbols encode each component's byte length, not just text.
    if name.startswith('__ZN') and name.endswith('E'):
        pos = 4; parts = []
        while pos < len(name) - 1:
            m = re.match(r'[0-9]+', name[pos:])
            if not m: raise ValueError('unsupported Rust export')
            count = int(m[0]); pos += len(m[0]); part = name[pos:pos + count]
            if len(part) != count: raise ValueError('Rust component bounds')
            pos += count
            part = part.replace('aside_local_memory', 'aux_local_memory')
            parts.append(str(len(part.encode())) + part)
        if pos != len(name) - 1: raise ValueError('Rust suffix')
        name = '__ZN' + ''.join(parts) + 'E'
    elif name.startswith('_aside_model_'):
        name = '_aux_model_' + name[len('_aside_model_'):]
    if 'aside' in name.lower(): raise ValueError('unclassified branded export')
    return name

def encode(exports):
    root = {'terminal': b'', 'children': {}}
    for name, terminal in sorted(exports.items()):
        node = root
        for c in name: node = node['children'].setdefault(c, {'terminal': b'', 'children': {}})
        if node['terminal']: raise ValueError('duplicate export destination')
        node['terminal'] = terminal
    nodes = []
    def compact(node):
        edges = []
        for edge, child in sorted(node['children'].items()):
            while not child['terminal'] and len(child['children']) == 1:
                c, child = next(iter(child['children'].items())); edge += c
            edges.append((edge, child))
        node['edges'] = edges; node['offset'] = 0; nodes.append(node)
        for _, child in edges: compact(child)
    compact(root)
    def serialize(node):
        if len(node['edges']) > 255: raise ValueError('export fanout')
        return enc(len(node['terminal'])) + node['terminal'] + bytes([len(node['edges'])]) + b''.join(edge.encode() + b'\0' + enc(child['offset']) for edge, child in node['edges'])
    for _ in range(30):
        changed = False; pos = 0
        for node in nodes:
            if node['offset'] != pos: node['offset'] = pos; changed = True
            pos += len(serialize(node))
        if not changed:
            output = b''.join(serialize(node) for node in nodes)
            if decode(output) != exports: raise ValueError('export reconstruction mismatch')
            return output
    raise ValueError('export offsets did not converge')

def derive(original):
    if digest(original) != INPUT_SHA: raise ValueError('unreviewed executable')
    if struct.unpack_from('<I', original)[0] != 0xfeedfacf: raise ValueError('Mach-O format')
    count, size = struct.unpack_from('<II', original, 16); pos = 32; commands = []
    for _ in range(count):
        cmd, length = struct.unpack_from('<II', original, pos)
        if length < 8 or pos + length > 32 + size: raise ValueError('load commands')
        commands.append((cmd, pos, length)); pos += length
    if pos != 32 + size: raise ValueError('load command tail')
    dyld = [p for c,p,s in commands if c == 0x80000022]
    sig = [p for c,p,s in commands if c == 0x1d]
    if len(dyld) != 1 or sig != [3288] or commands[-1] != (0x1d,3288,16): raise ValueError('unreviewed commands')
    export_off, export_size = struct.unpack_from('<II', original, dyld[0] + 40)
    sigoff, sigsize = struct.unpack_from('<II', original, sig[0] + 8)
    if (export_off,export_size,sigoff,sigsize) != (3297424,51936,3359488,24992) or sigoff + sigsize != len(original): raise ValueError('unreviewed linkedit')
    exports = decode(original[export_off:export_off+export_size]); mapped = {}; changes = []
    for name, terminal in exports.items():
        target = renamed(name)
        if target in mapped: raise ValueError('renamed export collision')
        mapped[target] = terminal
        if name != target: changes.append({'from':name,'to':target,'terminalSha256':digest(terminal)})
    rebuilt = encode(mapped)
    if len(rebuilt) > export_size: raise ValueError('rebuilt trie exceeds fixed range')
    output = bytearray(original[:sigoff])
    output[export_off:export_off+export_size] = rebuilt + bytes(export_size-len(rebuilt))
    struct.pack_into('<I', output, dyld[0]+44, len(rebuilt))
    struct.pack_into('<II', output, 16, count-1, size-16)
    output[sig[0]:sig[0]+16] = bytes(16)
    sections = []
    for c,p,s in commands:
        if c != 0x19: continue
        name = original[p+8:p+24].split(b'\0')[0].decode(); off, length = struct.unpack_from('<QQ',original,p+40)
        if name == '__LINKEDIT':
            if (p,off,length) != (2400,3293184,91296): raise ValueError('linkedit segment mismatch')
            struct.pack_into('<Q',output,p+48,sigoff-off)
        nsects = struct.unpack_from('<I',original,p+64)[0]
        for i in range(nsects):
            q=p+72+i*80; sec=original[q:q+16].split(b'\0')[0].decode(); length=struct.unpack_from('<Q',original,q+40)[0]; off=struct.unpack_from('<I',original,q+48)[0]
            flags=struct.unpack_from('<I',original,q+64)[0]
            if flags & 255 in (1,12,18): continue  # zero-fill has no file bytes
            if off+length > sigoff or original[off:off+length] != output[off:off+length]: raise ValueError('mapped section modified')
            sections.append({'segment':name,'section':sec,'offset':off,'length':length,'sha256':digest(original[off:off+length])})
    if re.search(b'aside',output,re.I): raise ValueError('unclassified old identity bytes')
    return bytes(output), {'format':'aux.memory-executable.derivation.v1','inputSha256':INPUT_SHA,'outputSha256':digest(output),'inputBytes':len(original),'outputBytes':len(output),'exportCount':len(exports),'renamedExports':changes,'exportTrieBytes':len(rebuilt),'unchangedMappedSections':sections,'originalSignatureRemoved':True,'signed':False,'executed':False}

if __name__ == '__main__':
    output, receipt = derive(Path(sys.argv[1]).read_bytes())
    if len(sys.argv)>2:
        with Path(sys.argv[2]).open('xb') as f: f.write(output)
    print(json.dumps(receipt,indent=2))
