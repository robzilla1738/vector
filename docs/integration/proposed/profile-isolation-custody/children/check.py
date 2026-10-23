from pathlib import Path
import subprocess,tempfile
h=Path(__file__).resolve().parent
s=(h/'source/base/process/kill_posix.cc').read_text();body=s[s.index('TerminationStatus GetTerminationStatusImpl('):s.index('\n}  // namespace')]
stub='''#pragma once
namespace base {
struct Time {int value=0; bool is_null()const{return !value;} bool operator==(const Time&)const=default;};
enum class AuxChildReapEvidence{pending,reaped,unknown};
using ProcessHandle=int;
enum TerminationStatus {TERMINATION_STATUS_NORMAL_TERMINATION,TERMINATION_STATUS_STILL_RUNNING,TERMINATION_STATUS_PROCESS_CRASHED,TERMINATION_STATUS_PROCESS_WAS_KILLED,TERMINATION_STATUS_ABNORMAL_TERMINATION};
}
'''
code='''#include <cassert>
#include <iostream>
#include <sys/wait.h>
#include <signal.h>
#include <unistd.h>
#include "content/browser/aux_child_lifetime.h"
#define BUILDFLAG(x) 0
#define DCHECK(x) assert(x)
#define DPLOG(x) std::cerr
#define HANDLE_EINTR(x) ([&]{pid_t r;do {r=(x);}while(r==-1&&errno==EINTR);return r;}())
namespace base {
'''+body+'''
}
int main(){
 using namespace base;using content::internal::AuxChildLifetime;
 auto custody=AuxChildLifetime::Reserve();
 pid_t child=fork();assert(child>=0);if(!child){usleep(20000);_exit(0);}
 custody->BindLaunch(child,Time{1});
 AuxChildReapEvidence evidence;int status;TerminationStatus result;
 do {result=GetTerminationStatusImpl(child,false,&status,&evidence);if(evidence==AuxChildReapEvidence::pending)usleep(1000);}while(evidence==AuxChildReapEvidence::pending);
 assert(evidence==AuxChildReapEvidence::reaped&&result==TERMINATION_STATUS_NORMAL_TERMINATION);
 {std::lock_guard lock(custody->mutex);custody->ValidateBeforeWaitLocked(child,Time{1});custody->ObserveLocked(child,evidence);}
 assert(AuxChildLifetime::Inspect().unresolved==0);
 result=GetTerminationStatusImpl(child,false,&status,&evidence);
 assert(result==TERMINATION_STATUS_NORMAL_TERMINATION&&evidence==AuxChildReapEvidence::unknown);
 auto uncertain=AuxChildLifetime::Reserve();uncertain->BindLaunch(12345,Time{2});
 {std::lock_guard lock(uncertain->mutex);uncertain->ObserveLocked(12345,evidence);uncertain->ObserveLocked(12345,AuxChildReapEvidence::reaped);}
 assert(AuxChildLifetime::Inspect().unresolved==1);
 auto replaced=AuxChildLifetime::Reserve();replaced->BindLaunch(12346,Time{3});
 {std::lock_guard lock(replaced->mutex);replaced->ValidateBeforeWaitLocked(12346,Time{4});replaced->ObserveLocked(12346,AuxChildReapEvidence::reaped);}
 assert(AuxChildLifetime::Inspect().unresolved==2);
 auto failed=AuxChildLifetime::Reserve();failed->BindLaunch(-1,Time{});assert(AuxChildLifetime::Inspect().unresolved==2);
 assert(!AuxChildLifetime::Inspect().all_writer_coverage);
}
'''
with tempfile.TemporaryDirectory(prefix='aux-content-child-') as d:
 p=Path(d);(p/'base/process').mkdir(parents=True);(p/'base/process/kill.h').write_text(stub);(p/'fixture.cc').write_text(code)
 subprocess.run(['clang++','-std=c++20','-pthread','-I'+str(p),'-I'+str(h/'source'),str(p/'fixture.cc'),'-o',str(p/'fixture')],check=True)
 subprocess.run([str(p/'fixture')],check=True)
print('PASS: actual POSIX wait body with disposable fork/reap and ECHILD; actual ledger retains unknown/birth mismatch and clears observed exit/launch failure. No browser or protected runtime.')
