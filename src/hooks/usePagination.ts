import { useCallback, useMemo, useState } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setTotal: (total: number) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 10 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const onPageChange = useCallback(
    (newPage: number) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages));
      setPage(clamped);
    },
    [totalPages],
  );

  const onLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    onPageChange,
    onLimitChange,
    offset,
    hasNextPage,
    hasPreviousPage,
  };
}
