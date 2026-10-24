#!/usr/bin/env python3
"""Fix actual product unsafe-buffer diagnostics with checks left enabled."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');rows=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
def edit(name,find,replace):return{'name':name,'find':find,'replace':replace,'count':1}
def project(path,anchors):
 actual=ROOT/path;original=actual.read_bytes();text=original.decode()
 for item in anchors:assert text.count(item['find'])==item['count']==1,(path,item['name']);text=text.replace(item['find'],item['replace'])
 before=HERE/'before'/path;before.parent.mkdir(parents=True,exist_ok=True);before.write_bytes(original)
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 assert actual.read_bytes()==original
 rows.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'source':str(target),'beforeImage':str(before),'anchors':anchors})
prefix='chrome/browser/aux/cli/'
main_helper='''// C main ABI only: the OS supplies exactly argc argv pointers and each
// argument is a NUL-terminated C string. Convert that boundary once, bounded
// by the existing argument limits, then use owned strings/ranges exclusively.
inline bool CopyNativeMainArguments(int argc, char* argv[],
                                    std::vector<std::string>* output) {
  if (!output || !argv || argc < 1 ||
      static_cast<size_t>(argc - 1) > kArgumentLimit) return false;
  std::span<char* const> native;
#pragma clang unsafe_buffer_usage begin
  native = std::span<char* const>(argv, static_cast<size_t>(argc));
#pragma clang unsafe_buffer_usage end
  std::vector<std::string> copied;
  for (const char* argument : native.subspan(1)) {
    if (!argument) return false;
    // The sole bounded libc scan is at the actual NUL-terminated main ABI.
#pragma clang unsafe_buffer_usage begin
    const size_t length = strnlen(argument, kArgumentBytes + 1);
#pragma clang unsafe_buffer_usage end
    if (length > kArgumentBytes) return false;
    std::span<const char> bytes;
#pragma clang unsafe_buffer_usage begin
    bytes = std::span<const char>(argument, length);
#pragma clang unsafe_buffer_usage end
    copied.emplace_back(bytes.begin(), bytes.end());
  }
  *output = std::move(copied);
  return true;
}
'''
project(prefix+'AuxCliWire.h',[
 edit('Explicit bounded main ABI dependency','#include <cstddef>','#include <cstddef>\n#include <cstring>'),
 edit('One bounded SDK-only main argument conversion','using Nonce = std::array<uint8_t, 32>;','using Nonce = std::array<uint8_t, 32>;\n'+main_helper)])
project(prefix+'AuxCliWire.cc',[
 edit('Read validated text through bounded span iterators','    text.assign(reinterpret_cast<const char*>(bytes_.data()+offset_),size);offset_+=size;','    const auto value=bytes_.subspan(offset_,size);\n    text.assign(value.begin(),value.end());offset_+=size;')])
message='''struct Message {
 struct KernelStorage {
  Request request{};
  std::array<uint8_t,sizeof(mach_msg_audit_trailer_t)+64> tail{};
 };
 // The actual kernel receive destination owns the complete maximum frame and
 // trailer capacity. Typed header access never casts array::data into an object.
 alignas(mach_msg_audit_trailer_t) std::array<KernelStorage,1> storage{};
 mutable std::array<mach_msg_audit_trailer_t,1> audit_cache{};
 mach_msg_header_t* Header(){return &storage.front().request.header;}
 size_t Capacity()const{return sizeof(storage);}
 bool received=false;
 ~Message(){if(received)mach_msg_destroy(Header());}
 const mach_msg_audit_trailer_t* Audit()const{
  const auto& header=storage.front().request.header;
  const auto offset=(static_cast<size_t>(header.msgh_size)+3)&~size_t{3};
  const auto bytes=std::as_bytes(std::span(storage));
  if(offset>bytes.size()-sizeof(mach_msg_audit_trailer_t))return nullptr;
  const auto trailer=bytes.subspan(offset,sizeof(mach_msg_audit_trailer_t));
  auto target=std::as_writable_bytes(std::span(audit_cache));
  std::copy(trailer.begin(),trailer.end(),target.begin());
  const auto& parsed=audit_cache.front();
  return parsed.msgh_trailer_type==MACH_MSG_TRAILER_FORMAT_0&&parsed.msgh_trailer_size==sizeof(parsed)?&parsed:nullptr;
 }
};
'''
send='''// A real typed stack message supplies its complete C ABI extent; there is no
// caller-provided pointer/length or msgh_size-based unbounded copy.
template<typename Wire>
std::span<const std::byte> NativeMessageBytes(const Wire& message){
 static_assert(offsetof(Wire,header)==0);
#pragma clang unsafe_buffer_usage begin
 const auto object=std::span<const Wire,1>(&message,1);
#pragma clang unsafe_buffer_usage end
 return std::as_bytes(object);
}
template<typename Wire>
bool Send(Wire& message,uint32_t timeout){
 auto* header=&message.header;
 const auto storage=NativeMessageBytes(message);
 const bool bounded=header->msgh_size>=sizeof(mach_msg_header_t)&&header->msgh_size<=storage.size();
 const auto status=bounded?mach_msg(header,MACH_SEND_MSG|MACH_SEND_TIMEOUT,header->msgh_size,0,MACH_PORT_NULL,timeout,MACH_PORT_NULL):MACH_SEND_INVALID_DATA;
 if(status==KERN_SUCCESS)return true;
 if(bounded&&(status==MACH_SEND_INVALID_DEST||status==MACH_SEND_TIMED_OUT||status==MACH_SEND_INTERRUPTED)){mach_msg_destroy(header);return false;}
 // Preserve actual post-call rights even for an unknown/invalid header size,
 // bounded by the real owning object's extent rather than trusting that field.
 const auto size=header->msgh_size<=storage.size()?header->msgh_size:storage.size();
 const auto bytes=storage.first(size);
 auto retained=std::make_unique<UnresolvedSend>();retained->bytes.reserve(bytes.size());
 for(const auto value:bytes)retained->bytes.push_back(std::to_integer<uint8_t>(value));
 if(header->msgh_id==kInvoke&&retained->bytes.size()>=offsetof(Request,payload)){
  auto payload=std::span(retained->bytes).subspan(offsetof(Request,payload));
  std::fill(payload.begin(),payload.end(),0);
 }
 std::lock_guard<std::mutex> lock(SendMutex());Sends().push_back(std::move(retained));return false;
}
template<typename Wire>
bool SendOnce(mach_port_t& right,Wire& message,uint32_t timeout){
 if(right==MACH_PORT_NULL)return false;auto& header=message.header;
 header.msgh_remote_port=right;right=MACH_PORT_NULL;
 header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE,0)|(header.msgh_bits&MACH_MSGH_BITS_COMPLEX);
 return Send(message,timeout);
}
'''
p=ROOT/(prefix+'AuxCliIngress.cc');s=p.read_text();a=s.index('struct Message {');b=s.index('bool Receive(',a);c=s.index('bool Send(mach_msg_header_t*');d=s.index('bool Nonzero(',c)
edits=[edit('Kernel receive owns typed maximum storage and copies bounded audit bytes',s[a:b],message),edit('Kernel receives the real complete owned capacity','message.bytes.size(),port,timeout','message.Capacity(),port,timeout'),edit('Send/retention keeps actual typed message ownership and extent',s[c:d],send)]
for old,new in [('SendOnce(state_->reply.value,&response.header,kHandshake)','SendOnce(state_->reply.value,response,kHandshake)'),('SendOnce(reply,&response.header,kHandshake)','SendOnce(reply,response,kHandshake)'),('Send(&hello.header,kHandshake)','Send(hello,kHandshake)'),('Send(&request.header,kHandshake)','Send(request,kHandshake)'),('Send(&control.header,kHandshake)','Send(control,kHandshake)')]:edits.append(edit('Typed native message handoff '+old,old,new))
edits.append(edit('No raw argv traversal after the actual main ABI conversion',' Arguments arguments;for(int i=1;i<argc;++i){if(!argv[i]||strnlen(argv[i],kArgumentBytes+1)>kArgumentBytes)return 64;arguments.argv.emplace_back(argv[i]);}',' Arguments arguments;if(!CopyNativeMainArguments(argc,argv,&arguments.argv))return 64;'))
project(prefix+'AuxCliIngress.cc',edits)
match='''bool SameCapturedHash(CFDataRef captured,std::span<const uint8_t> expected){
 if(!captured||expected.empty()||expected.size()>32||
    CFDataGetLength(captured)!=static_cast<CFIndex>(expected.size()))return false;
 std::array<uint8_t,32> copied{};
 // CoreFoundation owns the input and guarantees the validated range; this
 // fixed destination is larger than the exact already-checked hash length.
 CFDataGetBytes(captured,CFRangeMake(0,expected.size()),copied.data());
 return std::ranges::equal(std::span(copied).first(expected.size()),expected);
}
'''
project(prefix+'AuxCliSealedImages.cc',[
 edit('Bounded range algorithms and spans only, SDK-compatible','#include <optional>','#include <optional>\n#include <algorithm>\n#include <span>\n#include <string_view>'),
 edit('Compare exact CF-owned code hashes by copied bounded ranges','bool ValidateGuest(audit_token_t token,SecRequirementRef requirement,const std::vector<uint8_t>& hash){',match+'bool ValidateGuest(audit_token_t token,SecRequirementRef requirement,const std::vector<uint8_t>& hash){'),
 edit('No unsafe raw hash memcmp at peer validation','  return unique&&CFDataGetLength(unique)==static_cast<CFIndex>(hash.size())&&std::memcmp(CFDataGetBytePtr(unique),hash.data(),hash.size())==0;','  return SameCapturedHash(unique,hash);'),
 edit('Hex digit lookup uses bounded string_view','constexpr char hex[]="0123456789abcdef";','constexpr std::string_view hex="0123456789abcdef";'),
 edit('No unsafe raw hash memcmp at current image validation','return unique&&CFDataGetLength(unique)==static_cast<CFIndex>(data_->own.cd_hash.size())&&std::memcmp(CFDataGetBytePtr(unique),data_->own.cd_hash.data(),data_->own.cd_hash.size())==0;','return SameCapturedHash(unique,data_->own.cd_hash);'),
 edit('Read only the remaining owned resource span','while(offset<bytes.size()){const auto count=pread(entry,bytes.data()+offset,bytes.size()-offset,offset);if(count<0&&errno==EINTR)continue;if(count<=0)return false;offset+=count;}','while(offset<bytes.size()){auto remaining=std::span(bytes).subspan(offset);const auto count=pread(entry,remaining.data(),remaining.size(),offset);if(count<0&&errno==EINTR)continue;if(count<=0||static_cast<size_t>(count)>remaining.size())return false;offset+=static_cast<size_t>(count);}'),
 edit('Classify fixed entry prefix with bounded ranges','constexpr char prefix[]="#!/usr/bin/env node\\n/* aux-owned-cli-entry-v1 */\\n";\n  if(bytes.size()<sizeof(prefix)-1||std::memcmp(bytes.data(),prefix,sizeof(prefix)-1)!=0)return false;','constexpr std::string_view prefix="#!/usr/bin/env node\\n/* aux-owned-cli-entry-v1 */\\n";\n  if(bytes.size()<prefix.size()||!std::ranges::equal(std::span(bytes).first(prefix.size()),prefix))return false;')])
project(prefix+'packaged-identity-admission.h',[
 edit('Owned marker remainder spans require only the standard library','#include <string_view>','#include <string_view>\n#include <span>'),
 edit('Foundation gets the exact checked JSON key slice','''          NSData* encoded_key = [NSData dataWithBytes:json.data() + start
                                               length:index - start + 1];''','''          const auto key_view = json.substr(start, index - start + 1);
          NSData* encoded_key = [NSData dataWithBytes:key_view.data()
                                               length:key_view.size()];'''),
 edit('Read only the remaining owned immutable marker buffer','''    const ssize_t size = read(fd.value, bytes.data() + offset, bytes.size() - offset);''','''    auto remaining = std::span(bytes).subspan(offset);
    const ssize_t size = read(fd.value, remaining.data(), remaining.size());'''),
 edit('Reject impossible libc byte count before advancing owned offset','''    if (size <= 0) return false;
    offset += static_cast<size_t>(size);''','''    if (size <= 0 || static_cast<size_t>(size) > remaining.size()) return false;
    offset += static_cast<size_t>(size);''')])
p=ROOT/(prefix+'AuxNativeCliFrontend.mm');s=p.read_text();edits=[edit('Length-aware SDK-only stream diagnostics','#include <cstdio>','#include <cstdio>\n#include <iostream>\n#include <string_view>'),edit('One bounded actual C main argument conversion',''' if(argc<1||argc>257||!argv)return 64;
 for(int i=1;i<argc;++i){if(!argv[i]||strnlen(argv[i],8193)>8192)return 64;arguments.emplace_back(argv[i]);}''',''' if(!aux::cli::CopyNativeMainArguments(argc,argv,&arguments))return 64;''')]
import re
for statement in sorted(set(re.findall(r'std::fputs\("(?:[^"\\]|\\.)*",(?:stdout|stderr)\)',s))):
 text,stream=statement.removeprefix('std::fputs(').removesuffix(')').rsplit(',',1)
 replacement=('std::cout'if stream=='stdout'else'std::cerr')+' << std::string_view('+text+')'
 # The same immutable error literal occurs twice; preserve an exact declared
 # occurrence count rather than pretending its repeated anchor is unique.
 count=s.count(statement);item=edit('Bounded literal stream output '+stream,statement,replacement);item['count']=count;edits.append(item)
# Repeat literals need an explicit counted edit, unlike the single-match rows.
original=(ROOT/(prefix+'AuxNativeCliFrontend.mm')).read_bytes();text=original.decode()
for e in edits:assert text.count(e['find'])==e['count'];text=text.replace(e['find'],e['replace'])
before=HERE/'before'/prefix/'AuxNativeCliFrontend.mm';before.parent.mkdir(parents=True,exist_ok=True);before.write_bytes(original)
target=HERE/'source'/prefix/'AuxNativeCliFrontend.mm';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
rows.append({'path':prefix+'AuxNativeCliFrontend.mm','inputSha256':sha(original),'outputSha256':sha(text.encode()),'source':str(target),'beforeImage':str(before),'anchors':edits})
log=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/native-cli-product-link-20261024-a1/stdout')
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.cli-native-product.buffer-fix.v1','files':rows,'actualProductCompilerLog':str(log),'actualProductCompilerLogSha256':sha(log.read_bytes()),'actualNativeMutation':False,'compilerRun':False,'unsafeChecksDisabled':False,'newBaseDependency':False,'runtimeAcceptance':False},indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff(Path(r['beforeImage']).read_text().splitlines(True),Path(r['source']).read_text().splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path']))for r in rows)
(HERE/'native.patch').write_text(patch)
print(json.dumps({'files':len(rows),'countedMatches':sum(sum(a['count']for a in r['anchors'])for r in rows),'actualNativeMutation':False,'compilerRun':False,'unsafeChecksDisabled':False}))
