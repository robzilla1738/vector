// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_CONTROLLER_H_
#define CHROME_BROWSER_AUX_UI_STORAGE_MIGRATION_CONTROLLER_H_
#include "base/functional/callback.h"
#include "base/callback_list.h"
#include "base/values.h"
class Profile;
namespace content { class RenderFrameHost; }
namespace aux {
// Native private API only. The actual ExtensionFunction supplies its current
// Profile and RenderFrameHost, never renderer-selected identities or paths.
// Captured/unqualified data and physical uncertainty never authorize activation.
// Preliminary capture joins exact native worker and LOCAL frontend holds; real
// DOM writer closure and cross-store target/recovery proofs remain separate.
void PrepareUiStorageMigration(Profile* profile, content::RenderFrameHost* sender,
                               base::OnceCallback<void(base::DictValue)> reply);
// Actual retained native operation/cleanup ownership only, not whole-browser
// writer closure or a durable-migration certificate.
bool IsUiStorageMigrationPending(Profile* profile);
// Observer registration attaches only the in-memory native owner. Notification
// means actual retained operation/cleanup is no longer pending, not durability.
base::CallbackListSubscription ObserveUiStorageMigrationSettled(
    Profile* profile, base::RepeatingClosure callback);
}
#endif
