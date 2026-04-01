import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["volunteer", "organization"]).optional(),
  organizationType: z.string().optional(),
  csrfToken: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  csrfToken: z.string().min(1),
});

export const googleSchema = z.object({
  credential: z.string().min(1),
  csrfToken: z.string().min(1),
  role: z.enum(["volunteer", "organization"]).optional(),
});

export const onboardingSchema = z.object({
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  organizationName: z.string().optional(),
  causes: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().optional(),
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
