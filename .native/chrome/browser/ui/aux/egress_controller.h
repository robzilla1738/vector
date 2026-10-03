// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_EGRESS_CONTROLLER_H_
#define CHROME_BROWSER_UI_AUX_EGRESS_CONTROLLER_H_

#include <map>
#include <memory>
#include <optional>
#include <cstdint>
#include "base/time/time.h"
#include <set>
#include <string>
#include <utility>
#include <vector>

#include "chrome/browser/ui/aux/owner_mutation_fence.h"
#include "base/callback_list.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/supports_user_data.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "content/public/browser/storage_partition_config.h"
#include "content/public/browser/weak_document_ptr.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "services/network/public/mojom/network_context.mojom-forward.h"

class Profile;
namespace content {
class RenderFrameHost;
class WebContents;
}  // namespace content
namespace net {
class HttpRequestHeaders;
}
namespace network {
struct ResourceRequest;
class URLLoaderFactoryBuilder;
}  // namespace network
namespace aux {
struct EgressRequestContext {
  content::WeakDocumentPtr document;
  std::string page_id;
  std::string kind;
  bool ambiguous = false;
};
struct NativeCdpRetirementReceipt {
  base::DictValue original_lease;
  // Native registered isolation/document scope exists even before first Install.
  base::DictValue original_scope;
  base::TimeTicks original_event_ticks;
  base::TimeTicks admitted_ticks;
  base::TimeTicks last_dispatch_ticks;
  uint64_t dispatch_count = 0;
  bool original_clock_valid = false;
};
// Browser-owned read admission; no runtime phase label or caller token can
// construct one. The primary document and control generation stay original.
class NativePersonReadReceipt {
 public:
  const content::WeakDocumentPtr& document() const { return document_; }
  const std::string& page_id() const { return page_id_; }

 private:
  friend class EgressController;
  friend class NativePersonObserverController;
  NativePersonReadReceipt(content::WeakDocumentPtr document,
                          std::string page_id,
                          std::string control_generation,
                          std::string retirement_generation)
      : document_(document),
        page_id_(std::move(page_id)),
        control_generation_(std::move(control_generation)),
        retirement_generation_(std::move(retirement_generation)) {}
  content::WeakDocumentPtr document_;
  std::string page_id_;
  std::string control_generation_;
  std::string retirement_generation_;
};
class EgressController final : public base::SupportsUserData::Data {
 public:
  static EgressController* ForProfile(Profile* profile);
  static void ProxyFactory(
      Profile* profile,
      content::RenderFrameHost* frame,
      bool navigation,
      bool worker,
      network::URLLoaderFactoryBuilder& builder,
      mojo::PendingRemote<network::mojom::TrustedURLLoaderHeaderClient>*
          header_client);
  ~EgressController() override;
  base::DictValue Context(const base::DictValue& params);
  base::DictValue Install(const base::DictValue& params);
  base::DictValue Revoke(const base::DictValue& params);
  std::pair<std::string, content::StoragePartitionConfig> ReserveIsolation(
      const std::string& run_id,
      const std::string& task_id,
      int task_revision);
  bool RegisterIsolation(content::WebContents* page,
                         const std::string& isolation_id,
                         const std::string& run_id,
                         const std::string& task_id,
                         int task_revision);
  void ReleaseIsolation(const std::string& page_id);
  void IsolationReceipt(const std::string& event,
                        const std::string& run_id,
                        const std::string& page_id,
                        const std::string& isolation_id,
                        content::RenderFrameHost* frame,
                        const std::string& reason);
  bool IsIsolatedPage(content::WebContents* page) const;
  std::optional<NativePersonReadReceipt> CapturePersonRead(
      content::WebContents* page);
  bool MayReadPerson(const NativePersonReadReceipt& receipt);
  void Disconnect();
  // Only the native platform admission producer calls this with its original
  // current document. Clears existing request authority before callbacks and
  // latches control so an already queued Install cannot rearm the agent.
  std::optional<NativeCdpRetirementReceipt> RetireForNativePersonInput(
      content::WebContents* page, const content::WeakDocumentPtr& document,
      base::TimeTicks original_event_ticks, base::TimeTicks admitted_ticks,
      bool original_clock_valid);
  // Called on UI immediately before the original protocol host dispatch.
  // Revalidates the original attachment lease and counts no refused messages.
  bool RecordFinalCdpDispatch(const EgressRequestContext& context,
                              const base::DictValue& original_lease);
  // Navigation may deliver only its original protocol receipt after commit.
  // This validates retained authority; it never permits old-session effects.
  bool HasOriginalCdpNavigationAuthority(
      const base::DictValue& original_lease,
      const content::WeakDocumentPtr& current_document) const;
  base::DictValue RetireCdpNavigation(
      const base::DictValue& original_lease,
      const content::WeakDocumentPtr& committed_document);
  bool AllowUninspectable(content::RenderFrameHost* frame,
                          const std::string& kind);
  bool ProtectCredential(content::RenderFrameHost* frame,
                         std::u16string_view username,
                         std::u16string_view password);
  void Check(const EgressRequestContext& context,
             const network::ResourceRequest& request,
             const net::HttpRequestHeaders& headers,
             bool final_headers,
             base::OnceCallback<void(bool)> callback);
  bool IsProtected(const EgressRequestContext& context);
  bool MayContinue(const EgressRequestContext& context);
  base::CallbackListSubscription ObserveAuthority(
      base::RepeatingClosure callback);
  base::WeakPtr<EgressController> GetWeakPtr();
  OwnerMutationFence& owner_mutations() { return owner_mutations_; }
  // Actual current primary-frame lease, never inferred from page captions.
  base::DictValue PermissionAuthority(content::RenderFrameHost* frame);
  void Receipt(const std::string& request_id,
               const std::string& kind,
               const std::string& phase,
               const std::string& reason,
               bool allowed);

 private:
  struct PageState;
  struct Credential;
  struct Pending;
  struct InFlight;
  struct Isolation;
  bool PersonReadPage(content::WebContents* page);
  void RetirePersonReads();
  const Isolation* IsolationForPage(const std::string& page_id,
                                    content::RenderFrameHost* frame) const;
  void RetryPending();
  // Removes authority before invoking callbacks so reentrant requests fail
  // closed.
  void CancelChecks(const std::set<std::string>& page_ids,
                    bool all,
                    const std::string& lease_id = {});
  explicit EgressController(Profile* profile);
  bool Current(const EgressRequestContext& context,
               const base::DictValue& lease) const;
  void Answer(const std::string& request_id,
              bool ok,
              const std::string& result_json,
              const std::string& error_code);
  raw_ptr<Profile> profile_;
  std::map<std::string, std::unique_ptr<PageState>> pages_;
  std::map<std::string, std::unique_ptr<Isolation>> isolations_by_run_;
  std::map<std::string, std::string> isolation_run_by_page_;
  std::set<std::string> created_isolation_receipts_;
  size_t isolation_receipt_count_ = 0;
  std::map<std::string, std::vector<Credential>> credentials_by_run_;
  bool ambiguous_transport_used_ = false;
  std::vector<content::WeakDocumentPtr> opaque_documents_;
  std::vector<std::unique_ptr<Pending>> pending_;
  std::map<std::string, std::unique_ptr<InFlight>> in_flight_;
  base::OneShotTimer pending_timer_;
  base::RepeatingClosureList authority_observers_;
  OwnerMutationFence owner_mutations_;
  std::string person_read_retirement_generation_;
  base::CallbackListSubscription person_read_mutation_subscription_;
  size_t receipt_count_ = 0;
  base::WeakPtrFactory<EgressController> weak_factory_{this};
};
}  // namespace aux
#endif
