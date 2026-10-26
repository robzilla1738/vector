from pathlib import Path
import difflib
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
PREVIOUS = HERE.parent / 'next-desktop/source'
CLI = 'chrome/browser/aux/cli/'
paths = [CLI + name for name in ['AuxCliOpenArguments.h', 'AuxCliOpenArguments.cc', 'AuxCliWire.h', 'AuxCliWire.cc', 'AuxCliIngress.h', 'AuxCliIngress.cc', 'AuxNativeCliFrontend.mm', 'AuxCliOpenCommand.mm']]
records, patch = [], []
for path in paths:
    predecessor = PREVIOUS / path
    source = predecessor if predecessor.exists() else ROOT / path
    original = source.read_text()
    text = original
    anchors = []
    def edit(name, before, after):
        global text
        if text.count(before) != 1:
            raise ValueError((name, text.count(before)))
        text = text.replace(before, after)
        anchors.append(dict(name=name, before=before, after=after, expectedCount=1))
    if path.endswith('AuxCliOpenArguments.h'):
        edit('finite read-only query parser types', '// Data parsing only.', '''enum class ReadOnlyQueryKind { list, resolve };
struct ReadOnlyQuery { ReadOnlyQueryKind kind; OpenArguments destination; };
std::optional<ReadOnlyQuery> ParseNativeReadOnlyQuery(std::span<const std::string>);
// Data parsing only.''')
    elif path.endswith('AuxCliOpenArguments.cc'):
        edit('owned argument list for resolve parser reuse', '#include <utility>', '#include <utility>\n#include <vector>')
        edit('parse only finite list and resolve commands', 'std::optional<std::string> EncodeNativeOpenEnvelope(', '''std::optional<ReadOnlyQuery> ParseNativeReadOnlyQuery(std::span<const std::string> args) {
  if (args.empty()) return std::nullopt;
  if (args.front() == "resolve") {
    std::vector<std::string> open(args.begin(), args.end());
    open.front() = "open";
    auto destination = ParseNativeOpenArguments(open);
    if (destination.status != OpenParseStatus::accepted || !HttpText(destination.url) ||
        !ProfileText(destination.profile) || !SpaceText(destination.space)) return std::nullopt;
    return ReadOnlyQuery{ReadOnlyQueryKind::resolve, std::move(destination)};
  }
  if (args.front() != "list") return std::nullopt;
  OpenArguments destination;
  if (args.size() == 3 && args[1] == "--profile") destination.profile = args[2];
  else if (args.size() == 2 && args[1].starts_with("--profile=")) destination.profile = args[1].substr(10);
  else if (args.size() != 1) return std::nullopt;
  if ((args.size() != 1 && destination.profile.empty()) || !ProfileText(destination.profile)) return std::nullopt;
  destination.status = OpenParseStatus::accepted;
  return ReadOnlyQuery{ReadOnlyQueryKind::list, std::move(destination)};
}
std::optional<std::string> EncodeNativeOpenEnvelope(''')
    elif path.endswith('AuxCliWire.h'):
        edit('distinct finite query message kinds', 'inline constexpr uint32_t kVersion = 1;', '''inline constexpr mach_msg_id_t kReadOnlyQuery = 0x41584354; // AXCT
inline constexpr mach_msg_id_t kReadOnlyResult = 0x41584355; // AXCU
inline constexpr uint32_t kVersion = 1;''')
        edit('query carries no file or environment capabilities', 'struct Arguments {', '''// Authenticated metadata only. No fileports, provider tokens or process role.
struct ReadOnlyRequest {
  mach_msg_header_t header{};
  uint32_t version = kVersion;
  uint32_t payload_bytes = 0;
  Nonce nonce{};
  std::array<uint8_t, kPayloadLimit> payload{};
};
struct ReadOnlyCompletion {
  mach_msg_header_t header{};
  uint32_t version = kVersion;
  int32_t exit_code = 78;
  Nonce nonce{};
  uint32_t payload_bytes = 0;
  std::array<uint8_t, kPayloadLimit> payload{};
};
size_t ReadOnlyRequestBytes(uint32_t);
size_t ReadOnlyCompletionBytes(uint32_t);
struct Arguments {''')
    elif path.endswith('AuxCliWire.cc'):
        edit('bounded typed query frame sizes', '''size_t RequestBytes(uint32_t payload_bytes) {''', '''size_t ReadOnlyRequestBytes(uint32_t size) {
  return size <= kPayloadLimit ? (offsetof(ReadOnlyRequest, payload) + size + 3) & ~size_t{3} : 0;
}
size_t ReadOnlyCompletionBytes(uint32_t size) {
  return size <= kPayloadLimit ? (offsetof(ReadOnlyCompletion, payload) + size + 3) & ~size_t{3} : 0;
}
size_t RequestBytes(uint32_t payload_bytes) {''')
    elif path.endswith('AuxCliIngress.h'):
        edit('read-only terminal API reuses the sealed handshake', 'int ForwardTerminalInvocation(int argc,char* argv[]);', 'int ForwardTerminalInvocation(int argc,char* argv[]);\nint ForwardTerminalReadOnlyQuery(int argc,char* argv[]);')
        edit('receiver distinguishes metadata from native execution', '  bool Current()const;', '  bool Current()const;\n  bool IsReadOnlyQuery()const;')
        edit('only existing native receiver completes metadata', '  bool CompleteAfterNativeOpenResult(int exit_code);', '  bool CompleteAfterNativeOpenResult(int exit_code);\n  bool CompleteReadOnlyQuery(std::string_view json, int exit_code);')
    elif path.endswith('AuxCliIngress.cc'):
        edit('explicit bounded terminal output', '#include <limits>', '#include <limits>\n#include <cstdio>')
        edit('typed query frames fit the existing owned receive storage', 'struct Message {', '''static_assert(sizeof(ReadOnlyRequest)<=sizeof(Request));
static_assert(sizeof(ReadOnlyCompletion)<=sizeof(Request));
struct Message {''')
        edit('retain query kind in actual invocation', 'Arguments arguments;bool completed=false;', 'Arguments arguments;bool completed=false,read_only_query=false;')
        edit('actual transport kind query', 'const Arguments& Invocation::arguments()const', 'bool Invocation::IsReadOnlyQuery()const{return state_->read_only_query;}\nconst Arguments& Invocation::arguments()const')
        edit('authenticated typed JSON completion', 'struct Ingress::State{', '''bool Invocation::CompleteReadOnlyQuery(std::string_view json,int code){
 if(!Current()||!state_->read_only_query||json.empty()||json.size()>kPayloadLimit||code<0||code>255)return false;
 ReadOnlyCompletion response;response.header.msgh_size=ReadOnlyCompletionBytes(json.size());response.header.msgh_id=kReadOnlyResult;response.nonce=state_->nonce;response.exit_code=code;response.payload_bytes=json.size();
 std::copy(json.begin(),json.end(),response.payload.begin());state_->completed=true;
 return SendOnce(state_->reply.value,response,kHandshake);
}
struct Ingress::State{''')
        edit('private query receive branch accepts no capabilities', ''' Message request;if(!Receive(invocation->receiver.value,kInvokeWait,request))return{};const auto* request_audit=request.Audit();auto* message=reinterpret_cast<Request*>(request.Header());''', ''' Message request;if(!Receive(invocation->receiver.value,kInvokeWait,request))return{};const auto* request_audit=request.Audit();
 if(request.Header()->msgh_id==kReadOnlyQuery){
  const auto* query=reinterpret_cast<const ReadOnlyRequest*>(request.Header());
  if(!request_audit||(query->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||query->version!=kVersion||query->nonce!=invocation->nonce||query->payload_bytes>kPayloadLimit||query->header.msgh_size!=ReadOnlyRequestBytes(query->payload_bytes)||MACH_MSGH_BITS_REMOTE(query->header.msgh_bits)!=MACH_MSG_TYPE_PORT_SEND_ONCE||!invocation->images->SameCli(request_audit->msgh_audit,invocation->birth))return{};
  if(!Decode(std::span(query->payload).first(query->payload_bytes),&invocation->arguments)||!invocation->arguments.environment.empty()||state->closing.load())return{};
  invocation->read_only_query=true;invocation->reply.value=request.Header()->msgh_remote_port;request.Header()->msgh_remote_port=MACH_PORT_NULL;
  return std::unique_ptr<Invocation>(new Invocation(std::move(invocation)));
 }
 auto* message=reinterpret_cast<Request*>(request.Header());''')
        edit('one sealed client implementation with explicit finite kind', 'int ForwardTerminalInvocation(int argc,char* argv[]){', '''namespace {
enum class TerminalKind { native_open, read_only_query };
int ForwardTerminal(int argc,char* argv[],TerminalKind kind){''')
        edit('query grants no cwd or standard stream fileports', ''' std::array<Right,4> files;File directory;directory.value=open(".",O_RDONLY|O_DIRECTORY|O_CLOEXEC);if(directory.value<0)return 78;
 for(size_t i=0;i<4;++i){const int source=i==0?directory.value:static_cast<int>(i-1);if(!FileShape(source,i)||fileport_makeport(source,&files[i].value)!=0)return 78;request.files[i].name=files[i].value;request.files[i].disposition=MACH_MSG_TYPE_COPY_SEND;request.files[i].type=MACH_MSG_PORT_DESCRIPTOR;}''', ''' std::array<Right,4> files;File directory;
 if(kind==TerminalKind::native_open){
  directory.value=open(".",O_RDONLY|O_DIRECTORY|O_CLOEXEC);if(directory.value<0)return 78;
  for(size_t i=0;i<4;++i){const int source=i==0?directory.value:static_cast<int>(i-1);if(!FileShape(source,i)||fileport_makeport(source,&files[i].value)!=0)return 78;request.files[i].name=files[i].value;request.files[i].disposition=MACH_MSG_TYPE_COPY_SEND;request.files[i].type=MACH_MSG_PORT_DESCRIPTOR;}
 }''')
        edit('send query payload through actual private capability', ''' if(!Send(request,kHandshake))return 75;
 // Clear transient''', ''' if(kind==TerminalKind::read_only_query){
  ReadOnlyRequest query;query.nonce=hello.nonce;query.payload_bytes=payload.size();std::copy(payload.begin(),payload.end(),query.payload.begin());
  query.header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,MACH_MSG_TYPE_MAKE_SEND_ONCE);query.header.msgh_size=ReadOnlyRequestBytes(query.payload_bytes);query.header.msgh_id=kReadOnlyQuery;query.header.msgh_remote_port=endpoint.value;query.header.msgh_local_port=completion.value;
  if(!Send(query,kHandshake))return 75;
 }else if(!Send(request,kHandshake))return 75;
 // Clear transient''')
        edit('authenticate bounded JSON reply before printing', '''  const auto* token=result.Audit();const auto* done=reinterpret_cast<const Completion*>(result.Header());''', '''  const auto* token=result.Audit();
  if(kind==TerminalKind::read_only_query){
   const auto* done=reinterpret_cast<const ReadOnlyCompletion*>(result.Header());
   if(!token||done->header.msgh_id!=kReadOnlyResult||(done->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||done->header.msgh_remote_port!=MACH_PORT_NULL||done->payload_bytes>kPayloadLimit||done->header.msgh_size!=ReadOnlyCompletionBytes(done->payload_bytes)||done->version!=kVersion||done->nonce!=hello.nonce||done->exit_code<0||done->exit_code>255||!images->SameBrowser(token->msgh_audit,browser))return 75;
   const auto json=std::span(done->payload).first(done->payload_bytes);
   if(json.empty()||fwrite(json.data(),1,json.size(),stdout)!=json.size()||fputc('\\n',stdout)==EOF||fflush(stdout)!=0)return 74;
   return done->exit_code;
  }
  const auto* done=reinterpret_cast<const Completion*>(result.Header());''')
        edit('terminal query cancellation never requests execution', ''' for(const auto [bit,number]:std::array<std::pair<int,int>,4>''', ''' if(kind==TerminalKind::read_only_query&&(pending&7))return 130;
 for(const auto [bit,number]:std::array<std::pair<int,int>,4>''')
        # The original tail closes the loop, implementation and namespace.
        before=''' }
}
}
'''
        if not text.endswith(before):raise ValueError('unexpected ingress tail')
        after=''' }
}
}  // namespace
int ForwardTerminalInvocation(int argc,char* argv[]){return ForwardTerminal(argc,argv,TerminalKind::native_open);}
int ForwardTerminalReadOnlyQuery(int argc,char* argv[]){return ForwardTerminal(argc,argv,TerminalKind::read_only_query);}
}
'''
        text=text[:-len(before)]+after
        anchors.append(dict(name='finite public wrappers preserve original native forwarding',before=before,after=after,expectedCount=1,atEnd=True))
    elif path.endswith('AuxNativeCliFrontend.mm'):
        edit('metadata commands use the authenticated response transport', ' const auto parsed=aux::cli::ParseNativeOpenArguments(arguments);', ''' if(!arguments.empty()&&(arguments.front()=="list"||arguments.front()=="resolve")){
  if(arguments.size()==2&&arguments[1]=="--help"){
   std::cout << "Usage: aux list [--profile <ID or unique name>]\\n"
                "       aux resolve <https://URL> [--profile <ID or unique name> [--space <ID or unique name>]]\\n";return 0;
  }
  if(!aux::cli::ParseNativeReadOnlyQuery(arguments)){
   std::cerr << "Invalid Aux list/resolve arguments; use --help.\\n";return 64;
  }
  const int status=aux::cli::ForwardTerminalReadOnlyQuery(argc,argv);
  if(status)std::cerr << "Aux metadata query failed (exit " << status << "). If no JSON result was returned, open the matching Aux app through its supported launcher and retry.\\n";
  return status;
 }
 const auto parsed=aux::cli::ParseNativeOpenArguments(arguments);''')
    else:
        edit('ordinary receiver selection is compile-time and explicit', '#include "AuxCliOpenArguments.h"', '#include "AuxCliOpenArguments.h"\n#include "chrome/browser/aux/ordinary_startup_build.h"\n#include "chrome/browser/aux/routing/routing_service.h"\n#include "base/json/json_writer.h"')
        edit('metadata queries cannot enter the retained native operation', '''          }else NativeOpenOperation::Begin(std::move(*actual));''', '''          }else if(*actual&&(*actual)->IsReadOnlyQuery())service->ReadOnlyQuery(std::move(*actual));
#if defined(AUX_BROWSER_ONLY_NATIVE_STARTUP) && AUX_BROWSER_ONLY_NATIVE_STARTUP
          else if(*actual)(*actual)->CompleteAfterNativeOpenResult(64);
#else
          else NativeOpenOperation::Begin(std::move(*actual));
#endif''')
        edit('terminal typed refusal when queue or admission closes', 'if(closing_.load() || queued_.load()>=kPendingLimit)invocation->CompleteAfterNativeOpenResult(78);', 'if(closing_.load() || queued_.load()>=kPendingLimit)Refuse(invocation.get(),78);')
        edit('terminal typed refusal for a queued request after shutdown', 'if(*actual)(*actual)->CompleteAfterNativeOpenResult(78);', 'if(*actual)Refuse(actual->get(),78);')
        edit('terminal typed refusal for failed UI post', 'if(*delivery)(*delivery)->CompleteAfterNativeOpenResult(78);', 'if(*delivery)Refuse(delivery->get(),78);')
        edit('finite UI receiver uses actual admitted profile and existing resolver', '''  void ReceiveNext(){''', '''  static void Refuse(Invocation* invocation,int code){
    if(invocation->IsReadOnlyQuery())invocation->CompleteReadOnlyQuery(R"({"ok":false,"error":"query-unavailable"})",code);
    else invocation->CompleteAfterNativeOpenResult(code);
  }
  void ReadOnlyQuery(std::unique_ptr<Invocation> invocation){
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    const auto parsed=ParseNativeReadOnlyQuery(invocation->arguments().argv);
    base::DictValue result;
    int code=0;
    auto window=SelectActualWindow({});
    auto profile=window?window->GetProfile()->GetWeakPtr():base::WeakPtr<Profile>();
    const auto epoch=profile?aux::GetProfileCookieBindingEpoch(profile.get()):std::string();
    const auto generation=aux::peer::InspectNativeBrowserShutdown().admitted_generation;
    const auto current=[&](){
      return !closing_.load()&&!admission_closed&&ActualNativeReady()&&invocation->Current()&&
          window&&profile&&UsableWindow(window.get())&&window->GetProfile()==profile.get()&&
          !epoch.empty()&&aux::GetProfileCookieBindingEpoch(profile.get())==epoch&&
          !aux::IsProfileCookieRestorePending(profile.get())&&
          aux::peer::InspectNativeBrowserShutdown().admitted_generation==generation;
    };
    if(!parsed||!current()){
      result=base::DictValue().Set("ok",false).Set("error",parsed?"routing-authority-unavailable":"invalid-query");code=parsed?78:64;
    }else if(parsed->kind==ReadOnlyQueryKind::resolve){
      const auto& destination=parsed->destination;
      result=aux::routing::Resolve(profile.get(),{.url=GURL(destination.url),.profile=destination.profile,.space=destination.space,.authority=aux::routing::Authority::kExternal});
      if(!result.FindBool("ok").value_or(false))code=69;
    }else{
      auto state=aux::routing::GetState(profile.get());
      if(!state.FindBool("ok").value_or(false)){result=std::move(state);code=69;}
      else{
        auto* profiles=state.FindList("profiles");
        if(!parsed->destination.profile.empty()){
          const auto& selector=parsed->destination.profile;
          std::string selected;size_t matches=0;
          for(const auto& value:*profiles){
            const auto* id=value.GetDict().FindString("id");
            if(id&&*id==selector){selected=*id;matches=1;break;}
          }
          if(selected.empty())for(const auto& value:*profiles){
            const auto* id=value.GetDict().FindString("id");
            const auto* name=value.GetDict().FindString("name");
            if(id&&name&&*name==selector){selected=*id;++matches;}
          }
          if(matches!=1){result=base::DictValue().Set("ok",false).Set("error","profile-missing-or-ambiguous");code=69;}
          else profiles->EraseIf([&](const base::Value& value){const auto* id=value.GetDict().FindString("id");return !id||*id!=selected;});
        }
        if(!code)result=base::DictValue().Set("ok",true).Set("profiles",std::move(*profiles)).Set("spacesAreLoadedOnly",true);
      }
    }
    if(parsed&&!current()){result=base::DictValue().Set("ok",false).Set("error","query-owner-changed");code=78;}
    auto json=base::WriteJson(result);
    if(!json||json->size()>kPayloadLimit){json=R"({"ok":false,"error":"query-result-too-large"})";code=75;}
    invocation->CompleteReadOnlyQuery(*json,code);
  }
  void ReceiveNext(){''')
    output = HERE / 'source' / path
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text)
    records.append(dict(path=path, inputSource=str(source), inputSha256=hashlib.sha256(original.encode()).hexdigest(), outputSha256=hashlib.sha256(text.encode()).hexdigest(), anchors=anchors))
    patch.extend(difflib.unified_diff(original.splitlines(True), text.splitlines(True), fromfile='a/' + path, tofile='b/' + path))
(HERE / 'native.patch').write_text(''.join(patch))
(HERE / 'source-plan.json').write_text(json.dumps(dict(format='aux.native.counted-projection.v1',nativeRoot=str(ROOT),predecessor='46c5310c3 CLI Space source',files=records),indent=2)+'\n')
print(json.dumps([dict(path=r['path'],anchors=len(r['anchors'])) for r in records]))
