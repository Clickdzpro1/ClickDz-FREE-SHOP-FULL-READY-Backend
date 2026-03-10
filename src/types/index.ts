import { UserRole } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type Locale = "ar" | "fr" | "en";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      locale: Locale;
      requestId: string;
    }
  }
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginatedResult<any>["pagination"];
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
  requestId?: string;
}
