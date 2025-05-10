import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

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

function HomeComponent() {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery<ClipboardEntry[], Error>({
    queryKey: ["clipboard-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      return await invoke<ClipboardEntry[]>("search_clipboard_entries", {
        query: debouncedQuery,
        limit: 50,
      });
    },
    enabled: !!debouncedQuery.trim(),
  });

  return (
    <div className="p-2 max-w-xl mx-auto">
      <h3 className="mb-2 text-lg font-bold">Clipboard Instant Search</h3>
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="Search clipboard..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {isLoading && <div className="text-sm text-gray-500">Searching...</div>}
      {error && <div className="text-sm text-red-500">{error.message}</div>}
      <div className="max-h-96 overflow-y-auto border rounded bg-white dark:bg-gray-800 divide-y">
        {(!results || results.length === 0) && !isLoading && !error && (
          <div className="p-4 text-gray-400 text-center">No results</div>
        )}
        {results.map((entry: ClipboardEntry, i: number) => (
          <div
            key={i}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <div className="font-mono text-xs text-gray-500 mb-1">
              {new Date(entry.timestamp).toLocaleString()}
            </div>
            <div className="font-semibold text-sm mb-1">{entry.content}</div>
            <div className="flex gap-2 text-xs text-gray-400">
              <span>{entry.type}</span>
              {entry.app && <span>App: {entry.app}</span>}
              {entry.color && <span>Color: {entry.color}</span>}
              {entry.ocr_text && (
                <span>OCR: {entry.ocr_text.slice(0, 30)}...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
