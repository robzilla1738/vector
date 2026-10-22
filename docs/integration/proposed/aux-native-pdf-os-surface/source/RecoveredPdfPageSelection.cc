#include "RecoveredPdfPageSelection.h"
#include <cmath>
#include <stdexcept>
namespace aux::pdf {
std::vector<int> SelectPages(int count,const std::optional<std::vector<std::optional<double>>>& pages) {
  std::vector<int> result;
  if (!pages) {
    for (int page=1;page<=count;++page) result.push_back(page); // Original0x3b20..0x3b60.
    return result;
  }
  for (const auto& value:*pages) {
    if (!value || !std::isfinite(*value) || std::floor(*value)!=*value || *value<1 || *value>count)
      throw std::runtime_error("pages contains an invalid page number"); //0x3c90..0x3d78.
    result.push_back(static_cast<int>(*value)); // Preserve order AND duplicates.
  }
  if (result.empty()) throw std::runtime_error("pages must not be empty"); //0x3d94..
  return result;
}
}
