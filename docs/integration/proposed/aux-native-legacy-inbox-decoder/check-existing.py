#!/usr/bin/env python3
"""One serialized external actual-code fixture; no GN/source checkout writes."""
import pathlib,subprocess,json,hashlib,shlex,time,sys
P=pathlib.Path(__file__).resolve().parent
R=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
B=R/'out/AuxFast'
O=pathlib.Path('/Users/rcourson/Documents/Vibe/web/out/aux-legacy-inbox-codec-check')
assert not O.exists()
O.mkdir()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
V={}
for line in (B/'obj/crypto/crypto.ninja').read_text().splitlines():
 if ' = ' in line and not line.startswith(' '):
  key,value=line.split(' = ',1);V[key]=value
flags=shlex.split(' '.join(V[k] for k in ['defines','include_dirs','cflags','cflags_cc','module_deps']))
# Exact current ABI/modules and unchanged in-tree diagnostic plugins.
flags=['-I'+str(O/'overlay')]+flags
cc=R/'third_party/llvm-build/Release+Asserts/bin/clang++'
sources=[P/'source/chrome/browser/notifications/aux_legacy_inbox_codec.cc',P.parents[0]/'aux-native-inbox-v2/source/chrome/browser/notifications/aux_inbox_codec.cc',P/'tests/legacy-inbox-test.cc']
for header in ['aux_legacy_inbox_codec.h','aux_inbox_codec.h']:
 src=(P if header.startswith('aux_legacy') else P.parent/'aux-native-inbox-v2')/'source/chrome/browser/notifications'/header
 dst=O/'overlay/chrome/browser/notifications'/header;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(src.read_bytes())
libs=[B/x for x in ['obj/crypto/libcrcrypto.a','obj/base/libbase.a','obj/base/libbase_static.a','obj/third_party/boringssl/libboringssl.a','obj/base/allocator/partition_allocator/src/partition_alloc/liballocator_core.a','obj/base/allocator/partition_allocator/src/partition_alloc/liballocator_base.a','obj/base/allocator/partition_allocator/src/partition_alloc/libraw_ptr.a','obj/base/allocator/partition_allocator/src/partition_alloc/liballocator_shim.a','obj/buildtools/third_party/libc++/libc++.a','obj/buildtools/third_party/libc++abi/libc++abi.a']]
inputs=sources+[P/'source/chrome/browser/notifications/aux_legacy_inbox_codec.h',P.parent/'aux-native-inbox-v2/source/chrome/browser/notifications/aux_inbox_codec.h',B/'obj/crypto/crypto.ninja',B/'toolchain.ninja',cc]+libs
receipt={'scope':'actual-code isolated synthetic fixture; no protected lookup/database','inputs':{str(p):sha(p) for p in inputs},'commands':[],'status':'started'}
def save(): (O/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
def run(command,name):
 receipt['commands'].append(command);save()
 result=subprocess.run(command,cwd=B,capture_output=True,text=True)
 (O/(name+'.log')).write_text(result.stdout+result.stderr)
 receipt[name+'ExitCode']=result.returncode;save()
 if result.returncode:receipt['status']=name+'-failed';save();sys.exit(result.returncode)
objects=[]
for i,source in enumerate(sources):
 obj=O/(str(i)+'.o');objects.append(obj)
 run([str(cc)]+flags+['-c',str(source),'-o',str(obj)],'compile'+str(i))
run([str(cc),'--target=arm64-apple-macos','-mmacos-version-min=13.0','-isysroot',str(B/'sdk/xcode_links/MacOSX27.0.sdk'),'-nostdlib++','-Wl,-dead_strip']+list(map(str,objects+libs))+['-framework','Foundation','-framework','Security','-framework','CoreFoundation','-framework','IOKit','-framework','AppKit','-o',str(O/'fixture')],'link')
receipt['binarySha256']=sha(O/'fixture');save()
run([str(O/'fixture')],'fixture')
receipt['status']='passed';save();print(json.dumps(receipt,indent=2))
