#!/usr/bin/env python3
"""Static Swift namespace assessment. No executable output, load or target run."""
import collections
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import subprocess
import sys

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
TARGET=ROOT/'out/provided-candidate-standard-profile-resources-20261024/Aux.app/Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use'
PIN='af5b2731c50a848c248a976b800ebd91d4ced91ccdf98eadb4d101a72bf9786c'
OLD=b'AsideComputerUse'
sha=lambda data:hashlib.sha256(data).hexdigest()


def require(value,message):
    if not value:raise ValueError(message)


data=TARGET.read_bytes()
require(sha(data)==PIN and struct.unpack_from('<I',data)[0]==0xfeedfacf,'Exact reviewed thin64 helper required')
count,size=struct.unpack_from('<II',data,16)
pos=32;commands=[];sections=[]
for index in range(count):
    kind,length=struct.unpack_from('<II',data,pos)
    require(length>=8 and pos+length<=32+size,'Load command bounds')
    commands.append((kind,pos,length))
    if kind==0x19:
        segment=data[pos+8:pos+24].split(b'\0')[0].decode()
        nsects=struct.unpack_from('<I',data,pos+64)[0]
        require(length==72+nsects*80,'Section layout')
        for i in range(nsects):
            at=pos+72+i*80
            name=data[at:at+16].split(b'\0')[0].decode()
            length=struct.unpack_from('<Q',data,at+40)[0]
            offset=struct.unpack_from('<I',data,at+48)[0]
            flags=struct.unpack_from('<I',data,at+64)[0]
            if flags&255 in [1,12,18]:continue
            require(offset+length<=len(data),'Mapped section bounds')
            sections.append(dict(segment=segment,section=name,offset=offset,length=length,flags=flags))
    pos+=commands[-1][2]
require(pos==32+size,'Load command tail')
sym=[at for kind,at,size in commands if kind==2]
require(len(sym)==1,'One symbol table required')
symoff,nsyms,stroff,strsize=struct.unpack_from('<IIII',data,sym[0]+8)
require(symoff+nsyms*16<=len(data) and stroff+strsize<=len(data),'Symbol/string table bounds')
signature=[at for kind,at,size in commands if kind==0x1d]
require(len(signature)==1,'One original signature required')
sigoff,sigsize=struct.unpack_from('<II',data,signature[0]+8)
require(sigoff+sigsize==len(data),'Original signature must be the final file region')
strings=[]
for index in range(nsyms):
    at=symoff+16*index;strx=struct.unpack_from('<I',data,at)[0]
    require(strx<strsize,'nlist string bounds')
    end=data.index(0,stroff+strx,stroff+strsize)
    name=data[stroff+strx:end].decode('utf8')
    require('\n' not in name and '\r' not in name,'Symbol input framing')
    strings.append(name)
positions=[];start=0;regions=collections.Counter()
while (at:=data.find(OLD,start))>=0:
    positions.append(at);start=at+len(OLD)
    if stroff<=at and at+len(OLD)<=stroff+strsize:
        regions['LC_SYMTAB.stringTable']+=1;continue
    matches=[row for row in sections if row['offset']<=at and at+len(OLD)<=row['offset']+row['length']]
    require(len(matches)==1,'Unclassified namespace location: '+hex(at))
    row=matches[0]
    require(not row['flags']&0x80000400,'Namespace intersects instructions')
    regions[row['segment']+'.'+row['section']]+=1
require(len(positions)==2027 and data.count(b'Aside')==2029,'Exact namespace/old-signature count changed')
demangler=Path('/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift-demangle')
names=[name for name in strings if 'AsideComputerUse' in name]
old_text=subprocess.check_output([str(demangler),'--compact'],input='\n'.join(names)+'\n',text=True).splitlines()
require(len(old_text)==len(names),'Original demangler framing differs')
trials=[]
for namespace in ['AuxComputerAgent','AuxilComputerUse']:
    require(len(namespace.encode())==len(OLD),'Fixed-width namespace required')
    candidate=data.replace(OLD,namespace.encode())
    new_names=[name.replace(OLD.decode(),namespace) for name in names]
    new_text=subprocess.check_output([str(demangler),'--compact'],input='\n'.join(new_names)+'\n',text=True).splitlines()
    require(len(new_text)==len(names),'Derived demangler framing differs')
    mismatches=[dict(symbol=names[i],before=before,expected=before.replace(OLD.decode(),namespace),after=after)
                for i,(before,after) in enumerate(zip(old_text,new_text)) if before.replace(OLD.decode(),namespace)!=after]
    mapped=[]
    for row in sections:
        before=data[row['offset']:row['offset']+row['length']]
        after=candidate[row['offset']:row['offset']+row['length']]
        if row['flags']&0x80000400:require(before==after,'Instruction bytes changed')
        if before!=after:mapped.append({**row,'beforeSha256':sha(before),'afterSha256':sha(after)})
    trials.append(dict(namespace=namespace,pureModuleDemangleEquivalent=not mismatches,
        mismatchedNames=len(mismatches),mismatchExamples=mismatches[:4],mappedMetadataSections=mapped,
        replacedOccurrences=len(positions),inputBytes=len(data),outputWritten=False))
report=dict(format='aux.computer-use-module.static-assessment.v1',passed=True,inputSha256=PIN,
    reaParentEvidenceId='ev_f52a3a3cf7bf6c390b66ba0c0a5925b302bd93a0ed836d3e3ceec69f202f0f11',
    namespaceLocations=positions,regions=dict(regions),symbolCount=nsyms,reviewedNamespaceSymbols=len(names),
    originalSignature=dict(commandOffset=signature[0],commandIsLast=commands[-1][1]==signature[0],fileOffset=sigoff,bytes=sigsize),
    demanglerSha256=sha(demangler.read_bytes()),trials=trials,
    noTargetOutputWritten=True,productExecuted=False,runtimeAcceptance=False)
with (HERE/'assessment-a1.json').open('x') as stream:stream.write(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'namespaceSymbols':len(names),'regions':dict(regions),
    'trials':[{key:trial[key] for key in ['namespace','pureModuleDemangleEquivalent','mismatchedNames']} for trial in trials]}))
