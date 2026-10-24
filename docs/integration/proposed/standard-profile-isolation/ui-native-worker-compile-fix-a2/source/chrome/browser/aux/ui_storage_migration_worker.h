// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_WORKER_H_
#define CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_WORKER_H_

#include <string>
#include "base/functional/callback.h"
#include "base/values.h"

class Profile;
class ExtensionFunction;
namespace aux {
// Native controller calls only. The helper retains the actual canonical worker,
// checked external-request lifetime and native RPC correlation, not caller IDs.
// Results describe source producer state; none authorizes target writes or COLD.
void BeginUiStorageMigrationWorker(Profile* profile,
                                  base::OnceCallback<void(base::DictValue)> reply);
void ReadUiStorageMigrationWorker(Profile* profile,
                                 base::OnceCallback<void(base::DictValue)> reply);
void ValidateUiStorageMigrationWorker(Profile* profile,
                                     base::OnceCallback<void(base::DictValue)> reply);
// The caller reopens its real physical backend gate BEFORE this exact release.
// Acknowledged release resumes queued work; it is not resumed-work completion.
void ReleaseUiStorageMigrationWorker(Profile* profile,
                                    base::OnceCallback<void(base::DictValue)> reply);
bool IsUiStorageMigrationWorkerPending(Profile* profile);
// Last strictly parsed source hold plus CURRENT native worker ownership and
// physical lifetime. The controller must Validate at each required boundary and
// still join all real frame/backend/browser/daemon gates. No admission grant.
bool HasValidUiStorageMigrationWorkerLease(Profile* profile);
// Root's finite ExtensionFunction calls this with its actual native context.
// A true return means the exact RPC transport was consumed, not producer success.
// Identity selectors are never accepted from JSON or API arguments.
bool AcceptUiStorageMigrationWorkerReply(ExtensionFunction& sender,
                                         const std::string& request_id,
                                         const std::string& operation,
                                         const std::string& result_json);
}  // namespace aux
#endif
