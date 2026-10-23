// Copyright 2026 Aux Authors. All rights reserved.
// Supplied native-authority integration; HTTP and raw CDP inputs are distinct.
#ifndef CHROME_BROWSER_AUX_INSTALLATION_AUTH_H_
#define CHROME_BROWSER_AUX_INSTALLATION_AUTH_H_
#include "AuxSelectedStateHome.h"
#include <array>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>

#include "base/files/file_path.h"
#include "chrome/browser/aux/installation_carrier_custody.h"
#include "base/process/process.h"
#include "crypto/keypair.h"
namespace aux {
peer::NativeDaemonSignatureReply ObserveNativeDaemonChallenge(std::string_view challenge);
std::optional<std::array<uint8_t, 32>> LoadAgentInboxV2MasterKey(const base::FilePath& home);
namespace internal {
// Blocking production timeout reaper, shared with the synthetic-child fixture.
// The caller transfers its owned unreaped child and retained call; never a PID.
void WaitForInstallationCarrierExit(
    base::Process child,
    std::shared_ptr<InstallationCarrierCustody::Call> retained);
}
// Direct carrier scope only; callable while worker cleanup remains active.
// Admission is terminal for this browser process. Never authorizes migration.
InstallationCarrierCustody::Snapshot CloseInstallationCarrierAdmission();
InstallationCarrierCustody::Snapshot InspectInstallationCarrierCustody();
// Blocking functions: invoke on a MayBlock worker, never the UI thread.
base::FilePath StateHome();
// Supplied Agent inbox authority, independent of the installation signing key.
std::optional<std::array<uint8_t, 32>>
LoadAgentInboxMasterKey(const base::FilePath &home);
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
