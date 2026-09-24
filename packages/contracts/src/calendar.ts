import { z } from "zod";

export const CalendarConnectionSchema = z.object({
  connectionId: z.string().uuid(),
  provider: z.literal("google"),
  accountKey: z.string().min(1).max(320),
  label: z.string().min(1).max(320),
  scopes: z.array(z.literal("https://www.googleapis.com/auth/calendar.readonly")),
  state: z.enum(["active", "needs_reauth"]),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});
export type CalendarConnection = z.infer<typeof CalendarConnectionSchema>;

export const CalendarTaskGrantSchema = z.object({
  grantId: z.string().uuid(),
  taskId: z.string().uuid(),
  taskRevision: z.number().int().positive(),
  connectionId: z.string().uuid(),
  accountKey: z.string().min(1).max(320),
  label: z.string().min(1).max(320),
  createdAt: z.number().int().nonnegative(),
  revokedAt: z.number().int().nonnegative().optional(),
});
export type CalendarTaskGrant = z.infer<typeof CalendarTaskGrantSchema>;

export const CalendarEventSchema = z.object({
  eventId: z.string().min(1).max(1024),
  title: z.string().max(1000),
  start: z.string().max(100),
  end: z.string().max(100),
  url: z.string().url().max(8192).optional(),
  source: z.object({
    connectionId: z.string().uuid(),
    profileId: z.string().min(1).optional(),
    accountKey: z.string().min(1),
    calendarId: z.string().min(1),
    fetchedAt: z.number().int().nonnegative(),
  }),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

const CalendarReadBase = z.object({
  connectionId: z.string().uuid(),
  timeMin: z.string().datetime({ offset: true }),
  timeMax: z.string().datetime({ offset: true }),
  limit: z.number().int().min(1).max(100).default(25),
  pageToken: z.string().min(1).max(2048).optional(),
}).strict();
const validRange = (value: { timeMin: string; timeMax: string }) => {
  const span = Date.parse(value.timeMax) - Date.parse(value.timeMin);
  return span > 0 && span <= 31 * 24 * 60 * 60 * 1000;
};
export const CalendarEventsQuerySchema = CalendarReadBase.refine(validRange, "Choose a calendar range of at most 31 days.");
export type CalendarEventsQuery = z.output<typeof CalendarEventsQuerySchema>;

export const CalendarTaskEventsInputSchema = CalendarReadBase.omit({ connectionId: true }).extend({
  taskId: z.string().uuid(),
  grantId: z.string().uuid(),
}).strict();
export const CalendarTaskEventsQuerySchema = CalendarTaskEventsInputSchema.refine(validRange, "Choose a calendar range of at most 31 days.");
export type CalendarTaskEventsQuery = z.output<typeof CalendarTaskEventsQuerySchema>;
