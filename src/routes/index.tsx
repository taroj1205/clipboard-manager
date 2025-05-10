import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { HStack, Separator, VStack } from "@yamada-ui/react";
import { SidebarList } from "../components/sidebar-list";
import { DetailsPanel } from "../components/details-panel";
import { TopBar } from "../components/top-bar";
import {
  copyClipboardEntry,
  getPaginatedClipboardEntries,
} from "../utils/clipboard";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

// ClipboardEntry type matching backend
interface ClipboardEntry {
  content: string;
  type: string;
  timestamp: number;
  app?: string;
  ocr_text?: string;
  color?: string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function groupEntriesByDate(
  entries: ClipboardEntry[]
): Record<string, (ClipboardEntry & { count: number })[]> {
  const groups: Record<string, (ClipboardEntry & { count: number })[]> = {};
  // Deduplicate by content+type, keep latest, and count occurrences
  const dedupedMap = new Map<
    string,
    { entry: ClipboardEntry; count: number }
  >();
  for (const entry of entries) {
    const key = `${entry.type}::${entry.content}`;
    if (dedupedMap.has(key)) {
      dedupedMap.get(key)!.count++;
    } else {
      dedupedMap.set(key, { entry, count: 1 });
    }
  }
  // Only keep the latest entry for each unique content/type
  for (const { entry, count } of dedupedMap.values()) {
    const date = new Date(entry.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else {
      groupKey = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push({ ...entry, count });
  }
  // Sort each group by timestamp descending
  for (const key in groups) {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  }
  return groups;
}

export interface TypeFilter {
  label: string;
  value: "all" | "text" | "image" | "color";
}

function HomeComponent() {
  const [query, setQueryRaw] = React.useState("");
  const [typeFilter, setTypeFilterRaw] =
    React.useState<TypeFilter["value"]>("all");
  const [selectedIndex, setSelectedIndexRaw] = React.useState<number>(0);
  const debouncedQuery = useDebouncedValue(query, 200);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const { data: results = [], refetch } = useQuery<ClipboardEntry[], Error>({
    queryKey: ["clipboard-search", debouncedQuery],
    queryFn: () => getPaginatedClipboardEntries(debouncedQuery),
    enabled: true,
  });

  const filteredResults = React.useMemo(
    () =>
      typeFilter && typeFilter !== "all"
        ? results.filter((entry) => entry.type === typeFilter)
        : results,
    [results, typeFilter]
  );

  const grouped = React.useMemo(
    () => groupEntriesByDate(filteredResults),
    [filteredResults]
  );

  const typeOptions: TypeFilter[] = React.useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Text", value: "text" },
      { label: "Image", value: "image" },
      { label: "Color", value: "color" },
    ],
    []
  );

  const setQuery = React.useCallback((q: string) => setQueryRaw(q), []);
  const setTypeFilter = React.useCallback(
    (type: TypeFilter["value"]) => setTypeFilterRaw(type),
    []
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
    [handleUpdateSelectedIndex]
  );

  const focusInput = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const blurInput = React.useCallback(() => {
    inputRef.current?.blur();
  }, []);

  listen("clipboard-entry-added", () => {
    setSelectedIndex(0);
    refetch();
  });

  listen("tauri://focus", () => {
    focusInput();
  });

  listen("tauri://blur", () => {
    console.log("blur");
    setSelectedIndex(0);
    getCurrentWindow().hide();
    blurInput();
  });

  const handleArrowKey = React.useCallback(
    (direction: "up" | "down") => {
      setSelectedIndexRaw((prev) => {
        const newIndex =
          direction === "up"
            ? Math.max(0, prev - 1)
            : Math.min(filteredResults.length - 1, prev + 1);
        handleUpdateSelectedIndex(newIndex);
        return newIndex;
      });
    },
    [filteredResults]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        copyClipboardEntry(filteredResults[selectedIndex], () => {});
      }
    },
    [filteredResults, selectedIndex]
  );

  return (
    <VStack
      gap="sm"
      h="100vh"
      p="sm"
      separator={<Separator />}
      onKeyDown={handleKeyDown}
    >
      <TopBar
        query={query}
        setQuery={setQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        typeOptions={typeOptions}
        ref={inputRef}
        onArrowKey={handleArrowKey}
      />
      <HStack
        gap="xs"
        flex={1}
        align="stretch"
        separator={<Separator orientation="vertical" />}
      >
        <SidebarList
          grouped={grouped}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          ref={undefined}
          itemRefs={itemRefs}
        />
        <DetailsPanel selectedEntry={filteredResults[selectedIndex]} />
      </HStack>
    </VStack>
  );
}
