#include "source/direct-child-wait.h"

constexpr auto exited = DecodeDirectChildWait(123, 123, 7 << 8, ECHILD);
static_assert(exited.error == 0 && WIFEXITED(exited.status));
static_assert(WEXITSTATUS(exited.status) == 7);
// A failed wait must not expose even a plausible exit status.
constexpr auto unknown = DecodeDirectChildWait(123, -1, 7 << 8, ECHILD);
static_assert(unknown.error == ECHILD && unknown.status == 0);
constexpr auto impossible = DecodeDirectChildWait(123, 0, 7 << 8, 0);
static_assert(impossible.error == EIO && impossible.status == 0);
constexpr auto stopped = DecodeDirectChildWait(123, 123, (SIGSTOP << 8) | 0x7f, 0);
static_assert(stopped.error == EIO && stopped.status == 0);
