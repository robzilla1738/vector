// Factual retained native directory selection only. This is not startup
// admission; the daemon/root/generation receipt remains mandatory.
struct HeldUserDirectory {
  base::ScopedFD fd;
  base::FilePath path;
  std::optional<size_t> parent;
  std::string leaf;
  bool private_directory = false;
};
struct PreparedUserDirectories {
  const pid_t process = getpid();
  const uid_t uid = geteuid();
  NativeUserStartupPaths paths;
  std::vector<HeldUserDirectory> held;
};
std::unique_ptr<PreparedUserDirectories>& PreparedDirectories() {
  static auto* value = new std::unique_ptr<PreparedUserDirectories>;
  return *value;
}
bool& DirectoryPreparationAttempted() { static bool attempted = false; return attempted; }
bool ValidUserDirectory(int fd, bool private_directory) {
  struct stat value{};
  if (fd < 0 || fstat(fd, &value) != 0 || !S_ISDIR(value.st_mode) ||
      value.st_uid != geteuid() || (value.st_mode & (private_directory ? 0077 : 0022)))
    return false;
  if (!private_directory) return true;
  errno = 0;
  acl_t acl = acl_get_fd_np(fd, ACL_TYPE_EXTENDED);
  if (!acl) return errno == ENOENT;
  acl_entry_t entry{}; errno = 0;
  const bool empty = acl_valid(acl) == 0 && acl_get_entry(acl, 0, &entry) == -1 &&
      errno == EINVAL && entry == nullptr;
  acl_free(acl);
  return empty;
}
bool SameHeldUserDirectory(const PreparedUserDirectories& state, size_t index) {
  const auto& held = state.held.at(index);
  if (!ValidUserDirectory(held.fd.get(), held.private_directory)) return false;
  base::ScopedFD current(held.parent
      ? openat(state.held.at(*held.parent).fd.get(), held.leaf.c_str(),
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
      : open(held.path.value().c_str(),
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  struct stat before{}, after{};
  return current.is_valid() && ValidUserDirectory(current.get(), held.private_directory) &&
      fstat(held.fd.get(), &before) == 0 && fstat(current.get(), &after) == 0 &&
      before.st_dev == after.st_dev && before.st_ino == after.st_ino &&
      before.st_uid == after.st_uid && before.st_mode == after.st_mode;
}
bool HoldUserDirectory(PreparedUserDirectories& state, const base::FilePath& path,
                      std::optional<size_t> parent, const char* leaf,
                      bool private_directory) {
  base::ScopedFD fd(parent
      ? openat(state.held.at(*parent).fd.get(), leaf,
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
      : open(path.value().c_str(),
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  if (!fd.is_valid() || !ValidUserDirectory(fd.get(), private_directory)) return false;
  state.held.push_back({std::move(fd), path, parent, leaf, private_directory});
  return SameHeldUserDirectory(state, state.held.size() - 1);
}
bool InspectPrivateChild(int parent, const char* leaf, bool* exists) {
  struct stat value{};
  if (fstatat(parent, leaf, &value, AT_SYMLINK_NOFOLLOW) != 0) {
    if (errno != ENOENT) return false;
    *exists = false;
    return true;
  }
  *exists = true;
  return S_ISDIR(value.st_mode) && value.st_uid == geteuid() && !(value.st_mode & 0077);
}
bool SupportInventory(int support) {
  base::ScopedFD duplicate(fcntl(support, F_DUPFD_CLOEXEC, 0));
  if (!duplicate.is_valid()) return false;
  DIR* directory = fdopendir(duplicate.get());
  if (!directory) return false;
  duplicate.release();
  rewinddir(directory);
  std::set<std::string> names;
  bool valid = true;
  errno = 0;
  while (const dirent* entry = readdir(directory)) {
    const auto bytes = base::span(entry->d_name);
    const auto end = std::ranges::find(bytes, '\0');
    if (end == bytes.end()) { valid = false; break; }
    const std::string name(bytes.begin(), end);
    if (name == "." || name == "..") continue;
    if ((name != "User Data" && name != "Control" && name != "Tasks") ||
        !names.insert(name).second || names.size() > 3) { valid = false; break; }
    errno = 0;
  }
  if (errno != 0) valid = false;
  closedir(directory);
  if (!valid || !names.contains("User Data") ||
      names.contains("Control") != names.contains("Tasks")) return false;
  for (const auto& name : names) {
    bool exists = false;
    if (!InspectPrivateChild(support, name.c_str(), &exists) || !exists) return false;
  }
  return true;
}
std::optional<NativeUserStartupPaths> DeriveCurrentOsUserPaths() {
  if (getuid() == 0 || getuid() != geteuid()) return std::nullopt;
  const long configured = sysconf(_SC_GETPW_R_SIZE_MAX);
  size_t size = configured > 0 ? static_cast<size_t>(configured) : size_t{16384};
  if (size > 65536) return std::nullopt;
  std::vector<char> storage(size);
  passwd record{}; passwd* result = nullptr;
  for (;;) {
    const int status = getpwuid_r(geteuid(), &record, storage.data(), storage.size(), &result);
    if (status == ERANGE && storage.size() < 65536) {
      storage.resize(std::min(size_t{65536}, storage.size() * 2));
      continue;
    }
    if (status != 0 || result != &record || record.pw_uid != geteuid() || !record.pw_dir)
      return std::nullopt;
    break;
  }
  // getpwuid_r's strings belong to its actual bounded caller buffer. Verify
  // the returned field lies within it before constructing an owned path.
  const uintptr_t begin = reinterpret_cast<uintptr_t>(storage.data());
  const uintptr_t field = reinterpret_cast<uintptr_t>(record.pw_dir);
  if (field < begin || field - begin >= storage.size()) return std::nullopt;
  const auto tail = base::span(storage).subspan(static_cast<size_t>(field - begin));
  const auto end = std::ranges::find(tail, '\0');
  if (end == tail.end()) return std::nullopt;
  const std::string named(tail.begin(), end);
  if (named.empty() || named.size() >= PATH_MAX) return std::nullopt;
  std::array<char, PATH_MAX> canonical{};
  if (!realpath(named.c_str(), canonical.data())) return std::nullopt;
  const base::FilePath home(canonical.data());
  if (home.empty() || !home.IsAbsolute() || home.ReferencesParent() || home.value() == "/")
    return std::nullopt;
  const auto support = home.AppendASCII("Library/Application Support/Aux Browser");
  return NativeUserStartupPaths{home, support.AppendASCII("User Data"),
                                home.AppendASCII("Library/Caches/Aux Browser")};
}
bool SameUserPaths(const NativeUserStartupPaths& a, const NativeUserStartupPaths& b) {
  return a.home == b.home && a.data == b.data && a.cache == b.cache;
}
bool RevalidatePreparedDirectories(const PreparedUserDirectories& state) {
  if (state.process != getpid() || state.uid == 0 || state.uid != getuid() ||
      state.uid != geteuid() || state.held.size() != 7) return false;
  for (size_t i = 0; i < state.held.size(); ++i)
    if (!SameHeldUserDirectory(state, i)) return false;
  return SupportInventory(state.held.at(4).fd.get());
}
bool PrepareCurrentUserDirectories(const NativeUserStartupPaths& paths) {
  auto current = DeriveCurrentOsUserPaths();
  if (!current || !SameUserPaths(*current, paths)) return false;
  if (const auto& prepared = PreparedDirectories())
    return SameUserPaths(prepared->paths, paths) && RevalidatePreparedDirectories(*prepared);
  if (DirectoryPreparationAttempted()) return false;
  DirectoryPreparationAttempted() = true;
  auto state = std::make_unique<PreparedUserDirectories>();
  state->paths = paths;
  if (!HoldUserDirectory(*state, paths.home, std::nullopt, "", false) ||
      !HoldUserDirectory(*state, paths.home.AppendASCII("Library"), size_t{0}, "Library", false) ||
      !HoldUserDirectory(*state, paths.home.AppendASCII("Library/Application Support"),
                         size_t{1}, "Application Support", false) ||
      !HoldUserDirectory(*state, paths.home.AppendASCII("Library/Caches"), size_t{1}, "Caches", false)) {
    RAW_LOG(ERROR, "Aux OS-user startup refused: native OS ancestor chain unavailable");
    return false;
  }
  bool support_exists = false, cache_exists = false;
  if (!InspectPrivateChild(state->held.at(2).fd.get(), "Aux Browser", &support_exists) ||
      !InspectPrivateChild(state->held.at(3).fd.get(), "Aux Browser", &cache_exists) ||
      support_exists != cache_exists) {
    RAW_LOG(ERROR, "Aux OS-user startup refused: partial or invalid Aux namespace roots");
    return false;
  }
  // Complete preflight precedes the first mkdir. Never add User Data/cache to
  // an arbitrary pre-existing namespace or reset a partial failed install.
  if (support_exists) {
    if (!HoldUserDirectory(*state, paths.data.DirName(), size_t{2}, "Aux Browser", true) ||
        !SupportInventory(state->held.at(4).fd.get())) {
      RAW_LOG(ERROR, "Aux OS-user startup refused: unknown or partial Aux support namespace");
      return false;
    }
  } else {
    if (mkdirat(state->held.at(2).fd.get(), "Aux Browser", 0700) != 0 ||
        !HoldUserDirectory(*state, paths.data.DirName(), size_t{2}, "Aux Browser", true) ||
        mkdirat(state->held.at(4).fd.get(), "User Data", 0700) != 0 ||
        mkdirat(state->held.at(3).fd.get(), "Aux Browser", 0700) != 0) {
      RAW_LOG(ERROR, "Aux OS-user startup refused: fresh directory creation incomplete");
      return false;
    }
  }
  if (!HoldUserDirectory(*state, paths.data, size_t{4}, "User Data", true) ||
      !HoldUserDirectory(*state, paths.cache, size_t{3}, "Aux Browser", true) ||
      !RevalidatePreparedDirectories(*state)) {
    RAW_LOG(ERROR, "Aux OS-user startup refused: native directory revalidation failed");
    return false;
  }
  PreparedDirectories() = std::move(state);
  return true;
}
