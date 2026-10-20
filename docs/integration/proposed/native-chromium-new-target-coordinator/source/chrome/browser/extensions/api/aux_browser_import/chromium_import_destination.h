#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_IMPORT_DESTINATION_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_IMPORT_DESTINATION_H_
#include <memory>
#include <optional>
#include "base/values.h"
#include "components/password_manager/core/browser/password_store/stored_credential.h"
class GURL;
namespace net { class CanonicalCookie; }
namespace aux_import {
// Native-only wrappers around the SAME destination reconstruction used by
// mode1; Blob DTOs never become a public extension wire representation.
std::optional<password_manager::StoredCredential> BuildChromiumImportedPassword(
    const base::DictValue& row);
std::unique_ptr<net::CanonicalCookie> BuildChromiumImportedCookie(
    const base::DictValue& row, GURL& source);
}  // namespace aux_import
#endif
