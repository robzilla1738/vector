#if BUILDFLAG(IS_MAC) && defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)
// This path must already exist. No default, policy redirect, symlink expansion,
// accepted-startup record or directory creation selects an ordinary root.
bool ValidateOrdinaryUserDataSelection(base::CommandLine* command_line) {
  if (!command_line || !command_line->HasSwitch(switches::kUserDataDir) ||
      command_line->HasSwitch(switches::kDiskCacheDir) || command_line->HasSwitch(switches::kProfileDirectory)) return false;
  const auto path = command_line->GetSwitchValuePath(switches::kUserDataDir);
  if (path.empty() || !path.IsAbsolute() || path.ReferencesParent() ||
      path.value() == "/" || base::MakeAbsoluteFilePath(path) != path) return false;
  constexpr std::string_view prefix = "/private/tmp/aux-fresh-browser-";
  constexpr std::string_view suffix = "/home/Library/Application Support/Aux";
  const std::string_view named = path.value();
  if (!named.starts_with(prefix) || !named.ends_with(suffix) ||
      named.size() <= prefix.size() + suffix.size()) return false;
  const auto scope = named.substr(prefix.size(), named.size() - prefix.size() - suffix.size());
  if (scope.size() > 128 || std::ranges::any_of(scope, [](unsigned char ch) {
        return !base::IsAsciiAlpha(ch) && !base::IsAsciiDigit(ch) && ch != '-' && ch != '_';
      })) return false;
  auto policy_path = path;
  policy::path_parser::CheckUserDataDirPolicy(&policy_path);
  if (policy_path != path) return false;
  base::ScopedFD descriptor(open(path.value().c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  struct stat identity{};
  if (!descriptor.is_valid() || fstat(descriptor.get(), &identity) != 0 ||
      !S_ISDIR(identity.st_mode) || identity.st_uid != geteuid() || (identity.st_mode & 0077)) return false;
  const auto app_data = path.DirName();
  const auto home = app_data.DirName().DirName();
  const auto cache = home.AppendASCII("Library/Caches");
  const auto private_existing = [](const base::FilePath& candidate) {
    if (base::MakeAbsoluteFilePath(candidate) != candidate) return false;
    base::ScopedFD held(open(candidate.value().c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
    struct stat value{};
    return held.is_valid() && fstat(held.get(), &value) == 0 && S_ISDIR(value.st_mode) &&
        value.st_uid == geteuid() && !(value.st_mode & 0077);
  };
  if (!private_existing(home) || !private_existing(app_data) || !private_existing(cache) ||
      !base::PathService::OverrideAndCreateIfNeeded(base::DIR_HOME, home, true, false) ||
      !base::PathService::OverrideAndCreateIfNeeded(base::DIR_APP_DATA, app_data, true, false) ||
      !base::PathService::OverrideAndCreateIfNeeded(base::DIR_CACHE, cache, true, false) ||
      !base::PathService::OverrideAndCreateIfNeeded(chrome::DIR_USER_DATA, path, true, false)) return false;
  base::FilePath selected;
  if (!base::PathService::Get(chrome::DIR_USER_DATA, &selected) || selected != path) return false;
  base::ScopedFD current(open(path.value().c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  struct stat after{};
  return current.is_valid() && fstat(current.get(), &after) == 0 &&
      identity.st_dev == after.st_dev && identity.st_ino == after.st_ino &&
      identity.st_uid == after.st_uid && identity.st_mode == after.st_mode;
}
#endif
