export interface PaginationParams {
  cursor?: string | undefined;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}
