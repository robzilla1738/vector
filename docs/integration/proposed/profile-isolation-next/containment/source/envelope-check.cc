#include "AuxExecSpawnEnvelope.h"
#include <spawn.h>
#include <sys/wait.h>
#include <cstdio>

// Synthetic filesystem-policy check only; this does not authenticate roots or
// exercise protected startup, production custody, or profile switching.
int main(int argc, char** argv) {
  if (argc != 5) return 2;
  AuxExecNativeDeniedRoots roots{};
  roots.version = 1;
  roots.count = 3;
  for (int i = 0; i < 3; ++i) {
    if (strlen(argv[i + 1]) >= sizeof(roots.paths[i])) return 2;
    strcpy(roots.paths[i], argv[i + 1]);
  }
  char command[] = "/bin/sh";
  char flag[] = "-c";
  char script[] = "for root in \"$1\" \"$2\" \"$3\"; do "
      "if /bin/cat \"$root/secret\" >/dev/null 2>&1; then exit 10; fi; "
      "if (printf denied >\"$root/write\") 2>/dev/null; then exit 11; fi; "
      "done; printf allowed > allowed-output";
  char* args[] = {command, flag, script, command, argv[1], argv[2], argv[3], nullptr};
  char path[] = "PATH=/usr/bin:/bin";
  char* env[] = {path, nullptr};
  uv_process_options_t options{};
  options.file = command; options.args = args; options.env = env; options.cwd = argv[4];
  AuxExecSpawnEnvelope envelope;
  if (!envelope.Prepare(options, roots)) return 3;
  options.cwd = argv[1];
  if (envelope.Prepare(options, roots)) return 4;
  options.cwd = argv[4]; options.env = nullptr;
  if (envelope.Prepare(options, roots)) return 5;
  options.env = env; options.file = "custom-argv0";
  if (envelope.Prepare(options, roots)) return 6;
  options.file = command;
  if (!envelope.Prepare(options, roots)) return 7;
  posix_spawnattr_t attr;
  posix_spawn_file_actions_t actions;
  if (posix_spawnattr_init(&attr) || posix_spawn_file_actions_init(&actions)) return 8;
  if (posix_spawnattr_setflags(&attr, POSIX_SPAWN_CLOEXEC_DEFAULT) ||
      posix_spawn_file_actions_addchdir_np(&actions, envelope.Cwd())) return 8;
  pid_t pid = -1;
  int result = posix_spawn(&pid, envelope.File(), &actions, &attr, envelope.Args(), envelope.Env());
  posix_spawn_file_actions_destroy(&actions); posix_spawnattr_destroy(&attr);
  if (result) { fprintf(stderr, "spawn error: %d\n", result); return 9; }
  int status = 0;
  if (waitpid(pid, &status, 0) != pid || !WIFEXITED(status)) return 12;
  printf("synthetic sandbox exit=%d; refusal checks passed\n", WEXITSTATUS(status));
  return WEXITSTATUS(status);
}
