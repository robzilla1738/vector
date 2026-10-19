// Copyright 2026 Aux Authors. All rights reserved.
// Supplied native-authority integration; HTTP and raw CDP inputs are distinct.
#ifndef CHROME_BROWSER_AUX_INSTALLATION_AUTH_H_
#define CHROME_BROWSER_AUX_INSTALLATION_AUTH_H_
#include <optional>
#include <string>
#include <string_view>

#include "base/files/file_path.h"
#include "crypto/keypair.h"
namespace aux {
// Blocking functions: invoke on a MayBlock worker, never the UI thread.
base::FilePath StateHome();
std::optional<crypto::keypair::PrivateKey>
LoadInstallationPrivateKey(const base::FilePath &home);
std::optional<crypto::keypair::PublicKey>
ParseInstallationPublicKey(std::string_view json);
std::optional<crypto::keypair::PublicKey>
LoadInstallationPublicKey(const base::FilePath &home);
std::optional<std::string> SignDaemonChallenge(const base::FilePath &home,
                                               std::string_view challenge);
bool VerifyInstallationChallenge(const crypto::keypair::PublicKey &key,
                                 std::string_view challenge,
                                 std::string_view signature);
bool VerifyCdpChallenge(const crypto::keypair::PublicKey &key,
                        std::string_view challenge, std::string_view signature);
} // namespace aux
#endif
