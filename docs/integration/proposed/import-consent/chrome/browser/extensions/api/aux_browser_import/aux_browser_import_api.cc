// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_import/aux_browser_import_api.h"

#include "base/functional/bind.h"
#include "chrome/browser/extensions/api/aux_browser_import/import_service.h"
namespace extensions {
ExtensionFunction::ResponseAction AuxBrowserImportFunction::RunAux() {
  aux_import::ImportService::Get(profile())->Invoke(
      std::string(std::string_view(name()).substr(17)), args().Clone(),
      extension_id(),
      base::BindOnce(
          [](scoped_refptr<AuxBrowserImportFunction> self,
             std::optional<base::Value> result, std::string error) {
            if (!result) {
              self->Respond(self->Error(error));
            } else if (result->is_none()) {
              self->Respond(self->NoArguments());
            } else {
              self->Respond(self->WithArguments(std::move(*result)));
            }
          },
          base::WrapRefCounted(this)));
  return did_respond() ? AlreadyResponded() : RespondLater();
}
}  // namespace extensions
