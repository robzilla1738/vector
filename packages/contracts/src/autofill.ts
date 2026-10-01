import { z } from "zod";

export const AutofillProfileSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().max(320).optional(),
  phone: z.string().max(60).optional(),
  organization: z.string().max(200).optional(),
  street: z.string().max(300).optional(),
  city: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  postal: z.string().max(20).optional(),
  country: z.string().max(120).optional(),
});
export type AutofillProfile = z.infer<typeof AutofillProfileSchema>;
