import { z } from "zod";

const Id = z.string().min(1).max(200);
export const LinkRouteSourceSchema = z.enum(["external", "cli", "in-app"]);
export const LinkRouteDestinationSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("profile"), profileId: Id, spaceId: Id.optional(),
    window: z.enum(["tab", "little", "new-window"]) }).strict(),
  z.object({ kind: z.literal("ask") }).strict(),
]);
export const LinkRouteRuleSchema = z.object({ id: Id, enabled: z.boolean(), order: z.number().int().nonnegative(),
  match: z.object({ kind: z.enum(["host", "glob", "prefix"]), pattern: z.string().min(1).max(2048), subdomains: z.boolean() }).strict(),
  sources: z.array(LinkRouteSourceSchema).min(1).max(3).optional(), fromApps: z.array(z.string().min(1).max(255)).max(100).optional(),
  destination: LinkRouteDestinationSchema, hits: z.number().int().nonnegative(), lastHitAt: z.number().int().nonnegative().optional() }).strict();
export const LinkRoutesSchema = z.object({ version: z.literal(1), revision: z.number().int().nonnegative(), enabled: z.boolean(),
  inApp: z.enum(["off", "cross-site-new-tab"]), default: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("last-used") }).strict(),
    z.object({ kind: z.literal("profile"), profileId: Id, spaceId: Id.optional() }).strict(),
  ]), rules: z.array(LinkRouteRuleSchema).max(500) }).strict()
  .refine(config => new Set(config.rules.map(rule => rule.id)).size === config.rules.length, "Routing rule IDs must be unique.");
export type LinkRoutes = z.infer<typeof LinkRoutesSchema>;
export type LinkRouteDestination = z.infer<typeof LinkRouteDestinationSchema>;
export const SetLinkRoutesSchema = z.object({ expectedRevision: z.number().int().nonnegative(), config: LinkRoutesSchema }).strict();
