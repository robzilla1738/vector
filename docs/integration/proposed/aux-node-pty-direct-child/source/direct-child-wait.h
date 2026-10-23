// Copyright 2026 Aux contributors. MIT license; see the pinned upstream LICENSE.
#pragma once
#include <errno.h>
#include <sys/types.h>
#include <sys/wait.h>

struct DirectChildWaitResult {
  int status = 0;
  int error = 0;
};

constexpr DirectChildWaitResult DecodeDirectChildWait(
    pid_t pid, pid_t waited, int status, int wait_error) {
  if (waited != pid || (!WIFEXITED(status) && !WIFSIGNALED(status)))
    return {0, waited == -1 && wait_error != 0 ? wait_error : EIO};
  return {status, 0};
}

inline DirectChildWaitResult WaitForDirectChild(pid_t pid) {
  int status = 0;
  pid_t waited;
  do {
    waited = waitpid(pid, &status, 0);
  } while (waited == -1 && errno == EINTR);
  return DecodeDirectChildWait(pid, waited, status, errno);
}
