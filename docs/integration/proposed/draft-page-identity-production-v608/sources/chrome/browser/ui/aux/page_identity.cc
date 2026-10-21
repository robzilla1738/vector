// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/page_identity.h"

#include <utility>

#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/sessions/session_service.h"
#include "components/sessions/content/session_tab_helper.h"
#include "content/public/browser/web_contents.h"
#include "ui/gfx/geometry/size.h"

namespace aux {
namespace {

constexpr char kPageIdExtraDataKey[] = "aux.page_id";
constexpr char kRuntimeOwnedExtraDataKey[] = "aux.runtime_owned";
constexpr char kEphemeralTaskExtraDataKey[] = "aux.ephemeral_task";

bool IsValidPageId(const std::string& id) {
  if (base::Uuid::ParseLowercase(id).is_valid()) {
    return true;
  }
  if (id.size() < 8 || id.size() > 128 || id.rfind("p_", 0) != 0) {
    return false;
  }
  for (char character : id) {
    if ((character < 'a' || character > 'z') &&
        (character < '0' || character > '9') && character != '_') {
      return false;
    }
  }
  return true;
}

}  // namespace

PageIdentity::PageIdentity(content::WebContents* contents, std::string id)
    : content::WebContentsUserData<PageIdentity>(*contents),
      id_(std::move(id)) {}

PageIdentity::~PageIdentity() = default;

std::string PageIdentity::GetOrCreate(Profile* profile,
                                      content::WebContents* contents) {
  PageIdentity* identity = FromWebContents(contents);
  if (!identity) {
    const std::string id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    CreateForWebContents(contents, id);
    identity = FromWebContents(contents);
  }
  identity->Persist(profile, contents);
  return identity->id();
}

bool PageIdentity::IsValid(const std::string& id) {
  return IsValidPageId(id);
}

bool PageIdentity::Assign(Profile* profile,
                          content::WebContents* contents,
                          const std::string& id) {
  if (!contents || !IsValidPageId(id)) {
    return false;
  }
  if (auto* identity = FromWebContents(contents)) {
    identity->id_ = id;
    identity->persisted_ = false;
    identity->Persist(profile, contents);
  } else {
    CreateForWebContents(contents, id);
    FromWebContents(contents)->Persist(profile, contents);
  }
  return true;
}

void PageIdentity::Persist(Profile* profile, content::WebContents* contents) {
  if (persisted_ || !profile || profile->IsOffTheRecord()) {
    return;
  }
  SessionService* service = SessionServiceFactory::GetForProfile(profile);
  const SessionID window_id =
      sessions::SessionTabHelper::IdForWindowContainingTab(contents);
  const SessionID tab_id = sessions::SessionTabHelper::IdForTab(contents);
  if (service && window_id.is_valid() && tab_id.is_valid()) {
    service->AddTabExtraData(window_id, tab_id, kPageIdExtraDataKey, id_);
    service->AddTabExtraData(window_id, tab_id, "aux.space_id", space_id_);
    service->AddTabExtraData(window_id, tab_id, "aux.workspace_id", workspace_id_);
    persisted_ = true;
  }
}

void PageIdentity::BindSpace(Profile* profile, content::WebContents* contents,
                             std::string space_id, std::string workspace_id) {
  space_id_ = std::move(space_id);
  workspace_id_ = std::move(workspace_id);
  persisted_ = false;
  Persist(profile, contents);
}

void PageIdentity::Transfer(content::WebContents* from,
                            content::WebContents* to) {
  if (from == to || FromWebContents(to)) {
    return;
  }
  if (PageIdentity* previous = FromWebContents(from)) {
    CreateForWebContents(to, previous->id());
    PageIdentity* created = FromWebContents(to);
    created->runtime_owned_ = previous->runtime_owned_;
    created->runtime_work_retired_ = previous->runtime_work_retired_;
    created->space_id_ = previous->space_id_;
    created->workspace_id_ = previous->workspace_id_;
  }
}

void PageIdentity::MarkRuntimeOwned(Profile* profile,
                                    content::WebContents* contents) {
  GetOrCreate(profile, contents);
  PageIdentity* identity = FromWebContents(contents);
  if (identity->runtime_owned_) {
    return;
  }
  identity->runtime_owned_ = true;
  if (!profile || profile->IsOffTheRecord()) {
    return;
  }
  SessionService* service = SessionServiceFactory::GetForProfile(profile);
  const SessionID window_id =
      sessions::SessionTabHelper::IdForWindowContainingTab(contents);
  const SessionID tab_id = sessions::SessionTabHelper::IdForTab(contents);
  if (service && window_id.is_valid() && tab_id.is_valid()) {
    service->AddTabExtraData(window_id, tab_id, kRuntimeOwnedExtraDataKey, "1");
  }
}

void PageIdentity::MarkEphemeralTask(Profile* profile,
                                     content::WebContents* contents) {
  if (!profile || profile->IsOffTheRecord() || !contents) {
    return;
  }
  SessionService* service = SessionServiceFactory::GetForProfile(profile);
  const SessionID window_id =
      sessions::SessionTabHelper::IdForWindowContainingTab(contents);
  const SessionID tab_id = sessions::SessionTabHelper::IdForTab(contents);
  if (service && window_id.is_valid() && tab_id.is_valid()) {
    service->AddTabExtraData(window_id, tab_id,
                             kEphemeralTaskExtraDataKey, "1");
  }
}

bool PageIdentity::IsEphemeralTaskExtraData(
    const std::map<std::string, std::string>& extra_data) {
  const auto it = extra_data.find(kEphemeralTaskExtraDataKey);
  return it != extra_data.end() && it->second == "1";
}

void PageIdentity::RestoreFromExtraData(
    content::WebContents* contents,
    const std::map<std::string, std::string>& extra_data) {
  auto entry = extra_data.find(kPageIdExtraDataKey);
  if (entry == extra_data.end() || FromWebContents(contents)) {
    return;
  }
  if (IsValidPageId(entry->second)) {
    CreateForWebContents(contents, entry->second);
    FromWebContents(contents)->runtime_owned_ =
        extra_data.contains(kRuntimeOwnedExtraDataKey) &&
        extra_data.at(kRuntimeOwnedExtraDataKey) == "1";
    const auto space = extra_data.find("aux.space_id");
    const auto workspace = extra_data.find("aux.workspace_id");
    if (space != extra_data.end() && workspace != extra_data.end() &&
        !space->second.empty() && space->second.size() <= 128 &&
        !workspace->second.empty() && workspace->second.size() <= 128) {
      FromWebContents(contents)->space_id_ = space->second;
      FromWebContents(contents)->workspace_id_ = workspace->second;
    }
  }
}

WEB_CONTENTS_USER_DATA_KEY_IMPL(PageIdentity);

}  // namespace aux
