export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[] | undefined>;
  details?: unknown;
}

export const ok = <T>(data: T) => ({ success: true as const, data });
export const paginated = <T>(items: T[], total: number, page: number, pageSize: number) => ({
  success: true as const,
  data: items,
  meta: {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  },
});
