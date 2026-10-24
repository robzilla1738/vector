// Reuses the supplied conditional download rename primitive; no byte rewriting.
#include "chrome/browser/ui/aux_recent_files_service.h"
#include <cerrno>
#include <fcntl.h>
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>
#include "base/files/scoped_file.h"
#include "base/strings/string_number_conversions.h"
#include "components/download/public/common/download_item.h"
namespace aux::files {
namespace {
base::DictValue FingerprintInfo(const struct stat& info) {
  return base::DictValue().Set("device", base::NumberToString(info.st_dev))
      .Set("inode", base::NumberToString(info.st_ino))
      .Set("size", base::NumberToString(info.st_size))
      .Set("modifiedSeconds", base::NumberToString(info.st_mtimespec.tv_sec))
      .Set("modifiedNanos", base::NumberToString(info.st_mtimespec.tv_nsec));
}
std::optional<base::DictValue> FingerprintAt(int directory, const base::FilePath& name) {
  struct stat info;
  if (fstatat(directory, name.value().c_str(), &info, AT_SYMLINK_NOFOLLOW) || !S_ISREG(info.st_mode))
    return std::nullopt;
  return FingerprintInfo(info);
}
bool CurrentDirectory(int descriptor, const base::FilePath& path) {
  struct stat held, named;
  return !fstat(descriptor, &held) && !stat(path.value().c_str(), &named) &&
      S_ISDIR(held.st_mode) && S_ISDIR(named.st_mode) &&
      held.st_dev == named.st_dev && held.st_ino == named.st_ino;
}
bool SyncDirectory(int descriptor, const base::FilePath& path) {
  if (!CurrentDirectory(descriptor, path)) return false;
  int result;
  do { result = fsync(descriptor); } while (result && errno == EINTR);
  return !result && CurrentDirectory(descriptor, path);
}
}  // namespace
std::optional<base::DictValue> FingerprintRegularFile(const base::FilePath& path) {
  struct stat info;
  if (lstat(path.value().c_str(), &info) || !S_ISREG(info.st_mode)) return std::nullopt;
  return FingerprintInfo(info);
}
int InspectRegularFileMove(const base::DictValue& expected,
                            const base::FilePath& source,
                            const base::FilePath& destination) {
  if (!source.IsAbsolute() || source == destination || source.DirName() != destination.DirName()) return -1;
  const auto parent = source.DirName();
  base::ScopedFD directory(open(parent.value().c_str(), O_RDONLY | O_DIRECTORY | O_CLOEXEC));
  if (!directory.is_valid() || !CurrentDirectory(directory.get(), parent)) return -1;
  const auto original = FingerprintAt(directory.get(), source.BaseName());
  if (original && *original == expected)
    return CurrentDirectory(directory.get(), parent) ? 0 : -1;
  struct stat info;
  if (!fstatat(directory.get(), source.BaseName().value().c_str(), &info, AT_SYMLINK_NOFOLLOW) || errno != ENOENT)
    return -1;
  const auto moved = FingerprintAt(directory.get(), destination.BaseName());
  return moved && *moved == expected && SyncDirectory(directory.get(), parent) ? 1 : -1;
}
int MoveRegularFileExclusive(const base::DictValue& fingerprint,
                             const base::FilePath& expected,
                             const base::FilePath& source,
                             const base::FilePath& destination,
                             std::shared_ptr<const std::atomic_bool> authorization) {
  using Result = download::DownloadItem::DownloadRenameResult;
  if (source != expected || !source.IsAbsolute() || source == destination ||
      source.DirName() != destination.DirName()) return Result::FAILURE_UNAVAILABLE;
  const auto parent = source.DirName();
  base::ScopedFD directory(open(parent.value().c_str(), O_RDONLY | O_DIRECTORY | O_CLOEXEC));
  if (!directory.is_valid() || !CurrentDirectory(directory.get(), parent)) return Result::FAILURE_UNAVAILABLE;
  const auto source_name = source.BaseName(), destination_name = destination.BaseName();
  const auto actual = FingerprintAt(directory.get(), source_name);
  if (!actual || *actual != fingerprint) return Result::FAILURE_UNAVAILABLE;
  if (!authorization || !authorization->load(std::memory_order_acquire)) return Result::FAILURE_UNAVAILABLE;
  // Keep both leaves on the same retained directory. The path cannot retarget
  // this operation, and an existing destination is never overwritten.
  if (renameatx_np(directory.get(), source_name.value().c_str(), directory.get(),
                   destination_name.value().c_str(), RENAME_EXCL))
    return errno == EEXIST ? Result::FAILURE_NAME_CONFLICT : Result::FAILURE_UNKNOWN;
  const auto moved = FingerprintAt(directory.get(), destination_name);
  struct stat info;
  const bool source_missing = fstatat(directory.get(), source_name.value().c_str(),
                                     &info, AT_SYMLINK_NOFOLLOW) && errno == ENOENT;
  // After the physical move, readback/sync/revocation failures are unknown.
  // The caller must retain its prepared receipt for recovery, never retry as
  // if no move occurred or mark the rename completed before directory sync.
  if (!moved || *moved != fingerprint || !source_missing ||
      !SyncDirectory(directory.get(), parent) || !authorization->load(std::memory_order_acquire))
    return Result::FAILURE_UNKNOWN;
  return Result::SUCCESS;
}
}  // namespace aux::files
