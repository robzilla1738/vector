// Copyright 2026 Aux Authors. All rights reserved.
// Platform bridge to the supplied native authority; no replacement private key.
#include "chrome/browser/aux/installation_auth.h"

#include <errno.h>
#include <fcntl.h>
#include <poll.h>
#include <sys/socket.h>
#include <unistd.h>

#include <algorithm>
#include <array>

#include "base/base64.h"
#include "base/command_line.h"
#include "base/environment.h"
#include "base/files/file_util.h"
#include "base/files/scoped_file.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/path_service.h"
#include "base/process/kill.h"
#include "base/process/launch.h"
#include "base/strings/string_util.h"
#include "base/time/time.h"
#include "chrome/browser/aux/daemon_supervisor.h"
#include "crypto/sign.h"
namespace aux {
namespace {
constexpr size_t kMaxCarrierOutput = 32768;
constexpr auto kCarrierTimeout = base::Seconds(5);
std::optional<std::string> DecodeChallenge(std::string_view challenge) {
  auto bytes = base::Base64Decode(challenge);
  if (!bytes || bytes->size() != 32)
    return std::nullopt;
  return std::string(bytes->begin(), bytes->end());
}
std::optional<std::string> HttpMessage(std::string_view challenge) {
  auto bytes = DecodeChallenge(challenge);
  if (!bytes)
    return std::nullopt;
  return std::string("Aux Daemon Auth v1\0", 19) + *bytes;
}
bool VerifyMessage(const crypto::keypair::PublicKey &key,
                   std::string_view message, std::string_view signature) {
  if (signature.size() > 8192)
    return false;
  auto bytes = base::Base64Decode(signature);
  if (!bytes)
    return false;
  if (key.IsEcP256()) {
    return crypto::sign::Verify(crypto::sign::ECDSA_SHA256, key,
                                base::as_byte_span(message), *bytes);
  }
  return key.IsMldsa65() &&
         crypto::sign::Verify(crypto::sign::MLDSA_65, key,
                              base::as_byte_span(message), *bytes);
}
std::optional<base::DictValue> RunCarrier(const base::FilePath &home,
                                          std::string_view command,
                                          base::DictValue input) {
  auto env = base::Environment::Create();
  // This switch is an externally reviewed runtime acceptance gate, not an
  // automatically manufactured approval or fallback to independent PEM keys.
  if (env->GetVar("AUX_ENABLE_PROVIDED_NATIVE_CARRIER") != "1")
    return std::nullopt;
  auto paths = BundlePaths::FromBrowserExecutable();
  if (!paths)
    return std::nullopt;
  const auto root = base::MakeAbsoluteFilePath(paths->root);
  const auto canonical_home = base::MakeAbsoluteFilePath(home);
  if (!home.IsAbsolute() || root.empty() || canonical_home.empty() ||
      !base::DirectoryExists(canonical_home))
    return std::nullopt;
  auto bundled = [&](std::string_view relative) -> base::FilePath {
    auto path = base::MakeAbsoluteFilePath(paths->root.AppendASCII(relative));
    if (path.empty() || !root.IsParent(path))
      return {};
    int mode = 0;
    if (!base::GetPosixFilePermissions(path, &mode) || (mode & 0022))
      return {};
    return path;
  };
  const auto carrier = bundled("native/aux-native-carrier");
  const auto boundary = bundled("native/libaux-native-boundary.dylib");
  const auto binding =
      bundled("apps/daemon/Aux "
              "Daemon.app/Contents/Resources/native/provided-native.node");
  if (carrier.empty() || boundary.empty() || binding.empty())
    return std::nullopt;
  auto payload = base::WriteJson(input);
  if (!payload || payload->size() > 4096)
    return std::nullopt;
  int sockets[2];
  if (socketpair(AF_UNIX, SOCK_STREAM, 0, sockets) != 0)
    return std::nullopt;
  base::ScopedFD parent(sockets[0]), child(sockets[1]);
  int one = 1;
  if (setsockopt(parent.get(), SOL_SOCKET, SO_NOSIGPIPE, &one, sizeof(one)) ||
      fcntl(parent.get(), F_SETFL, O_NONBLOCK) == -1 ||
      fcntl(parent.get(), F_SETFD, FD_CLOEXEC) == -1 ||
      fcntl(child.get(), F_SETFD, FD_CLOEXEC) == -1)
    return std::nullopt;
  base::ScopedFD error(open("/dev/null", O_WRONLY | O_CLOEXEC));
  if (!error.is_valid())
    return std::nullopt;
  base::CommandLine line(carrier);
  line.AppendArgPath(binding);
  line.AppendArg(std::string(command));
  base::LaunchOptions options;
  options.clear_environment = true;
  options.environment["PATH"] = "/usr/bin:/bin";
  options.environment["HOME"] = canonical_home.value();
  options.environment["AUX_HOME"] = canonical_home.value();
  options.environment["AUX_ENABLE_PROVIDED_NATIVE_CARRIER"] = "1";
  options.environment["DYLD_INSERT_LIBRARIES"] = boundary.value();
  options.fds_to_remap = {{child.get(), STDIN_FILENO},
                          {child.get(), STDOUT_FILENO},
                          {error.get(), STDERR_FILENO}};
  auto process = base::LaunchProcess(line, options);
  child.reset();
  if (!process.IsValid())
    return std::nullopt;
  const auto deadline = base::TimeTicks::Now() + kCarrierTimeout;
  auto refuse = [&]() -> std::optional<base::DictValue> {
    // The process is still our unreaped child, so this PID cannot have been
    // reused. Kill only this carrier; asynchronous cleanup avoids unbounded
    // wait.
    process.Terminate(1, false);
    base::EnsureProcessTerminated(std::move(process));
    return std::nullopt;
  };
  size_t sent = 0;
  bool write_closed = false, eof = false;
  std::string output;
  while (!eof) {
    const auto remaining = deadline - base::TimeTicks::Now();
    if (remaining <= base::TimeDelta())
      return refuse();
    pollfd item{parent.get(),
                static_cast<short>(POLLIN | (!write_closed ? POLLOUT : 0)), 0};
    int result = poll(
        &item, 1, std::max(1, static_cast<int>(remaining.InMilliseconds())));
    if (result < 0) {
      if (errno == EINTR)
        continue;
      return refuse();
    }
    if (result == 0 || (item.revents & (POLLERR | POLLNVAL)))
      return refuse();
    if (!write_closed && (item.revents & POLLOUT)) {
      ssize_t n =
          send(parent.get(), payload->data() + sent, payload->size() - sent, 0);
      if (n < 0 && errno != EINTR && errno != EAGAIN)
        return refuse();
      if (n > 0)
        sent += n;
      if (sent == payload->size()) {
        shutdown(parent.get(), SHUT_WR);
        write_closed = true;
      }
    }
    if (item.revents & (POLLIN | POLLHUP)) {
      std::array<char, 2048> bytes;
      ssize_t n = read(parent.get(), bytes.data(), bytes.size());
      if (n < 0) {
        if (errno == EINTR || errno == EAGAIN)
          continue;
        return refuse();
      }
      if (n == 0) {
        eof = true;
        continue;
      }
      if (output.size() + n > kMaxCarrierOutput)
        return refuse();
      output.append(bytes.data(), n);
    }
  }
  int exit_code = 1;
  if (!process.WaitForExitWithTimeout(
          std::max(base::TimeDelta(), deadline - base::TimeTicks::Now()),
          &exit_code))
    return refuse();
  if (exit_code != 0)
    return std::nullopt;
  auto result = base::JSONReader::ReadDict(output, base::JSON_PARSE_RFC);
  if (!result || result->Find("error"))
    return std::nullopt;
  return result;
}
} // namespace
base::FilePath StateHome() {
  auto env = base::Environment::Create();
  if (auto value = env->GetVar("AUX_HOME"); value && !value->empty())
    return base::FilePath(*value);
  base::FilePath home;
  return base::PathService::Get(base::DIR_HOME, &home)
             ? home.AppendASCII(".aux")
             : base::FilePath();
}
std::optional<crypto::keypair::PrivateKey>
LoadInstallationPrivateKey(const base::FilePath & /*home*/) {
  // Legacy independent credential broker cannot export the supplied authority's
  // private key. Keep it fail-closed until the actual Vault proxy is
  // integrated.
  return std::nullopt;
}
std::optional<crypto::keypair::PublicKey>
ParseInstallationPublicKey(std::string_view json) {
  if (json.size() > kMaxCarrierOutput)
    return std::nullopt;
  auto input = base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC);
  const auto *scheme = input ? input->FindString("scheme") : nullptr;
  const auto *sig = input ? input->FindString("sig") : nullptr;
  if (!scheme || !sig)
    return std::nullopt;
  auto bytes = base::Base64Decode(*sig);
  if (!bytes)
    return std::nullopt;
  if (*scheme == "p256_v1" && bytes->size() == 65 && (*bytes)[0] == 4)
    return crypto::keypair::PublicKey::FromEcP256Point(*bytes);
  if (*scheme == "pq_v1" && bytes->size() == 1952)
    return crypto::keypair::PublicKey::FromMldsa65PublicKey(*bytes);
  return std::nullopt;
}
std::optional<crypto::keypair::PublicKey>
LoadInstallationPublicKey(const base::FilePath &home) {
  auto result = RunCarrier(home, "get-public-keys", {});
  auto json = result ? base::WriteJson(*result) : std::nullopt;
  return json ? ParseInstallationPublicKey(*json) : std::nullopt;
}
std::optional<std::string> SignDaemonChallenge(const base::FilePath &home,
                                               std::string_view challenge) {
  auto message = HttpMessage(challenge);
  if (!message)
    return std::nullopt;
  base::DictValue input;
  input.Set("challenge", base::Base64Encode(*message));
  auto result = RunCarrier(home, "cdp-sign", std::move(input));
  const auto *signature = result ? result->FindString("signature") : nullptr;
  // The daemon verifies this unchanged native signature. One carrier invocation
  // keeps the entire signing operation within its five-second I/O deadline.
  if (!signature || signature->empty() || signature->size() > 8192 ||
      !base::Base64Decode(*signature))
    return std::nullopt;
  return *signature;
}
bool VerifyInstallationChallenge(const crypto::keypair::PublicKey &key,
                                 std::string_view challenge,
                                 std::string_view signature) {
  auto message = HttpMessage(challenge);
  return message && VerifyMessage(key, *message, signature);
}
bool VerifyCdpChallenge(const crypto::keypair::PublicKey &key,
                        std::string_view challenge,
                        std::string_view signature) {
  auto bytes = DecodeChallenge(challenge);
  return bytes && VerifyMessage(key, *bytes, signature);
}
} // namespace aux
