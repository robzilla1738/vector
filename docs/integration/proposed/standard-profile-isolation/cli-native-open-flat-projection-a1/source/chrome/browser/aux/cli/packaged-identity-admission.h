// Copyright 2026 Aux Authors. All rights reserved.
// Read-only immutable bundle admission. Never inspects a mutable Aux home.
#ifndef AUX_PROVIDED_PACKAGED_IDENTITY_ADMISSION_H_
#define AUX_PROVIDED_PACKAGED_IDENTITY_ADMISSION_H_
#import <Foundation/Foundation.h>
#include <errno.h>
#include <fcntl.h>
#include <limits.h>
#include <sys/stat.h>
#include <unistd.h>
#include <cstdint>
#include <cstdlib>
#include <set>
#include <string>
#include <string_view>
namespace aux::packaged_identity {
constexpr size_t kMaxMarkerBytes = 16 * 1024 * 1024;
inline bool Whitespace(char ch) {
  return ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n';
}
// Constrain Foundation's parser to RFC JSON syntax (no comments, trailing
// commas, fragments, invalid number tokens or extra trailing documents).
class StrictJsonSyntax {
 public:
  explicit StrictJsonSyntax(std::string_view input) : input_(input) {}
  bool Valid() {
    Skip();
    if (!Value(0)) return false;
    Skip();
    return offset_ == input_.size();
  }
 private:
  void Skip() { while (offset_ < input_.size() && Whitespace(input_[offset_])) ++offset_; }
  bool Take(char ch) {
    if (offset_ == input_.size() || input_[offset_] != ch) return false;
    ++offset_; return true;
  }
  bool String() {
    if (!Take('"')) return false;
    while (offset_ < input_.size()) {
      const unsigned char ch = input_[offset_++];
      if (ch == '"') return true;
      if (ch < 0x20) return false;
      if (ch != '\\') continue;
      if (offset_ == input_.size()) return false;
      const char escape = input_[offset_++];
      if (escape == 'u') {
        for (int count = 0; count < 4; ++count) {
          if (offset_ == input_.size()) return false;
          const char digit = input_[offset_++];
          if (!((digit >= '0' && digit <= '9') ||
                (digit >= 'a' && digit <= 'f') ||
                (digit >= 'A' && digit <= 'F'))) return false;
        }
      } else if (std::string_view("\"\\/bfnrt").find(escape) == std::string_view::npos) {
        return false;
      }
    }
    return false;
  }
  bool Digits() {
    const size_t start = offset_;
    while (offset_ < input_.size() && input_[offset_] >= '0' && input_[offset_] <= '9') ++offset_;
    return offset_ != start;
  }
  bool Number() {
    Take('-');
    if (!Take('0')) {
      if (offset_ == input_.size() || input_[offset_] < '1' || input_[offset_] > '9' || !Digits()) return false;
    }
    if (Take('.') && !Digits()) return false;
    if (Take('e') || Take('E')) {
      if (!Take('+')) Take('-');
      if (!Digits()) return false;
    }
    return true;
  }
  bool Value(unsigned depth) {
    Skip();
    if (offset_ == input_.size()) return false;
    const char ch = input_[offset_];
    if (ch == '{' || ch == '[') {
      if (depth >= 200) return false;
      ++offset_;
      const char end = ch == '{' ? '}' : ']';
      Skip(); if (Take(end)) return true;
      for (;;) {
        if (ch == '{') { Skip(); if (!String()) return false; Skip(); if (!Take(':')) return false; }
        if (!Value(depth + 1)) return false;
        Skip(); if (Take(end)) return true;
        if (!Take(',')) return false;
      }
    }
    if (ch == '"') return String();
    for (const auto token : {std::string_view("true"), std::string_view("false"), std::string_view("null")}) {
      if (input_.substr(offset_, token.size()) == token) { offset_ += token.size(); return true; }
    }
    return Number();
  }
  const std::string_view input_;
  size_t offset_ = 0;
};
inline bool MarkerAllowed(std::string_view json) {
  @autoreleasepool {
    if (json.empty() || json.size() > kMaxMarkerBytes ||
        json.substr(0, 3) == "\xEF\xBB\xBF") return false;
    if (!StrictJsonSyntax(json).Valid()) return false;
    NSData* data = [NSData dataWithBytes:json.data() length:json.size()];
    // Foundation also supports other JSON encodings. The browser accepts UTF-8;
    // reject any encoding conversion or invalid UTF-8 instead of broadening it.
    NSString* utf8 = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    if (!utf8 || ![[utf8 dataUsingEncoding:NSUTF8StringEncoding] isEqualToData:data])
      return false;
    id object = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    if (![object isKindOfClass:[NSDictionary class]]) return false;
    NSDictionary* marker = object;
    std::set<std::string> keys;
    std::string version_token, state_token;
    bool has_version_token = false, has_state_token = false;
    int depth = 0;
    // JSON parsing validates structure. This second pass rejects duplicate
    // decoded TOP-LEVEL keys (including escaped spellings), which Foundation
    // otherwise resolves by selecting a value. It also retains exact numeric
    // lexemes so 1.0, 1e0, strings and booleans cannot masquerade as an int.
    for (size_t index = 0; index < json.size(); ++index) {
      const char ch = json[index];
      if (ch == '"') {
        const size_t start = index++;
        while (index < json.size()) {
          if (json[index] == '\\') { index += 2; continue; }
          if (json[index] == '"') break;
          ++index;
        }
        if (index >= json.size()) return false;
        size_t next = index + 1;
        while (next < json.size() && Whitespace(json[next])) ++next;
        if (depth == 1 && next < json.size() && json[next] == ':') {
          NSData* encoded_key = [NSData dataWithBytes:json.data() + start
                                               length:index - start + 1];
          id decoded = [NSJSONSerialization JSONObjectWithData:encoded_key
                   options:NSJSONReadingFragmentsAllowed error:nil];
          if (![decoded isKindOfClass:[NSString class]]) return false;
          NSData* decoded_bytes = [decoded dataUsingEncoding:NSUTF8StringEncoding];
          if (!decoded_bytes) return false;
          std::string key;
          if (decoded_bytes.length) key.assign(
              static_cast<const char*>(decoded_bytes.bytes), decoded_bytes.length);
          if (!keys.insert(key).second) return false;
          if (key == "version" || key == "stateIdentityVersion") {
            size_t value_start = next + 1;
            while (value_start < json.size() && Whitespace(json[value_start]))
              ++value_start;
            size_t value_end = value_start;
            while (value_end < json.size() && !Whitespace(json[value_end]) &&
                   json[value_end] != ',' && json[value_end] != '}' &&
                   json[value_end] != ']') ++value_end;
            const std::string token(json.substr(value_start, value_end - value_start));
            if (key == "version") {
              version_token = token;
              has_version_token = true;
            } else {
              state_token = token;
              has_state_token = true;
            }
          }
        }
      } else if (ch == '{' || ch == '[') {
        ++depth;
      } else if (ch == '}' || ch == ']') {
        --depth;
      }
    }
    if (!has_version_token || version_token != "1" ||
        ![marker[@"version"] isKindOfClass:[NSNumber class]]) return false;
    id implementation = marker[@"implementation"];
    if (![implementation isKindOfClass:[NSString class]] ||
        ![implementation isEqualToString:@"supplied"]) return false;
    id profile = marker[@"identityProfile"];
    if (profile && ![profile isKindOfClass:[NSString class]]) return false;
    if (profile && ![profile isEqualToString:@"compatibility"] &&
        ![profile isEqualToString:@"aux-v1"]) return false;
    id state = marker[@"stateIdentityVersion"];
    if (state && (![state isKindOfClass:[NSNumber class]] ||
                  !has_state_token || state_token != "1")) return false;
    // No acceptance record, environment or process switch can authorize state2.
    return true;
  }
}
inline bool SameMetadata(const struct stat& before, const struct stat& after) {
  return before.st_dev == after.st_dev && before.st_ino == after.st_ino &&
      before.st_size == after.st_size && before.st_mode == after.st_mode &&
      before.st_uid == after.st_uid && before.st_nlink == after.st_nlink &&
      before.st_mtimespec.tv_sec == after.st_mtimespec.tv_sec &&
      before.st_mtimespec.tv_nsec == after.st_mtimespec.tv_nsec &&
      before.st_ctimespec.tv_sec == after.st_ctimespec.tv_sec &&
      before.st_ctimespec.tv_nsec == after.st_ctimespec.tv_nsec;
}
inline bool MarkerAllowedAt(const std::string& path) {
  if (path.empty() || path[0] != '/' || path.find('\0') != std::string::npos)
    return false;
  char canonical[PATH_MAX];
  if (!realpath(path.c_str(), canonical) || path != canonical) return false;
  struct ScopedFd {
    explicit ScopedFd(int value) : value(value) {}
    ~ScopedFd() { if (value >= 0) close(value); }
    int value;
  } fd(open(path.c_str(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  struct stat before, after;
  if (fd.value < 0 || fstat(fd.value, &before) || !S_ISREG(before.st_mode) ||
      (before.st_uid != getuid() && before.st_uid != 0) ||
      (before.st_mode & 0022) || before.st_nlink != 1 || before.st_size <= 0 ||
      static_cast<uint64_t>(before.st_size) > kMaxMarkerBytes) return false;
  std::string bytes(static_cast<size_t>(before.st_size), '\0');
  size_t offset = 0;
  while (offset < bytes.size()) {
    const ssize_t size = read(fd.value, bytes.data() + offset, bytes.size() - offset);
    if (size < 0 && errno == EINTR) continue;
    if (size <= 0) return false;
    offset += static_cast<size_t>(size);
  }
  char extra;
  if (read(fd.value, &extra, 1) != 0 || fstat(fd.value, &after) ||
      !SameMetadata(before, after)) return false;
  return MarkerAllowed(bytes);
}
}  // namespace aux::packaged_identity
#endif
