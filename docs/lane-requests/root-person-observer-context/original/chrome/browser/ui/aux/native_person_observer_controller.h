// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_PERSON_OBSERVER_CONTROLLER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_PERSON_OBSERVER_CONTROLLER_H_

#include <cstdint>
#include <optional>
#include <string>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/common/aux_person_observer.mojom.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "mojo/public/cpp/bindings/associated_remote.h"

namespace aux {
class NativePersonObserverController final
    : public content::WebContentsObserver,
      public content::WebContentsUserData<NativePersonObserverController> {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  ~NativePersonObserverController() override;
  base::WeakPtr<NativePersonObserverController> GetWeakPtr() {
    return weak_factory_.GetWeakPtr();
  }
  void Read(uint64_t connection_generation, base::DictValue request, Reply reply);
  void Disconnect(uint64_t connection_generation);

 private:
  friend class content::WebContentsUserData<NativePersonObserverController>;
  explicit NativePersonObserverController(content::WebContents* contents);
  bool Current() const;
  void Prepared(std::string request_json, bool ready);
  void Received(bool accepted, const std::string& result_json);
  void AuthorityChanged();
  void Refuse();
  void Finish(base::DictValue result);
  void DidStartNavigation(content::NavigationHandle* navigation) override;
  void WebContentsDestroyed() override;
  uint64_t connection_generation_ = 0;
  bool closing_ = false;
  std::string read_id_;
  std::string document_id_;
  std::optional<NativePersonReadReceipt> receipt_;
  base::WeakPtr<EgressController> authority_;
  base::CallbackListSubscription authority_subscription_;
  mojo::AssociatedRemote<chrome::mojom::AuxPersonObserver> remote_;
  base::OneShotTimer deadline_;
  Reply reply_;
  base::WeakPtrFactory<NativePersonObserverController> weak_factory_{this};
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
}  // namespace aux
#endif
