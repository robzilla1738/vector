/* Node process.dlopen looks up napi_register_module_v1 by name.
 * rustc-cdylib-link-arg /EXPORT did not appear in the PE table on
 * windows-latest (smoke: "Module did not self-register"). Object-level
 * linker directives are applied when this .obj is linked. */
#if defined(_MSC_VER)
#pragma comment(linker, "/EXPORT:napi_register_module_v1")
#pragma comment(linker, "/INCLUDE:napi_register_module_v1")
#endif

void ve_napi_win_export_anchor(void) {}
