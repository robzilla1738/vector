from pathlib import Path
import re,subprocess,tempfile
root=Path(__file__).resolve().parent
source=(root/'source/AuxNativePeerTransport.cc').read_text()
wire=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/chrome/browser/aux/AuxNativePeerWire.h').read_text()
helper=re.search(r'ExchangeStatus ReadReplyFailure\([^}]+\}',source).group()
recover=re.search(r'inline bool RecoverableSendError\([^}]+\}',wire).group()
program='''#include <mach/mach.h>
#include <cassert>
#include <cstdio>
enum class ExchangeStatus { timedOut, refused };
namespace detail {\n'''+recover+'\n}\n'+helper+'''
int main(){
 mach_port_t receiver=0,reply=0; mach_msg_type_name_t kind=0;
 assert(mach_port_allocate(mach_task_self(),MACH_PORT_RIGHT_RECEIVE,&receiver)==KERN_SUCCESS);
 assert(mach_port_extract_right(mach_task_self(),receiver,MACH_MSG_TYPE_MAKE_SEND_ONCE,&reply,&kind)==KERN_SUCCESS);
 assert(mach_port_mod_refs(mach_task_self(),receiver,MACH_PORT_RIGHT_RECEIVE,-1)==KERN_SUCCESS);
 mach_msg_header_t message{};
 message.msgh_bits=MACH_MSGH_BITS(MACH_MSG_TYPE_MOVE_SEND_ONCE,0);
 message.msgh_size=sizeof(message); message.msgh_remote_port=reply;
 auto result=mach_msg(&message,MACH_SEND_MSG|MACH_SEND_TIMEOUT,sizeof(message),0,MACH_PORT_NULL,0,MACH_PORT_NULL);
 // macOS silently consumes a dead send-once reply; no authority is granted.
 assert(result==KERN_SUCCESS);
 assert(ReadReplyFailure(MACH_SEND_INVALID_DEST)==ExchangeStatus::timedOut);
 assert(ReadReplyFailure(MACH_SEND_TIMED_OUT)==ExchangeStatus::timedOut);
 assert(ReadReplyFailure(MACH_SEND_INTERRUPTED)==ExchangeStatus::timedOut);
 assert(ReadReplyFailure(MACH_SEND_INVALID_RIGHT)==ExchangeStatus::refused);
}
'''
assert source.count('return ReadReplyFailure(result);')==1
assert source.count('header->msgh_id == kRequest ? ReadReplyFailure(result)')==1
assert re.search(r'\+\+state->snapshot.rejected_peer_identities;.*?return ExchangeStatus::refused;',source,re.S)
with tempfile.TemporaryDirectory(prefix='aux-peer-canceled-reply-') as d:
 path=Path(d);(path/'test.cc').write_text(program)
 subprocess.run(['clang++','-std=c++20',str(path/'test.cc'),'-o',str(path/'test')],check=True)
 subprocess.run([str(path/'test')],check=True)
print('PASS: canceled Mach reply silently consumed; extracted recoverable/uncertain status classification; trust-refusal source boundary')
