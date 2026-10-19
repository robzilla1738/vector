// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_SECURITY_CLIENT_H_
#define CHROME_BROWSER_AUX_PROFILE_SECURITY_CLIENT_H_
#include <cstdint>
#include <string>
#include "base/functional/callback.h"
#include "chrome/browser/aux/profile_state.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
namespace aux {
// UI sequence. Reads actual metadata on a worker, obtains actual default account
// Vault status, then rereads metadata before returning. No cached unlocked state.
void FetchProfileSecurity(
    const base::FilePath& home,
    const base::FilePath& profile_path,
    scoped_refptr<network::SharedURLLoaderFactory> factory,
    uint16_t port,
    std::string authorization,
    base::OnceCallback<void(ProfileSecurityState)> done);
}  // namespace aux
#endif
