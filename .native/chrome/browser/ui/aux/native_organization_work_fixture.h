// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_ORGANIZATION_WORK_FIXTURE_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_ORGANIZATION_WORK_FIXTURE_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <optional>
#include <set>
#include <string>
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "third_party/blink/public/mojom/widget/native_organization_work.mojom.h"
class WebUIBrowserUI;
namespace aux {
class NativeOrganizationWorkFixture final {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  explicit NativeOrganizationWorkFixture(base::WeakPtr<WebUIBrowserUI>);
  ~NativeOrganizationWorkFixture();
  void Prepare(blink::mojom::NativeOrganizationWorkMetric, Reply);
  void Complete(Reply);
 private:
  using RuntimeIdentity = AuxRuntimeHost::PerformanceProcessIdentity;
  bool Current() const;
  void RuntimePrepared(std::optional<RuntimeIdentity>);
  void Armed(bool);
  void ReadCompleted(blink::mojom::NativeOrganizationWorkSamplePtr);
  void RuntimeCompleted(blink::mojom::NativeOrganizationWorkSamplePtr,
                        std::optional<RuntimeIdentity>);
  void Refuse();
  base::DictValue Record(const char* status) const;
  base::WeakPtr<WebUIBrowserUI> ui_;
  content::WeakDocumentPtr document_;
  std::optional<NativeGuestStageOwnedSnapshot> owner_;
  blink::mojom::NativeOrganizationWorkScopePtr scope_;
  std::optional<blink::DocumentToken> last_document_;
  uint64_t generation_ = 0, sequence_ = 0;
  std::optional<RuntimeIdentity> runtime_;
  std::set<std::string> archived_before_, live_before_;
  mojo::Remote<blink::mojom::NativeOrganizationWorkLease> lease_;
  Reply pending_;
  bool active_ = false, read_ = false;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeOrganizationWorkFixture> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
