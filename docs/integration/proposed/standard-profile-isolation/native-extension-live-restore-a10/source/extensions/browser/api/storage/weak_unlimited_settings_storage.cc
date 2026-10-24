// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "extensions/browser/api/storage/weak_unlimited_settings_storage.h"

#include <memory>
#include <utility>

using value_store::ValueStore;

namespace extensions {

WeakUnlimitedSettingsStorage::WeakUnlimitedSettingsStorage(
    ValueStore* delegate)
    : delegate_(delegate) {}

WeakUnlimitedSettingsStorage::~WeakUnlimitedSettingsStorage() = default;

size_t WeakUnlimitedSettingsStorage::GetBytesInUse(const std::string& key) {
  return delegate_->GetBytesInUse(key);
}

size_t WeakUnlimitedSettingsStorage::GetBytesInUse(
    const std::vector<std::string>& keys) {
  return delegate_->GetBytesInUse(keys);
}


size_t WeakUnlimitedSettingsStorage::GetBytesInUse() {
  return delegate_->GetBytesInUse();
}

ValueStore::ReadResult WeakUnlimitedSettingsStorage::GetKeys() {
  return delegate_->GetKeys();
}

ValueStore::ReadResult WeakUnlimitedSettingsStorage::Get(
    const std::string& key) {
  return delegate_->Get(key);
}

ValueStore::ReadResult WeakUnlimitedSettingsStorage::Get(
    const std::vector<std::string>& keys) {
  return delegate_->Get(keys);
}

ValueStore::ReadResult WeakUnlimitedSettingsStorage::Get() {
  return delegate_->Get();
}

ValueStore::WriteResult WeakUnlimitedSettingsStorage::Set(
    WriteOptions options, const std::string& key, const base::Value& value) {
  return delegate_->Set(IGNORE_QUOTA, key, value);
}

ValueStore::WriteResult WeakUnlimitedSettingsStorage::Set(
    WriteOptions options,
    const base::DictValue& values) {
  return delegate_->Set(IGNORE_QUOTA, values);
}

ValueStore::WriteResult WeakUnlimitedSettingsStorage::Remove(
    const std::string& key) {
  return delegate_->Remove(key);
}

ValueStore::WriteResult WeakUnlimitedSettingsStorage::Remove(
    const std::vector<std::string>& keys) {
  return delegate_->Remove(keys);
}

ValueStore::WriteResult WeakUnlimitedSettingsStorage::Clear() {
  return delegate_->Clear();
}

ValueStore::AuxUiPreferenceCaptureResult
WeakUnlimitedSettingsStorage::CaptureAuxUiPreferencesForMigration() {
  return delegate_->CaptureAuxUiPreferencesForMigration();
}

ValueStore::Status WeakUnlimitedSettingsStorage::CommitAuxUiPreferenceMigration(
    std::unique_ptr<AuxUiPreferenceCapture> capture) {
  return delegate_->CommitAuxUiPreferenceMigration(std::move(capture));
}

ValueStore::AuxUiPreferenceReadbackResult
WeakUnlimitedSettingsStorage::CommitRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return delegate_->CommitRetainedAuxUiPreferenceMigration(std::move(capture));
}
ValueStore::AuxUiPreferenceReadbackResult
WeakUnlimitedSettingsStorage::ReadRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return delegate_->ReadRetainedAuxUiPreferenceMigration(std::move(capture));
}
ValueStore::AuxUiPreferenceReadbackResult
WeakUnlimitedSettingsStorage::RestoreRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return delegate_->RestoreRetainedAuxUiPreferenceMigration(std::move(capture));
}

}  // namespace extensions
