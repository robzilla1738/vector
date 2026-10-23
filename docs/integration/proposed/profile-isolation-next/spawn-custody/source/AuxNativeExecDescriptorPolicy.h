#pragma once
#include <uv.h>
// uv_spawn must create exactly three fresh stdio pipes (or /dev/null). Neither
// inherited FD/stream, IPC/additional slots, nor uid/gid/fork-fallback requests
// are accepted by this protected producer. UV_CREATE_PIPE creates socketpairs;
// libuv never forwards an existing stream's descriptor under this flag.
constexpr bool AuxExecStdioFlagsAllowed(unsigned flags) noexcept {
  constexpr unsigned directions = UV_READABLE_PIPE | UV_WRITABLE_PIPE;
  return flags == UV_IGNORE ||
      ((flags & ~directions) == UV_CREATE_PIPE && (flags & directions));
}
inline bool AuxExecDescriptorOptionsAllowed(const uv_process_options_t& options) noexcept {
  if (options.stdio_count != 3 || !options.stdio ||
      (options.flags & (UV_PROCESS_SETUID | UV_PROCESS_SETGID))) return false;
  for (unsigned index = 0; index != 3; ++index) {
    const auto& entry = options.stdio[index];
    if (!AuxExecStdioFlagsAllowed(entry.flags)) return false;
    if (entry.flags != UV_IGNORE &&
        (!entry.data.stream || entry.data.stream->type != UV_NAMED_PIPE ||
         reinterpret_cast<const uv_pipe_t*>(entry.data.stream)->ipc)) return false;
  }
  return true;
}
