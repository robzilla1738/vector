import { type NativeMethodName, NativeMethods, type NativeParams, RpcChannel } from "@aux/contracts";

/** Register a native.* handler whose input is parsed at the process boundary. */
export function onNative<M extends NativeMethodName>(ch: RpcChannel, method: M, fn: (params: NativeParams<M>) => unknown) {
  ch.onMethod(method, raw => fn(NativeMethods[method].parse(raw ?? {}) as NativeParams<M>));
}
