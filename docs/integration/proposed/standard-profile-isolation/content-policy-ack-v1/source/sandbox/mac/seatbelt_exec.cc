// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "sandbox/mac/seatbelt_exec.h"

#include <stdint.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <cerrno>
#include <climits>
#include <poll.h>
#include <stdlib.h>
#include <chrono>
#include <algorithm>

#include <limits>
#include <vector>

#include "base/compiler_specific.h"
#include "base/posix/eintr_wrapper.h"  //nogncheck
#include "sandbox/mac/sandbox_logging.h"
#include "sandbox/mac/sandbox_serializer.h"
#include "sandbox/mac/seatbelt.h"

namespace sandbox {

namespace {

// Local, same-architecture protocol: exact bytes, not a renderer proof.
struct AuxPolicyEnvelope {
  uint64_t version = 1;
  uint64_t generation = 0;
  std::array<uint8_t, 32> challenge{};
};
constexpr size_t kAuxMaxPolicyBytes = 8 * 1024 * 1024;
// Bounds only receipt availability, never turns elapsed time into settlement.
// Nonblocking descriptors ensure poll readiness cannot turn into an unbounded
// read/write. Every caller owns and closes its endpoint after the loop.
bool AuxReceiptIO(int fd, void* buffer, size_t size, bool writing) {
  auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(10);
  auto* bytes = static_cast<uint8_t*>(buffer);
  size_t offset = 0;
  while (offset < size) {
    auto left = std::chrono::duration_cast<std::chrono::milliseconds>(
        deadline - std::chrono::steady_clock::now()).count();
    if (left <= 0) return false;
    pollfd item{fd, static_cast<short>(writing ? POLLOUT : POLLIN), 0};
    int ready = HANDLE_EINTR(poll(&item, 1, static_cast<int>(left)));
    if (ready <= 0 || (item.revents & (POLLERR | POLLNVAL))) return false;
    ssize_t n = writing
        ? write(fd, UNSAFE_TODO(bytes + offset), size - offset)
        : read(fd, UNSAFE_TODO(bytes + offset), size - offset);
    if (n < 0 && (errno == EINTR || errno == EAGAIN)) continue;
    if (n <= 0) return false;
    offset += static_cast<size_t>(n);
  }
  return true;
}
struct ReadTraits {
  using BufferType = uint8_t*;
  static constexpr char kNameString[] = "read";
  static ssize_t Operate(int fd, BufferType buffer, size_t size) {
    return read(fd, buffer, size);
  }
};
constexpr char ReadTraits::kNameString[];

struct WriteTraits {
  using BufferType = const uint8_t*;
  static constexpr char kNameString[] = "write";
  static ssize_t Operate(int fd, BufferType buffer, size_t size) {
    return write(fd, buffer, size);
  }
};
constexpr char WriteTraits::kNameString[];

template <typename Traits>
bool ReadOrWrite(int fd,
                 const typename Traits::BufferType buffer,
                 const size_t size,
                 const char* operation_description) {
  if (size > std::numeric_limits<ssize_t>::max()) {
    logging::Error("request size is greater than ssize_t::max");
    return false;
  }

  ssize_t bytes_to_transact = static_cast<ssize_t>(size);

  while (bytes_to_transact > 0) {
    ssize_t offset = size - bytes_to_transact;
    ssize_t transacted_bytes = HANDLE_EINTR(
        Traits::Operate(fd, UNSAFE_TODO(buffer + offset), bytes_to_transact));
    if (transacted_bytes < 0) {
      logging::PError("SeatbeltExec: %s %s failed", operation_description,
                      Traits::kNameString);
      return false;
    } else if (transacted_bytes == 0) {
      // A short read from the sender, perhaps the sender process died.
      logging::Error("SeatbeltExec: %s %s failed", operation_description,
                     Traits::kNameString);
      return false;
    }

    bytes_to_transact -= transacted_bytes;
  }

  return true;
}

}  // namespace

namespace switches {

const char kSeatbeltClient[] = "--seatbelt-client=";

const char kSeatbeltClientName[] = "seatbelt-client";
const char kAuxSeatbeltReceipt[] = "--aux-seatbelt-receipt=";

}  // namespace switches

SeatbeltExecClient::SeatbeltExecClient() {
  if (pipe(pipe_) != 0)
    logging::PFatal("SeatbeltExecClient: pipe failed");
}

SeatbeltExecClient::~SeatbeltExecClient() {
  for (int fd : aux_receipt_) if (fd >= 0) IGNORE_EINTR(close(fd));
  if (pipe_[0] != -1)
    IGNORE_EINTR(close(pipe_[0]));
  if (pipe_[1] != -1)
    IGNORE_EINTR(close(pipe_[1]));
}

int SeatbeltExecClient::EnableAuxAppliedPolicyReceipt(uint64_t generation) {
  if (!generation || aux_receipt_[0] >= 0 || pipe(aux_receipt_) != 0) return -1;
  for (int fd : aux_receipt_) {
    if (fcntl(fd, F_SETFD, FD_CLOEXEC) != 0 ||
        fcntl(fd, F_SETFL, O_NONBLOCK) != 0) {
      for (int& owned : aux_receipt_) { close(owned); owned = -1; }
      return -1;
    }
  }
  if (fcntl(aux_receipt_[1], F_SETNOSIGPIPE, 1) != 0) {
    for (int& owned : aux_receipt_) { close(owned); owned = -1; }
    return -1;
  }
  aux_generation_ = generation;
  arc4random_buf(aux_challenge_.data(), aux_challenge_.size());
  return aux_receipt_[1];
}

bool SeatbeltExecClient::ReadAuxAppliedPolicyReceipt(
    const std::string& expected_policy) {
  if (aux_receipt_[0] < 0 || !aux_generation_ ||
      expected_policy.size() > kAuxMaxPolicyBytes) return false;
  AuxPolicyEnvelope observed;
  uint64_t length = 0;
  if (!AuxReceiptIO(aux_receipt_[0], &observed, sizeof(observed), false) ||
      observed.version != 1 || observed.generation != aux_generation_ ||
      observed.challenge != aux_challenge_ ||
      !AuxReceiptIO(aux_receipt_[0], &length, sizeof(length), false) ||
      length != expected_policy.size()) return false;
  std::string observed_policy(length, '\0');
  return AuxReceiptIO(aux_receipt_[0], observed_policy.data(), length, false) &&
         observed_policy == expected_policy;
}

int SeatbeltExecClient::GetReadFD() {
  return pipe_[0];
}

bool SeatbeltExecClient::SendPolicy(const std::string& serialized_policy) {
  IGNORE_EINTR(close(pipe_[0]));
  pipe_[0] = -1;

  if (!WriteString(serialized_policy)) {
    return false;
  }

  if (aux_receipt_[1] >= 0) {
    IGNORE_EINTR(close(aux_receipt_[1]));
    aux_receipt_[1] = -1;
    AuxPolicyEnvelope envelope;
    envelope.generation = aux_generation_;
    envelope.challenge = aux_challenge_;
    if (!ReadOrWrite<WriteTraits>(pipe_[1],
          reinterpret_cast<const uint8_t*>(&envelope), sizeof(envelope),
          "Aux receipt binding")) return false;
  }
  IGNORE_EINTR(close(pipe_[1]));
  pipe_[1] = -1;

  return true;
}

bool SeatbeltExecClient::WriteString(const std::string& str) {
  uint64_t str_len = static_cast<uint64_t>(str.size());
  if (!ReadOrWrite<WriteTraits>(pipe_[1], reinterpret_cast<uint8_t*>(&str_len),
                                sizeof(str_len), "buffer length")) {
    return false;
  }

  if (!ReadOrWrite<WriteTraits>(pipe_[1],
                                reinterpret_cast<const uint8_t*>(&str[0]),
                                str_len, "buffer")) {
    return false;
  }

  return true;
}

SeatbeltExecServer::SeatbeltExecServer(int fd) : fd_(fd) {}

SeatbeltExecServer::~SeatbeltExecServer() {
  if (fd_ >= 0) close(fd_);
  if (aux_receipt_fd_ >= 0) close(aux_receipt_fd_);
}

sandbox::SeatbeltExecServer::CreateFromArgumentsResult::
    CreateFromArgumentsResult() = default;
sandbox::SeatbeltExecServer::CreateFromArgumentsResult::
    CreateFromArgumentsResult(CreateFromArgumentsResult&&) = default;
sandbox::SeatbeltExecServer::CreateFromArgumentsResult::
    ~CreateFromArgumentsResult() = default;

// static
sandbox::SeatbeltExecServer::CreateFromArgumentsResult
SeatbeltExecServer::CreateFromArguments(const char* executable_path,
                                        int argc,
                                        const char* const* argv) {
  CreateFromArgumentsResult result;
  int seatbelt_client_fd = -1;
  int receipt_fd = -1;
  bool duplicate_receipt = false;
  for (int i = 1; i < argc; ++i) {
    if (UNSAFE_TODO(strncmp(argv[i], switches::kAuxSeatbeltReceipt,
                           strlen(switches::kAuxSeatbeltReceipt))) == 0) {
      if (receipt_fd >= 0) duplicate_receipt = true;
      const char* value = UNSAFE_TODO(argv[i] + strlen(switches::kAuxSeatbeltReceipt));
      char* end = nullptr;
      long parsed = strtol(value, &end, 10);
      if (!end || *end || parsed < 0 || parsed > INT_MAX) duplicate_receipt = true;
      else receipt_fd = static_cast<int>(parsed);
    }
    if (UNSAFE_TODO(strncmp(argv[i], switches::kSeatbeltClient,
                            strlen(switches::kSeatbeltClient))) == 0) {
      result.sandbox_required = true;
      std::string arg(UNSAFE_TODO(argv[i]));
      std::string fd_string = arg.substr(strlen(switches::kSeatbeltClient));
      seatbelt_client_fd = std::stoi(fd_string);
    }
  }

  if (!result.sandbox_required)
    return result;

  if (seatbelt_client_fd < 0) {
    logging::Error("Must pass a valid file descriptor to %s",
                   switches::kSeatbeltClient);
    return result;
  }

  if (duplicate_receipt || receipt_fd == seatbelt_client_fd) return result;
  result.server.reset(new SeatbeltExecServer(seatbelt_client_fd));
  result.server->aux_receipt_fd_ = receipt_fd;
  return result;
}

bool SeatbeltExecServer::InitializeSandbox() {
  std::string policy_string;
  if (!ReadString(&policy_string))
    return false;

  AuxPolicyEnvelope envelope;
  if (aux_receipt_fd_ >= 0 &&
      (!ReadOrWrite<ReadTraits>(fd_, reinterpret_cast<uint8_t*>(&envelope),
          sizeof(envelope), "Aux receipt binding") ||
       envelope.version != 1 || !envelope.generation)) return false;
  // The capability channel is closed before entering the framework. Receipt
  // failure does not undo a successfully installed policy or claim coverage.
  close(fd_);
  fd_ = -1;
  bool applied = SandboxSerializer::ApplySerializedPolicy(policy_string);
  if (aux_receipt_fd_ >= 0) {
    if (applied && policy_string.size() <= kAuxMaxPolicyBytes) {
      uint64_t length = policy_string.size();
      if (AuxReceiptIO(aux_receipt_fd_, &envelope, sizeof(envelope), true) &&
          AuxReceiptIO(aux_receipt_fd_, &length, sizeof(length), true)) {
        AuxReceiptIO(aux_receipt_fd_, policy_string.data(), length, true);
      }
    }
    close(aux_receipt_fd_);
    aux_receipt_fd_ = -1;
  }
  return applied;
}

bool SeatbeltExecServer::ReadString(std::string* str) {
  uint64_t buf_len = 0;
  if (!ReadOrWrite<ReadTraits>(fd_, reinterpret_cast<uint8_t*>(&buf_len),
                               sizeof(buf_len), "buffer length")) {
    return false;
  }

  str->resize(buf_len);

  if (!ReadOrWrite<ReadTraits>(fd_, reinterpret_cast<uint8_t*>(&(*str)[0]),
                               buf_len, "buffer")) {
    return false;
  }

  return true;
}

}  // namespace sandbox
