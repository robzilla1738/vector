// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_SERVICE_H_
#define CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_SERVICE_H_

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include "base/callback_list.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/sequence_checker.h"
#include "base/values.h"
#include "chrome/browser/aux/organization/organization_model.h"
#include "components/keyed_service/core/keyed_service.h"

namespace aux::organization {
enum class WriteOutcome { kCommitted, kRefused, kFailed, kUncertain };
struct WriteReceipt {
  WriteOutcome outcome = WriteOutcome::kUncertain;
  std::string profile_id;
  std::string owner_generation;
  uint64_t revision = 0;
};
// Production adapter is native and profile-owned. It retains real writer
// custody until settlement and must not call kCommitted for merely queued I/O
// or PrefService::CommitPendingWrite's success-less closure. Never expose this
// interface or owner_generation allocation to a renderer.
class OrganizationStorage {
 public:
  virtual ~OrganizationStorage() = default;
  virtual bool IsCurrentOwner(std::string_view profile_id,
                              std::string_view owner_generation) const = 0;
  virtual void Commit(base::DictValue snapshot, std::string profile_id,
                      std::string owner_generation, uint64_t expected_revision,
                      uint64_t new_revision,
                      base::OnceCallback<void(WriteReceipt)> done) = 0;
};
struct CommitResult {
  Error error = Error::kInvalid;
  uint64_t revision = 0;
  std::string undo_token;
};
// One instance per regular native profile, NOT per window. A factory must bind
// actual loaded Profile identity and admitted storage; incognito must not be
// redirected into a regular profile's organization service.
class OrganizationService final : public KeyedService {
 public:
  using Reply = base::OnceCallback<void(CommitResult)>;
  OrganizationService(Snapshot initial, std::string owner_generation,
                      std::unique_ptr<OrganizationStorage> storage);
  ~OrganizationService() override;
  const Snapshot& snapshot() const;
  void Execute(Context context, Command command, Reply reply);
  void ExecuteBatch(Context context, std::vector<Command> commands, Reply reply);
  void Undo(Context context, std::string token, Reply reply);
  base::CallbackListSubscription Observe(
      base::RepeatingCallback<void(const Delta&)> callback);
  bool blocked() const;
  bool pending() const;
  void Shutdown() override;
 private:
  struct Pending;
  struct UndoRecord { std::string token; uint64_t revision; Snapshot previous; };
  void Start(Context context, Mutation mutation, Reply reply,
             bool make_undo);
  void DidCommit(WriteReceipt receipt);
  Error Check(const Context& context) const;
  Snapshot snapshot_;
  const std::string owner_generation_;
  std::unique_ptr<OrganizationStorage> storage_;
  std::unique_ptr<Pending> pending_;
  std::vector<UndoRecord> undo_;
  base::RepeatingCallbackList<void(const Delta&)> observers_;
  bool blocked_ = false;
  bool shutdown_ = false;
  SEQUENCE_CHECKER(sequence_checker_);
  base::WeakPtrFactory<OrganizationService> weak_{this};
};
}  // namespace aux::organization
#endif
