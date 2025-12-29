import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ClipboardEntry,
  PaginatedClipboardResponse,
  SortBy,
  SortOrder,
} from "~/utils/clipboard";
import { getPaginatedClipboardEntries } from "~/utils/clipboard";
import { groupEntriesByDate } from "~/utils/dates";

export function useClipboardSearch(initialData?: ClipboardEntry[]) {
  const queryClient = useQueryClient();
  const [query, setQueryRaw] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [typeFilters, setTypeFilters] = useState<string[]>(["all"]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const LIMIT = 50;

  const {
    refetch,
    data = initialData
      ? {
          pages: [
            {
              entries: initialData,
              nextCursor: null,
              hasMore: false,
              totalCount: initialData.length,
            },
          ],
        }
      : undefined,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery<PaginatedClipboardResponse>({
    gcTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    maxPages: 10,
    queryFn: async ({ pageParam }) => {
      const result = await getPaginatedClipboardEntries(
        debouncedQuery,
        LIMIT,
        pageParam as number,
        sortBy,
        sortOrder,
        typeFilters
      );
      return result;
    },
    queryKey: [
      "clipboard-search",
      debouncedQuery,
      sortBy,
      sortOrder,
      typeFilters,
    ],
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const results = useMemo(
    () => (data ? data.pages.flatMap((page) => page.entries) : []),
    [data]
  );

  const grouped = useMemo(() => groupEntriesByDate(results), [results]);
  const flatList = useMemo(() => {
    const arr: (ClipboardEntry & { count: number; group: string })[] = [];
    for (const [date, items] of Object.entries(grouped)) {
      for (const item of items) {
        arr.push({ ...item, group: date });
      }
    }
    return arr;
  }, [grouped]);

  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q);
      refetch();
    },
    [refetch]
  );

  const handleSortChange = useCallback(
    (newSortBy: SortBy, newSortOrder: SortOrder = "desc") => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      refetch();
    },
    [refetch]
  );

  const updateTypeFilters = useCallback(
    (filters: string[]) => {
      setTypeFilters(filters);
      refetch();
    },
    [refetch]
  );

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({
      exact: false,
      queryKey: ["clipboard-search"],
    });
  }, [queryClient]);

  return {
    query,
    setQuery,
    debouncedQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    handleSortChange,
    typeFilters,
    updateTypeFilters,
    results,
    flatList,
    grouped,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    invalidateQueries,
  };
}
