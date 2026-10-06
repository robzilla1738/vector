import type { QuickJSAsyncContext } from "quickjs-emscripten-core";

/** Every context owns an isolated Asyncify module; only the loader imports are shared. */
export async function createQuickJsContext(): Promise<QuickJSAsyncContext> {
  const { newQuickJSAsyncWASMModuleFromVariant } = await import("quickjs-emscripten-core");
  return (
    await newQuickJSAsyncWASMModuleFromVariant(import("@jitl/quickjs-wasmfile-release-asyncify"))
  ).newContext();
}
