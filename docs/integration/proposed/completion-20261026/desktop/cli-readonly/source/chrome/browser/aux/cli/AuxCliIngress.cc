#include "AuxCliIngress.h"
#include <Security/SecRandom.h>
#include <bsm/libbsm.h>
#include <servers/bootstrap.h>
#include <sys/fileport.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <signal.h>
#include <algorithm>
#include <array>
#include <cstring>
#include <cstdlib>
#include <mutex>
#include <vector>
#include <atomic>
#include <limits>
#include <cstdio>
namespace aux::cli {
namespace {
const pid_t kIngressProcess=getpid();
constexpr mach_msg_id_t kHello=0x41584348,kHelloReply=0x41584349,kSignal=0x41584353;
constexpr uint32_t kHandshake=2000,kInvokeWait=5000;
struct Hello{mach_msg_header_t header{};uint32_t version=kVersion;Nonce nonce{};};
struct HelloReply{mach_msg_header_t header{};mach_msg_body_t body{};mach_msg_port_descriptor_t invocation{};uint32_t version=kVersion;Nonce nonce{};};
struct Signal{mach_msg_header_t header{};uint32_t version=kVersion;int32_t signal=0;Nonce nonce{};};
struct Right{
 mach_port_t value=MACH_PORT_NULL;const pid_t process=getpid();bool receiver=false;
 Right()=default;explicit Right(bool receive):receiver(receive){}
 ~Right(){Reset();}Right(const Right&)=delete;Right&operator=(const Right&)=delete;
 Right(Right&& other)noexcept:value(other.value),receiver(other.receiver){other.value=MACH_PORT_NULL;}
 Right&operator=(Right&& other)noexcept{if(this!=&other){Reset();value=other.value;receiver=other.receiver;other.value=MACH_PORT_NULL;}return *this;}
 void Reset(){if(value!=MACH_PORT_NULL&&getpid()==process){if(receiver)mach_port_mod_refs(mach_task_self(),value,MACH_PORT_RIGHT_RECEIVE,-1);else mach_port_deallocate(mach_task_self(),value);}value=MACH_PORT_NULL;}
 bool Create(){return receiver&&value==MACH_PORT_NULL&&mach_port_allocate(mach_task_self(),MACH_PORT_RIGHT_RECEIVE,&value)==KERN_SUCCESS;}
};
struct File{
 int value=-1;File()=default;~File(){if(value>=0)close(value);}File(const File&)=delete;File&operator=(const File&)=delete;
 File(File&& other)noexcept:value(other.value){other.value=-1;}File&operator=(File&& other)noexcept{if(this!=&other){if(value>=0)close(value);value=other.value;other.value=-1;}return *this;}
};
static_assert(sizeof(ReadOnlyRequest)<=sizeof(Request));
static_assert(sizeof(ReadOnlyCompletion)<=sizeof(Request));
struct Message {
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
bool Receive(mach_port_t port,uint32_t timeout,Message& message){
 const auto status=mach_msg(message.Header(),MACH_RCV_MSG|MACH_RCV_TIMEOUT|MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0)|MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT),0,message.Capacity(),port,timeout,MACH_PORT_NULL);
 message.received=status==KERN_SUCCESS;return message.received;
}
// An unknown send error cannot be treated as a clean rights transfer. Retain
// its actual post-call message, rather than destroy an assumed representation.
struct UnresolvedSend{std::vector<uint8_t> bytes;};
std::mutex& SendMutex(){static auto* mutex=new std::mutex;return *mutex;}
std::vector<std::unique_ptr<UnresolvedSend>>& Sends(){static auto* values=new std::vector<std::unique_ptr<UnresolvedSend>>;return *values;}
// A real typed stack message supplies its complete C ABI extent; there is no
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
bool Nonzero(const Nonce& n){return std::any_of(n.begin(),n.end(),[](auto b){return b!=0;});}
bool FileShape(int descriptor,size_t role){struct stat metadata{};const int flags=fcntl(descriptor,F_GETFL);
 if(flags<0||fstat(descriptor,&metadata)!=0)return false;
 if(role==0)return S_ISDIR(metadata.st_mode);
 if(!(S_ISREG(metadata.st_mode)||S_ISCHR(metadata.st_mode)||S_ISFIFO(metadata.st_mode)||S_ISSOCK(metadata.st_mode)))return false;
 const int mode=flags&O_ACCMODE;return role==1?mode!=O_WRONLY:mode!=O_RDONLY;
}
volatile sig_atomic_t signals=0;
void SignalHandler(int sig){if(sig==SIGINT)signals=signals|1;else if(sig==SIGTERM)signals=signals|2;else if(sig==SIGHUP)signals=signals|4;else if(sig==SIGWINCH)signals=signals|8;}
class SignalScope{
 public:SignalScope(){sigset_t mask;sigfillset(&mask);struct sigaction next{};next.sa_handler=SignalHandler;next.sa_mask=mask;signals=0;for(size_t i=0;i<names.size();++i){if(sigaction(names[i],&next,&previous[i])!=0){valid=false;break;}installed++;}}
 ~SignalScope(){for(size_t i=0;i<installed;++i)sigaction(names[i],&previous[i],nullptr);}
 bool valid=true;
 private:const std::array<int,4> names{SIGINT,SIGTERM,SIGHUP,SIGWINCH};std::array<struct sigaction,4> previous{};size_t installed=0;
};
}
struct Invocation::State{
 const pid_t process=getpid();std::shared_ptr<const SealedImages> images;PeerBirth birth;audit_token_t token{};Nonce nonce{};
 Right receiver{true},reply;std::array<File,4> files;Arguments arguments;bool completed=false,read_only_query=false;
};
Invocation::Invocation(std::unique_ptr<State> state):state_(std::move(state)){}
Invocation::~Invocation()=default;
audit_token_t Invocation::KernelPeerForNativeAdmission()const{return state_->token;}
bool Invocation::Current()const{return getpid()==state_->process&&!state_->completed&&state_->images->SameCli(state_->token,state_->birth);}
bool Invocation::IsReadOnlyQuery()const{return state_->read_only_query;}
const Arguments& Invocation::arguments()const{return state_->arguments;}
int Invocation::directory()const{return state_->files[0].value;}int Invocation::input()const{return state_->files[1].value;}int Invocation::output()const{return state_->files[2].value;}int Invocation::error()const{return state_->files[3].value;}
int Invocation::PollSignal(uint32_t timeout){
 if(!Current())return 0;Message received;if(!Receive(state_->receiver.value,timeout,received))return 0;
 const auto* header=received.Header();const auto* audit=received.Audit();
 if(!audit||header->msgh_id!=kSignal||header->msgh_size!=sizeof(Signal)||(header->msgh_bits&MACH_MSGH_BITS_COMPLEX)||header->msgh_remote_port!=MACH_PORT_NULL||!state_->images->SameCli(audit->msgh_audit,state_->birth))return 0;
 const auto* signal=reinterpret_cast<const Signal*>(header);
 return signal->version==kVersion&&signal->nonce==state_->nonce&&(signal->signal==SIGINT||signal->signal==SIGTERM||signal->signal==SIGHUP||signal->signal==SIGWINCH)?signal->signal:0;
}
bool Invocation::CompleteAfterObservedExit(int code){
 if(!Current()||code<0||code>255)return false;Completion response;response.header.msgh_size=sizeof(response);response.header.msgh_id=kCompleted;response.nonce=state_->nonce;response.exit_code=code;
 state_->completed=true;return SendOnce(state_->reply.value,response,kHandshake);
}
// Only NativeOpenOperation/Service may publish this narrow native action result.
// Exit zero means a genuine native tab/navigation start, never page-load success.
bool Invocation::CompleteAfterNativeOpenResult(int code){return CompleteAfterObservedExit(code);}
bool Invocation::CompleteReadOnlyQuery(std::string_view json,int code){
 if(!Current()||!state_->read_only_query||json.empty()||json.size()>kPayloadLimit||code<0||code>255)return false;
 ReadOnlyCompletion response;response.header.msgh_size=ReadOnlyCompletionBytes(json.size());response.header.msgh_id=kReadOnlyResult;response.nonce=state_->nonce;response.exit_code=code;response.payload_bytes=json.size();
 std::copy(json.begin(),json.end(),response.payload.begin());state_->completed=true;
 return SendOnce(state_->reply.value,response,kHandshake);
}
struct Ingress::State{const pid_t process=getpid();std::atomic_bool closing{false};std::shared_ptr<const SealedImages> images;Right service{true};};
Ingress::Ingress(std::shared_ptr<State> state):state_(std::move(state)){}
Ingress::~Ingress(){CloseAdmission();}
void Ingress::CloseAdmission(){if(getpid()==state_->process)state_->closing.store(true);}
bool Ingress::AdmissionClosed()const{return getpid()!=state_->process||state_->closing.load();}
std::unique_ptr<Ingress> Ingress::CreateForActualBrowser(){
 auto state=std::make_shared<State>();state->images=SealedImages::ForCurrentBrowser();
 if(!state->images||!state->service.Create()||mach_port_insert_right(mach_task_self(),state->service.value,state->service.value,MACH_MSG_TYPE_MAKE_SEND)!=KERN_SUCCESS)return{};
 Right send;send.value=state->service.value;
 if(!state->images->RevalidateSelf())return{};
 // A dynamic private service has no installed launchd declaration. check_in
 // would require unrelated installation and is not an equivalent replacement.
 // Keep this one real checked registration; do not suppress other diagnostics.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
 const auto registered=bootstrap_register(bootstrap_port,
     const_cast<char*>(state->images->service().c_str()),send.value);
#pragma clang diagnostic pop
 if(registered!=KERN_SUCCESS||!state->images->RevalidateSelf())return{};
 return std::unique_ptr<Ingress>(new Ingress(std::move(state)));
}
std::unique_ptr<Invocation> Ingress::ReceiveOne(uint32_t timeout){
 auto state=state_;
 if(state->closing.load()||getpid()!=state->process||!state->images->RevalidateSelf())return{};Message received;
 if(!Receive(state->service.value,timeout,received))return{};const auto* audit=received.Audit();const auto* header=received.Header();
 if(!audit||header->msgh_id!=kHello||header->msgh_size!=sizeof(Hello)||(header->msgh_bits&MACH_MSGH_BITS_COMPLEX)||MACH_MSGH_BITS_REMOTE(header->msgh_bits)!=MACH_MSG_TYPE_PORT_SEND_ONCE)return{};
 const auto* hello=reinterpret_cast<const Hello*>(header);if(hello->version!=kVersion||!Nonzero(hello->nonce))return{};
 auto invocation=std::make_unique<Invocation::State>();invocation->images=state->images;invocation->token=audit->msgh_audit;invocation->nonce=hello->nonce;
 if(!invocation->images->CaptureCli(invocation->token,&invocation->birth)||!invocation->receiver.Create())return{};
 HelloReply response;response.header.msgh_bits=MACH_MSGH_BITS_COMPLEX;response.header.msgh_id=kHelloReply;response.header.msgh_size=sizeof(response);response.body.msgh_descriptor_count=1;
 response.invocation.name=invocation->receiver.value;response.invocation.disposition=MACH_MSG_TYPE_MAKE_SEND;response.invocation.type=MACH_MSG_PORT_DESCRIPTOR;response.nonce=invocation->nonce;
 auto reply=received.Header()->msgh_remote_port;received.Header()->msgh_remote_port=MACH_PORT_NULL;
 if(!SendOnce(reply,response,kHandshake))return{};
 Message request;if(!Receive(invocation->receiver.value,kInvokeWait,request))return{};const auto* request_audit=request.Audit();
 if(request.Header()->msgh_id==kReadOnlyQuery){
  const auto* query=reinterpret_cast<const ReadOnlyRequest*>(request.Header());
  if(!request_audit||(query->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||query->version!=kVersion||query->nonce!=invocation->nonce||query->payload_bytes>kPayloadLimit||query->header.msgh_size!=ReadOnlyRequestBytes(query->payload_bytes)||MACH_MSGH_BITS_REMOTE(query->header.msgh_bits)!=MACH_MSG_TYPE_PORT_SEND_ONCE||!invocation->images->SameCli(request_audit->msgh_audit,invocation->birth))return{};
  if(!Decode(std::span(query->payload).first(query->payload_bytes),&invocation->arguments)||!invocation->arguments.environment.empty()||state->closing.load())return{};
  invocation->read_only_query=true;invocation->reply.value=request.Header()->msgh_remote_port;request.Header()->msgh_remote_port=MACH_PORT_NULL;
  return std::unique_ptr<Invocation>(new Invocation(std::move(invocation)));
 }
 auto* message=reinterpret_cast<Request*>(request.Header());
 if(!request_audit||message->header.msgh_id!=kInvoke||!(message->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||message->body.msgh_descriptor_count!=4||message->version!=kVersion||message->nonce!=invocation->nonce||message->payload_bytes>kPayloadLimit||message->header.msgh_size!=RequestBytes(message->payload_bytes)||MACH_MSGH_BITS_REMOTE(message->header.msgh_bits)!=MACH_MSG_TYPE_PORT_SEND_ONCE||!invocation->images->SameCli(request_audit->msgh_audit,invocation->birth))return{};
 if(!Decode(std::span(message->payload.data(),message->payload_bytes),&invocation->arguments))return{};
 for(size_t i=0;i<4;++i){const auto& port=message->files[i];if(port.type!=MACH_MSG_PORT_DESCRIPTOR||port.disposition!=MACH_MSG_TYPE_PORT_SEND||port.name==MACH_PORT_NULL)return{};
  const int received_fd=fileport_makefd(port.name);if(received_fd<0)return{};const int copied=fcntl(received_fd,F_DUPFD_CLOEXEC,64);close(received_fd);if(copied<0)return{};invocation->files[i].value=copied;if(!FileShape(copied,i))return{};
 }
 if(state->closing.load()||!invocation->images->SameCli(request_audit->msgh_audit,invocation->birth))return{};
 invocation->reply.value=request.Header()->msgh_remote_port;request.Header()->msgh_remote_port=MACH_PORT_NULL;
 return std::unique_ptr<Invocation>(new Invocation(std::move(invocation)));
}
size_t Ingress::UnresolvedSendRights(){if(getpid()!=kIngressProcess)return std::numeric_limits<size_t>::max();std::lock_guard<std::mutex> lock(SendMutex());return Sends().size();}
namespace {
enum class TerminalKind { native_open, read_only_query };
int ForwardTerminal(int argc,char* argv[],TerminalKind kind){
 if(argc<1||argc>static_cast<int>(kArgumentLimit+1)||!argv)return 64;
 auto images=SealedImages::ForCurrentCli();if(!images)return 78;Right public_endpoint;
 if(bootstrap_look_up(bootstrap_port,images->service().c_str(),&public_endpoint.value)!=KERN_SUCCESS)return 69;
 Right hello_reply{true};if(!hello_reply.Create())return 78;Hello hello;
 if(SecRandomCopyBytes(kSecRandomDefault,hello.nonce.size(),hello.nonce.data())!=errSecSuccess)return 78;
 hello.header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,MACH_MSG_TYPE_MAKE_SEND_ONCE);hello.header.msgh_id=kHello;hello.header.msgh_size=sizeof(hello);hello.header.msgh_remote_port=public_endpoint.value;hello.header.msgh_local_port=hello_reply.value;
 if(!Send(hello,kHandshake))return 75;Message response;if(!Receive(hello_reply.value,kHandshake,response))return 75;
 const auto* audit=response.Audit();auto* reply=reinterpret_cast<HelloReply*>(response.Header());PeerBirth browser;
 if(!audit||reply->header.msgh_id!=kHelloReply||reply->header.msgh_size!=sizeof(*reply)||!(reply->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||reply->body.msgh_descriptor_count!=1||reply->version!=kVersion||reply->nonce!=hello.nonce||reply->invocation.type!=MACH_MSG_PORT_DESCRIPTOR||reply->invocation.disposition!=MACH_MSG_TYPE_PORT_SEND||reply->invocation.name==MACH_PORT_NULL||!images->CaptureBrowser(audit->msgh_audit,&browser))return 78;
 const audit_token_t browser_token=audit->msgh_audit;Right endpoint;endpoint.value=reply->invocation.name;reply->invocation.name=MACH_PORT_NULL;
 // No credentials, stdio or directory capability crosses the public locator.
 Arguments arguments;if(!CopyNativeMainArguments(argc,argv,&arguments.argv))return 64;
 // Native open needs no caller environment or provider/authentication tokens.
 std::vector<uint8_t> payload;if(!Encode(arguments,&payload))return 64;
 Request request;request.nonce=hello.nonce;request.payload_bytes=payload.size();std::copy(payload.begin(),payload.end(),request.payload.begin());
 std::array<Right,4> files;File directory;
 if(kind==TerminalKind::native_open){
  directory.value=open(".",O_RDONLY|O_DIRECTORY|O_CLOEXEC);if(directory.value<0)return 78;
  for(size_t i=0;i<4;++i){const int source=i==0?directory.value:static_cast<int>(i-1);if(!FileShape(source,i)||fileport_makeport(source,&files[i].value)!=0)return 78;request.files[i].name=files[i].value;request.files[i].disposition=MACH_MSG_TYPE_COPY_SEND;request.files[i].type=MACH_MSG_PORT_DESCRIPTOR;}
 }
 Right completion{true};if(!completion.Create()||!images->SameBrowser(browser_token,browser))return 78;SignalScope signal_scope;if(!signal_scope.valid)return 78;
 request.header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,MACH_MSG_TYPE_MAKE_SEND_ONCE)|MACH_MSGH_BITS_COMPLEX;request.header.msgh_size=RequestBytes(request.payload_bytes);request.header.msgh_id=kInvoke;request.header.msgh_remote_port=endpoint.value;request.header.msgh_local_port=completion.value;request.body.msgh_descriptor_count=4;
 if(kind==TerminalKind::read_only_query){
  ReadOnlyRequest query;query.nonce=hello.nonce;query.payload_bytes=payload.size();std::copy(payload.begin(),payload.end(),query.payload.begin());
  query.header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,MACH_MSG_TYPE_MAKE_SEND_ONCE);query.header.msgh_size=ReadOnlyRequestBytes(query.payload_bytes);query.header.msgh_id=kReadOnlyQuery;query.header.msgh_remote_port=endpoint.value;query.header.msgh_local_port=completion.value;
  if(!Send(query,kHandshake))return 75;
 }else if(!Send(request,kHandshake))return 75;
 // Clear transient option bytes, which can include an explicit CLI API token.
 std::fill(payload.begin(),payload.end(),0);std::fill(request.payload.begin(),request.payload.end(),0);
 for(;;){Message result;if(Receive(completion.value,250,result)){
  const auto* token=result.Audit();
  if(kind==TerminalKind::read_only_query){
   const auto* done=reinterpret_cast<const ReadOnlyCompletion*>(result.Header());
   if(!token||done->header.msgh_id!=kReadOnlyResult||(done->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||done->header.msgh_remote_port!=MACH_PORT_NULL||done->payload_bytes>kPayloadLimit||done->header.msgh_size!=ReadOnlyCompletionBytes(done->payload_bytes)||done->version!=kVersion||done->nonce!=hello.nonce||done->exit_code<0||done->exit_code>255||!images->SameBrowser(token->msgh_audit,browser))return 75;
   const auto json=std::span(done->payload).first(done->payload_bytes);
   if(json.empty()||fwrite(json.data(),1,json.size(),stdout)!=json.size()||fputc('\n',stdout)==EOF||fflush(stdout)!=0)return 74;
   return done->exit_code;
  }
  const auto* done=reinterpret_cast<const Completion*>(result.Header());
  if(!token||done->header.msgh_id!=kCompleted||done->header.msgh_size!=sizeof(*done)||(done->header.msgh_bits&MACH_MSGH_BITS_COMPLEX)||done->version!=kVersion||done->nonce!=hello.nonce||done->exit_code<0||done->exit_code>255||!images->SameBrowser(token->msgh_audit,browser))return 75;
  return done->exit_code;
 }
 if(!images->SameBrowser(browser_token,browser))return 75;
 sigset_t all,previous;sigfillset(&all);sigprocmask(SIG_BLOCK,&all,&previous);const auto pending=signals;signals=0;sigprocmask(SIG_SETMASK,&previous,nullptr);
 if(kind==TerminalKind::read_only_query&&(pending&7))return 130;
 for(const auto [bit,number]:std::array<std::pair<int,int>,4>{{{1,SIGINT},{2,SIGTERM},{4,SIGHUP},{8,SIGWINCH}}})if(pending&bit){Signal control;control.header.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND,0);control.header.msgh_remote_port=endpoint.value;control.header.msgh_id=kSignal;control.header.msgh_size=sizeof(control);control.signal=number;control.nonce=hello.nonce;if(!Send(control,kHandshake))return 75;}
 }
}
}  // namespace
int ForwardTerminalInvocation(int argc,char* argv[]){return ForwardTerminal(argc,argv,TerminalKind::native_open);}
int ForwardTerminalReadOnlyQuery(int argc,char* argv[]){return ForwardTerminal(argc,argv,TerminalKind::read_only_query);}
}
