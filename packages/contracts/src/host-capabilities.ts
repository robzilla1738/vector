import { z } from "zod";
const str = z.string();
const bool = z.boolean();
export const HostCapabilitiesSchema = z.object({
  buildId: str, sourceCommit: str.regex(/^[a-f0-9]{40}(\+dirty)?$/), methods: z.array(str),
  qualifiedFeatures: z.array(str),
  developmentAcceptanceRequested: bool.optional(),
  testClockScale: z.number().finite().min(1).max(100000).optional(),
  loopbackServicesUrl: z.string().url().max(200).refine(value => {
    const url = new URL(value);
    return url.protocol === "http:" && url.hostname === "127.0.0.1" && !!url.port && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash;
  }).optional(),
}).strict();
export type HostCapabilities = z.infer<typeof HostCapabilitiesSchema>;
