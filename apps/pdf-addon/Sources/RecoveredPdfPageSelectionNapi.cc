// Source-derived helper only; no module registration or PDF operation replacement.
#include "RecoveredPdfPageSelection.h"
#include <node_api.h>
#include <stdexcept>
namespace aux::pdf {
std::vector<int> ReadPageNumbers(napi_env env,napi_value input,int page_count) {
  bool has=false;napi_has_named_property(env,input,"pages",&has);
  if (!has) return SelectPages(page_count,std::nullopt);
  napi_value pages{};napi_get_named_property(env,input,"pages",&pages);
  bool array=false;napi_is_array(env,pages,&array);
  if (!array) throw std::runtime_error("pages must be an array");
  uint32_t length=0;napi_get_array_length(env,pages,&length);
  std::vector<int> result;
  for (uint32_t index=0;index<length;++index) {
    napi_value item{};napi_get_element(env,pages,index,&item);
    napi_valuetype type=napi_undefined;napi_typeof(env,item,&type);
    double value=0;
    if (type!=napi_number || napi_get_value_double(env,item,&value)!=napi_ok)
      throw std::runtime_error("pages contains an invalid page number");
    // Validate before reading the next JS element, preserving original early throw.
    result.push_back(SelectPages(page_count,std::vector<std::optional<double>>{value})[0]);
  }
  if (result.empty()) throw std::runtime_error("pages must not be empty");
  return result;
}
}
