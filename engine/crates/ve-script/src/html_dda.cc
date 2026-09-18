// HTMLDDA host slot: rusty_v8 152.2.0 exposes ObjectTemplate in Rust but
// does not wrap v8::ObjectTemplate::MarkAsUndetectable. Official HTML
// document.all needs typeof undefined and a callable object.

#include "v8-template.h"

namespace {

template <class T>
inline v8::Local<T> ptr_to_local(const T* ptr) {
  static_assert(sizeof(v8::Local<T>) == sizeof(T*), "");
  auto local = *reinterpret_cast<const v8::Local<T>*>(&ptr);
  return local;
}

}  // namespace

extern "C" void ve_object_template_mark_as_undetectable(
    const v8::ObjectTemplate& self) {
  ptr_to_local(&self)->MarkAsUndetectable();
}
