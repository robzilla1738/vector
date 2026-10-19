// Daemon/CLI-only Postject compatibility for inserted-library image ordering.
// Original Node adds image0's slide; insertion can move MH_EXECUTE to image1.
#include <mach-o/dyld.h>
#include <mach-o/getsect.h>
#include <mach-o/loader.h>
#include <cstdint>
#include <cstring>
namespace {
char *SeaResourcePointer(const char *segment, const char *section, unsigned long *size) {
  if (!segment || !section || std::strcmp(segment, "NODE_SEA") || std::strcmp(section, "__NODE_SEA_BLOB")) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    return getsectdata(segment, section, size);
#pragma clang diagnostic pop
  }
  if (!size) return nullptr;
  *size = 0;
  const mach_header_64 *mainHeader = nullptr;
  for (uint32_t i = 0; i < _dyld_image_count(); ++i) {
    const mach_header *header = _dyld_get_image_header(i);
    if (header && header->magic == MH_MAGIC_64 && header->filetype == MH_EXECUTE) {
      if (mainHeader) return nullptr;
      mainHeader = reinterpret_cast<const mach_header_64 *>(header);
    }
  }
  if (!mainHeader) return nullptr;
  unsigned long actualSize = 0;
  const uint8_t *actual = getsectiondata(mainHeader, segment, section, &actualSize);
  if (!actual || actualSize < 10 || actualSize > 256UL * 1024 * 1024) return nullptr;
  uint32_t magic = 0;
  std::memcpy(&magic, actual, sizeof(magic));
  if (magic != 0x143da20) return nullptr;
  // Integer arithmetic only; the normalized value is not dereferenced here.
  // Unchanged Postject adds slide0 and obtains the real mapped resource.
  const uintptr_t normalized = reinterpret_cast<uintptr_t>(actual) -
      static_cast<uintptr_t>(_dyld_get_image_vmaddr_slide(0));
  *size = actualSize;
  return reinterpret_cast<char *>(normalized);
}
__attribute__((used)) static const struct {
  const void *replacement;
  const void *original;
} interpose_sea_resource __attribute__((section("__DATA,__interpose"))) = {
  (const void *)(unsigned long)&SeaResourcePointer,
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  (const void *)(unsigned long)&getsectdata
#pragma clang diagnostic pop
};
}
