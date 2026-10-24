#pragma once
#include "AuxCliSealedImages.h"
#include "AuxCliWire.h"
#include <memory>
#include <optional>
#include <span>
#include <string_view>
namespace aux::cli {
enum class NativeReplyStatus { completed,pending,refused,unknown };
struct NativeReply { NativeReplyStatus status=NativeReplyStatus::refused;std::vector<uint8_t> bytes; };
struct NativeRootPair { uint64_t generation=0;int control=-1,task=-1; };
// A native gateway binds the real existing prepared provider, actual live
// authenticated browser-parent connection and independently checked CLI peer.
// No string scope, caller home, PID claim or JSON receipt creates this type.
class RetainedInvocation final {
 public:
  ~RetainedInvocation();
  bool Current();
  NativeReply Run(audit_token_t browser_request,uint64_t sequence,std::string_view command,std::string_view input);
  bool Acknowledge(audit_token_t browser_request,uint64_t sequence);
  std::optional<NativeRootPair> CopyCurrentRoots(audit_token_t browser_request);
  // Closes only this imported command/OS owner. It is never a CLI process,
  // descendant, file-writer or whole-browser drain receipt.
  NativeReplyStatus Close();
  static size_t UnresolvedNativeOwners();
  static size_t PollUnresolvedNativeOwners();
 private:
  // Deliberately private and uncalled: signed peer identity alone must not
  // import the daemon's selected target for a task from another profile.
  // A genuine native target/ancestry gateway must own this factory before any
  // public ingress can activate it. No callback Boolean or JSON selects it.
  static std::shared_ptr<RetainedInvocation> FromAuthenticatedBrowser(
      uint64_t actual_parent_connection,uint64_t actual_prepared_provider,
      audit_token_t browser_request,audit_token_t delegated_cli,Nonce invocation);
  struct State;explicit RetainedInvocation(std::unique_ptr<State>);
  std::unique_ptr<State> state_;
};
}
