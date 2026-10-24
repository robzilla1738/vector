// Syntax-only TU, never linked or executed. The Owner wrapper requires the real
// selected worker host and is not represented by a fabricated Owner here.
#include <algorithm>
#include <array>
#include <cerrno>
#include <cstdint>
#include <cstring>
#include <functional>
#include <iterator>
#include <limits>
#include <string>
#include <vector>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
#include <CommonCrypto/CommonDigest.h>
namespace {
#include "source/AuxRuntimeCacheInspection.inc"
#include "source/AuxRuntimeCachePins.inc"
static_assert(std::size(kAuxRuntimePins)==10929);
}
