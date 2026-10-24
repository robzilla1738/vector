// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "components/services/storage/dom_storage/aux_ui_cache_cohort.h"
#include <cstring>

#include "base/functional/bind.h"
#include "base/containers/span.h"
#include "base/task/sequenced_task_runner.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "url/gurl.h"
#include "url/origin.h"
namespace storage {
namespace {
AuxUiCacheCohort::Entries CloneEntries(const AuxUiCacheCohort::Entries& source) {
  AuxUiCacheCohort::Entries result;
  for (const auto& entry : source) result.push_back(entry.Clone());
  return result;
}
bool SameEntries(const AuxUiCacheCohort::Entries& left, const AuxUiCacheCohort::Entries& right) {
  if (left.size() != right.size()) return false;
  for (size_t i = 0; i < left.size(); ++i)
    if (!left[i] || !right[i] || left[i]->key != right[i]->key || left[i]->value != right[i]->value) return false;
  return true;
}
bool SameDocuments(const blink::mojom::AuxUiCacheReply& left, const blink::mojom::AuxUiCacheReply& right) {
  if (left.sources.size() != right.sources.size()) return false;
  for (size_t i = 0; i < left.sources.size(); ++i) {
    if (!left.sources[i] || !right.sources[i] ||
        left.sources[i]->source_id != right.sources[i]->source_id ||
        left.sources[i]->frame != right.sources[i]->frame ||
        left.sources[i]->document != right.sources[i]->document) return false;
  }
  return true;
}
}  // namespace
AuxUiCacheCohort::AuxUiCacheCohort(blink::mojom::StorageArea& implementation,
    mojo::RemoteSet<blink::mojom::StorageAreaObserver>& observers,
    mojo::ReceiverSet<blink::mojom::StorageArea>& receivers,
    blink::StorageKey storage_key, std::string namespace_id)
    : implementation_(implementation), observers_(observers), receivers_(receivers),
      storage_key_(std::move(storage_key)), namespace_id_(std::move(namespace_id)) {}
AuxUiCacheCohort::~AuxUiCacheCohort() = default;
bool AuxUiCacheCohort::SameEndpoints() const {
  if (observers_.size() != nodes_.size()) return false;
  for (auto iterator = observers_.begin(); iterator != observers_.end(); ++iterator)
    if (!nodes_.contains(iterator.id())) return false;
  return true;
}
StatusOr<AuxUiCacheCohort::Entries> AuxUiCacheCohort::DecodeSelected(
    const std::map<std::vector<uint8_t>, std::vector<uint8_t>>& entries, bool local) {
  std::map<std::u16string, std::u16string> decoded;
  auto units = [](const std::vector<uint8_t>& raw, bool tagged, bool key)
      -> std::optional<std::u16string> {
    size_t offset = 0;
    bool single_byte = key;
    if (tagged) {
      if (raw.empty() || raw[0] > 1) return std::nullopt;
      offset = 1; single_byte = raw[0] == 1;
    } else if (key && raw.size() >= 2 && (raw[0] == 0 || raw[1] == 0)) {
      single_byte = false;
    }
    std::u16string result;
    if (single_byte) {
      for (size_t i = offset; i < raw.size(); ++i) {
        // Every reviewed native key/scope in this finite slice is ASCII.
        if (key && (raw[i] < 0x20 || raw[i] > 0x7e)) return std::nullopt;
        result.push_back(raw[i]);
      }
    } else {
      if ((raw.size() - offset) % sizeof(char16_t)) return std::nullopt;
      for (size_t i = offset; i < raw.size(); i += sizeof(char16_t)) {
        char16_t unit; base::byte_span_from_ref(unit).copy_from(base::span(raw).subspan(i, sizeof(unit)));
        if (key && (unit < 0x20 || unit > 0x7e)) return std::nullopt;
        result.push_back(unit);
      }
    }
    return result;
  };
  for (const auto& [key, value] : entries) {
    auto decoded_key = units(key, local, true);
    auto decoded_value = units(value, local, false);
    if (!decoded_key || !decoded_value ||
        !decoded.emplace(std::move(*decoded_key), std::move(*decoded_value)).second)
      return base::unexpected(DbStatus::NotSupported("Exact native UI storage units refused"));
  }
  Entries result;
  for (const auto& [key, value] : decoded) {
    auto entry = blink::mojom::AuxUiCacheEntry::New();
    entry->key.assign(key.begin(), key.end()); entry->value.assign(value.begin(), value.end());
    result.push_back(std::move(entry));
  }
  return result;
}
bool AuxUiCacheCohort::IsReviewedKey(const std::vector<uint8_t>& key, bool local) {
  std::map<std::vector<uint8_t>, std::vector<uint8_t>> input;
  input.emplace(key, local ? std::vector<uint8_t>{1} : std::vector<uint8_t>{});
  auto decoded = DecodeSelected(input, local);
  if (!decoded.has_value() || decoded->size() != 1) return false;
  std::string name;
  for (uint16_t unit : decoded.value()[0]->key) {
    if (unit < 0x20 || unit > 0x7e) return false;
    name.push_back(unit);
  }
  if (local) {
    for (std::string_view exact : {
        "aside.new-tab.omnibox-mode.v1", "aux.new-tab.omnibox-mode.v2",
        "aside.browserTabStyle", "aux.browserTabStyle.v2",
        "aside.last-final-confirm.v1", "aux.last-final-confirm.v2",
        "aside.last-permission-mode.v1", "aux.last-permission-mode.v2",
        "aside.new-tab.onboarding-helper-state.v1", "aux.new-tab.onboarding-helper-state.v2"})
      if (name == exact) return true;
  }
  for (std::string_view prefix : {"aside.chat-draft.v2:", "aux.chat-draft.v3:",
       "aside.chat-draft.v1:", "aux.chat-draft-text.v1:"})
    if (name.starts_with(prefix)) return true;
  return !local && (name.starts_with("aside.sidepanel-new-session-settings.v1:") ||
      name.starts_with("aux.sidepanel-new-session-settings.v2:") ||
      name == "aside.chat-pending-new-session-message.v1" || name == "aux.chat-pending-new-session-message.v2");
}
void AuxUiCacheCohort::Prepare(const base::UnguessableToken& request, Callback callback) {
  if (request.is_empty() || request_ || pending_) {
    std::move(callback).Run(DbStatus::IOError("Discover the original cache hold instead of preparing again")); return;
  }
  request_ = request;
  // Unbinding retains actual pending receiver handles/messages. Dispatch later
  // resumes through the real receiver context, including bad-message checks.
  // No RPC callback is dropped or falsely acknowledged by a native task queue.
  frozen_receivers_ = receivers_.TakeReceivers();
  for (auto iterator = observers_.begin(); iterator != observers_.end(); ++iterator)
    nodes_.try_emplace(iterator.id());
  Run(Operation::kPrepare, {}, {}, std::move(callback));
}
void AuxUiCacheCohort::Read(Callback callback) { Run(Operation::kRead, {}, {}, std::move(callback)); }
void AuxUiCacheCohort::Validate(Callback callback) { Run(Operation::kValidate, {}, {}, std::move(callback)); }
void AuxUiCacheCohort::Stage(const Entries& source, const Entries& target, Callback callback) {
  Run(Operation::kStage, source, target, std::move(callback));
}
void AuxUiCacheCohort::Publish(Callback callback) { Run(Operation::kPublish, {}, {}, std::move(callback)); }
void AuxUiCacheCohort::Restore(Callback callback) { Run(Operation::kRestore, {}, {}, std::move(callback)); }
void AuxUiCacheCohort::Release(const base::UnguessableToken& original_request, Callback callback) {
  if (!request_ && last_released_ == original_request) { std::move(callback).Run(DbStatus::OK()); return; }
  if (request_ != original_request) { std::move(callback).Run(DbStatus::IOError("Original cache release correlation missing")); return; }
  Run(Operation::kRelease, {}, {}, std::move(callback));
}
std::vector<blink::mojom::AuxUiCacheReplyPtr> AuxUiCacheCohort::CopyReports() const {
  std::vector<blink::mojom::AuxUiCacheReplyPtr> result;
  for (const auto& [id, node] : nodes_) if (node.report) result.push_back(node.report.Clone());
  return result;
}
void AuxUiCacheCohort::Run(Operation operation, const Entries& source,
                          const Entries& target, Callback callback) {
  const bool ui_origin = storage_key_.origin() == url::Origin::Create(
      GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
  if (!request_ || pending_ || (operation != Operation::kRelease && !SameEndpoints()) ||
      ((operation == Operation::kStage || operation == Operation::kPublish || operation == Operation::kValidate) && !prepared_)) {
    std::move(callback).Run(DbStatus::IOError("Actual cache endpoint inventory is not held")); return;
  }
  if (operation == Operation::kStage) {
    expected_source_ = CloneEntries(source); expected_target_ = CloneEntries(target);
  }
  pending_ = true; operation_ = operation; remaining_ = nodes_.size();
  error_.reset(); callback_ = std::move(callback);
  if (!ui_origin) {
    // Non-UI maps receive only a native receiver hold. Their renderer caches
    // are not touched and cannot be mistaken for captured Aux UI stores.
    remaining_ = 1; OneDone(DbStatus::OK()); return;
  }
  if (nodes_.empty()) { remaining_ = 1; OneDone(DbStatus::OK()); return; }
  // The finite set is snapped before dispatch. Each real remote callback must
  // return or disconnect; a hung renderer remains pending, never timed-out idle.
  for (auto& [id, node] : nodes_) {
    if (operation == Operation::kRelease && node.custody == Custody::kNotHeld) {
      OneDone(DbStatus::OK()); continue;
    }
    auto* observer = observers_.Get(id);
    if (!observer) { OneDone(DbStatus::IOError("Original cache endpoint disappeared")); continue; }
    if (operation != Operation::kPrepare && operation != Operation::kRead && !node.token) {
      OneDone(DbStatus::IOError("Original cache lease token remains unknown")); continue;
    }
    if (operation == Operation::kRelease) {
      observer->ReleaseAuxUiCacheMigration(*request_, *node.token,
          mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
              &AuxUiCacheCohort::Released, weak_.GetWeakPtr(), id), false));
      continue;
    }
    auto reply = mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
        &AuxUiCacheCohort::Reply, weak_.GetWeakPtr(), id, operation),
        blink::mojom::AuxUiCacheReplyPtr());
    switch (operation) {
      case Operation::kPrepare: observer->BeginAuxUiCacheMigration(*request_, std::move(reply)); break;
      case Operation::kRead: observer->ReadAuxUiCacheMigration(*request_, std::move(reply)); break;
      case Operation::kValidate: observer->ValidateAuxUiCacheMigration(*request_, *node.token, std::move(reply)); break;
      case Operation::kStage: observer->StageAuxUiCacheMigration(*request_, *node.token, CloneEntries(source), CloneEntries(target), std::move(reply)); break;
      case Operation::kPublish: observer->PublishAuxUiCacheMigration(*request_, *node.token, std::move(reply)); break;
      case Operation::kRestore: observer->RestoreAuxUiCacheMigration(*request_, *node.token, std::move(reply)); break;
      case Operation::kRelease: NOTREACHED();
    }
  }
}
void AuxUiCacheCohort::Reply(mojo::RemoteSetElementId id, Operation operation,
                            blink::mojom::AuxUiCacheReplyPtr reply) {
  auto found = nodes_.find(id);
  if (!pending_ || operation != operation_ || found == nodes_.end()) return;
  auto& node = found->second;
  bool valid = reply && reply->held && reply->request_id == request_ &&
      reply->token && !reply->token->is_empty() && (!node.token || node.token == reply->token);
  if (valid) {
    node.token = reply->token;
    node.custody = Custody::kHeld;
  } else if (reply && !reply->held &&
             (operation == Operation::kRead || operation == Operation::kPrepare)) {
    // An authenticated response from this exact observer proves only that it
    // has no retained hold. It cannot qualify capture and does not retire work.
    node.custody = Custody::kNotHeld;
  }
  if (!valid || !reply->ok || reply->tainted || !SameEndpoints()) {
    if (reply) node.report = std::move(reply);
    OneDone(DbStatus::IOError("Actual cache hold is refused, changed or uncertain")); return;
  }
  if (reply->sources.empty() || reply->sources.size() > 256) {
    node.report = std::move(reply);
    OneDone(DbStatus::IOError("Actual cache document inventory is incomplete")); return;
  }
  for (const auto& source : reply->sources) {
    if (!source || source->source_id.is_zero()) {
      node.report = std::move(reply);
      OneDone(DbStatus::IOError("Actual cache source stamp is invalid")); return;
    }
  }
  if (node.original && (!SameDocuments(*reply, *node.original) ||
      !SameEntries(reply->source_entries, node.original->source_entries))) {
    node.report = std::move(reply);
    OneDone(DbStatus::IOError("Original cache source snapshot or documents changed")); return;
  }
  if (operation == Operation::kStage &&
      (reply->published || !SameEntries(reply->source_entries, expected_source_) ||
       !SameEntries(reply->staged_entries, expected_target_))) {
    node.report = std::move(reply);
    OneDone(DbStatus::IOError("Actual private cache target readback disagrees")); return;
  }
  if ((operation == Operation::kPublish && !reply->published) ||
      (operation == Operation::kRestore && reply->published)) {
    node.report = std::move(reply);
    OneDone(DbStatus::IOError("Actual cache publication state disagrees")); return;
  }
  if (!node.original) node.original = reply.Clone();
  node.report = std::move(reply);
  OneDone(DbStatus::OK());
}
void AuxUiCacheCohort::Released(mojo::RemoteSetElementId id, bool released) {
  auto found = nodes_.find(id);
  if (!pending_ || operation_ != Operation::kRelease || found == nodes_.end()) return;
  if (released) { found->second.custody = Custody::kNotHeld; found->second.token.reset(); }
  OneDone(released ? DbStatus::OK() : DbStatus::IOError("Original cache release remains uncertain"));
}
void AuxUiCacheCohort::OneDone(DbStatus status) {
  CHECK(pending_); CHECK_GT(remaining_, 0u);
  if (!status.ok() && !error_) error_ = std::move(status);
  if (--remaining_) return;
  // Never run an owning callback or clear the node map from inside the
  // dispatch loop, including immediate/default lost-endpoint replies.
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&AuxUiCacheCohort::Finish, weak_.GetWeakPtr()));
}
void AuxUiCacheCohort::Finish() {
  CHECK(pending_); CHECK_EQ(remaining_, 0u);
  pending_ = false;
  DbStatus outcome = error_.value_or(DbStatus::OK());
  if (!outcome.ok()) prepared_ = false;
  else if (operation_ == Operation::kPrepare || operation_ == Operation::kRead || operation_ == Operation::kValidate)
    prepared_ = true;
  if (operation_ == Operation::kRelease && outcome.ok()) {
    last_released_ = request_;
    request_.reset(); nodes_.clear(); prepared_ = false;
    expected_source_.clear(); expected_target_.clear();
    auto receivers = std::move(frozen_receivers_);
    for (auto& receiver : receivers) receivers_.Add(&implementation_, std::move(receiver));
  }
  auto callback = std::move(callback_);
  std::move(callback).Run(std::move(outcome));
}
}  // namespace storage
