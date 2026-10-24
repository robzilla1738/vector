// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
// Native plist URL/profile extraction follows Chromium's ChromeWeblocFile.
#include "chrome/browser/aux/routing/external_routing_ingress.h"
#import <Foundation/Foundation.h>
#include <optional>
#include <utility>
#include "base/apple/foundation_util.h"
#include "base/files/file_util.h"
#include "base/files/safe_base_name.h"
#include "base/functional/bind.h"
#include "base/memory/ref_counted.h"
#include "base/strings/sys_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/app_controller_mac.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/shortcuts/chrome_webloc_file.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "net/base/filename_util.h"
namespace aux::routing {
namespace {
bool ShortcutPath(const StartupTab& tab, base::FilePath* path) {
  return net::FileURLToFilePath(tab.url, path) &&
      (path->Extension() == shortcuts::ChromeWeblocFile::kFileExtension ||
       path->Extension() == ".webloc");
}
struct ResolvedShortcut {
  GURL url;
  base::FilePath profile_leaf;
};
std::optional<ResolvedShortcut> ResolveFile(const base::FilePath& path) {
  // Same native property-list format/parser and SafeBaseName contract as the
  // supplied ChromeWeblocFile resolver. Bound input, validate Objective-C types,
  // and omit its diagnostic logging of file paths/whole plist contents.
  std::string bytes;
  if (!base::ReadFileToStringWithMaxSize(path, &bytes, 64 * 1024)) return std::nullopt;
  @autoreleasepool {
    NSData* data = [NSData dataWithBytes:bytes.data() length:bytes.size()];
    NSDictionary* contents = base::apple::ObjCCast<NSDictionary>(
        [NSPropertyListSerialization propertyListWithData:data
            options:NSPropertyListImmutable format:nil error:nil]);
    NSString* url = base::apple::ObjCCast<NSString>(contents[@"URL"]);
    if (!url) return std::nullopt;
    ResolvedShortcut result{GURL(base::SysNSStringToUTF8(url)), {}};
    if (!result.url.is_valid() || !result.url.SchemeIsHTTPOrHTTPS() ||
        result.url.has_username() || result.url.has_password()) return std::nullopt;
    id raw_profile = contents[@"CrProfile"];
    if (raw_profile || path.Extension() == shortcuts::ChromeWeblocFile::kFileExtension) {
      NSString* profile = base::apple::ObjCCast<NSString>(raw_profile);
      if (!profile) return std::nullopt;
      auto leaf = base::SafeBaseName::Create(base::apple::NSStringToFilePath(profile));
      if (!leaf || leaf->path().empty()) return std::nullopt;
      result.profile_leaf = leaf->path();
    }
    return result;
  }
}
class ShortcutBatch : public base::RefCounted<ShortcutBatch> {
 public:
  ShortcutBatch(StartupTabs tabs, NativeTabFallback fallback,
                base::RepeatingCallback<void(const StartupTab&)> unresolved)
      : tabs_(std::move(tabs)), fallback_(std::move(fallback)),
        unresolved_(std::move(unresolved)) {}
  void Start() { Next(); }
 private:
  friend class base::RefCounted<ShortcutBatch>;
  ~ShortcutBatch() = default;
  void Continue() {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(&ShortcutBatch::Next, base::RetainedRef(this)));
  }
  void Next() {
    if (index_ == tabs_.size()) return;
    StartupTab tab = tabs_[index_++];
    base::FilePath path;
    if (ShortcutPath(tab, &path)) {
      if (!tab.aux_native_external_receipt) {
        // A queued nonreceipt shortcut retains its existing native resolver.
        unresolved_.Run(tab);
        Continue();
        return;
      }
      base::ThreadPool::PostTaskAndReplyWithResult(
          FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_BLOCKING},
          base::BindOnce(&ResolveFile, path),
          base::BindOnce(&ShortcutBatch::Resolved, base::RetainedRef(this), std::move(tab)));
      return;
    }
    SelectProfile(std::move(tab), base::FilePath());
  }
  void Resolved(StartupTab receipt, std::optional<ResolvedShortcut> result) {
    if (!result) { Refuse(); Continue(); return; }
    receipt.url = result->url;
    receipt.is_untrusted_launch = true;
    SelectProfile(std::move(receipt), result->profile_leaf);
  }
  void SelectProfile(StartupTab tab, const base::FilePath& leaf) {
    auto callback = base::BindOnce(&ShortcutBatch::Selected, base::RetainedRef(this),
                                   std::move(tab));
    auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
    if (!manager) { Refuse(); Continue(); return; }
    if (!leaf.empty()) {
      const auto path = manager->user_data_dir().Append(leaf);
      // Keep Chromium's exact native shortcut behavior: a known target uses
      // RunInProfileSafely; a missing shortcut profile uses the last safe one.
      if (manager->GetProfileAttributesStorage().GetProfileAttributesWithPath(path)) {
        app_controller_mac::RunInProfileSafely(path, std::move(callback),
            app_controller_mac::kShowProfilePickerOnFailure);
        return;
      }
    }
    app_controller_mac::RunInLastProfileSafely(std::move(callback),
        app_controller_mac::kShowProfilePickerOnFailure);
  }
  void Selected(StartupTab tab, Profile* profile) {
    if (!profile) { Refuse(); Continue(); return; }
    if (MaybeRouteExternalTabs(profile, StartupTabs{tab}, fallback_,
          base::BindOnce(&ShortcutBatch::Continue, base::RetainedRef(this)))) return;
    tab.aux_native_external_receipt = false;
    fallback_.Run(tab, profile);
    Continue();
  }
  void Refuse() {
    if (warned_) return;
    warned_ = true;
    chrome::ShowWarningMessageBoxAsync(gfx::NativeWindow(), u"Aux could not open a shortcut",
        u"A shortcut is unreadable, does not contain a supported web URL, or its "
        u"profile is unavailable. The link was not opened in another profile.");
  }
  StartupTabs tabs_;
  NativeTabFallback fallback_;
  base::RepeatingCallback<void(const StartupTab&)> unresolved_;
  size_t index_ = 0;
  bool warned_ = false;
};
}  // namespace
bool MaybeResolveExternalShortcutBatch(const StartupTabs& tabs, NativeTabFallback fallback,
    base::RepeatingCallback<void(const StartupTab&)> unresolved) {
  bool has_shortcut = false;
  for (const auto& tab : tabs) {
    base::FilePath path;
    has_shortcut |= tab.aux_native_external_receipt && ShortcutPath(tab, &path);
  }
  if (!has_shortcut) return false;
  base::MakeRefCounted<ShortcutBatch>(tabs, std::move(fallback), std::move(unresolved))->Start();
  return true;
}
}  // namespace aux::routing
