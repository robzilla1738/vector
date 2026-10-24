// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef COMPONENTS_SERVICES_STORAGE_DOM_STORAGE_AUX_UI_CACHE_COHORT_H_
#define COMPONENTS_SERVICES_STORAGE_DOM_STORAGE_AUX_UI_CACHE_COHORT_H_
#include <map>
#include <optional>
#include <vector>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/unguessable_token.h"
#include "components/services/storage/dom_storage/db_status.h"
#include "mojo/public/cpp/bindings/remote_set.h"
#include "mojo/public/cpp/bindings/receiver_set.h"
#include "third_party/blink/public/common/storage_key/storage_key.h"
#include "third_party/blink/public/mojom/dom_storage/storage_area.mojom.h"
namespace storage {
// Owned by the actual native StorageArea/session wrapper and bound to its
// existing observer set. Replies are observations of those retained endpoints,
// not profile/admission authority or backend/directory completion.
class AuxUiCacheCohort {
 public:
  using Callback = base::OnceCallback<void(DbStatus)>;
  using Entries = std::vector<blink::mojom::AuxUiCacheEntryPtr>;
  AuxUiCacheCohort(blink::mojom::StorageArea& implementation,
      mojo::RemoteSet<blink::mojom::StorageAreaObserver>& observers,
      mojo::ReceiverSet<blink::mojom::StorageArea>& receivers,
      blink::StorageKey storage_key, std::string namespace_id);
  ~AuxUiCacheCohort();
  AuxUiCacheCohort(const AuxUiCacheCohort&) = delete;
  AuxUiCacheCohort& operator=(const AuxUiCacheCohort&) = delete;
  static StatusOr<Entries> DecodeSelected(
      const std::map<std::vector<uint8_t>, std::vector<uint8_t>>& entries, bool local);
  static bool IsReviewedKey(const std::vector<uint8_t>& key, bool local);
  void Prepare(const base::UnguessableToken& request, Callback callback);
  void Read(Callback callback);
  void Validate(Callback callback);
  void Stage(const Entries& source, const Entries& target, Callback callback);
  void StageRecovery(const Entries& source, const Entries& target, Callback callback);
  void RestoreRecovery(Callback callback);
  void Publish(Callback callback);
  void Restore(Callback callback);
  void Release(const base::UnguessableToken& original_request, Callback callback);
  bool ObserveHeldPhase(const base::UnguessableToken& request, bool target) const;
  bool held() const { return request_.has_value(); }
  bool pending() const { return pending_; }
  bool has_frozen_bindings() const { return !frozen_receivers_.empty(); }
  const std::string& namespace_id() const { return namespace_id_; }
  base::WeakPtr<AuxUiCacheCohort> GetWeakPtr() { return weak_.GetWeakPtr(); }
  std::vector<blink::mojom::AuxUiCacheReplyPtr> CopyReports() const;
 private:
  enum class Operation { kPrepare, kRead, kValidate, kStage, kPublish, kRestore, kRelease, kRecoveryStage, kRecoveryRestore };
  enum class Custody { kUnknown, kHeld, kNotHeld };
  struct Node {
    Custody custody = Custody::kUnknown;
    std::optional<base::UnguessableToken> token;
    blink::mojom::AuxUiCacheReplyPtr report;
    blink::mojom::AuxUiCacheReplyPtr original;
  };
  void Run(Operation operation, const Entries& source, const Entries& target, Callback callback);
  void Reply(mojo::RemoteSetElementId id, Operation operation,
             blink::mojom::AuxUiCacheReplyPtr reply);
  void Released(mojo::RemoteSetElementId id, bool released);
  void OneDone(DbStatus status);
  void Finish();
  bool SameEndpoints() const;
  raw_ref<blink::mojom::StorageArea> implementation_;
  raw_ref<mojo::RemoteSet<blink::mojom::StorageAreaObserver>> observers_;
  raw_ref<mojo::ReceiverSet<blink::mojom::StorageArea>> receivers_;
  std::vector<mojo::PendingReceiver<blink::mojom::StorageArea>> frozen_receivers_;
  const blink::StorageKey storage_key_;
  const std::string namespace_id_;
  std::optional<base::UnguessableToken> request_;
  std::optional<base::UnguessableToken> last_released_;
  std::map<mojo::RemoteSetElementId, Node> nodes_;
  bool pending_ = false;
  bool prepared_ = false;
  size_t remaining_ = 0;
  Operation operation_ = Operation::kPrepare;
  std::optional<DbStatus> error_;
  Entries expected_source_;
  Entries expected_target_;
  std::optional<bool> zero_endpoint_phase_published_;
  bool recovery_plan_set_ = false;
  Entries recovery_source_;
  Entries recovery_target_;
  Callback callback_;
  base::WeakPtrFactory<AuxUiCacheCohort> weak_{this};
};
}  // namespace storage
#endif
