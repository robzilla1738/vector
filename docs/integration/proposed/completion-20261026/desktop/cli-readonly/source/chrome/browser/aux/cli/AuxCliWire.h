#pragma once
#include <mach/mach.h>
#include <array>
#include <cstddef>
#include <cstring>
#include <string_view>
#include <cstdint>
#include <span>
#include <string>
#include <utility>
#include <vector>

namespace aux::cli {
inline constexpr mach_msg_id_t kInvoke = 0x41584351; // AXCQ
inline constexpr mach_msg_id_t kCompleted = 0x41584352; // AXCR
inline constexpr mach_msg_id_t kReadOnlyQuery = 0x41584354; // AXCT
inline constexpr mach_msg_id_t kReadOnlyResult = 0x41584355; // AXCU
inline constexpr uint32_t kVersion = 1;
inline constexpr size_t kArgumentLimit = 256;
inline constexpr size_t kArgumentBytes = 8192;
inline constexpr size_t kPayloadLimit = 32768;
inline constexpr size_t kEnvironmentLimit = 32;
using Nonce = std::array<uint8_t, 32>;
// C main ABI only: the OS supplies exactly argc argv pointers and each
// argument is a NUL-terminated C string. Convert that boundary once, bounded
// by the existing argument limits, then use owned strings/ranges exclusively.
inline bool CopyNativeMainArguments(int argc, char* argv[],
                                    std::vector<std::string>* output) {
  if (!output || !argv || argc < 1 ||
      static_cast<size_t>(argc - 1) > kArgumentLimit) return false;
  std::span<char* const> native;
#pragma clang unsafe_buffer_usage begin
  native = std::span<char* const>(argv, static_cast<size_t>(argc));
#pragma clang unsafe_buffer_usage end
  std::vector<std::string> copied;
  for (const char* argument : native.subspan(1)) {
    if (!argument) return false;
    // The sole bounded libc scan is at the actual NUL-terminated main ABI.
#pragma clang unsafe_buffer_usage begin
    const size_t length = strnlen(argument, kArgumentBytes + 1);
#pragma clang unsafe_buffer_usage end
    if (length > kArgumentBytes) return false;
    std::span<const char> bytes;
#pragma clang unsafe_buffer_usage begin
    bytes = std::span<const char>(argument, length);
#pragma clang unsafe_buffer_usage end
    copied.emplace_back(bytes.begin(), bytes.end());
  }
  *output = std::move(copied);
  return true;
}

// Fileports: directory, stdin, stdout, stderr. These kernel capabilities never
// select an Aux installation/profile/owner. Native admission is separate.
struct Request {
  mach_msg_header_t header{};
  mach_msg_body_t body{};
  std::array<mach_msg_port_descriptor_t, 4> files{};
  uint32_t version = kVersion;
  uint32_t payload_bytes = 0;
  Nonce nonce{};
  std::array<uint8_t, kPayloadLimit> payload{};
};
struct Completion {
  mach_msg_header_t header{};
  uint32_t version = kVersion;
  int32_t exit_code = 78;
  Nonce nonce{};
};
// Authenticated metadata only. No fileports, provider tokens or process role.
struct ReadOnlyRequest {
  mach_msg_header_t header{};
  uint32_t version = kVersion;
  uint32_t payload_bytes = 0;
  Nonce nonce{};
  std::array<uint8_t, kPayloadLimit> payload{};
};
struct ReadOnlyCompletion {
  mach_msg_header_t header{};
  uint32_t version = kVersion;
  int32_t exit_code = 78;
  Nonce nonce{};
  uint32_t payload_bytes = 0;
  std::array<uint8_t, kPayloadLimit> payload{};
};
size_t ReadOnlyRequestBytes(uint32_t);
size_t ReadOnlyCompletionBytes(uint32_t);
struct Arguments {
  std::vector<std::string> argv;
  std::vector<std::pair<std::string, std::string>> environment;
};
// Fixed non-loader CLI options. None is read as native root/role authority.
bool IsCliEnvironmentName(std::string_view name);
bool Encode(const Arguments&, std::vector<uint8_t>*);
bool Decode(std::span<const uint8_t>, Arguments*);
size_t RequestBytes(uint32_t payload_bytes);
}
