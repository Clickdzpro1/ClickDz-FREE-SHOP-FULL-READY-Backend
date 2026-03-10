import { PaginationParams, PaginatedResult } from "../types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query: {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || `${DEFAULT_PAGE}`, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT)
  );
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = (query.sortOrder === "asc" ? "asc" : "desc") as "asc" | "desc";

  return { page, limit, sortBy, sortOrder };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

export function buildPrismaSkip(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

export function buildPrismaOrderBy(
  params: PaginationParams
): Record<string, "asc" | "desc"> {
  return { [params.sortBy]: params.sortOrder };
}
