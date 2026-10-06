import { z } from "zod";
import { BrowserHostMethods } from "./browser-host-methods.js";
import { RuntimeHostMethods } from "./runtime-host-methods.js";

export { HostCapabilitiesSchema, type HostCapabilities } from "./host-capabilities.js";
export {
  HostEvents,
  type HostEventId,
  type HostEventPayload,
  type HostReaderNode,
} from "./browser-host-methods.js";

/** Complete authoritative manifest, retaining browser then runtime entry order. */
export const HostMethods = { ...BrowserHostMethods, ...RuntimeHostMethods } as const;

export type HostMethodId = keyof typeof HostMethods;
export type HostMethodArgs<M extends HostMethodId> = z.input<(typeof HostMethods)[M]["args"]>;
export type HostMethodResult<M extends HostMethodId> = z.output<(typeof HostMethods)[M]["result"]>;
