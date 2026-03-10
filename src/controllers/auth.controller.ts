import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(success(result, "Registration successful", 201));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(success(result, "Login successful"));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  res.json(success(result, "Token refreshed"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.json(success(null, "Logged out successfully"));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.userId);
  res.json(success(null, "All sessions logged out"));
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user!.userId);
  res.json(success(result));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.updateProfile(req.user!.userId, req.body);
  res.json(success(result, "Profile updated"));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.userId, req.body);
  res.json(success(null, "Password changed successfully"));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  // Always return success to prevent email enumeration
  res.json(success(null, "If an account with that email exists, a password reset link has been sent"));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json(success(null, "Password has been reset successfully"));
});
