from pathlib import Path
import subprocess,tempfile
h=Path(__file__).resolve().parent
stub='''#pragma once
namespace base {
struct Time{int value=0;bool is_null()const{return !value;}bool operator==(const Time&)const=default;};
enum class AuxChildReapEvidence{pending,reaped,unknown};
struct Process{int pid;Time birth;int Pid()const{return pid;}Time CreationTime()const{return birth;}};
inline int waits=0;inline AuxChildReapEvidence next=AuxChildReapEvidence::reaped;
inline AuxChildReapEvidence EnsureProcessTerminatedWithAuxReapEvidence(Process){++waits;return next;}
}
'''
code='''#include <cassert>
#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"
using namespace extensions;
int main(){
 auto launched=AuxNativeMessagingLifetime::Reserve();launched->BindLaunch(123,base::Time{1});
 auto context=std::move(launched);auto launcher=std::move(context);auto host=std::move(launcher);
 assert(!launched&&!context&&!launcher);ReapAuxNativeMessagingProcess({123,{1}},std::move(host));
 assert(base::waits==1&&AuxNativeMessagingLifetime::Inspect().unresolved==0);
 auto cancelled=AuxNativeMessagingLifetime::Reserve();cancelled->BindLaunch(124,base::Time{2});
 ReapAuxNativeMessagingProcess({124,{2}},std::move(cancelled));assert(base::waits==2&&AuxNativeMessagingLifetime::Inspect().unresolved==0);
 auto uncertain=AuxNativeMessagingLifetime::Reserve();uncertain->BindLaunch(125,base::Time{3});
 base::next=base::AuxChildReapEvidence::unknown;ReapAuxNativeMessagingProcess({125,{3}},uncertain);
 assert(AuxNativeMessagingLifetime::Inspect().unresolved==1);
 auto dropped=AuxNativeMessagingLifetime::Reserve();dropped->BindLaunch(126,base::Time{4});dropped.reset();
 assert(AuxNativeMessagingLifetime::Inspect().unresolved==2);
 base::next=base::AuxChildReapEvidence::reaped;
 auto mismatch=AuxNativeMessagingLifetime::Reserve();mismatch->BindLaunch(127,base::Time{5});
 ReapAuxNativeMessagingProcess({127,{6}},mismatch);assert(AuxNativeMessagingLifetime::Inspect().unresolved==3);
 assert(!AuxNativeMessagingLifetime::Inspect().all_writer_coverage);
}
'''
with tempfile.TemporaryDirectory(prefix='aux-messaging-custody-') as d:
 p=Path(d);(p/'base/process').mkdir(parents=True);(p/'base/process/kill.h').write_text(stub);(p/'check.cc').write_text(code)
 subprocess.run(['clang++','-std=c++20','-pthread','-I'+str(p),'-I'+str(h/'source'),str(p/'check.cc'),'-o',str(p/'check')],check=True)
 subprocess.run([str(p/'check')],check=True)
print('PASS actual messaging ledger/reap wrapper with synthetic native wait: moved owner, cancelled launch, unknown wait, dropped callback/task, mismatched identity. No extension host launched.')
