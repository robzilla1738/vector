#!/usr/bin/env python3
"""Pinned private Swift metadata derivation, preserving all instructions and ABI exports."""
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import subprocess
import sys

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
SCOPE=HERE.parent.parent
ROOT=SCOPE.parents[3]
TARGET=ROOT/'out/provided-candidate-standard-profile-resources-20261024/Aux.app/Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use'
OUT=Path('/private/tmp/aux-computer-use-module-identity-20261024-a1')
INPUT_SHA='af5b2731c50a848c248a976b800ebd91d4ced91ccdf98eadb4d101a72bf9786c'
OLD=b'AsideComputerUse'
NEW=b'AuxilComputerUse'
sha=lambda data:hashlib.sha256(data).hexdigest()


def require(value,message):
    if not value:raise ValueError(message)


original=TARGET.read_bytes()
require(sha(original)==INPUT_SHA,'Exact already-branded helper required')
assessment=json.loads((HERE.parent/'assessment-a1.json').read_text())
require(assessment['passed'] is True and assessment['inputSha256']==INPUT_SHA
    and next(trial for trial in assessment['trials'] if trial['namespace']==NEW.decode())['pureModuleDemangleEquivalent'] is True,
    'Actual pure-module demangler assessment required')
require(struct.unpack_from('<I',original)[0]==0xfeedfacf and len(OLD)==len(NEW)==16,'Exact fixed-width thin64 format')
count,size=struct.unpack_from('<II',original,16)
pos=32;commands=[];sections=[];linkedit=None
for _ in range(count):
    kind,length=struct.unpack_from('<II',original,pos)
    require(length>=8 and pos+length<=32+size,'Load command bounds')
    commands.append((kind,pos,length))
    if kind==0x19:
        name=original[pos+8:pos+24].split(b'\0')[0].decode()
        if name=='__LINKEDIT':linkedit=pos
        nsects=struct.unpack_from('<I',original,pos+64)[0]
        require(length==72+80*nsects,'Segment/section bounds')
        for index in range(nsects):
            at=pos+72+80*index
            section=original[at:at+16].split(b'\0')[0].decode()
            length=struct.unpack_from('<Q',original,at+40)[0]
            offset=struct.unpack_from('<I',original,at+48)[0]
            flags=struct.unpack_from('<I',original,at+64)[0]
            if flags&255 not in [1,12,18]:sections.append(dict(segment=name,section=section,offset=offset,length=length,flags=flags))
    pos+=commands[-1][2]
require(pos==32+size and commands[-1]==(0x1d,6672,16),'Exact final signature command required')
sigoff,sigsize=struct.unpack_from('<II',original,6672+8)
require((sigoff,sigsize)==(2041536,23072) and sigoff+sigsize==len(original),'Exact original signature tail')
require(linkedit is not None,'LINKEDIT required')
output=bytearray(original[:sigoff]);patches=[]


def patch(offset,before,after,kind):
    require(len(before)==len(after) and bytes(output[offset:offset+len(before)])==before,'Exact patch before-image')
    require(not any(offset<item['offset']+len(bytes.fromhex(item['beforeHex']))
        and offset+len(before)>item['offset'] for item in patches),'Patch overlap')
    output[offset:offset+len(after)]=after
    patches.append(dict(offset=offset,beforeHex=before.hex(),afterHex=after.hex(),count=1,kind=kind))


require(assessment['namespaceLocations']==[index for index in range(len(original)) if original.startswith(OLD,index)],
    'Complete namespace-location assessment differs')
for offset in assessment['namespaceLocations']:patch(offset,OLD,NEW,'swift-private-module-name')
patch(16,original[16:24],struct.pack('<II',count-1,size-16),'remove-invalid-original-signature-command-count')
patch(6672,original[6672:6688],bytes(16),'remove-invalid-original-signature-command')
linkedit_off=struct.unpack_from('<Q',original,linkedit+40)[0]
file_size=sigoff-linkedit_off
patch(linkedit+48,original[linkedit+48:linkedit+56],struct.pack('<Q',file_size),'unsigned-linkedit-file-size')
patch(linkedit+32,original[linkedit+32:linkedit+40],struct.pack('<Q',(file_size+16383)//16384*16384),'unsigned-linkedit-virtual-size')
require(b'Aside' not in output and output.count(NEW)==2027,'Unclassified old product identities remain')
require(output.count(b'aside')==1 and b'_setupLookaside\0' in output,'SQLite language symbol must remain valid')
section_evidence=[]
for row in sections:
    start,end=row['offset'],row['offset']+row['length']
    require(end<=sigoff,'Mapped section intersects removed signature')
    before,after=original[start:end],bytes(output[start:end])
    require(after==before.replace(OLD,NEW),'Mapped section changed outside the exact module namespace')
    if row['flags']&0x80000400:require(before==after,'Executable instructions changed')
    section_evidence.append({**row,'beforeSha256':sha(before),'afterSha256':sha(after),'unchanged':before==after})

# All nlist entries/addresses remain byte-identical. Validate the complete
# indexed name cohort and every undefined import, including private entries.
sym=[pos for kind,pos,length in commands if kind==2]
require(len(sym)==1,'One original symbol table required')
symoff,nsyms,stroff,strsize=struct.unpack_from('<IIII',original,sym[0]+8)
require(original[symoff:symoff+nsyms*16]==output[symoff:symoff+nsyms*16],'nlist records changed')
old_names=[];new_names=[];imports=0
for index in range(nsyms):
    at=symoff+index*16
    strx,kind=struct.unpack_from('<IB',original,at)
    require(strx<strsize,'Symbol string index')
    start=stroff+strx
    old=original[start:original.index(0,start,stroff+strsize)].decode()
    new=bytes(output[start:output.index(0,start,stroff+strsize)]).decode()
    require(new==old.replace(OLD.decode(),NEW.decode()),'Unexpected nlist rename')
    if kind&0x0e==0:
        require(old==new,'Imported ABI name changed');imports+=1
    if OLD.decode() in old:old_names.append(old);new_names.append(new)
tool=Path('/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift-demangle')
before=subprocess.check_output([str(tool),'--compact'],input='\n'.join(old_names)+'\n',text=True).splitlines()
after=subprocess.check_output([str(tool),'--compact'],input='\n'.join(new_names)+'\n',text=True).splitlines()
require(len(before)==len(after)==1979 and all(a==b.replace(OLD.decode(),NEW.decode()) for b,a in zip(before,after)),
    'Swift substitution table changed more than the private module namespace')

spec=importlib.util.spec_from_file_location('memory_export_trie',SCOPE/'memory-runtime-identity-a1/source/binary_identity_a2.py')
trie=importlib.util.module_from_spec(spec);spec.loader.exec_module(trie)
exports=[]
for kind,pos,length in commands:
    if kind==0x80000022:exports.append(struct.unpack_from('<II',original,pos+40))
    elif kind==0x80000033:exports.append(struct.unpack_from('<II',original,pos+8))
require(len(exports)==1,'One actual dynamic export trie required')
start,length=exports[0]
old_exports=trie.decode(original[start:start+length]);new_exports=trie.decode(output[start:start+length])
require(old_exports==new_exports and all(OLD.decode() not in name for name in old_exports),
    'Externally exported ABI changed')

OUT.mkdir(mode=0o700)
target=OUT/'aux-computer-use'
with target.open('xb') as stream:stream.write(output)
target.chmod(0o755)
plan=dict(format='aux.computer-use-module.patch-plan.v1',inputSha256=INPUT_SHA,outputSha256=sha(output),
    inputBytes=len(original),outputBytes=len(output),namespace=NEW.decode(),namespaceOccurrenceCount=2027,
    patches=patches,truncatedSignature=dict(offset=sigoff,bytes=sigsize,sha256=sha(original[sigoff:])),
    instructionBytesUnchanged=True,undefinedNamesUnchanged=True,dynamicExportsUnchanged=True,
    nativeDefinitionsAndAddressesUnchanged=True,swiftDemanglePureModuleEquivalence=True,originalSignatureRemoved=True,
    productExecuted=False,signed=False,runtimeAcceptance=False)
with (HERE/'patch-plan.json').open('x') as stream:stream.write(json.dumps(plan,indent=2)+'\n')
native_tools=[]
for mode in ['-exports','-dependents']:
    original_text=subprocess.check_output(['/usr/bin/dyld_info',mode,str(TARGET)],text=True).splitlines()[1:]
    derived_text=subprocess.check_output(['/usr/bin/dyld_info',mode,str(target)],text=True).splitlines()[1:]
    require(original_text==derived_text,'Native dyld inspection differs: '+mode)
    native_tools.append(dict(tool='/usr/bin/dyld_info',mode=mode,rows=len(original_text),unchanged=True))
report=dict(format='aux.computer-use-module.derivation.actual.v1',passed=True,inputSha256=INPUT_SHA,
    output=str(target),outputSha256=sha(output),planSha256=sha((HERE/'patch-plan.json').read_bytes()),
    symbolCount=nsyms,undefinedRecords=imports,renamedIndexedSymbols=1979,namespaceOccurrences=2027,
    dynamicExports=len(old_exports),nativeToolChecks=native_tools,sections=section_evidence,
    originalSignatureRemoved=True,signed=False,productExecuted=False,runtimeAcceptance=False,packaged=False)
with (HERE.parent/'derivation-a1.json').open('x') as stream:stream.write(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':True,'namespace':NEW.decode(),'renamedIndexedSymbols':1979,'dynamicExportsUnchanged':len(old_exports),'productExecuted':False}))
