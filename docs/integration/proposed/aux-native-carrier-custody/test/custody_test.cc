#include "../source/installation_carrier_custody.h"
#include <cassert>
#include <condition_variable>
#include <thread>
#include <sys/wait.h>
#include <unistd.h>
int main() {
  { // Closed before the pending call reaches actual launch.
    aux::InstallationCarrierCustody custody;
    auto call = custody.BeginCall();
    assert(!custody.CloseAdmission().drained());
    bool launched = false;
    assert(!call->LaunchIfAdmitted([&] { launched = true; return true; }));
    assert(!launched && !custody.BeginCall());
    call.reset();
    assert(custody.Inspect().drained());
  }
  { // Actual child exit must be observed, never guessed by token destruction.
    aux::InstallationCarrierCustody custody;
    auto call = custody.BeginCall();
    assert(call->LaunchIfAdmitted([] { return true; }));
    call.reset();
    const auto result = custody.CloseAdmission();
    assert(!result.drained() && result.unresolved_children == 1);
  }
  { // A moved cleanup callback retains custody after the synchronous call exits.
    aux::InstallationCarrierCustody custody;
    auto call = custody.BeginCall();
    assert(call->LaunchIfAdmitted([] { return true; }));
    std::mutex mutex;
    std::condition_variable changed;
    bool finish = false;
    std::thread cleanup([owned = call, &mutex, &changed, &finish] {
      std::unique_lock lock(mutex);
      changed.wait(lock, [&] { return finish; });
      owned->ObservedChildExit();
    });
    call.reset();
    assert(!custody.CloseAdmission().drained());
    { std::lock_guard lock(mutex); finish = true; }
    changed.notify_one();
    cleanup.join();
    assert(custody.Inspect().drained());
  }
  { // Actual owned synthetic child: a callback retains custody through waitpid.
    aux::InstallationCarrierCustody custody;
    auto call = custody.BeginCall();
    int fds[2];
    assert(pipe(fds) == 0);
    pid_t child = -1;
    assert(call->LaunchIfAdmitted([&] {
      child = fork();
      if (child == 0) {
        close(fds[1]);
        char byte;
        const auto ignored = read(fds[0], &byte, 1);
        (void)ignored;
        _exit(0);
      }
      return child > 0;
    }));
    close(fds[0]);
    std::thread reaper([owned = call, child] {
      int status;
      assert(waitpid(child, &status, 0) == child);
      assert(WIFEXITED(status) && WEXITSTATUS(status) == 0);
      owned->ObservedChildExit();
    });
    call.reset();
    assert(!custody.CloseAdmission().drained());
    assert(write(fds[1], "x", 1) == 1);
    close(fds[1]);
    reaper.join();
    assert(custody.Inspect().drained());
  }
  { // Even failed launch is attempted once; no implicit retry beyond closure.
    aux::InstallationCarrierCustody custody;
    auto call = custody.BeginCall();
    assert(!call->LaunchIfAdmitted([] { return false; }));
    assert(!call->LaunchIfAdmitted([] { assert(false); return true; }));
    call.reset();
    assert(custody.CloseAdmission().drained());
  }
}
