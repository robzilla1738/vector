import { config } from "zod/v4/core";

// The packaged WebUI forbids dynamic scripts. Every renderer schema import
// resolves through this module, before Zod's lazy parser can probe JIT.
config({ jitless: true });
export * from "zod/v4";
