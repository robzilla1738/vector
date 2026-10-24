// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/organization/organization_service.h"

#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_codec.h"

namespace aux::organization {
namespace {
constexpr size_t kUndoEstimatedBytesLimit = 16 * 1024 * 1024;
size_t SnapshotCost(const Snapshot& snapshot) {
  // Account capacities, records and conservative per-map-node allocation
  // overhead. This bounds retained undo history by size as well as count.
  size_t bytes = sizeof(Snapshot) + snapshot.profile_id.capacity();
  for (const auto& [id, space] : snapshot.spaces)
    bytes += sizeof(Space) + sizeof(std::string) + 64 + id.capacity() +
        space.id.capacity() + space.name.capacity() + space.icon.capacity();
  for (const auto& [id, entry] : snapshot.entries)
    bytes += sizeof(Entry) + sizeof(std::string) + 64 + id.capacity() +
        entry.id.capacity() + entry.space_id.capacity() + entry.parent_id.capacity() +
        entry.title.capacity() + entry.launch_url.capacity() + entry.current_url.capacity() +
        entry.archive_operation_id.capacity();
  bytes += snapshot.replay.capacity() * sizeof(ReplayRecord);
  for (const auto& replay : snapshot.replay)
    bytes += replay.operation_id.capacity() + replay.fingerprint.capacity();
  return bytes;
}
}  // namespace
struct OrganizationService::Pending {
  Context context;
  Snapshot previous;
  Mutation mutation;
  Reply reply;
  bool make_undo = true;
};
OrganizationService::OrganizationService(
    Snapshot initial, std::string owner_generation,
    std::unique_ptr<OrganizationStorage> storage)
    : snapshot_(std::move(initial)),
      owner_generation_(std::move(owner_generation)), storage_(std::move(storage)) {
  CHECK(storage_);
  CHECK(!owner_generation_.empty());
  CHECK(Validate(snapshot_) == Error::kNone);
}
OrganizationService::~OrganizationService() {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  Shutdown();
}
const Snapshot& OrganizationService::snapshot() const {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  return snapshot_;
}
bool OrganizationService::blocked() const {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  return blocked_ || shutdown_;
}
bool OrganizationService::pending() const {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  return pending_ != nullptr;
}
Error OrganizationService::Check(const Context& context) const {
  if (shutdown_ || blocked_) return Error::kOwnerLost;
  if (context.profile_id != snapshot_.profile_id) return Error::kForeignProfile;
  if (context.owner_generation != owner_generation_ ||
      !storage_->IsCurrentOwner(snapshot_.profile_id, owner_generation_))
    return Error::kOwnerLost;
  if (pending_) return Error::kBusy;
  return Error::kNone;
}
void OrganizationService::Execute(Context context, Command command, Reply reply) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  CHECK(reply);
  if (auto error = Check(context); error != Error::kNone) {
    std::move(reply).Run({error, snapshot_.revision, {}});
    return;
  }
  if (!CommandUrlsValid(command)) {
    std::move(reply).Run({Error::kInvalid, snapshot_.revision, {}});
    return;
  }
  Mutation mutation = Apply(snapshot_, context, command);
  Start(std::move(context), std::move(mutation), std::move(reply), true);
}
void OrganizationService::ExecuteBatch(Context context,
                                        std::vector<Command> commands,
                                        Reply reply) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  CHECK(reply);
  if (auto error = Check(context); error != Error::kNone) {
    std::move(reply).Run({error, snapshot_.revision, {}});
    return;
  }
  for (const auto& command : commands) {
    if (!CommandUrlsValid(command)) {
      std::move(reply).Run({Error::kInvalid, snapshot_.revision, {}});
      return;
    }
  }
  Mutation mutation = ApplyBatch(snapshot_, context, commands);
  Start(std::move(context), std::move(mutation), std::move(reply), true);
}
void OrganizationService::Undo(Context context, std::string token, Reply reply) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  CHECK(reply);
  if (auto error = Check(context); error != Error::kNone) {
    std::move(reply).Run({error, snapshot_.revision, {}});
    return;
  }
  for (const auto& record : snapshot_.replay) {
    if (record.operation_id == context.operation_id) {
      const auto result = record.fingerprint == "undo:" + token &&
                                  record.base_revision == context.expected_revision
                              ? Error::kReplay : Error::kOperationConflict;
      std::move(reply).Run({result, snapshot_.revision, {}});
      return;
    }
  }
  if (undo_.empty() || undo_.back().token != token ||
      undo_.back().revision != snapshot_.revision) {
    std::move(reply).Run({Error::kUndoUnavailable, snapshot_.revision, {}});
    return;
  }
  Mutation mutation = ApplyUndo(snapshot_, undo_.back().previous, context, token);
  Start(std::move(context), std::move(mutation), std::move(reply), false);
}
void OrganizationService::Start(Context context, Mutation mutation, Reply reply,
                                bool make_undo) {
  if (mutation.error != Error::kNone) {
    std::string token;
    if (mutation.error == Error::kReplay && !undo_.empty() &&
        undo_.back().revision == snapshot_.revision)
      token = undo_.back().token;
    std::move(reply).Run({mutation.error, snapshot_.revision, std::move(token)});
    return;
  }
  CHECK(!pending_);
  auto serialized = EncodeSnapshot(mutation.snapshot);
  const auto target_revision = mutation.snapshot.revision;
  pending_ = std::make_unique<Pending>(Pending{std::move(context), snapshot_,
      std::move(mutation), std::move(reply), make_undo});
  // Adapter may complete synchronously. Install pending state before calling.
  storage_->Commit(std::move(serialized), snapshot_.profile_id,
                   owner_generation_, snapshot_.revision, target_revision,
                   base::BindOnce(&OrganizationService::DidCommit, weak_.GetWeakPtr()));
}
void OrganizationService::DidCommit(WriteReceipt receipt) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (!pending_) return;
  auto pending = std::move(pending_);
  const bool exact = receipt.profile_id == snapshot_.profile_id &&
                     receipt.owner_generation == owner_generation_ &&
                     receipt.revision == pending->mutation.snapshot.revision;
  Error error = Error::kNone;
  if (!exact) error = Error::kStorageUncertain;
  else if (shutdown_ || !storage_->IsCurrentOwner(snapshot_.profile_id,
                                                  owner_generation_))
    error = Error::kOwnerLost;
  else {
    switch (receipt.outcome) {
      case WriteOutcome::kCommitted: break;
      case WriteOutcome::kRefused: error = Error::kStorageRefused; break;
      case WriteOutcome::kFailed: error = Error::kStorageFailed; break;
      case WriteOutcome::kUncertain: error = Error::kStorageUncertain; break;
    }
  }
  if (error != Error::kNone) {
    // Only an exact, pre-write refusal establishes no state was committed.
    // All other cases require a fresh owned read/reconciliation, never rollback
    // another writer or publish an in-memory success to hide uncertainty.
    blocked_ |= error != Error::kStorageRefused;
    const auto alive = weak_.GetWeakPtr();
    const auto revision = snapshot_.revision;
    settled_.Notify();
    if (alive && pending->reply)
      std::move(pending->reply).Run({error, revision, {}});
    return;
  }
  snapshot_ = std::move(pending->mutation.snapshot);
  if (pending->make_undo) {
    const size_t cost = SnapshotCost(pending->previous);
    if (cost <= kUndoEstimatedBytesLimit) {
      undo_.push_back({base::Uuid::GenerateRandomV4().AsLowercaseString(),
                       snapshot_.revision, std::move(pending->previous), cost});
      undo_bytes_ += cost;
      while (undo_.size() > kUndoLimit || undo_bytes_ > kUndoEstimatedBytesLimit) {
        undo_bytes_ -= undo_.front().estimated_bytes;
        undo_.erase(undo_.begin());
      }
    } else {
      undo_.clear(); undo_bytes_ = 0;
    }
  } else {
    CHECK(!undo_.empty());
    undo_bytes_ -= undo_.back().estimated_bytes;
    undo_.pop_back();
    if (!undo_.empty()) undo_.back().revision = snapshot_.revision;
  }
  CommitResult result{Error::kNone, snapshot_.revision,
                       undo_.empty() ? "" : undo_.back().token};
  const auto alive = weak_.GetWeakPtr();
  // Delta publishes only after the actual tuple-bound commit receipt.
  observers_.Notify(pending->mutation.delta);
  if (!alive) return;
  settled_.Notify();
  if (alive && pending->reply) std::move(pending->reply).Run(std::move(result));
}
base::CallbackListSubscription OrganizationService::Observe(
    base::RepeatingCallback<void(const Delta&)> callback) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  return observers_.Add(std::move(callback));
}
base::CallbackListSubscription OrganizationService::ObserveSettled(
    base::RepeatingClosure callback) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  return settled_.Add(std::move(callback));
}
void OrganizationService::Shutdown() {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);
  if (shutdown_) return;
  shutdown_ = true;
  undo_.clear(); undo_bytes_ = 0;
  if (pending_ && pending_->reply)
    std::move(pending_->reply).Run({Error::kOwnerLost, snapshot_.revision, {}});
  // Storage owns custody through real completion even if this service retires.
  // No timeout/drop-callback is translated to successful drain.
}
}  // namespace aux::organization
