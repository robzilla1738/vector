#ifndef CHROME_BROWSER_PROFILES_AUX_ASYNC_PROFILE_CREATION_ADMISSION_H_
#define CHROME_BROWSER_PROFILES_AUX_ASYNC_PROFILE_CREATION_ADMISSION_H_

#include <cstddef>
#include <cstdint>
#include <utility>

namespace aux {

// Only synchronous covered dispatch scopes. Zero is NOT constructor-tail,
// posted-task, storage-durability or whole-profile quiescence evidence.
struct AsyncProfileCreationAdmissionSnapshot {
  uint64_t generation;
  bool closed;
  size_t active_dispatches;
  size_t unfinished_initializations;
  size_t unresolved_initializations;
};

uint64_t CaptureAsyncProfileCreationGeneration();
bool IsAsyncProfileCreationGenerationCurrent(uint64_t generation);
void CloseAsyncProfileCreationAdmission();
AsyncProfileCreationAdmissionSnapshot InspectAsyncProfileCreationAdmission();
// Real ProfileImpl constructor/tail/destructor observations only. Destruction
// before the actual final-init tail becomes sticky unresolved, never success.
void ObserveAsyncProfileInitializationStarted(const void* profile);
void ObserveAsyncProfileInitializationFinished(const void* profile);
void ObserveAsyncProfileInitializationAbandoned(const void* profile);

// Actual native operation scope; construction atomically acquires open admission
// for this generation. No reset, caller Boolean or JS/environment grant exists.
class ScopedAsyncProfileCreationDispatch final {
 public:
  explicit ScopedAsyncProfileCreationDispatch(uint64_t generation);
  ~ScopedAsyncProfileCreationDispatch();
  ScopedAsyncProfileCreationDispatch(const ScopedAsyncProfileCreationDispatch&) = delete;
  ScopedAsyncProfileCreationDispatch& operator=(const ScopedAsyncProfileCreationDispatch&) = delete;
  bool admitted() const { return admitted_; }
 private:
  const bool admitted_;
};

template <typename Operation>
bool RunAsyncProfileCreationDispatch(uint64_t generation, Operation operation) {
  ScopedAsyncProfileCreationDispatch dispatch(generation);
  if (!dispatch.admitted())
    return false;
  std::move(operation)();
  return true;
}

// The initialized callback's documented failure result is nullptr. Preserve
// failure completion after close; never send nullptr to the created callback.
template <typename Callback, typename ProfileType>
void DeliverAsyncProfileInitialization(uint64_t generation,
                                       Callback callback,
                                       ProfileType* profile) {
  if (callback.is_null())
    return;
  if (!profile || !RunAsyncProfileCreationDispatch(
                      generation, [&] { std::move(callback).Run(profile); })) {
    std::move(callback).Run(nullptr);
  }
}

template <typename Callback, typename ProfileType>
void DeliverAsyncProfileCreated(uint64_t generation,
                                Callback callback,
                                ProfileType* profile) {
  if (!callback.is_null()) {
    RunAsyncProfileCreationDispatch(
        generation, [&] { std::move(callback).Run(profile); });
  }
}

}  // namespace aux
#endif
