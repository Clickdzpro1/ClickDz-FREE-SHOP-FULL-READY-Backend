export function success(data: any, message?: string, _statusCode?: number) {
  return {
    success: true as const,
    data,
    ...(message && { message }),
  };
}

export function paginated(data: any[], pagination: any) {
  return {
    success: true as const,
    data,
    meta: pagination,
  };
}

export function error(message: string, _statusCode?: number) {
  return {
    success: false as const,
    error: { message },
  };
}
