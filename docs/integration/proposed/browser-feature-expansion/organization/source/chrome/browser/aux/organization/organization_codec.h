// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_CODEC_H_
#define CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_CODEC_H_

#include <optional>
#include <string>
#include <string_view>
#include "base/functional/callback.h"
#include "base/values.h"
#include "chrome/browser/aux/organization/organization_model.h"
namespace aux::organization {
std::optional<uint64_t> ParseCanonicalUint64(std::string_view value);
struct DecodeResult {
  std::optional<Snapshot> snapshot;
  std::string error;
};
base::DictValue EncodeSnapshot(const Snapshot& snapshot);
DecodeResult DecodeSnapshot(const base::DictValue& value,
                            std::string_view expected_profile_id);
// Pure migration proposal: does not write preferences or delete legacy input.
// Factory must persist this snapshot through actual admitted storage before
// publishing it. Retry after a committed migration decodes aux.organization;
// never import pinned_tabs over a nonempty/unknown/newer organization value.
DecodeResult ImportLegacyPins(std::string profile_id,
                              const base::ListValue& legacy,
                              base::RepeatingCallback<std::string()> allocate_id);
bool CommandUrlsValid(const Command& command);
}  // namespace aux::organization
#endif
