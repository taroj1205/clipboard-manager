import { createFileRoute } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import {
  AppWindowIcon,
  ClockIcon,
  FileIcon,
  FileTextIcon,
  StarIcon,
  TagIcon,
} from "@yamada-ui/lucide";
import {
  Center,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIndicator,
  EmptyStateTitle,
  HStack,
  Separator,
  useNotice,
  usePrevious,
  VStack,
} from "@yamada-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
import { DetailsPanel } from "~/components/details-panel";
import { ErrorComponent } from "~/components/error-component";
import { HomeLoadingComponent } from "~/components/loading/home";
import { SidebarList } from "~/components/sidebar-list";
import { type SortOption, TopBar } from "~/components/top-bar";
import {
  useClipboardFilters,
  useClipboardSearch,
  useClipboardUI,
  useKeyboardNavigation,
} from "~/hooks";
import { useEventListener } from "~/utils/events";

// Search params schema
const searchSchema = z.object({
  q: z.string().optional().default(""),
  types: z
    .array(z.enum(["all", "text", "image", "color", "html"]))
    .optional()
    .default(["all"]),
  sort: z
    .enum(["timestamp", "relevance", "type", "app", "content"])
    .optional()
    .default("timestamp"),
});

export const Route = createFileRoute("/")({
  component: HomeComponent,
  errorComponent: ErrorComponent,
  pendingComponent: HomeLoadingComponent,
  validateSearch: searchSchema,
});

function HomeComponent() {
  const notice = useNotice();
  const loaderData = Route.useLoaderData();
  const navigate = Route.useNavigate();

  // Initialize custom hooks
  const { typeFilter, setTypeFilter, typeOptions, parseTypePrefix } =
    useClipboardFilters();

  const {
    query,
    setQuery,
    sortBy,
    setSortBy,
    typeFilters,
    updateTypeFilters,
    flatList,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    invalidateQueries,
  } = useClipboardSearch(loaderData);

  const {
    selectedIndex,
    setSelectedIndex,
    inputRef,
    itemRefs,
    handleArrowKey,
    focusInput,
    blurInput,
    resetSelection,
  } = useClipboardUI();

  // Use flatList directly (no client-side filtering needed)
  const filteredFlatList = flatList;
  const previousDataLength = usePrevious(filteredFlatList.length);

  // Sort options configuration
  const sortOptions: SortOption[] = useMemo(
    () => [
      { label: "Latest First", value: "timestamp", icon: <ClockIcon /> },
      { label: "Most Relevant", value: "relevance", icon: <StarIcon /> },
      { label: "By Type", value: "type", icon: <TagIcon /> },
      { label: "By App", value: "app", icon: <AppWindowIcon /> },
      { label: "By Content", value: "content", icon: <FileTextIcon /> },
    ],
    []
  );

  // Set dark mode
  useEffect(() => {
    localStorage.setItem("ui-color-mode", "dark");
  }, []);

  // Update search params helper
  const updateSearchParams = useCallback(
    (updates: Partial<z.infer<typeof searchSchema>>) => {
      navigate({
        search: (prev: z.infer<typeof searchSchema>) => ({
          ...prev,
          ...updates,
        }),
        replace: true,
      });
    },
    [navigate]
  );

  // Sync type filters between local state and search hook
  useEffect(() => {
    if (JSON.stringify(typeFilter) !== JSON.stringify(typeFilters)) {
      updateTypeFilters(typeFilter);
    }
  }, [typeFilter, typeFilters, updateTypeFilters]);

  // Handle search with type prefix parsing
  const handleSearch = useCallback(
    (q: string, types?: string[]) => {
      const { cleanQuery, types: parsedTypes } = parseTypePrefix(q);

      if (parsedTypes.length > 0) {
        setQuery(cleanQuery);
        setTypeFilter(parsedTypes);
        updateSearchParams({
          q: cleanQuery,
          types: parsedTypes as z.infer<typeof searchSchema>["types"],
        });
      } else {
        setQuery(q);
        updateSearchParams({ q });
        if (types) {
          setTypeFilter(types);
          updateSearchParams({
            types: types as z.infer<typeof searchSchema>["types"],
          });
        }
      }
      resetSelection();
    },
    [
      parseTypePrefix,
      setQuery,
      setTypeFilter,
      updateSearchParams,
      resetSelection,
    ]
  );

  // Handle type filter changes
  const handleTypeFilterChange = useCallback(
    (types: string[]) => {
      setTypeFilter(types);
      updateSearchParams({
        types: types as z.infer<typeof searchSchema>["types"],
      });
      resetSelection();
    },
    [setTypeFilter, updateSearchParams, resetSelection]
  );

  // Handle sort changes
  const handleSortBy = useCallback(
    (newSortBy: SortOption["value"]) => {
      setSortBy(newSortBy);
      updateSearchParams({ sort: newSortBy });
      resetSelection();
      refetch();
    },
    [setSortBy, updateSearchParams, resetSelection, refetch]
  );

  // Handle arrow key navigation
  const handleArrowKeyNavigation = useCallback(
    (direction: "down" | "up") => {
      handleArrowKey(direction, filteredFlatList.length);
    },
    [handleArrowKey, filteredFlatList.length]
  );

  // Event listeners for Tauri events
  useEffect(() => {
    const unlistenClipboardUpdate = listen("clipboard-entry-updated", () => {
      resetSelection();
      invalidateQueries();
    });

    const unlistenFocus = listen("tauri://focus", () => {
      focusInput();
    });

    const unlistenBlur = listen("tauri://blur", () => {
      resetSelection();
      blurInput();
    });

    return () => {
      unlistenClipboardUpdate.then((fn) => fn());
      unlistenFocus.then((fn) => fn());
      unlistenBlur.then((fn) => fn());
    };
  }, [resetSelection, invalidateQueries, focusInput, blurInput]);

  // Keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation({
    query,
    setQuery: handleSearch,
    selectedIndex,
    filteredFlatList,
    handleArrowKey: handleArrowKeyNavigation,
    focusInput,
    inputRef,
    notice,
  });

  useEventListener("keydown", handleKeyDown);

  return (
    <VStack color="white" gap="sm" h="100vh" p="sm" separator={<Separator />}>
      <TopBar
        isLoading={isLoading || isFetchingNextPage}
        query={query}
        ref={inputRef}
        setQuery={handleSearch}
        setSortBy={handleSortBy}
        setTypeFilter={handleTypeFilterChange}
        sortBy={sortBy}
        sortOptions={sortOptions}
        typeFilter={typeFilter}
        typeOptions={typeOptions}
      />
      {filteredFlatList.length > 0 ? (
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
            totalEntries={filteredFlatList.length}
          />
          {filteredFlatList.length > 0 && (
            <DetailsPanel selectedEntry={filteredFlatList[selectedIndex]} />
          )}
        </HStack>
      ) : (
        <Center flex={1} w="full">
          <EmptyState>
            <EmptyStateIndicator>
              <FileIcon fontSize="40px" />
            </EmptyStateIndicator>
            <EmptyStateTitle>No clipboard entries</EmptyStateTitle>
            <EmptyStateDescription>
              {isLoading
                ? "Loading your clipboard history..."
                : "Your clipboard history is empty. Copy something to get started!"}
            </EmptyStateDescription>
          </EmptyState>
        </Center>
      )}
    </VStack>
  );
}
