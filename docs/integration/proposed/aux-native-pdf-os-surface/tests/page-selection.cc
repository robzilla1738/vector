#include "RecoveredPdfPageSelection.h"
#include <cassert>
#include <limits>
#include <string>
#include <stdexcept>
using aux::pdf::SelectPages;
int main() {
  assert((SelectPages(3,std::nullopt)==std::vector<int>{1,2,3}));
  assert(SelectPages(0,std::nullopt).empty());
  assert((SelectPages(3,std::vector<std::optional<double>>{3,1,3})==std::vector<int>{3,1,3}));
  for (const auto& pages:std::vector<std::vector<std::optional<double>>>{{},{0},{4},{1.5},{std::nullopt},{std::numeric_limits<double>::infinity()},{std::numeric_limits<double>::quiet_NaN()}}) {
    try { (void)SelectPages(3,pages);assert(false); }
    catch(const std::runtime_error& error) {
      assert(std::string(error.what())==(pages.empty()?"pages must not be empty":"pages contains an invalid page number"));
    }
  }
}
