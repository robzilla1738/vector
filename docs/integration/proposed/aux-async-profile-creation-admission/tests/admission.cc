#include "chrome/browser/profiles/aux_async_profile_creation_admission.h"
#include <cassert>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <string>
#include <thread>

struct Profile {};
struct Callback {
  std::function<void(Profile*)> call;
  bool is_null() const { return !call; }
  void Run(Profile* value) { auto once = std::move(call); once(value); }
};
int main(int argc, char** argv) {
  assert(argc == 2);
  const auto generation = aux::CaptureAsyncProfileCreationGeneration();
  assert(generation == 1);
  Profile profile;
  if (std::string(argv[1]) == "observation") {
    aux::ObserveAsyncProfileInitializationStarted(&profile);
    assert(aux::InspectAsyncProfileCreationAdmission().unfinished_initializations == 1);
    aux::CloseAsyncProfileCreationAdmission();
    assert(aux::InspectAsyncProfileCreationAdmission().unfinished_initializations == 1);
    aux::ObserveAsyncProfileInitializationFinished(&profile);
    assert(aux::InspectAsyncProfileCreationAdmission().unfinished_initializations == 0);
    aux::ObserveAsyncProfileInitializationAbandoned(&profile);
    assert(aux::InspectAsyncProfileCreationAdmission().unresolved_initializations == 0);
    aux::ObserveAsyncProfileInitializationStarted(&profile);
    aux::ObserveAsyncProfileInitializationAbandoned(&profile);
    assert(aux::InspectAsyncProfileCreationAdmission().unresolved_initializations == 1);
    aux::ObserveAsyncProfileInitializationFinished(&profile);
    assert(aux::InspectAsyncProfileCreationAdmission().unresolved_initializations == 2);
    return 0;
  }
  int created = 0, initialized = 0;
  aux::DeliverAsyncProfileCreated(generation, Callback{[&](Profile* p) { assert(p == &profile); ++created; }}, &profile);
  assert(created == 1);
  std::mutex mutex; std::condition_variable changed; bool entered = false, release = false;
  std::thread worker([&] {
    assert(aux::RunAsyncProfileCreationDispatch(generation, [&] {
      std::unique_lock<std::mutex> lock(mutex); entered = true; changed.notify_one();
      changed.wait(lock, [&] { return release; });
    }));
  });
  { std::unique_lock<std::mutex> lock(mutex); changed.wait(lock, [&] { return entered; }); }
  aux::CloseAsyncProfileCreationAdmission();
  auto during = aux::InspectAsyncProfileCreationAdmission();
  assert(during.closed && during.active_dispatches == 1);
  assert(!aux::RunAsyncProfileCreationDispatch(generation, [] { assert(false); }));
  assert(!aux::RunAsyncProfileCreationDispatch(0, [] { assert(false); }));
  aux::DeliverAsyncProfileInitialization(generation, Callback{[&](Profile* p) { assert(!p); ++initialized; }}, &profile);
  aux::DeliverAsyncProfileCreated(generation, Callback{[&](Profile*) { ++created; }}, &profile);
  assert(initialized == 1 && created == 1);
  { std::lock_guard<std::mutex> lock(mutex); release = true; changed.notify_one(); }
  worker.join();
  aux::CloseAsyncProfileCreationAdmission();
  const auto after = aux::InspectAsyncProfileCreationAdmission();
  assert(after.closed && after.generation == 0 && after.active_dispatches == 0);
  assert(!aux::IsAsyncProfileCreationGenerationCurrent(generation));
}
