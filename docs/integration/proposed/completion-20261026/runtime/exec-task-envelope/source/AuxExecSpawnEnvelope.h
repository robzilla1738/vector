#ifndef AUX_EXEC_SPAWN_ENVELOPE_H_
#define AUX_EXEC_SPAWN_ENVELOPE_H_

#include <uv.h>
#include <limits.h>
#include <stdlib.h>
#include <unistd.h>
#include <cstdint>
#include <cstring>
#include <string>
#include <vector>
#include "AuxNativeExecReservation.h"
#include "AuxNativeExecTaskBoundary.h"
#include <utility>

// Native-only command formatting. This class grants no authority: its roots MUST
// come from AuxNativeExecCopyDeniedRoots on the same retained spawn reservation.
// The caller owns admission, descriptor exclusion, the real uv_spawn result and
// terminal observation. Missing roots or invalid options refuse before spawn.
class AuxExecSpawnEnvelope final {
 public:
  AuxExecSpawnEnvelope() = default;
  AuxExecSpawnEnvelope(const AuxExecSpawnEnvelope&) = delete;
  AuxExecSpawnEnvelope& operator=(const AuxExecSpawnEnvelope&) = delete;
  AuxExecSpawnEnvelope(AuxExecSpawnEnvelope&&) = delete;
  AuxExecSpawnEnvelope& operator=(AuxExecSpawnEnvelope&&) = delete;
  bool Prepare(const uv_process_options_t& options,
               const AuxExecNativeDeniedRoots& roots,const AuxExecNativeTaskBoundary& task) noexcept {
    ready_ = false;
    arguments_.clear(); environment_.clear(); argv_.clear(); envp_.clear();
    cwd_.clear();
    if (roots.version != 1 || roots.count == 0 || roots.count > 4 ||
        !options.file || !options.file[0] || !options.args || !options.args[0] ||
        !options.env || std::strcmp(options.file, options.args[0]) != 0) return false;
    // sandbox-exec does not preserve a separately customized argv[0]. Refuse that
    // unsupported shape instead of silently changing its semantics.
    char current[PATH_MAX], canonical[PATH_MAX];
    const char* requested = options.cwd;
    if (!requested) {
      if (!getcwd(current, sizeof(current))) return false;
      requested = current;
    }
    if (!realpath(requested, canonical)) return false;
    cwd_ = canonical;
    std::vector<std::string> denied;
    for (uint32_t i = 0; i < roots.count; ++i) {
      const char* root = roots.paths[i];
      const size_t length = strnlen(root, sizeof(roots.paths[i]));
      if (length <= 1 || length == sizeof(roots.paths[i]) || root[0] != '/' ||
          std::strchr(root, '\n') || std::strchr(root, '\r') || root[length - 1] == '/' ||
          !realpath(root, canonical) || std::strcmp(root, canonical) != 0) return false;
      if (Within(cwd_, root)) return false;
      bool duplicate = false;
      for (const auto& prior : denied) if (prior == root) duplicate = true;
      if (!duplicate) denied.emplace_back(root);
    }
    if(task.version!=1)return false;
    const char* task_paths[]={task.taskRoot,task.accountTaskRoot,task.workspace,task.application};
    for(const char* root:task_paths){const size_t length=strnlen(root,4096);if(length<=1||length>=4096||root[0]!='/'||strchr(root,'\n')||strchr(root,'\r')||!realpath(root,canonical)||strcmp(root,canonical)!=0)return false;}
    const std::string account_prefix=std::string(task.taskRoot)+"/u/";
    if(std::strncmp(task.accountTaskRoot,account_prefix.c_str(),account_prefix.size())!=0||!task.accountTaskRoot[account_prefix.size()]||strchr(task.accountTaskRoot+account_prefix.size(),'/'))return false;
    // Workspace membership comes from the held stored session/project owner.
    // It is not a broad filesystem allow or replacement for original permissions.
    std::string policy = "(version 1)\n(allow default)\n";
    policy += "(deny file-read* file-write* file-map-executable file-link (require-all (subpath (param \"AUX_NATIVE_TASK_ROOT\")) (require-not (subpath (param \"AUX_NATIVE_TASK_ACCOUNT\")))))\n";
    policy += "(deny file-write-unlink (literal (param \"AUX_NATIVE_TASK_ACCOUNT\")) (path-ancestors (param \"AUX_NATIVE_TASK_ACCOUNT\")))\n";
    policy += "(deny file-write* file-link (subpath (param \"AUX_NATIVE_APPLICATION\")))\n";
    policy += "(deny file-write-unlink (literal (param \"AUX_NATIVE_APPLICATION\")) (path-ancestors (param \"AUX_NATIVE_APPLICATION\")))\n";
    for (size_t i = 0; i < denied.size(); ++i) {
      const std::string parameter = "AUX_NATIVE_DENIED_ROOT_" + std::to_string(i);
      policy += "(deny file-read* file-write* file-map-executable (literal (param \"" +
          parameter + "\")) (subpath (param \"" + parameter + "\")))\n";
      policy += "(deny file-write-unlink (path-ancestors (param \"" + parameter + "\")))\n";
    }
    arguments_ = {"/usr/bin/sandbox-exec", "-p", policy};
    for (size_t i = 0; i < denied.size(); ++i) {
      arguments_.emplace_back("-D");
      arguments_.push_back("AUX_NATIVE_DENIED_ROOT_" + std::to_string(i) + "=" + denied[i]);
    }
    for(const auto& item:std::vector<std::pair<const char*,const char*>>{{"AUX_NATIVE_TASK_ROOT",task.taskRoot},{"AUX_NATIVE_TASK_ACCOUNT",task.accountTaskRoot},{"AUX_NATIVE_APPLICATION",task.application}}){arguments_.emplace_back("-D");arguments_.push_back(std::string(item.first)+"="+item.second);}
    arguments_.emplace_back("--");
    size_t bytes = 0;
    for (const auto& argument : arguments_) bytes += argument.size() + 1;
    const long system_limit = sysconf(_SC_ARG_MAX);
    const size_t limit = system_limit > 0 && system_limit < 1048576
        ? static_cast<size_t>(system_limit) : 1048576;
    if (bytes >= limit) return false;
    if (!Copy(options.args, arguments_, bytes, limit) ||
        !Copy(options.env, environment_, bytes, limit)) return false;
    argv_.reserve(arguments_.size() + 1);
    envp_.reserve(environment_.size() + 1);
    for (auto& argument : arguments_) argv_.push_back(argument.data());
    for (auto& variable : environment_) envp_.push_back(variable.data());
    argv_.push_back(nullptr); envp_.push_back(nullptr);
    ready_ = true;
    return true;
  }
  const char* File() const noexcept { return ready_ ? "/usr/bin/sandbox-exec" : nullptr; }
  char** Args() noexcept { return ready_ ? argv_.data() : nullptr; }
  const char* Cwd() const noexcept { return ready_ ? cwd_.c_str() : nullptr; }
  char** Env() noexcept { return ready_ ? envp_.data() : nullptr; }

 private:
  static bool Within(const std::string& child, const std::string& root) noexcept {
    return child == root || (child.size() > root.size() &&
        child.compare(0, root.size(), root) == 0 && child[root.size()] == '/');
  }
  static bool Copy(char* const* source, std::vector<std::string>& destination,
                   size_t& bytes, size_t limit) noexcept {
    for (size_t i = 0; source[i]; ++i) {
      if (i >= 16384 || bytes >= limit) return false;
      const size_t length = strnlen(source[i], limit - bytes);
      if (length >= limit - bytes) return false;
      bytes += length + 1;
      destination.emplace_back(source[i], length);
    }
    return true;
  }
  // Allocation failure follows the host's normal fatal allocation behavior.
  // No recoverable-allocation or descendant-custody claim is made here.
  bool ready_ = false;
  std::string cwd_;
  std::vector<std::string> arguments_, environment_;
  std::vector<char*> argv_, envp_;
};
#endif
