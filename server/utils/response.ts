export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { message: string; code?: string },
) {
  return { success, data, error };
}

export function createSuccessResponse<T>(data: T) {
  return createApiResponse(true, data);
}

export function createErrorResponse(message: string, code?: string) {
  return createApiResponse(false, undefined, { message, code });
}
