// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_appearance_file_channel.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <fcntl.h>
#include <libproc.h>
#include <sys/resource.h>
#include <sys/file.h>
#include <unistd.h>
#include <algorithm>
#include <utility>
#include "base/command_line.h"
#include "base/functional/bind.h"
#include "base/containers/span.h"
#include "base/files/file_util.h"
#include "base/json/json_writer.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/rand_util.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/synchronization/lock.h"
#include "base/task/thread_pool.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/method_registry.h"
#include "crypto/sha2.h"
#include "crypto/keypair.h"
#include "crypto/sign.h"
namespace aux {
namespace {
constexpr char kName[] = "native-appearance-channel.jsonl";
constexpr size_t kMaxWire = 32768;
constexpr size_t kMaxRecord = 4096, kMaxBytes = 2 * 1024 * 1024, kMaxRecords = 4000;
struct ProcessIdentity { std::string uuid, start; };
std::optional<ProcessIdentity> OriginalProcess() {
  rusage_info_v0 actual{};
  if (proc_pid_rusage(getpid(), RUSAGE_INFO_V0,
      reinterpret_cast<rusage_info_t*>(&actual)) != 0 ||
      !actual.ri_proc_start_abstime || actual.ri_proc_exit_abstime ||
      std::ranges::all_of(actual.ri_uuid, [](uint8_t byte) { return byte == 0; }))
    return std::nullopt;
  return ProcessIdentity{base::ToLowerASCII(base::HexEncode(actual.ri_uuid)),
                        base::NumberToString(actual.ri_proc_start_abstime)};
}
bool Matches(const struct stat& current, const struct stat& expected, mode_t mode) {
  return current.st_dev == expected.st_dev && current.st_ino == expected.st_ino &&
      current.st_uid == geteuid() && expected.st_uid == geteuid() &&
      (current.st_mode & 0777) == mode &&
      (mode == 0700 ? S_ISDIR(current.st_mode) : S_ISREG(current.st_mode) && current.st_nlink == 1);
}
bool WriteAll(int fd, std::string_view bytes) {
  return base::WriteFileDescriptor(fd, bytes);
}
std::unique_ptr<NativeAppearanceFileChannel>& Channel() {
  static base::NoDestructor<std::unique_ptr<NativeAppearanceFileChannel>> channel;
  return *channel;
}
}  // namespace
NativeAppearanceDirectoryLease::NativeAppearanceDirectoryLease() = default;
NativeAppearanceDirectoryLease::NativeAppearanceDirectoryLease(NativeAppearanceDirectoryLease&&) = default;
NativeAppearanceDirectoryLease::~NativeAppearanceDirectoryLease() = default;
class NativeAppearanceFileChannel::State : public base::RefCountedThreadSafe<State> {
 public:
  explicit State(NativeAppearanceDirectoryLease lease);
  bool Initialize() {
    const auto process = OriginalProcess();
    if (!process || !Directories()) return false;
    process_ = *process;
    signing_key_.emplace(crypto::keypair::PrivateKey::GenerateEd25519());
    fd_.reset(openat(lease_.root_.get(), kName,
        O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC, 0600));
    if (!fd_.is_valid() || flock(fd_.get(), LOCK_EX | LOCK_NB) != 0 ||
        fstat(fd_.get(), &file_identity_) != 0 || !CurrentFile()) return false;
    auto capabilities = AuxMethodRegistry::Get().Capabilities();
    const auto* build = capabilities.FindString("buildId");
    const auto* source = capabilities.FindString("sourceCommit");
    if (!build || !source) return false;
    nonce_ = base::ToLowerASCII(base::HexEncode(base::RandBytesAsVector(16)));
    header_.Set("producer", "aux-native-appearance-file-channel");
    header_.Set("version", 1); header_.Set("pid", getpid());
    header_.Set("processUuid", process_.uuid); header_.Set("processStartMachTicks", process_.start);
    header_.Set("buildId", *build); header_.Set("sourceCommit", *source);
    header_.Set("nonce", nonce_); header_.Set("basename", kName);
    header_.Set("publicKeySpkiHex", base::ToLowerASCII(base::HexEncode(signing_key_->ToSubjectPublicKeyInfo())));
    header_.Set("rootDevice", base::NumberToString(lease_.root_identity_.st_dev));
    header_.Set("rootInode", base::NumberToString(lease_.root_identity_.st_ino));
    header_.Set("profileName", "Default");
    header_.Set("profileDevice", base::NumberToString(lease_.profile_identity_.st_dev));
    header_.Set("profileInode", base::NumberToString(lease_.profile_identity_.st_ino));
    header_.Set("fileDevice", base::NumberToString(file_identity_.st_dev));
    header_.Set("fileInode", base::NumberToString(file_identity_.st_ino));
    auto json = base::WriteJson(header_);
    if (!json) return false;
    original_header_ = *json + "\n";
    if (original_header_.size() > kMaxRecord || !WriteAll(fd_.get(), original_header_) ||
        fsync(fd_.get()) != 0) return false;
    written_bytes_ = accepted_bytes_ = original_header_.size();
    return Current();
  }
  std::optional<base::Value::Dict> Receipt(Profile* profile) {
    base::AutoLock lock(lock_);
    if (!ProfileMatches(profile)) return std::nullopt;
    if (!NativeAppearanceObservationEnabled() || !Current()) { retired_ = true; return std::nullopt; }
    auto result = header_.Clone();
    result.Set("headerSha256", base::ToLowerASCII(base::HexEncode(crypto::SHA256HashString(original_header_))));
    return result;
  }
  bool Publish(Profile* profile, std::string raw) {
    base::AutoLock lock(lock_);
    if (!ProfileMatches(profile)) return false;
    if (!NativeAppearanceObservationEnabled() || !Current() || raw.empty() || raw.size() > kMaxRecord ||
        sequence_ >= kMaxRecords) { retired_ = true; return false; }
    base::Value::Dict record;
    record.Set("producer", "aux-native-appearance-file-record"); record.Set("version", 1);
    record.Set("nonce", nonce_); record.Set("sequence", static_cast<int>(sequence_ + 1));
    record.Set("raw", std::move(raw));
    auto payload = base::WriteJson(record);
    if (!payload || !signing_key_) { retired_ = true; return false; }
    const std::string signed_bytes = "AUX_NATIVE_APPEARANCE_FILE_V1\n" + *payload;
    const auto signature = crypto::sign::Sign(crypto::sign::ED25519, *signing_key_, base::as_byte_span(signed_bytes));
    if (signature.size() != 64) { retired_ = true; return false; }
    base::Value::Dict envelope;
    envelope.Set("payload", *payload);
    envelope.Set("signatureHex", base::ToLowerASCII(base::HexEncode(signature)));
    auto encoded = base::WriteJson(envelope);
    if (!encoded || encoded->size() + 1 > kMaxWire ||
        accepted_bytes_ + encoded->size() + 1 > kMaxBytes) { retired_ = true; return false; }
    ++sequence_; accepted_bytes_ += encoded->size() + 1;
    if (!runner_) runner_ = base::ThreadPool::CreateSequencedTaskRunner(
        {base::MayBlock(), base::TaskPriority::USER_VISIBLE, base::TaskShutdownBehavior::SKIP_ON_SHUTDOWN});
    if (!runner_->PostTask(FROM_HERE, base::BindOnce(&State::Append, scoped_refptr<State>(this), *encoded + "\n"))) {
      retired_ = true; return false;
    }
    return true;
  }
  void Retire() { base::AutoLock lock(lock_); retired_ = true; signing_key_.reset(); }
 private:
  friend class base::RefCountedThreadSafe<State>;
  ~State();
  bool ProfileMatches(Profile* profile) {
    if (!profile || profile->IsOffTheRecord() ||
        profile->GetPath().DirName().value() != lease_.profile_path_ ||
        profile->GetPath().BaseName().value() != "Default") return false;
    if (!profile_bound_) { original_profile_ = profile->GetWeakPtr(); profile_bound_ = true; }
    return original_profile_ && original_profile_.get() == profile;
  }
  bool Directories() const {
    struct stat root{}, named_root{}, profile{}, named_profile{};
    return fstat(lease_.root_.get(), &root) == 0 && lstat(lease_.root_path_.c_str(), &named_root) == 0 &&
        fstat(lease_.profile_.get(), &profile) == 0 &&
        fstatat(lease_.root_.get(), "profile", &named_profile, AT_SYMLINK_NOFOLLOW) == 0 &&
        Matches(root, lease_.root_identity_, 0700) && Matches(named_root, lease_.root_identity_, 0700) &&
        Matches(profile, lease_.profile_identity_, 0700) && Matches(named_profile, lease_.profile_identity_, 0700);
  }
  bool CurrentFile() const {
    struct stat held{}, named{};
    return fstat(fd_.get(), &held) == 0 &&
        fstatat(lease_.root_.get(), kName, &named, AT_SYMLINK_NOFOLLOW) == 0 &&
        Matches(held, file_identity_, 0600) && Matches(named, file_identity_, 0600) &&
        held.st_size >= 0 && static_cast<size_t>(held.st_size) >= written_bytes_ &&
        static_cast<size_t>(held.st_size) <= written_bytes_ + in_flight_bytes_;
  }
  bool Current() const {
    const auto process = OriginalProcess();
    return !retired_ && process &&
        process->uuid == process_.uuid && process->start == process_.start && Directories() && CurrentFile();
  }
  void Append(std::string bytes) {
    {
      base::AutoLock lock(lock_);
      if (!Current()) { retired_ = true; return; }
      in_flight_bytes_ = bytes.size();
    }
    // No UI capability/publication lock is held across actual disk I/O.
    const bool written = WriteAll(fd_.get(), bytes);
    base::AutoLock lock(lock_);
    if (written) written_bytes_ += bytes.size();
    in_flight_bytes_ = 0;
    if (!written || !Current()) retired_ = true;
  }
  NativeAppearanceDirectoryLease lease_;
  base::ScopedFD fd_;
  struct stat file_identity_ {};
  ProcessIdentity process_;
  base::WeakPtr<Profile> original_profile_;
  bool profile_bound_ = false;
  std::optional<crypto::keypair::PrivateKey> signing_key_;
  std::string nonce_, original_header_;
  base::Value::Dict header_;
  scoped_refptr<base::SequencedTaskRunner> runner_;
  base::Lock lock_;
  size_t accepted_bytes_ = 0, written_bytes_ = 0, sequence_ = 0, in_flight_bytes_ = 0;
  bool retired_ = false;
};
NativeAppearanceFileChannel::State::State(NativeAppearanceDirectoryLease lease) : lease_(std::move(lease)) {}
NativeAppearanceFileChannel::State::~State() = default;
NativeAppearanceFileChannel::NativeAppearanceFileChannel(scoped_refptr<State> state) : state_(std::move(state)) {}
NativeAppearanceFileChannel::~NativeAppearanceFileChannel() { Retire(); }
std::unique_ptr<NativeAppearanceFileChannel> NativeAppearanceFileChannel::Create(NativeAppearanceDirectoryLease lease) {
  auto state = base::MakeRefCounted<State>(std::move(lease));
  if (!state->Initialize()) return nullptr;
  return std::unique_ptr<NativeAppearanceFileChannel>(new NativeAppearanceFileChannel(std::move(state)));
}
std::optional<base::Value::Dict> NativeAppearanceFileChannel::Receipt(Profile* profile) { return state_->Receipt(profile); }
bool NativeAppearanceFileChannel::Publish(Profile* profile, std::string raw) { return state_->Publish(profile, std::move(raw)); }
void NativeAppearanceFileChannel::Retire() { state_->Retire(); }
void InitializeNativeAppearanceFileChannel() {
  if (!base::CommandLine::ForCurrentProcess()->HasSwitch("aux-native-appearance-file-observer") || NativePerformanceObservationMetadataEnabled() || Channel()) return;
  auto lease = TakeNativeAppearanceDirectoryLease();
  if (lease) Channel() = NativeAppearanceFileChannel::Create(std::move(*lease));
}
std::optional<base::Value::Dict> NativeAppearanceFileChannelReceipt(Profile* profile) {
  return Channel() ? Channel()->Receipt(profile) : std::nullopt;
}
bool PublishNativeAppearanceFileRecord(Profile* profile, std::string raw) {
  return Channel() && Channel()->Publish(profile, std::move(raw));
}
}  // namespace aux
#endif
