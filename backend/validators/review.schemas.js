import { z } from "zod";

export const createReviewSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional().default(""),
});
