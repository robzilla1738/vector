#pragma once
#include <mach/mach.h>
#include <array>
#include <cstddef>
#include <string_view>
#include <cstdint>
#include <span>
#include <string>
#include <utility>
#include <vector>

namespace aux::cli {
inline constexpr mach_msg_id_t kInvoke = 0x41584351; // AXCQ
inline constexpr mach_msg_id_t kCompleted = 0x41584352; // AXCR
inline constexpr uint32_t kVersion = 1;
inline constexpr size_t kArgumentLimit = 256;
inline constexpr size_t kArgumentBytes = 8192;
inline constexpr size_t kPayloadLimit = 32768;
inline constexpr size_t kEnvironmentLimit = 32;
using Nonce = std::array<uint8_t, 32>;
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
