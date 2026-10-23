"""Exercise the actual Monitor body with synthetic peer/child observations only."""
from pathlib import Path
import subprocess, tempfile
h=Path(__file__).resolve().parent
s=(h/'source/AuxSelectedStateHome.cc').read_text()
body=s[s.index('void Monitor('):s.index('SelectedStateHomeObservation ObserveLocked')]
prefix=r'''
#include <memory>
#include <mutex>
#include <optional>
#include <cassert>
#include <vector>
int sleeps=0;
namespace base { int Milliseconds(int v){return v;} struct PlatformThread {static void Sleep(int){++sleeps;}}; }
constexpr int kServiceReceiveTimeoutMs=250;
enum class ExchangeStatus{authenticated,timedOut,refused};
struct NativeChildObservation {bool exit_observed_and_reaped=false,launch_failed=false,exit_ownership_unknown=false,wrong_process=false;};
struct SelectedNativeHome {
 std::vector<NativeChildObservation> observations; int polls=0,closes=0,services=0;
 ExchangeStatus ServicePeerOnce(int){++services;return ExchangeStatus::refused;}
 void CloseNativeAdmission(){++closes;}
 NativeChildObservation InspectOwnedChild(){assert(polls<int(observations.size())); return observations[polls++];}
};
struct State {std::mutex mutex;bool closed=false,monitor_running=false;std::shared_ptr<SelectedNativeHome> selected;std::optional<NativeChildObservation> child_close;};
State& CurrentState(){static State s;return s;}
'''
suffix=r'''
int main(){
 auto& state=CurrentState();
 // Also exercises the queued-monitor-starts-after-close race.
 for(bool already_closed:{false,true}) {
  auto owner=std::make_shared<SelectedNativeHome>();owner->observations={{},{},{.exit_observed_and_reaped=true}};
  state.selected=owner;state.closed=already_closed;sleeps=0;Monitor(owner);
  assert(owner->polls==3&&owner->closes==1&&sleeps==2);
  assert(owner->services==(already_closed?0:1));assert(!state.monitor_running);
  assert(state.child_close->exit_observed_and_reaped);
 }
 auto owner=std::make_shared<SelectedNativeHome>();owner->observations={{.exit_ownership_unknown=true}};
 state.selected=owner;state.closed=true;sleeps=0;Monitor(owner);
 assert(owner->polls==1&&sleeps==0&&state.child_close->exit_ownership_unknown);
 assert(!state.child_close->exit_observed_and_reaped);
 auto other=std::make_shared<SelectedNativeHome>();Monitor(other);assert(other->polls==0&&other->services==0);
}
'''
with tempfile.TemporaryDirectory(prefix='aux-monitor-fixture-') as d:
 p=Path(d);(p/'fixture.cc').write_text(prefix+body+suffix)
 subprocess.run(['clang++','-std=c++20','-pthread',str(p/'fixture.cc'),'-o',str(p/'fixture')],check=True)
 subprocess.run([str(p/'fixture')],check=True)
print('PASS: actual monitor body; delayed exit, preclosed queued start, unknown exit retention, selected owner mismatch. Synthetic observations only; no protected runtime.')
