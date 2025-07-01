import type { ClipboardEntry } from "~/utils/clipboard";
import { keepPreviousData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { HStack, Separator, usePrevious, VStack } from "@yamada-ui/react";
import * as React from "react";
import { DetailsPanel } from "~/components/details-panel";
import { ErrorComponent } from "~/components/error-component";
import { HomeLoadingComponent } from "~/components/loading/home";
import { SidebarList } from "~/components/sidebar-list";
import { TopBar } from "~/components/top-bar";
import { copyClipboardEntry, getPaginatedClipboardEntries } from "~/utils/clipboard";
import { groupEntriesByDate } from "~/utils/dates";
import { useEventListener } from "~/utils/events";
import { hideWindow } from "~/utils/window";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  errorComponent: ErrorComponent,
  pendingComponent: HomeLoadingComponent,
});

export interface TypeFilter {
  label: string;
  value: "all" | "color" | "html" | "image" | "text";
}

const allowedTypes: TypeFilter["value"][] = ["all", "text", "image", "color", "html"];

function HomeComponent() {
  const queryClient = useQueryClient();
  const loaderData = Route.useLoaderData();
  const [query, setQueryRaw] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [typeFilter, setTypeFilterRaw] = React.useState<TypeFilter["value"][]>(["all"]);
  const [selectedIndex, setSelectedIndexRaw] = React.useState<number>(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  // Debounce search query with a shorter delay for better UX
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200); // 200ms debounce for fast feedback

    return () => clearTimeout(timeoutId);
  }, [query]);

  React.useEffect(() => {
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
    getNextPageParam: (lastPage, allPages) => (lastPage.length === LIMIT ? allPages.length * LIMIT : undefined),
    initialPageParam: 0,
    maxPages: 10, // Limit to 10 pages in memory
    queryFn: async ({ pageParam }) => getPaginatedClipboardEntries(debouncedQuery, LIMIT, pageParam as number),
    queryKey: ["clipboard-search", debouncedQuery, typeFilter],
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    placeholderData: keepPreviousData,
  });

  // Flatten paginated results
  const results = React.useMemo(() => (data ? data.pages.flat().slice(0, data.pages.length * LIMIT) : []), [data]);

  // Deduplicate and group entries by date, then flatten for selection
  const grouped = React.useMemo(() => groupEntriesByDate(results), [results]);
  const flatList = React.useMemo(() => {
    const arr: (ClipboardEntry & { count: number; group: string })[] = [];
    for (const [date, items] of Object.entries(grouped)) {
      for (const item of items) {
        arr.push({ ...item, group: date });
      }
    }
    return arr;
  }, [grouped]);

  // Filter by type after deduplication
  const filteredFlatList = React.useMemo(() => {
    const selectedTypes = typeFilter.filter((t): t is TypeFilter["value"] =>
      allowedTypes.includes(t as TypeFilter["value"])
    );
    if (selectedTypes.length === 0 || selectedTypes.includes("all")) return flatList;
    return flatList.filter((entry) => selectedTypes.includes(entry.type));
  }, [flatList, typeFilter]);

  const previousDataLength = usePrevious(flatList.length);

  const typeOptions: TypeFilter[] = React.useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Text", value: "text" },
      { label: "Image", value: "image" },
      { label: "Color", value: "color" },
    ],
    []
  );

  const handleUpdateSelectedIndex = React.useCallback((index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      const parent = el.parentElement?.parentElement?.parentElement;
      if (parent?.scrollTop !== undefined) {
        if (index < 6) {
          parent.scrollTo({ behavior: "smooth", top: 0 });
          return;
        }
        const elTop = el.offsetTop;
        const elHeight = el.offsetHeight;
        const parentScroll = parent.scrollTop;
        const parentHeight = parent.clientHeight;
        // If the element is above the visible area
        if (elTop - 50 < parentScroll) {
          parent.scrollTo({ behavior: "smooth", top: elTop - 50 });
        } else if (elTop + elHeight + 50 > parentScroll + parentHeight) {
          // If the element is below the visible area
          parent.scrollTo({
            behavior: "smooth",
            top: elTop - parentHeight + elHeight + 50,
          });
        }
      } else {
        // fallback to scrollIntoView if parent not found
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, []);

  const setSelectedIndex = React.useCallback(
    (index: number) => {
      setSelectedIndexRaw(index);
      handleUpdateSelectedIndex(index);
    },
    [handleUpdateSelectedIndex]
  );

  const setTypeFilter = React.useCallback(
    (types: string[]) => {
      const filtered = types.filter((t): t is TypeFilter["value"] => allowedTypes.includes(t as TypeFilter["value"]));
      setTypeFilterRaw(filtered.length === 0 ? ["all"] : filtered);
      setSelectedIndex(0);
      refetch();
    },
    [refetch, setSelectedIndex]
  );

  const setQuery = React.useCallback(
    (q: string, types?: string[]) => {
      setQueryRaw(q);
      setSelectedIndex(0);
      if (types) setTypeFilter(types);
      refetch();
    },
    [refetch, setSelectedIndex, setTypeFilter]
  );

  const focusInput = React.useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const blurInput = React.useCallback(() => {
    inputRef.current?.blur();
  }, []);

  const handleArrowKey = React.useCallback(
    (direction: "down" | "up") => {
      setSelectedIndexRaw((prev) => {
        const newIndex = direction === "up" ? Math.max(0, prev - 1) : Math.min(filteredFlatList.length - 1, prev + 1);
        handleUpdateSelectedIndex(newIndex);
        return newIndex;
      });
    },
    [filteredFlatList, handleUpdateSelectedIndex]
  );

  // Event listeners in useEffect
  React.useEffect(() => {
    const unlistenClipboard = listen("clipboard-entry-updated", () => {
      setSelectedIndex(0);
      // Invalidate queries to trigger refetch while keeping current data visible
      queryClient.invalidateQueries({
        exact: false,
        queryKey: ["clipboard-search"],
      });
    });

    const unlistenFocus = listen("tauri://focus", () => {
      focusInput();
    });

    const unlistenBlur = listen("tauri://blur", () => {
      setSelectedIndex(0);
      blurInput();
    });

    return () => {
      unlistenClipboard.then((unlisten) => unlisten());
      unlistenFocus.then((unlisten) => unlisten());
      unlistenBlur.then((unlisten) => unlisten());
    };
  }, [queryClient, refetch, setSelectedIndex, focusInput, blurInput]);

  useEventListener("keydown", (ev) => {
    if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();
      handleArrowKey(ev.key === "ArrowUp" ? "up" : "down");
    } else if (ev.key === "k" && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      ev.stopPropagation();
      const entry = filteredFlatList[selectedIndex];
      copyClipboardEntry(entry, () => {
        // Callback for copy completion
      }).then(() => {
        hideWindow();
      });
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      if (query.length > 0) {
        setQuery("");
      } else {
        hideWindow();
      }
    } else if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.shiftKey) {
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();
      setQuery(query + ev.key);
    }
  });

  return (
    <VStack gap="sm" h="100vh" p="sm" color="white" separator={<Separator />}>
      <TopBar
        ref={inputRef}
        query={query}
        setQuery={setQuery}
        setTypeFilter={setTypeFilter}
        typeFilter={typeFilter}
        typeOptions={typeOptions}
      />
      <HStack align="stretch" flex={1} gap="xs" separator={<Separator orientation="vertical" />}>
        <SidebarList
          entries={filteredFlatList}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          itemRefs={itemRefs}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          isLoading={isLoading}
          previousDataLength={previousDataLength}
          totalEntries={results.length}
        />
        {filteredFlatList.length > 0 && <DetailsPanel selectedEntry={filteredFlatList[selectedIndex]} />}
      </HStack>
    </VStack>
  );
}
