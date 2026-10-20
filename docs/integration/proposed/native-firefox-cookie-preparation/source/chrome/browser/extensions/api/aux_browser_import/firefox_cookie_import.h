#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_FIREFOX_COOKIE_IMPORT_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_FIREFOX_COOKIE_IMPORT_H_

#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"

class Profile;

namespace aux {

// UI sequence. `prepared` acknowledges the actual host's prelaunch preparation;
// it is NOT the cookie import result. `settled` reports the native writes after
// all callbacks, or the worker failure/empty result before prepared is invoked.
// The real import owner supplies its weak running predicate. Stopped owners do
// not receive destination completion; writes already queued cannot be undone.
void PrepareFirefoxCookies(base::WeakPtr<Profile> profile,
                           const base::FilePath& source_profile,
                           base::RepeatingCallback<bool()> is_running,
                           base::OnceCallback<void(bool)> prepared,
                           base::OnceCallback<void(bool)> settled);

}  // namespace aux

#endif  // CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_FIREFOX_COOKIE_IMPORT_H_
