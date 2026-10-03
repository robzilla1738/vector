// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <fcntl.h>
#include <libproc.h>
#include <mach/mach_time.h>
#include <sys/stat.h>
#include <unistd.h>
#include <array>
#include <atomic>
#include <string_view>
#include <utility>
#include "base/command_line.h"
#include "base/files/file_path.h"
#include "base/files/scoped_file.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/posix/eintr_wrapper.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/uuid.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/native_process_footprint.h"
#include "crypto/hash.h"
namespace aux {
bool NativeStartupObservationEnabled() {
#if BUILDFLAG(ENABLE_AUX_SHELL)
  return base::CommandLine::ForCurrentProcess()->HasSwitch("aux-native-startup-observer") &&
      NativePerformanceObservationMetadataEnabled();
#else
  // Distinct closed Stock startup flag plus original cached Stock fixture.
  // Aux flags cannot admit this build kind; no caller-selected kind or path.
  return base::CommandLine::ForCurrentProcess()->HasSwitch("aux-native-stock-startup-observer") &&
      NativeStockObservationMetadataEnabled();
#endif
}
namespace {
#if BUILDFLAG(ENABLE_AUX_SHELL)
constexpr std::string_view kNativeStartupKind = "aux";
#else
constexpr std::string_view kNativeStartupKind = "stock";
#endif
bool Directory(const struct stat& s) {
  return S_ISDIR(s.st_mode) && s.st_uid == geteuid() && (s.st_mode & 0777) == 0700;
}
bool File(const struct stat& s, size_t limit) {
  return S_ISREG(s.st_mode) && s.st_uid == geteuid() && (s.st_mode & 0777) == 0600 &&
      s.st_nlink == 1 && s.st_size > 0 && static_cast<uint64_t>(s.st_size) <= limit;
}
bool Same(const struct stat& a, const struct stat& b) {
  return a.st_dev == b.st_dev && a.st_ino == b.st_ino && a.st_mode == b.st_mode &&
      a.st_uid == b.st_uid && a.st_nlink == b.st_nlink && a.st_size == b.st_size &&
      a.st_mtimespec.tv_sec == b.st_mtimespec.tv_sec && a.st_mtimespec.tv_nsec == b.st_mtimespec.tv_nsec &&
      a.st_ctimespec.tv_sec == b.st_ctimespec.tv_sec && a.st_ctimespec.tv_nsec == b.st_ctimespec.tv_nsec;
}
bool Hex(const std::string* value, size_t size) {
  if (!value || value->size() != size) return false;
  for (char c : *value) if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))) return false;
  return true;
}
std::optional<uint64_t> Decimal(const std::string* value) {
  if (!value || value->empty() || value->size() > 20 || value->front() == '0') return std::nullopt;
  for (char c : *value) if (c < '0' || c > '9') return std::nullopt;
  uint64_t number = 0;
  return base::StringToUint64(*value, &number) && number ? std::optional(number) : std::nullopt;
}
std::optional<std::string> Read(int fd, size_t limit) {
  std::string body;
  std::array<char, 8192> buffer;
  while (true) {
    const ssize_t count = HANDLE_EINTR(read(fd, buffer.data(), buffer.size()));
    if (count < 0) return std::nullopt;
    if (!count) return body.empty() ? std::nullopt : std::optional(body);
    if (body.size() + count > limit) return std::nullopt;
    body.append(buffer.data(), count);
  }
}
std::string Hash(std::string_view value) {
  const auto hash = crypto::hash::Sha256(value);
  return base::HexEncodeLower(hash);
}
}  // namespace
NativeStartupLaunchLease::State::State() = default;
NativeStartupLaunchLease::State::~State() = default;
NativeStartupLaunchReceipt::NativeStartupLaunchReceipt() = default;
NativeStartupLaunchReceipt::~NativeStartupLaunchReceipt() = default;
NativeStartupLaunchReceipt::NativeStartupLaunchReceipt(NativeStartupLaunchReceipt&&) = default;
NativeStartupLaunchReceipt& NativeStartupLaunchReceipt::operator=(NativeStartupLaunchReceipt&&) = default;
NativeStartupLaunchLease::NativeStartupLaunchLease(std::unique_ptr<State> state) : state_(std::move(state)) {}
NativeStartupLaunchLease::~NativeStartupLaunchLease() = default;
bool NativeStartupLaunchLease::ValidateOwnedFiles() const {
  const auto& s = *state_;
  auto directory_matches = [](int fd, int parent, const char* name, const struct stat& expected) {
    struct stat actual{}, path{};
    return !fstat(fd, &actual) && !fstatat(parent, name, &path, AT_SYMLINK_NOFOLLOW) &&
        Directory(actual) && Directory(path) && actual.st_dev == expected.st_dev &&
        actual.st_ino == expected.st_ino && path.st_dev == expected.st_dev && path.st_ino == expected.st_ino;
  };
  auto file_matches = [](int fd, int parent, const char* name, const struct stat& expected) {
    struct stat actual{}, path{};
    return !fstat(fd, &actual) && !fstatat(parent, name, &path, AT_SYMLINK_NOFOLLOW) &&
        File(actual, 2048) && File(path, 2048) && Same(actual, expected) && Same(path, expected);
  };
  auto read_fixed = [](int fd) -> std::optional<std::string> {
    std::array<char, 2049> bytes{};
    const ssize_t count = HANDLE_EINTR(pread(fd, bytes.data(), bytes.size(), 0));
    if (count <= 0 || count > 2048) return std::nullopt;
    return std::string(bytes.data(), static_cast<size_t>(count));
  };
  if (!directory_matches(s.root.get(), s.parent.get(), s.root_name.c_str(), s.root_identity) ||
      !directory_matches(s.profile.get(), s.root.get(), "profile", s.profile_identity) ||
      !file_matches(s.metadata.get(), s.root.get(), "startup-build.json", s.metadata_identity) ||
      !file_matches(s.receipt.get(), s.root.get(), "startup-launch-receipt.json", s.receipt_identity) ||
      read_fixed(s.metadata.get()) != std::optional(s.metadata_bytes) ||
      read_fixed(s.receipt.get()) != std::optional(s.receipt_bytes)) return false;
  struct stat executable{}, path{};
  return !fstat(s.executable.get(), &executable) && !lstat(s.helper_path.c_str(), &path) &&
      Same(executable, s.executable_identity) && Same(path, s.executable_identity) &&
      directory_matches(s.root.get(), s.parent.get(), s.root_name.c_str(), s.root_identity) &&
      directory_matches(s.profile.get(), s.root.get(), "profile", s.profile_identity) &&
      file_matches(s.metadata.get(), s.root.get(), "startup-build.json", s.metadata_identity) &&
      file_matches(s.receipt.get(), s.root.get(), "startup-launch-receipt.json", s.receipt_identity);
}
bool NativeStartupLaunchLease::MatchesInitialFiles(const struct stat& root,
    const struct stat& profile, const struct stat& metadata) const {
  return Directory(root) && Directory(profile) && File(metadata, 2048) &&
      root.st_dev == state_->root_identity.st_dev && root.st_ino == state_->root_identity.st_ino &&
      profile.st_dev == state_->profile_identity.st_dev && profile.st_ino == state_->profile_identity.st_ino &&
      Same(metadata, state_->metadata_identity) && Validate();
}
bool NativeStartupLaunchLease::Validate() const {
  const auto& s = *state_;
  if (!NativeStartupObservationEnabled() || getpid() != s.browser_pid || getppid() != s.launcher_pid ||
      base::FilePath(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir")) != s.profile_path ||
      !ValidateOwnedFiles()) return false;
  std::array<char, PROC_PIDPATHINFO_MAXSIZE> current_path{};
  const auto identity = ReadNativeProcessFootprint(s.launcher_pid);
  if (proc_pidpath(s.launcher_pid, current_path.data(), current_path.size()) <= 0 ||
      current_path.back() != '\0' || std::string_view(current_path.data()) != s.helper_path || !identity ||
      identity->pid != s.launcher_pid || identity->process_uuid != s.helper_uuid ||
      identity->process_start_absolute != s.helper_start) return false;
  // Revalidate the ORIGINAL held file/directory identities after kernel reads.
  return getppid() == s.launcher_pid && NativeStartupObservationEnabled() && ValidateOwnedFiles();
}
std::optional<NativeStartupLaunchReceipt> ReadNativeStartupLaunchReceipt() {
  static std::atomic<bool> consumed{false};
  if (consumed.load() || !NativeStartupObservationEnabled()) return std::nullopt;
  const auto profile = base::FilePath(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
  const auto root_path = profile.DirName();
  if (profile.BaseName().value() != "profile" || !OwnedJourneyFixtureRoot(root_path.value())) return std::nullopt;
  base::ScopedFD parent(open("/private/tmp", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC));
  base::ScopedFD root(parent.is_valid() ? openat(parent.get(), root_path.BaseName().value().c_str(),
      O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC) : -1);
  base::ScopedFD child(root.is_valid() ? openat(root.get(), "profile", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC) : -1);
  if (!parent.is_valid() || !root.is_valid() || !child.is_valid()) return std::nullopt;
  struct stat root_before{}, profile_before{};
  if (fstat(root.get(), &root_before) || fstat(child.get(), &profile_before) ||
      !Directory(root_before) || !Directory(profile_before)) return std::nullopt;
  auto stable_directory = [&]() {
    struct stat a{}, b{}, c{}, d{};
    return !fstat(root.get(), &a) && !fstatat(parent.get(), root_path.BaseName().value().c_str(), &b, AT_SYMLINK_NOFOLLOW) &&
        !fstat(child.get(), &c) && !fstatat(root.get(), "profile", &d, AT_SYMLINK_NOFOLLOW) &&
        Directory(a) && Directory(b) && Directory(c) && Directory(d) &&
        a.st_dev == root_before.st_dev && a.st_ino == root_before.st_ino &&
        b.st_dev == root_before.st_dev && b.st_ino == root_before.st_ino &&
        c.st_dev == profile_before.st_dev && c.st_ino == profile_before.st_ino &&
        d.st_dev == profile_before.st_dev && d.st_ino == profile_before.st_ino;
  };
  if (!stable_directory()) return std::nullopt;
  base::ScopedFD metadata(openat(root.get(), "startup-build.json", O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
  base::ScopedFD receipt(openat(root.get(), "startup-launch-receipt.json", O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
  struct stat metadata_before{}, receipt_before{};
  if (!metadata.is_valid() || !receipt.is_valid() || fstat(metadata.get(), &metadata_before) ||
      fstat(receipt.get(), &receipt_before) || !File(metadata_before, 2048) || !File(receipt_before, 2048))
    return std::nullopt;
  const auto metadata_bytes = Read(metadata.get(), 2048), receipt_bytes = Read(receipt.get(), 2048);
  const auto expected = metadata_bytes ? base::JSONReader::ReadDict(*metadata_bytes, base::JSON_PARSE_RFC) : std::nullopt;
  const auto actual = receipt_bytes ? base::JSONReader::ReadDict(*receipt_bytes, base::JSON_PARSE_RFC) : std::nullopt;
  auto text = [](const base::DictValue& value, const char* key, std::string_view match) {
    const auto* found = value.FindString(key); return found && *found == match;
  };
  if (!expected || !actual || expected->size() != 7 || actual->size() != 12 ||
      !text(*expected, "producer", "aux-native-startup-build") ||
      !text(*actual, "producer", "aux-native-startup-launch") ||
      expected->FindInt("version") != 1 || actual->FindInt("version") != 1 ||
      !text(*expected, "kind", kNativeStartupKind) || !text(*actual, "kind", kNativeStartupKind) ||
      !text(*actual, "sequence", "1") || actual->FindInt("launcherPid") != getppid() ||
      actual->FindInt("browserPid") != getpid()) return std::nullopt;
  // Producers use compact sorted-key JSON. Exact canonical bytes reject
  // duplicate keys (JSONReader otherwise silently keeps the last occurrence).
  if (base::WriteJson(*expected) != metadata_bytes || base::WriteJson(*actual) != receipt_bytes)
    return std::nullopt;
  const auto* trial = expected->FindString("trial");
  const auto* helper_hash = expected->FindString("helperBinarySha256");
  const auto* source_hash = expected->FindString("helperSourceSha256");
  const auto* helper_uuid = expected->FindString("helperImageUuid");
  const auto* nonce = actual->FindString("nonce");
  const auto launch = Decimal(actual->FindString("launchMachTicks"));
  const auto returned = Decimal(actual->FindString("spawnReturnedMachTicks"));
  if (!Hex(trial, 32) || !Hex(helper_hash, 64) || !Hex(source_hash, 64) || !Hex(helper_uuid, 32) ||
      !text(*actual, "trial", *trial) || !text(*actual, "helperBinarySha256", *helper_hash) ||
      !text(*actual, "helperSourceSha256", *source_hash) || !nonce ||
      !base::Uuid::ParseLowercase(*nonce).is_valid() || *nonce == "00000000-0000-0000-0000-000000000000" || !launch || !returned ||
      *launch > *returned || *returned > mach_absolute_time() ||
      !base::TimeTicks::IsConsistentAcrossProcesses()) return std::nullopt;
  const auto launcher = getppid();
  const auto identity = ReadNativeProcessFootprint(launcher);
  if (!identity || base::ToLowerASCII(identity->process_uuid) != *helper_uuid) return std::nullopt;
  std::array<char, PROC_PIDPATHINFO_MAXSIZE> helper_path{};
  if (proc_pidpath(launcher, helper_path.data(), helper_path.size()) <= 0 ||
      helper_path.back() != '\0' || helper_path[0] != '/') return std::nullopt;
  base::ScopedFD executable(open(helper_path.data(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC));
  struct stat executable_before{};
  if (!executable.is_valid() || fstat(executable.get(), &executable_before) ||
      !S_ISREG(executable_before.st_mode) || executable_before.st_uid != geteuid() ||
      (executable_before.st_mode & (S_ISUID | S_ISGID | 022)) ||
      !(executable_before.st_mode & 0100) || executable_before.st_size <= 0 ||
      executable_before.st_size > 64 * 1024 * 1024) return std::nullopt;
  const auto executable_bytes = Read(executable.get(), 64 * 1024 * 1024);
  if (!executable_bytes || Hash(*executable_bytes) != *helper_hash) return std::nullopt;
  struct stat metadata_after{}, receipt_after{}, metadata_path{}, receipt_path{}, executable_after{}, executable_path{};
  if (fstat(metadata.get(), &metadata_after) || fstat(receipt.get(), &receipt_after) ||
      fstatat(root.get(), "startup-build.json", &metadata_path, AT_SYMLINK_NOFOLLOW) ||
      fstatat(root.get(), "startup-launch-receipt.json", &receipt_path, AT_SYMLINK_NOFOLLOW) ||
      fstat(executable.get(), &executable_after) || lstat(helper_path.data(), &executable_path) ||
      !Same(executable_before, executable_path) || !Same(metadata_before, metadata_after) ||
      !Same(metadata_before, metadata_path) || !Same(receipt_before, receipt_after) ||
      !Same(receipt_before, receipt_path) || !Same(executable_before, executable_after) ||
      !stable_directory() || lseek(metadata.get(), 0, SEEK_SET) != 0 ||
      lseek(receipt.get(), 0, SEEK_SET) != 0 || Read(metadata.get(), 2048) != metadata_bytes ||
      Read(receipt.get(), 2048) != receipt_bytes) return std::nullopt;
  const auto after_identity = ReadNativeProcessFootprint(launcher);
  std::array<char, PROC_PIDPATHINFO_MAXSIZE> after_path{};
  if (getppid() != launcher || !after_identity || after_identity->pid != identity->pid ||
      after_identity->process_uuid != identity->process_uuid ||
      after_identity->process_start_absolute != identity->process_start_absolute ||
      proc_pidpath(launcher, after_path.data(), after_path.size()) <= 0 || after_path != helper_path ||
      !NativeStartupObservationEnabled() || !stable_directory()) return std::nullopt;
  NativeStartupLaunchReceipt result;
  result.launcher_pid = launcher; result.browser_pid = getpid(); result.trial = *trial;
  result.receipt_nonce = *nonce; result.helper_sha256 = *helper_hash; result.helper_source_sha256 = *source_hash;
  result.helper_process_uuid = identity->process_uuid; result.helper_process_start = identity->process_start_absolute;
  result.launch_mach_ticks = *launch; result.spawn_returned_mach_ticks = *returned;
  result.launch = base::TimeTicks::FromMachAbsoluteTime(*launch);
  result.spawn_returned = base::TimeTicks::FromMachAbsoluteTime(*returned);
  result.original_receipt_sha256 = Hash(*receipt_bytes);
  if (result.launch.is_null() || result.spawn_returned < result.launch ||
      result.spawn_returned > base::TimeTicks::Now()) return std::nullopt;
  auto state = std::make_unique<NativeStartupLaunchLease::State>();
  state->parent = std::move(parent); state->root = std::move(root); state->profile = std::move(child);
  state->metadata = std::move(metadata); state->receipt = std::move(receipt); state->executable = std::move(executable);
  state->profile_path = profile; state->root_name = root_path.BaseName().value();
  state->helper_path = helper_path.data(); state->metadata_bytes = *metadata_bytes; state->receipt_bytes = *receipt_bytes;
  state->helper_uuid = identity->process_uuid; state->helper_start = identity->process_start_absolute;
  state->browser_pid = getpid(); state->launcher_pid = launcher;
  state->root_identity = root_before; state->profile_identity = profile_before;
  state->metadata_identity = metadata_before; state->receipt_identity = receipt_before; state->executable_identity = executable_before;
  result.lease = std::unique_ptr<NativeStartupLaunchLease>(new NativeStartupLaunchLease(std::move(state)));
  if (!result.lease->Validate()) return std::nullopt;
  bool unused = false;
  if (!consumed.compare_exchange_strong(unused, true)) return std::nullopt;
  return result;
}
}  // namespace aux
#endif
