import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().max(100).optional(),
});

export const unsubscribeNewsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});
