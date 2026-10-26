from pathlib import Path
import hashlib,json,difflib
src=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
out=Path(__file__).resolve().parent
(out/'source/base/files').mkdir(parents=True,exist_ok=True)
h='''// Copyright 2026 The Aux Authors.
#ifndef BASE_FILES_AUX_READ_ONLY_APP_H_
#define BASE_FILES_AUX_READ_ONLY_APP_H_
#include "base/base_export.h"
#include "base/files/file_path.h"
namespace base {
// Native authenticated startup registers its exact containing bundle once.
BASE_EXPORT bool RegisterAuxReadOnlyApp(const FilePath& app);
// Ancestors are protected only for destructive directory operations.
BASE_EXPORT bool AuxAppAllowsMutation(const FilePath& path, bool destructive = false);
BASE_EXPORT bool AuxAppAllowsDescriptorMutation(int fd);
}
#endif
'''
(out/'source/base/files/aux_read_only_app.h').write_text(h)
impl='''
#if BUILDFLAG(IS_MAC)
namespace {
struct AuxReadOnlyApp {
  std::mutex mutex;
  FilePath path;
  dev_t device = 0;
  ino_t inode = 0;
};
AuxReadOnlyApp& ReadOnlyApp() {
  static NoDestructor<AuxReadOnlyApp> state;
  return *state;
}
FilePath PhysicalMutationPath(FilePath path) {
  if (!path.IsAbsolute()) {
    char cwd[PATH_MAX];
    if (!getcwd(cwd, sizeof(cwd))) return {};
    path = FilePath(cwd).Append(path);
  }
  std::vector<FilePath::StringType> suffix;
  for (;;) {
    char physical[PATH_MAX];
    if (realpath(path.value().c_str(), physical)) {
      FilePath result(physical);
      for (auto it = suffix.rbegin(); it != suffix.rend(); ++it)
        result = result.Append(*it);
      return result;
    }
    struct stat value;
    if (errno != ENOENT || lstat(path.value().c_str(), &value) == 0 ||
        errno != ENOENT || path == path.DirName()) return {};
    suffix.push_back(path.BaseName().value());
    path = path.DirName();
  }
}
}
bool RegisterAuxReadOnlyApp(const FilePath& app) {
  auto& state = ReadOnlyApp();
  std::lock_guard<std::mutex> lock(state.mutex);
  auto physical = PhysicalMutationPath(app);
  struct stat value;
  if (physical.empty() || physical.BaseName().value() != "Aux.app" ||
      stat(physical.value().c_str(), &value) != 0 || !S_ISDIR(value.st_mode)) return false;
  if (!state.path.empty())
    return state.path == physical && state.device == value.st_dev && state.inode == value.st_ino;
  state.path = physical;
  state.device = value.st_dev;
  state.inode = value.st_ino;
  return true;
}
bool AuxAppAllowsMutation(const FilePath& path, bool destructive) {
  auto& state = ReadOnlyApp();
  std::lock_guard<std::mutex> lock(state.mutex);
  if (state.path.empty()) return true;
  struct stat value;
  auto target = PhysicalMutationPath(path);
  const bool allowed = stat(state.path.value().c_str(), &value) == 0 &&
      value.st_dev == state.device && value.st_ino == state.inode &&
      !target.empty() && target != state.path && !state.path.IsParent(target) &&
      (!destructive || !target.IsParent(state.path));
  if (!allowed) errno = EACCES;
  return allowed;
}
bool AuxAppAllowsDescriptorMutation(int fd) {
  auto& state = ReadOnlyApp();
  { std::lock_guard<std::mutex> lock(state.mutex); if (state.path.empty()) return true; }
  struct stat value;
  if (fstat(fd, &value) != 0) return false;
  if (!S_ISREG(value.st_mode) && !S_ISDIR(value.st_mode)) return true;
  char path[PATH_MAX];
  return fcntl(fd, F_GETPATH, path) == 0 && AuxAppAllowsMutation(FilePath(path));
}
#endif
'''
files=['base/files/file_posix.cc','base/files/file_util_posix.cc','base/files/file_util_apple.mm']
originals={p:(src/p).read_text() for p in files}; texts=dict(originals)
def change(p,a,b):
 assert texts[p].count(a)==1,(p,a,texts[p].count(a))
 texts[p]=texts[p].replace(a,b)
p=files[0]
change(p,'#include <optional>','#include <optional>\n#include <limits.h>\n#include <mutex>\n#include <vector>\n#include <stdlib.h>\n#include "base/files/aux_read_only_app.h"\n#include "base/no_destructor.h"')
change(p,'namespace base {','namespace base {\n'+impl)
change(p,'void File::DoInitialize(const FilePath& path, uint32_t flags) {','''void File::DoInitialize(const FilePath& path, uint32_t flags) {
#if BUILDFLAG(IS_MAC)
  if ((flags & (FLAG_WRITE | FLAG_APPEND | FLAG_WRITE_ATTRIBUTES | FLAG_CREATE |
                FLAG_CREATE_ALWAYS | FLAG_OPEN_ALWAYS | FLAG_OPEN_TRUNCATED)) &&
      !AuxAppAllowsMutation(path)) { error_details_ = FILE_ERROR_ACCESS_DENIED; return; }
#endif''')
for sig,ret in [('int File::Write(int64_t offset, const char* data, int size) {','-1'),('int File::WriteAtCurrentPos(const char* data, int size) {','-1'),('bool File::SetLength(int64_t length) {','false'),('bool File::SetTimes(Time last_access_time, Time last_modified_time) {','false')]:
 change(p,sig,sig+'\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsDescriptorMutation(file_.get())) return '+ret+';\n#endif')
a='''std::optional<size_t> File::WriteAtCurrentPosNoBestEffort(
    base::span<const uint8_t> data) {'''
change(p,a,a+'\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsDescriptorMutation(file_.get())) return std::nullopt;\n#endif')
p=files[1]
change(p,'#include "base/files/file_util.h"','#include "base/files/file_util.h"\n#include "base/files/aux_read_only_app.h"')
for sig,guard,ret in [('bool DeleteFile(const FilePath& path) {','AuxAppAllowsMutation(path, true)','false'),('bool DeletePathRecursively(const FilePath& path) {','AuxAppAllowsMutation(path, true)','false'),('bool MoveUnsafe(const FilePath& from_path, const FilePath& to_path) {','AuxAppAllowsMutation(from_path, true) && AuxAppAllowsMutation(to_path, true)','false'),('bool AppendToFile(const FilePath& filename, span<const uint8_t> data) {','AuxAppAllowsMutation(filename)','false'),('bool SetPosixFilePermissions(const FilePath& path, int mode) {','AuxAppAllowsMutation(path)','false'),('bool WriteFileDescriptor(int fd, span<const uint8_t> data) {','AuxAppAllowsDescriptorMutation(fd)','false')]:
 change(p,sig,sig+'\n#if BUILDFLAG(IS_MAC)\n  if (!('+guard+')) return '+ret+';\n#endif')
a='''                 File::Error* error) {
  ScopedBlockingCall scoped_blocking_call(FROM_HERE, BlockingType::MAY_BLOCK);
  if (rename'''
b='''                 File::Error* error) {
#if BUILDFLAG(IS_MAC)
  if (!AuxAppAllowsMutation(from_path, true) || !AuxAppAllowsMutation(to_path, true)) {
    if (error) *error = File::FILE_ERROR_ACCESS_DENIED;
    return false;
  }
#endif
  ScopedBlockingCall scoped_blocking_call(FROM_HERE, BlockingType::MAY_BLOCK);
  if (rename'''
change(p,a,b)
a='''FILE* OpenFile(const FilePath& filename, base::cstring_view mode) {'''
change(p,a,a+'''\n#if BUILDFLAG(IS_MAC)
  if ((mode.find('w') != mode.npos || mode.find('a') != mode.npos || mode.find('+') != mode.npos) &&
      !AuxAppAllowsMutation(filename)) return nullptr;
#endif''')
a='''    File outfile(open(target_path.value().c_str(), open_flags, mode));'''
change(p,a,'''#if BUILDFLAG(IS_MAC)
    if (!AuxAppAllowsMutation(target_path)) return false;
#endif
'''+a)
a='''                        const FilePath& symlink_path) {'''
change(p,a,a+'\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsMutation(symlink_path)) return false;\n#endif')
p=files[2]
change(p,'#include "base/files/file_util.h"','#include "base/files/file_util.h"\n#include "base/files/aux_read_only_app.h"')
a='''bool CopyFile(const FilePath& from_path, const FilePath& to_path) {'''
change(p,a,a+'\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsMutation(to_path)) return false;\n#endif')
p=files[0]
change(p,'int File::Mkdir(const FilePath& path, mode_t mode) {','int File::Mkdir(const FilePath& path, mode_t mode) {\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsMutation(path)) return -1;\n#endif')
p=files[1]
change(p,'    if (S_ISDIR(from_stat.st_mode)) {','#if BUILDFLAG(IS_MAC)\n    if (!AuxAppAllowsMutation(target_path)) return false;\n#endif\n    if (S_ISDIR(from_stat.st_mode)) {')
change(p,'    FilePath::StringViewType name_prefix,\n    FilePath* path) {','    FilePath::StringViewType name_prefix,\n    FilePath* path) {\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsMutation(directory)) return ScopedFD();\n#endif')
change(p,'                                        FilePath* new_dir) {','                                        FilePath* new_dir) {\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsMutation(base_dir)) return false;\n#endif')
p=files[1]
change(p,'bool WriteFile(const FilePath& filename, span<const uint8_t> data) {','bool WriteFile(const FilePath& filename, span<const uint8_t> data) {\n#if BUILDFLAG(IS_MAC)\n  if (!AuxAppAllowsMutation(filename)) return false;\n#endif')
p='chrome/browser/shortcuts/chrome_webloc_file.mm'
files.append(p); originals[p]=(src/p).read_text(); texts[p]=originals[p]
change(p,'bool ChromeWeblocFile::SaveToFile(const base::FilePath& file_path) {','bool ChromeWeblocFile::SaveToFile(const base::FilePath& file_path) {\n  if (!base::AuxAppAllowsMutation(file_path)) return false;')
change(p,'#include "base/files/block_tests_writing_to_special_dirs.h"','#include "base/files/block_tests_writing_to_special_dirs.h"\n#include "base/files/aux_read_only_app.h"')
plan=[];patch=[]
for p in files:
 (out/'source'/p).parent.mkdir(parents=True,exist_ok=True)
 (out/'source'/p).write_text(texts[p]);
 plan.append({'path':p,'inputSha256':hashlib.sha256(originals[p].encode()).hexdigest(),'outputSha256':hashlib.sha256(texts[p].encode()).hexdigest()})
 patch.extend(difflib.unified_diff(originals[p].splitlines(True),texts[p].splitlines(True),fromfile='a/'+p,tofile='b/'+p))
plan.append({'path':'base/files/aux_read_only_app.h','inputSha256':None,'outputSha256':hashlib.sha256(h.encode()).hexdigest()})
patch.extend(difflib.unified_diff([],h.splitlines(True),fromfile='/dev/null',tofile='b/base/files/aux_read_only_app.h'))
(out/'source-plan.json').write_text(json.dumps({'files':plan},indent=2)+'\n');(out/'native.patch').write_text(''.join(patch))
print(out)
