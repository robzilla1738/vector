#ifndef AUX_RECOVERED_PDF_PAGE_SELECTION_H_
#define AUX_RECOVERED_PDF_PAGE_SELECTION_H_
#include <optional>
#include <vector>
namespace aux::pdf {
// nullopt outer = absent property; nullopt element = non-number/failed numeric read.
// JS non-array rejection belongs to the exact NAPI adapter, not this pure helper.
std::vector<int> SelectPages(int page_count,
    const std::optional<std::vector<std::optional<double>>>& explicit_pages);
}
#endif
