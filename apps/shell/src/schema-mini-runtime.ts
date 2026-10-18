import { config } from "zod/v4/core";

// Captured-source restoration must parse synchronously under the packaged WebUI CSP.
config({ jitless: true });
export * from "zod/v4/mini";
