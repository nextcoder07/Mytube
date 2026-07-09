// src/utils/response.ts
export function success<T>(data: T, message = "Success", meta?: unknown) {
  return { success: true, message, data, error: null, meta: meta || null };
}

export function error(message: string, code: string, details?: unknown) {
  return { success: false, message, data: null, error: { code, details } };
}
