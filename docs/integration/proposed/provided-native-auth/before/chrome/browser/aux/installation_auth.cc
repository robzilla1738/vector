// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/installation_auth.h"

#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

#include <array>

#include "base/base64.h"
#include "base/environment.h"
#include "base/files/scoped_file.h"
#include "base/path_service.h"
#include "base/strings/string_util.h"
#include "crypto/sign.h"
namespace aux {
namespace {
std::optional<std::vector<uint8_t>> ReadPem(const base::FilePath& path,
                                            std::string_view type,
                                            bool private_key) {
  base::ScopedFD fd(
      open(path.value().c_str(), O_RDONLY | O_CLOEXEC | O_NOFOLLOW));
  struct stat info;
  if (!fd.is_valid() || fstat(fd.get(), &info) != 0 || !S_ISREG(info.st_mode) ||
      info.st_size <= 0 || info.st_size > 16384 ||
      (private_key && (info.st_uid != geteuid() || (info.st_mode & 0077)))) {
    return std::nullopt;
  }
  std::string pem;
  std::array<char, 1024> buffer;
  for (;;) {
    ssize_t count = read(fd.get(), buffer.data(), buffer.size());
    if (count == 0) {
      break;
    }
    if (count < 0 || pem.size() + count > 16384) {
      return std::nullopt;
    }
    pem.append(buffer.data(), count);
  }
  const std::string begin = "-----BEGIN " + std::string(type) + "-----";
  const std::string end = "-----END " + std::string(type) + "-----";
  std::string_view text = base::TrimWhitespaceASCII(pem, base::TRIM_ALL);
  if (!base::StartsWith(text, begin) || !base::EndsWith(text, end)) {
    return std::nullopt;
  }
  text.remove_prefix(begin.size());
  text.remove_suffix(end.size());
  std::string decoded;
  if (!base::Base64Decode(text, &decoded,
                          base::Base64DecodePolicy::kForgiving)) {
    return std::nullopt;
  }
  return std::vector<uint8_t>(decoded.begin(), decoded.end());
}
std::optional<std::string> Message(std::string_view challenge) {
  std::string bytes;
  if (!base::Base64Decode(challenge, &bytes) || bytes.size() != 32) {
    return std::nullopt;
  }
  std::string message("Aux Daemon Auth v1\0", 19);
  message += bytes;
  return message;
}
}  // namespace
base::FilePath StateHome() {
  auto env = base::Environment::Create();
  if (auto value = env->GetVar("AUX_HOME"); value && !value->empty()) {
    return base::FilePath(*value);
  }
  base::FilePath home;
  if (!base::PathService::Get(base::DIR_HOME, &home)) {
    return {};
  }
  return home.AppendASCII(".aux");
}
std::optional<crypto::keypair::PrivateKey> LoadInstallationPrivateKey(
    const base::FilePath& home) {
  auto bytes = ReadPem(home.AppendASCII("installation-private.pem"),
                       "PRIVATE KEY", true);
  if (!bytes) {
    return std::nullopt;
  }
  auto key = crypto::keypair::PrivateKey::FromPrivateKeyInfo(*bytes);
  if (!key || !key->IsEcP256()) {
    return std::nullopt;
  }
  return key;
}
std::optional<crypto::keypair::PublicKey> LoadInstallationPublicKey(
    const base::FilePath& home) {
  auto bytes =
      ReadPem(home.AppendASCII("installation-public.pem"), "PUBLIC KEY", false);
  if (!bytes) {
    return std::nullopt;
  }
  auto key = crypto::keypair::PublicKey::FromSubjectPublicKeyInfo(*bytes);
  if (!key || !key->IsEcP256()) {
    return std::nullopt;
  }
  return key;
}
std::optional<std::string> SignDaemonChallenge(const base::FilePath& home,
                                               std::string_view challenge) {
  auto key = LoadInstallationPrivateKey(home);
  auto message = Message(challenge);
  if (!key || !message) {
    return std::nullopt;
  }
  return base::Base64Encode(crypto::sign::Sign(crypto::sign::ECDSA_SHA256, *key,
                                               base::as_byte_span(*message)));
}
bool VerifyInstallationChallenge(const crypto::keypair::PublicKey& key,
                                 std::string_view challenge,
                                 std::string_view signature) {
  auto message = Message(challenge);
  auto bytes = base::Base64Decode(signature);
  return message && bytes &&
         crypto::sign::Verify(crypto::sign::ECDSA_SHA256, key,
                              base::as_byte_span(*message), *bytes);
}
}  // namespace aux
