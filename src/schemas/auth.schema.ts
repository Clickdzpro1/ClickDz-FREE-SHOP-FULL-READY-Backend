import { z } from "zod";
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "../utils/constants";

/**
 * Password must have at least: 1 uppercase, 1 lowercase, 1 digit, 1 special char.
 */
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one digit")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Algerian phone number (optional).
 * Accepts: 0550123456, +213550123456, 213550123456
 */
const phoneSchema = z
  .string()
  .regex(
    /^(?:\+?213|0)[5-7]\d{8}$/,
    "Invalid phone number. Use Algerian format: 05XXXXXXXX or +2135XXXXXXXX"
  )
  .optional();

export const registerSchema = z.object({
  email: z.string().email("Invalid email address").transform((e) => e.toLowerCase().trim()),
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  phone: phoneSchema,
  locale: z.enum(["ar", "fr", "en"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").transform((e) => e.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  phone: phoneSchema,
  locale: z.enum(["ar", "fr", "en"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
