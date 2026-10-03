// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_UTILITY_APPEARANCE_OWNER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_UTILITY_APPEARANCE_OWNER_H_
#include <optional>
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "base/memory/weak_ptr.h"
#include "base/values.h"
class WebUIBrowserUI;
namespace aux {
// Read-only actual current shell/BWI/page association. No caller selectors,
// identity creation, window creation, native effects, or rendering claims.
std::optional<base::DictValue> ReadNativeUtilityAppearanceOwner(
    base::WeakPtr<WebUIBrowserUI> ui);
// Equality also validates the closed native record; it cannot admit a caller
// record in place of either actual producer read.
bool NativeUtilityAppearanceOwnerMatches(const base::DictValue& before,
                                        const base::DictValue& after);
}  // namespace aux
#endif
#endif
