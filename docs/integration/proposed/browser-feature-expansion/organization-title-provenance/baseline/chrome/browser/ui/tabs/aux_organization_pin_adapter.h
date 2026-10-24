// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_TABS_AUX_ORGANIZATION_PIN_ADAPTER_H_
#define CHROME_BROWSER_UI_TABS_AUX_ORGANIZATION_PIN_ADAPTER_H_
#include <optional>
#include <string>
#include <vector>
#include "base/functional/callback.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
class Profile;
namespace aux {
using PinCommitReply = base::OnceCallback<void(bool, std::string)>;
// nullopt means loading/unavailable, not an empty successful organization.
std::optional<std::vector<PinnedTabEntry>> ReadOrganizationPinnedEntries(Profile&, bool include_descendants = false);
void CommitOrganizationPin(Profile&, const GURL&, const std::u16string&, size_t index,
                           std::string existing_id, PinCommitReply);
void ReorderOrganizationPin(Profile&, std::string id, size_t index,
                            base::OnceCallback<void(bool)>);
void UnpinOrganizationEntry(Profile&, std::string id, std::string destination_space,
                            base::OnceCallback<void(bool)>);
}  // namespace aux
#endif
