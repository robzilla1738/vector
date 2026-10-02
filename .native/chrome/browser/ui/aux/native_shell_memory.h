// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_SHELL_MEMORY_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_SHELL_MEMORY_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <cstdint>
#include <optional>
#include "base/memory/weak_ptr.h"
#include "base/unguessable_token.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "content/public/browser/weak_document_ptr.h"
class WebUIBrowserUI;
namespace aux {
// Fixed private fixture operation. The native owner chooses its own renderer;
// no process selector or caller assertion can choose another process.
class NativeShellMemorySampler {
 public:
  explicit NativeShellMemorySampler(base::WeakPtr<WebUIBrowserUI> ui);
  ~NativeShellMemorySampler();
  NativeShellMemorySampler(const NativeShellMemorySampler&) = delete;
  NativeShellMemorySampler& operator=(const NativeShellMemorySampler&) = delete;
  base::DictValue Sample();
 private:
  base::WeakPtr<WebUIBrowserUI> ui_;
  content::WeakDocumentPtr document_;
  std::optional<NativeGuestStageOwnedSnapshot> owner_;
  const base::UnguessableToken nonce_ = base::UnguessableToken::Create();
  uint64_t sequence_ = 0;
};
}  // namespace aux
#endif
#endif
