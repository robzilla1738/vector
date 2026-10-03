// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_RECORDER_CONTROLLER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_RECORDER_CONTROLLER_H_

#include <cstdint>
#include <memory>
#include <optional>
#include <string>

#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "base/timer/timer.h"
#include "chrome/common/aux_recorder.mojom.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "mojo/public/cpp/bindings/associated_remote.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"

class AuxRuntimeHost;

namespace aux {
// Closed person-capture producer. No caller method, source, frame or world.
class NativeRecorderController final
    : public content::WebContentsObserver,
      public content::WebContentsUserData<NativeRecorderController> {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  ~NativeRecorderController() override;
  base::WeakPtr<NativeRecorderController> GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
  void Start(uint64_t connection_generation, Reply reply);
  void Drain(uint64_t connection_generation, const std::string& recorder_id,
             Reply reply);
  void Stop(uint64_t connection_generation, const std::string& recorder_id,
            Reply reply);
  void Disconnect(uint64_t connection_generation);

 private:
  friend class content::WebContentsUserData<NativeRecorderController>;
  friend class ::AuxRuntimeHost;
  bool BoundToConnection(uint64_t generation) const {
    return active_ && connection_generation_ == generation;
  }
  explicit NativeRecorderController(content::WebContents* contents);
  bool PersonPage() const;
  bool PersonReadCurrent() const;
  void OnPersonReadAuthorityChanged();
  bool Current(uint64_t connection_generation, const std::string& recorder_id,
               uint64_t document_generation,
               const content::WeakDocumentPtr& document) const;
  class DocumentSink;
  struct PendingReply;
  std::shared_ptr<PendingReply> ArmReply(Reply reply);
  void Install(Reply reply);
  void Retire();
  void DidStartNavigation(content::NavigationHandle* navigation) override;
  void DidFinishNavigation(content::NavigationHandle* navigation) override;
  void WebContentsDestroyed() override;

  std::string recorder_id_;
  uint64_t connection_generation_ = 0;
  uint64_t document_generation_ = 0;
  uint64_t operation_generation_ = 0;
  content::WeakDocumentPtr document_;
  std::optional<NativePersonReadReceipt> person_read_;
  base::WeakPtr<EgressController> person_authority_;
  base::CallbackListSubscription person_read_subscription_;
  bool active_ = false;
  bool ready_ = false;
  bool pending_ = false;
  bool established_ = false;
  base::OneShotTimer navigation_gap_timer_;
  std::optional<int64_t> navigation_id_;
  base::ListValue events_;
  size_t event_bytes_ = 0;
  mojo::AssociatedRemote<chrome::mojom::AuxRecorder> recorder_remote_;
  std::unique_ptr<DocumentSink> sink_;
  base::OnceClosure retired_callback_;
  std::shared_ptr<PendingReply> reply_;
  base::WeakPtrFactory<NativeRecorderController> weak_factory_{this};
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
}  // namespace aux
#endif
