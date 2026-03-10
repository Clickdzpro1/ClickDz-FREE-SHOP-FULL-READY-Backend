import { z } from "zod";

export const redeemPointsSchema = z.object({
  points: z.number().int().min(1, "Points must be at least 1"),
});
