// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_PERMISSION_BROKER_H_
#define CHROME_BROWSER_UI_AUX_PERMISSION_BROKER_H_

#include <string>
#include <optional>
#include <cstdint>
#include <vector>
#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "components/permissions/permission_request_manager.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents_user_data.h"

class AuxRuntimeHost;

namespace aux {
class EgressController;
class PermissionBroker final
    : public content::WebContentsUserData<PermissionBroker>,
      public permissions::PermissionRequestManager::Observer {
 public:
  ~PermissionBroker() override;
  void OnPromptAdded() override;
  void OnPromptCreationFailedHiddenTab() override;
  void OnPromptRemoved() override;
  void OnRequestsFinalized() override;
  void OnNavigation(content::NavigationHandle*) override;
  void OnPermissionRequestManagerDestructed() override;

 private:
  friend class content::WebContentsUserData<PermissionBroker>;
  explicit PermissionBroker(content::WebContents* contents);
  void Cancel();
  bool Current();
  void Request();
  void Answer(bool ok, const std::string& json);
  void OnOwnerMutationChanged();
  raw_ptr<permissions::PermissionRequestManager> manager_ = nullptr;
  content::WeakDocumentPtr document_;
  base::DictValue authority_;
  base::DictValue request_;
  std::string pending_approval_id_;
  base::WeakPtr<AuxRuntimeHost> runtime_;
  std::vector<base::WeakPtr<permissions::PermissionRequest>> requests_;
  base::TimeTicks deadline_;
  base::OneShotTimer retry_;
  base::OneShotTimer deadline_timer_;
  base::WeakPtr<EgressController> egress_;
  std::optional<std::string> held_allow_;
  uint64_t mutation_failure_epoch_ = 0;
  base::CallbackListSubscription mutation_subscription_;
  base::CallbackListSubscription authority_subscription_;
  base::WeakPtrFactory<PermissionBroker> weak_factory_{this};
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
}  // namespace aux
#endif
