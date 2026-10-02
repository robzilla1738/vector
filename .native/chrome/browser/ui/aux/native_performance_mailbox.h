// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_PERFORMANCE_MAILBOX_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_PERFORMANCE_MAILBOX_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <cstdint>
#include <optional>
#include <string>
#include <vector>
#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/threading/sequence_bound.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "content/public/browser/weak_document_ptr.h"
class WebUIBrowserUI;
class BrowserWindowInterface;
namespace aux {
// No caller path, selector or effect. Reads only fixed owned-fixture metadata.
// Pure native inventory comparison; caller must obtain permitted target from
// the existing fixture creation ticket. This does not create/grant authority.
bool NativePerformanceOwnerInventoryMatches(BrowserWindowInterface* origin,
    base::WeakPtr<BrowserWindowInterface> permitted_little,
    const std::vector<BrowserWindowInterface*>& observed);
bool IsNativePerformanceMailboxOperation(const std::string& operation);
std::optional<base::DictValue> ReadNativePerformanceMailboxFile(
    const base::FilePath& root, uint64_t last_sequence, uint64_t root_device, uint64_t root_inode);
class NativePerformanceMailbox final {
 public:
  using Reply = base::OnceCallback<void(std::optional<base::DictValue>)>;
  explicit NativePerformanceMailbox(base::WeakPtr<WebUIBrowserUI> ui);
  ~NativePerformanceMailbox();
  void Next(Reply reply);
  std::optional<uint64_t> TakeExpected(const std::string& operation);
  bool EmitReply(uint64_t sequence, const std::string& operation,
                 const base::DictValue& record);
 private:
  class WatchState;
  bool Stable() const;
  void Received(std::optional<base::DictValue> request);
  void Refuse();
  base::WeakPtr<WebUIBrowserUI> ui_;
  std::optional<NativeGuestStageOwnedSnapshot> owner_;
  content::WeakDocumentPtr document_;
  base::FilePath root_;
  uint64_t root_device_ = 0, root_inode_ = 0, profile_device_ = 0, profile_inode_ = 0;
  uint64_t sequence_ = 0;
  std::optional<std::string> expected_;
  std::optional<std::string> running_;
  bool failed_ = false;
  std::optional<std::string> sample_completion_;
  std::optional<base::DictValue> sample_scope_;
  Reply pending_;
  base::SequenceBound<WatchState> watcher_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativePerformanceMailbox> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
