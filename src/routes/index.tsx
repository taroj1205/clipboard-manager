import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import {
  HStack,
  Separator,
  useNotice,
  usePrevious,
  VStack,
} from "@yamada-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailsPanel } from "~/components/details-panel";
import { ErrorComponent } from "~/components/error-component";
import { HomeLoadingComponent } from "~/components/loading/home";
import { SidebarList } from "~/components/sidebar-list";
import { TopBar } from "~/components/top-bar";
import { useKeyboardNavigation, useScrollManagement } from "~/hooks";
import type { ClipboardEntry } from "~/utils/clipboard";
import { getPaginatedClipboardEntries } from "~/utils/clipboard";
import { groupEntriesByDate } from "~/utils/dates";
import { useEventListener } from "~/utils/events";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  errorComponent: ErrorComponent,
  pendingComponent: HomeLoadingComponent,
});

export interface TypeFilter {
  label: string;
  value: "all" | "color" | "html" | "image" | "text";
}

const allowedTypes: TypeFilter["value"][] = [
  "all",
  "text",
  "image",
  "color",
  "html",
];

function HomeComponent() {
  const queryClient = useQueryClient();
  const loaderData = Route.useLoaderData();
  const notice = useNotice();
  const [query, setQueryRaw] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilterRaw] = useState<TypeFilter["value"][]>([
    "all",
  ]);
  const [selectedIndex, setSelectedIndexRaw] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Debounce search query with a shorter delay for better UX
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200); // 200ms debounce for fast feedback

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    localStorage.setItem("ui-color-mode", "dark");
  }, []);

  const LIMIT = 50;

  const {
    refetch,
    data = loaderData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<ClipboardEntry[]>({
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === LIMIT ? allPages.length * LIMIT : undefined,
    initialPageParam: 0,
    maxPages: 10, // Limit to 10 pages in memory
    queryFn: async ({ pageParam }) =>
      getPaginatedClipboardEntries(debouncedQuery, LIMIT, pageParam as number),
    queryKey: ["clipboard-search", debouncedQuery, typeFilter],
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    placeholderData: keepPreviousData,
  });

  // Flatten paginated results
  const results = useMemo(
    () => (data ? data.pages.flat().slice(0, data.pages.length * LIMIT) : []),
    [data]
  );

  // Deduplicate and group entries by date, then flatten for selection
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

  // Filter by type after deduplication
  const filteredFlatList = useMemo(() => {
    const selectedTypes = typeFilter.filter((t): t is TypeFilter["value"] =>
      allowedTypes.includes(t as TypeFilter["value"])
    );
    if (selectedTypes.length === 0 || selectedTypes.includes("all")) {
      return flatList;
    }
    return flatList.filter((entry) => selectedTypes.includes(entry.type));
  }, [flatList, typeFilter]);

  const previousDataLength = usePrevious(flatList.length);

  const typeOptions: TypeFilter[] = useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Text", value: "text" },
      { label: "Image", value: "image" },
      { label: "Color", value: "color" },
    ],
    []
  );

  const { handleUpdateSelectedIndex } = useScrollManagement();

  const setSelectedIndex = useCallback(
    (index: number) => {
      setSelectedIndexRaw(index);
      handleUpdateSelectedIndex(itemRefs, index);
    },
    [handleUpdateSelectedIndex]
  );

  const setTypeFilter = useCallback(
    (types: string[]) => {
      const filtered = types.filter((t): t is TypeFilter["value"] =>
        allowedTypes.includes(t as TypeFilter["value"])
      );
      setTypeFilterRaw(filtered.length === 0 ? ["all"] : filtered);
      setSelectedIndex(0);
      refetch();
    },
    [refetch, setSelectedIndex]
  );

  const setQuery = useCallback(
    (q: string, types?: string[]) => {
      setQueryRaw(q);
      setSelectedIndex(0);
      if (types) {
        setTypeFilter(types);
      }
      refetch();
    },
    [refetch, setSelectedIndex, setTypeFilter]
  );

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input && document.activeElement !== input) {
        input.focus();
      }
    });
  }, []);

  const blurInput = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  const filteredFlatListRef = useRef(filteredFlatList);
  filteredFlatListRef.current = filteredFlatList;

  const handleArrowKey = useCallback(
    (direction: "down" | "up") => {
      setSelectedIndexRaw((prev) => {
        const currentList = filteredFlatListRef.current;
        const newIndex =
          direction === "up"
            ? Math.max(0, prev - 1)
            : Math.min(currentList.length - 1, prev + 1);

        // Use requestAnimationFrame to batch the scroll update
        requestAnimationFrame(() => {
          handleUpdateSelectedIndex(itemRefs, newIndex);
        });

        return newIndex;
      });
    },
    [handleUpdateSelectedIndex]
  );

  listen("clipboard-entry-updated", () => {
    setSelectedIndex(0);
    queryClient.invalidateQueries({
      exact: false,
      queryKey: ["clipboard-search"],
    });
  });

  listen("tauri://focus", () => {
    focusInput();
  });

  listen("tauri://blur", () => {
    setSelectedIndex(0);
    blurInput();
  });

  const { handleKeyDown } = useKeyboardNavigation({
    query,
    setQuery,
    selectedIndex,
    filteredFlatList,
    handleArrowKey,
    focusInput,
    inputRef,
    notice,
  });

  useEventListener("keydown", handleKeyDown);

  return (
    <VStack color="white" gap="sm" h="100vh" p="sm" separator={<Separator />}>
      <TopBar
        query={query}
        ref={inputRef}
        setQuery={setQuery}
        setTypeFilter={setTypeFilter}
        typeFilter={typeFilter}
        typeOptions={typeOptions}
      />
      <HStack
        align="stretch"
        flex={1}
        gap="xs"
        separator={<Separator orientation="vertical" />}
      >
        <SidebarList
          entries={filteredFlatList}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          itemRefs={itemRefs}
          previousDataLength={previousDataLength}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          totalEntries={results.length}
        />
        {filteredFlatList.length > 0 && (
          <DetailsPanel selectedEntry={filteredFlatList[selectedIndex]} />
        )}
      </HStack>
    </VStack>
  );
}
