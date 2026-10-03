// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_measurement_request.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <cerrno>
#include <fcntl.h>
#include <unistd.h>
#include <utility>
#include <string_view>
#include "base/json/json_reader.h"
#include "base/posix/eintr_wrapper.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
namespace aux {
namespace {
constexpr char kRequest[] = "performance-request.json";
bool SameFile(const struct stat& a, const struct stat& b) {
  return a.st_dev == b.st_dev && a.st_ino == b.st_ino && a.st_size == b.st_size &&
      a.st_mode == b.st_mode && a.st_uid == b.st_uid && a.st_nlink == b.st_nlink &&
      a.st_ctimespec.tv_sec == b.st_ctimespec.tv_sec && a.st_ctimespec.tv_nsec == b.st_ctimespec.tv_nsec &&
      a.st_mtimespec.tv_sec == b.st_mtimespec.tv_sec && a.st_mtimespec.tv_nsec == b.st_mtimespec.tv_nsec;
}
bool Directory(const struct stat& value, uint64_t device, uint64_t inode) {
  return S_ISDIR(value.st_mode) && value.st_uid == geteuid() && (value.st_mode & 0777) == 0700 &&
      static_cast<uint64_t>(value.st_dev) == device && static_cast<uint64_t>(value.st_ino) == inode;
}
}  // namespace
std::optional<NativeStockMeasurementRequest> NativeStockMeasurementRequest::Read(
    base::FilePath root, uint64_t device, uint64_t inode, uint64_t sequence) {
  if (!OwnedJourneyFixtureRoot(root.value())) return NativeStockMeasurementRequest();
  base::ScopedFD directory(HANDLE_EINTR(open(root.value().c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC)));
  struct stat info{};
  if (!directory.is_valid() || fstat(directory.get(), &info) != 0 || !Directory(info, device, inode))
    return NativeStockMeasurementRequest();
  base::ScopedFD file(HANDLE_EINTR(openat(directory.get(), kRequest, O_RDONLY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)));
  if (!file.is_valid()) {
    if (errno == ENOENT) return std::nullopt;
    return NativeStockMeasurementRequest();
  }
  struct stat before{}; char bytes[513];
  if (fstat(file.get(), &before) != 0 || !S_ISREG(before.st_mode) || before.st_uid != geteuid() ||
      (before.st_mode & 0777) != 0600 || before.st_nlink != 1 || before.st_size <= 0 || before.st_size > 512)
    return NativeStockMeasurementRequest();
  const auto size = HANDLE_EINTR(read(file.get(), bytes, sizeof(bytes)));
  if (size != before.st_size) return NativeStockMeasurementRequest();
  auto row = base::JSONReader::ReadDict(std::string_view(bytes, size), base::JSON_PARSE_RFC);
  const auto* operation = row ? row->FindString("operation") : nullptr;
  const auto* raw_sequence = row ? row->FindString("sequence") : nullptr; uint64_t next = 0;
  if (!row || row->size() != 2 || !operation || (*operation != "sampleStockProcessMemory" && *operation != "prepareStockWarmWindow" && *operation != "completeStockWarmWindow") || !raw_sequence ||
      !base::StringToUint64(*raw_sequence, &next) || *raw_sequence != base::NumberToString(next) ||
      next == 0 || next > 4000 || next < sequence || next > sequence + 1)
    return NativeStockMeasurementRequest();
  NativeStockMeasurementRequest result;
  result.root_ = std::move(root); result.device_ = device; result.inode_ = inode; result.original_ = before; result.original_bytes_.assign(bytes, size);
  result.directory_ = std::move(directory); result.file_ = std::move(file); result.record_ = std::move(*row);
  if (!result.Current()) return NativeStockMeasurementRequest();
  return next == sequence ? std::nullopt : std::make_optional(std::move(result));
}
bool NativeStockMeasurementRequest::Current() const {
  struct stat directory{}, path{}, opened{}, named{}; char bytes[513];
  return directory_.is_valid() && file_.is_valid() && NativeStockObservationMetadataEnabled() &&
      fstat(directory_.get(), &directory) == 0 && Directory(directory, device_, inode_) &&
      lstat(root_.value().c_str(), &path) == 0 && Directory(path, device_, inode_) &&
      fstat(file_.get(), &opened) == 0 && SameFile(opened, original_) &&
      fstatat(directory_.get(), kRequest, &named, AT_SYMLINK_NOFOLLOW) == 0 && SameFile(named, original_) &&
      HANDLE_EINTR(pread(file_.get(), bytes, sizeof(bytes), 0)) == original_.st_size &&
      std::string_view(bytes, original_.st_size) == original_bytes_ &&
      fstat(file_.get(), &opened) == 0 && SameFile(opened, original_) &&
      fstatat(directory_.get(), kRequest, &named, AT_SYMLINK_NOFOLLOW) == 0 && SameFile(named, original_) &&
      lstat(root_.value().c_str(), &path) == 0 && Directory(path, device_, inode_);
}
}  // namespace aux
#endif
