// Reuses the supplied conditional download rename primitive; no byte rewriting.
#include "chrome/browser/ui/aux_recent_files_service.h"
#include <cerrno>
#include <stdio.h>
#include <sys/stat.h>
#include "base/strings/string_number_conversions.h"
#include "components/download/public/common/download_item.h"
namespace aux::files {
std::optional<base::DictValue> FingerprintRegularFile(const base::FilePath& path) {
  struct stat info;
  if (lstat(path.value().c_str(), &info) || !S_ISREG(info.st_mode)) return std::nullopt;
  return base::DictValue().Set("device", base::NumberToString(info.st_dev))
      .Set("inode", base::NumberToString(info.st_ino))
      .Set("size", base::NumberToString(info.st_size))
      .Set("modifiedSeconds", base::NumberToString(info.st_mtimespec.tv_sec))
      .Set("modifiedNanos", base::NumberToString(info.st_mtimespec.tv_nsec));
}
int InspectRegularFileMove(const base::DictValue& expected,
                            const base::FilePath& source,
                            const base::FilePath& destination) {
  if (source == destination || source.DirName() != destination.DirName()) return -1;
  const auto original = FingerprintRegularFile(source);
  if (original && *original == expected) return 0;
  struct stat info;
  if (!lstat(source.value().c_str(), &info) || errno != ENOENT) return -1;
  const auto moved = FingerprintRegularFile(destination);
  return moved && *moved == expected ? 1 : -1;
}
int MoveRegularFileExclusive(const base::DictValue& fingerprint,
                             const base::FilePath& expected,
                             const base::FilePath& source,
                             const base::FilePath& destination,
                             std::shared_ptr<const std::atomic_bool> authorization) {
  using Result = download::DownloadItem::DownloadRenameResult;
  auto actual = FingerprintRegularFile(source);
  if (source != expected || source.DirName() != destination.DirName() ||
      !actual || *actual != fingerprint) return Result::FAILURE_UNAVAILABLE;
  if (!authorization || !authorization->load(std::memory_order_acquire)) return Result::FAILURE_UNAVAILABLE;
  if (renamex_np(source.value().c_str(), destination.value().c_str(), RENAME_EXCL))
    return errno == EEXIST ? Result::FAILURE_NAME_CONFLICT : Result::FAILURE_UNKNOWN;
  return Result::SUCCESS;
}
}  // namespace aux::files
