import { z } from "zod";

export const logHoursSchema = z.object({
  eventId: z.string().min(1),
  hours: z.coerce.number().positive(),
});

// Fix: Added Zod schema for updateProfile — previously had no validation
export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  causes: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
  // Organization-specific fields
  organizationName: z.string().optional(),
  organizationType: z.string().optional(),
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["admin", "editor", "viewer"]).optional(),
      })
    )
    .optional(),
});
