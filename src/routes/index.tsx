import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { HStack, Separator, VStack, usePrevious } from "@yamada-ui/react";
import * as React from "react";
import { DetailsPanel } from "../components/details-panel";
import { SidebarList } from "../components/sidebar-list";
import { TopBar } from "../components/top-bar";
import { type ClipboardEntry, copyClipboardEntry, getPaginatedClipboardEntries } from "../utils/clipboard";
import { useEventListener } from "../utils/events";

import { ErrorComponent } from "../components/error-component";
import { groupEntriesByDate } from "../utils/dates";
import { hideWindow } from "../utils/window";
export const Route = createFileRoute("/")({
  component: HomeComponent,
  errorComponent: ErrorComponent,
});

export interface TypeFilter {
  label: string;
  value: "all" | "text" | "image" | "color" | "html";
}

const allowedTypes: TypeFilter["value"][] = ["all", "text", "image", "color", "html"];

function HomeComponent() {
  const [query, setQueryRaw] = React.useState("");
  const [typeFilter, setTypeFilterRaw] = React.useState<TypeFilter["value"][]>(["all"]);
  const [selectedIndex, setSelectedIndexRaw] = React.useState<number>(0);
  const debouncedQuery = React.useDeferredValue(query);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  localStorage.setItem("ui-color-mode", "dark");

  const LIMIT = 50;

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, refetch } = useSuspenseInfiniteQuery<
    ClipboardEntry[],
    Error
  >({
    initialPageParam: 0,
    queryKey: ["clipboard-search", debouncedQuery, typeFilter],
    queryFn: ({ pageParam }) => getPaginatedClipboardEntries(debouncedQuery, LIMIT, pageParam as number),
    getNextPageParam: (lastPage, allPages) => (lastPage.length === LIMIT ? allPages.length * LIMIT : undefined),
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
    const selectedTypes = typeFilter.filter((t): t is TypeFilter["value"] => allowedTypes.includes(t as TypeFilter["value"]));
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
    [],
  );

  const setQuery = React.useCallback(
    (q: string, types?: string[]) => {
      setQueryRaw(q);
      setSelectedIndex(0);
      if (types) setTypeFilter(types);
      refetch();
    },
    [refetch],
  );

  const setTypeFilter = React.useCallback(
    (types: string[]) => {
      if (!types || types.length === 0) {
        setTypeFilterRaw(["all"]);
      } else {
        const filtered = types.filter((t): t is TypeFilter["value"] => allowedTypes.includes(t as TypeFilter["value"]));
        setTypeFilterRaw(filtered.length === 0 ? ["all"] : filtered);
      }
      setSelectedIndex(0);
      refetch();
    },
    [refetch],
  );

  const handleUpdateSelectedIndex = React.useCallback((index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      const parent = el.parentElement?.parentElement?.parentElement;
      if (parent && parent.scrollTop !== undefined) {
        if (index < 6) {
          parent.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const elTop = el.offsetTop;
        const elHeight = el.offsetHeight;
        const parentScroll = parent.scrollTop;
        const parentHeight = parent.clientHeight;
        // If the element is above the visible area
        if (elTop - 50 < parentScroll) {
          parent.scrollTo({ top: elTop - 50, behavior: "smooth" });
        } else if (elTop + elHeight + 50 > parentScroll + parentHeight) {
          // If the element is below the visible area
          parent.scrollTo({
            top: elTop - parentHeight + elHeight + 50,
            behavior: "smooth",
          });
        }
      } else {
        // fallback to scrollIntoView if parent not found
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, []);

  const setSelectedIndex = React.useCallback(
    (index: number) => {
      setSelectedIndexRaw(index);
      handleUpdateSelectedIndex(index);
    },
    [handleUpdateSelectedIndex],
  );

  const focusInput = React.useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const blurInput = React.useCallback(() => {
    inputRef.current?.blur();
  }, []);

  listen("clipboard-entry-updated", () => {
    setSelectedIndex(0);
    refetch();
  });

  listen("tauri://focus", () => {
    focusInput();
  });

  listen("tauri://blur", () => {
    setSelectedIndex(0);
    // getCurrentWindow().hide();
    blurInput();
  });

  const handleArrowKey = React.useCallback(
    (direction: "up" | "down") => {
      setSelectedIndexRaw((prev) => {
        const newIndex = direction === "up" ? Math.max(0, prev - 1) : Math.min(filteredFlatList.length - 1, prev + 1);
        handleUpdateSelectedIndex(newIndex);
        return newIndex;
      });
    },
    [filteredFlatList, handleUpdateSelectedIndex],
  );

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
      copyClipboardEntry(filteredFlatList[selectedIndex], () => {}).then(() => {
        hideWindow();
      });
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      if (query) {
        setQuery("");
      } else {
        hideWindow();
      }
    } else if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.shiftKey) {
      if (inputRef.current && document.activeElement === inputRef.current) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();
      setQuery(query + ev.key);
    }
  });

  return (
    <VStack
      gap="sm"
      h="100vh"
      p="sm"
      separator={<Separator />}
      // onKeyDown={handleKeyDown}
      color="white"
    >
      <TopBar
        query={query}
        setQuery={setQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        typeOptions={typeOptions}
        ref={inputRef}
      />
      <HStack gap="xs" flex={1} align="stretch" separator={<Separator orientation="vertical" />}>
        <SidebarList
          entries={filteredFlatList}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          itemRefs={itemRefs}
          totalEntries={results.length}
          previousDataLength={previousDataLength}
        />
        {filteredFlatList.length > 0 && <DetailsPanel selectedEntry={filteredFlatList[selectedIndex]} />}
      </HStack>
    </VStack>
  );
}
