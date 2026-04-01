import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.coerce.date(),
  location: z.string().optional(),
  locationLat: z.coerce.number().optional(),
  locationLng: z.coerce.number().optional(),
  hours: z.coerce.number().positive(),
  difficultyFactor: z.coerce.number().min(0.5).max(3).optional(),
  tags: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});
