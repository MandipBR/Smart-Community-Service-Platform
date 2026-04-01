import { z } from "zod";

export const logHoursSchema = z.object({
  eventId: z.string().min(1),
  hours: z.coerce.number().positive(),
});
