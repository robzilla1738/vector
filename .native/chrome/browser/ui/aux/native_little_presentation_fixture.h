// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_LITTLE_PRESENTATION_FIXTURE_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_LITTLE_PRESENTATION_FIXTURE_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/native_little_creation_ticket.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "third_party/blink/public/mojom/widget/native_guest_stage_measurement.mojom.h"
namespace aux {
class NativeLittlePresentationFixture;
struct NativeLittleRouteObservation {
  base::WeakPtr<NativeLittlePresentationFixture> fixture;
  base::UnguessableToken nonce;
};
// Invoked only by actual trusted native external receipt code. Observation is
// optional and must never change actual routing success, destinations or grants.
std::optional<NativeLittleRouteObservation> ObserveLittleExternalRoute(Profile* source);
class NativeLittlePresentationFixture final : public blink::mojom::NativeCreatedGuestFrameReadiness {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  explicit NativeLittlePresentationFixture(base::WeakPtr<WebUIBrowserUI> source);
  ~NativeLittlePresentationFixture() override;
  void Prepare(Reply ready);
  void Complete(Reply completed);
  std::optional<NativeLittleRouteObservation> BeginExternalRoute(Profile* source);
  void Created(const base::UnguessableToken& nonce, BrowserWindowInterface* window);
  void Delivered(const base::UnguessableToken& nonce, content::WebContents* guest,
      base::WeakPtr<content::NavigationHandle> navigation);
  base::WeakPtr<BrowserWindowInterface> CleanupWindowForMailbox() const;
  void Ready(blink::mojom::NativeCreatedGuestFrameScopePtr scope,
      blink::mojom::NativeGuestStageWitnessPtr witness, ReadyCallback accepted) override;
 private:
  friend class NativeLittlePresentationFixtureLifetimeTest;
  bool StableSource() const;
  std::optional<NativeGuestStageOwnedSnapshot> CurrentTarget();
  void TryStart();
  void GuestArmed(bool accepted);
  void Submitted(blink::mojom::NativeCreatedGuestFrameSubmissionPtr actual);
  void Presented(viz::mojom::NativeGuestInclusionResultPtr actual);
  void Refuse(const char* reason);
  void Finish(base::DictValue record);
  base::DictValue Record(const char* status, const char* reason) const;
  base::WeakPtr<WebUIBrowserUI> source_;
  base::WeakPtr<WebUIBrowserUI> target_;
  NativeLittleCreationTicket ticket_;
  std::optional<NativeGuestStageOwnedSnapshot> source_owner_;
  std::optional<NativeGuestStageOwnedSnapshot> target_owner_;
  blink::mojom::NativeCreatedGuestFrameScopePtr scope_;
  blink::mojom::NativeCreatedGuestFrameSubmissionPtr submission_;
  content::WeakDocumentPtr guest_document_;
  base::WeakPtr<content::WebContents> guest_;
  mojo::Remote<blink::mojom::NativeGuestDocumentFrameLease> guest_lease_;
  mojo::Receiver<blink::mojom::NativeCreatedGuestFrameReadiness> readiness_{this};
  uint64_t sequence_ = 0, source_document_generation_ = 0, target_document_generation_ = 0;
  std::optional<blink::DocumentToken> last_source_document_;
  std::optional<blink::DocumentToken> last_target_document_;
  base::UnguessableToken nonce_;
  bool active_ = false, starting_ = false, consumed_ = false;
  std::optional<base::DictValue> record_;
  Reply completed_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeLittlePresentationFixture> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
