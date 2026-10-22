// TEST-only native observer. Not linked, staged or exported by the product.
#ifndef AUX_PDF_LIFETIME_FIXTURE
#error("Fixture only")
#endif
#include <node_api.h>
#include <dlfcn.h>
#include <cstdint>
#include <string>
using Close=int32_t(*)();using Pending=uint64_t(*)();
static Close close_pdf=nullptr;static Pending pending_pdf=nullptr;
static napi_value Initialize(napi_env env,napi_callback_info info){
  size_t argc=1,length=0;napi_value argument;
  napi_get_cb_info(env,info,&argc,&argument,nullptr,nullptr);
  if(argc!=1||napi_get_value_string_utf8(env,argument,nullptr,0,&length)!=napi_ok){napi_throw_error(env,nullptr,"Fixture path required");return nullptr;}
  std::string file(length+1,'\0');napi_get_value_string_utf8(env,argument,file.data(),file.size(),&length);file.resize(length);
  // Never load an image: observe only the own module already verified/required
  // by the fixture. The retained native reference keeps its symbol addresses live.
  auto* image=dlopen(file.c_str(),RTLD_LAZY|RTLD_LOCAL|RTLD_NOLOAD);
  if(!image){napi_throw_error(env,nullptr,"Expected already-loaded fixture image");return nullptr;}
  close_pdf=reinterpret_cast<Close>(dlsym(image,"AuxPdfCloseAdmissionAndDrain"));
  pending_pdf=reinterpret_cast<Pending>(dlsym(image,"AuxPdfPendingOperations"));
  if(!close_pdf||!pending_pdf){napi_throw_error(env,nullptr,"Missing native PDF custody symbols");return nullptr;}
  napi_value value;napi_get_undefined(env,&value);return value;
}
static napi_value CloseNow(napi_env env,napi_callback_info){napi_value value;napi_create_int32(env,close_pdf(),&value);return value;}
static napi_value Count(napi_env env,napi_callback_info){napi_value value;napi_create_double(env,static_cast<double>(pending_pdf()),&value);return value;}
NAPI_MODULE_INIT(){
  const napi_property_descriptor methods[]={{"initialize",nullptr,Initialize,nullptr,nullptr,nullptr,napi_default,nullptr},{"close",nullptr,CloseNow,nullptr,nullptr,nullptr,napi_default,nullptr},{"pending",nullptr,Count,nullptr,nullptr,nullptr,napi_default,nullptr}};
  napi_define_properties(env,exports,3,methods);return exports;
}
