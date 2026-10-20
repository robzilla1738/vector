// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_EXTENSION_IMPORT_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_EXTENSION_IMPORT_H_
#include "base/values.h"
class Profile;
namespace aux_import {
// UI-thread destination owner for the completely prepared native source list.
// Queuing is distinct from successful installation and does not delay the job.
void InstallChromiumExtensions(Profile* profile, const base::ListValue& imports);
}  // namespace aux_import
#endif
