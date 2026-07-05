// src/types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: {
    code: string;
    details?: unknown;
  } | null;
}
