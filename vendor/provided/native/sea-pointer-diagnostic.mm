// Read-only temporary loader diagnosis. Not linked into production boundary.
#include <mach-o/dyld.h>
#include <mach-o/getsect.h>
#include <mach-o/loader.h>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
__attribute__((constructor)) static void AuxReadOnlySeaPointers() {
  const char *enabled = std::getenv("AUX_DEBUG_SEA_POINTERS");
  if (!enabled || std::strcmp(enabled, "1")) return;
  const mach_header_64 *mainHeader = nullptr;
  uint32_t mainIndex = 0;
  for (uint32_t i = 0; i < _dyld_image_count(); ++i) {
    const mach_header *header = _dyld_get_image_header(i);
    if (header && header->magic == MH_MAGIC_64 && header->filetype == MH_EXECUTE) {
      mainHeader = reinterpret_cast<const mach_header_64 *>(header); mainIndex = i; break;
    }
  }
  unsigned long actualSize = 0, legacySize = 0;
  const uint8_t *actual = mainHeader ? getsectiondata(mainHeader, "NODE_SEA", "__NODE_SEA_BLOB", &actualSize) : nullptr;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  const char *legacy = getsectdata("NODE_SEA", "__NODE_SEA_BLOB", &legacySize);
#pragma clang diagnostic pop
  const intptr_t zeroSlide = _dyld_get_image_vmaddr_slide(0);
  const intptr_t mainSlide = mainHeader ? _dyld_get_image_vmaddr_slide(mainIndex) : 0;
  const uintptr_t legacyAdjusted = reinterpret_cast<uintptr_t>(legacy) + zeroSlide;
  uint32_t actualMagic = 0;
  if (actual && actualSize >= sizeof(actualMagic)) std::memcpy(&actualMagic, actual, sizeof(actualMagic));
  // No addresses, paths, environment contents or native inputs are printed.
  std::fprintf(stderr, "AUX_SEA_POINTERS {\"mainImageFound\":%s,\"mainImageIndex\":%u,\"mainImageIsZero\":%s,\"zeroSlideMatchesMain\":%s,\"legacySectionFound\":%s,\"actualSectionFound\":%s,\"sectionSizesMatch\":%s,\"postjectPointerMatchesActual\":%s,\"legacyRawPointerMatchesActual\":%s,\"actualMagicMatches\":%s}\n",
    mainHeader ? "true" : "false", mainIndex, mainHeader && !mainIndex ? "true" : "false",
    mainHeader && zeroSlide == mainSlide ? "true" : "false", legacy ? "true" : "false", actual ? "true" : "false",
    legacySize == actualSize ? "true" : "false", actual && legacyAdjusted == reinterpret_cast<uintptr_t>(actual) ? "true" : "false",
    actual && reinterpret_cast<uintptr_t>(legacy) == reinterpret_cast<uintptr_t>(actual) ? "true" : "false", actualMagic == 0x143da20 ? "true" : "false");
}
