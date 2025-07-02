import { useCallback } from "react";
import type { ClipboardEntry } from "~/utils/clipboard";
import { copyClipboardEntry } from "~/utils/clipboard";
import { hideWindow } from "~/utils/window";

interface UseKeyboardNavigationProps {
  query: string;
  setQuery: (q: string, types?: string[]) => void;
  selectedIndex: number;
  filteredFlatList: (ClipboardEntry & { count: number; group: string })[];
  handleArrowKey: (direction: "down" | "up") => void;
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  notice: (args: {
    status: "error" | "success";
    title: string;
    description: string;
  }) => void;
}

export function useKeyboardNavigation({
  query,
  setQuery,
  selectedIndex,
  filteredFlatList,
  handleArrowKey,
  focusInput,
  inputRef,
  notice,
}: UseKeyboardNavigationProps) {
  const handleArrowKeys = useCallback(
    (ev: KeyboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();
      handleArrowKey(ev.key === "ArrowUp" ? "up" : "down");
    },
    [focusInput, handleArrowKey]
  );

  const handleCommandK = useCallback(
    (ev: KeyboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();
    },
    [focusInput]
  );

  const handleEnter = useCallback(
    (ev: KeyboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      if (selectedIndex < 0 || selectedIndex >= filteredFlatList.length) {
        return;
      }

      const entry = filteredFlatList[selectedIndex];
      if (!entry) {
        return;
      }

      hideWindow();

      copyClipboardEntry(entry, notice).catch((error) => {
        console.error("Copy operation failed:", error);
      });
    },
    [filteredFlatList, selectedIndex, notice]
  );

  const handleEscape = useCallback(
    (ev: KeyboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (query.length > 0) {
        focusInput();
        setQuery("");
      } else {
        hideWindow();
      }
    },
    [query, focusInput, setQuery]
  );

  const handleCharacterInput = useCallback(
    (ev: KeyboardEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      focusInput();

      const input = inputRef.current;
      if (
        input &&
        input.selectionStart !== null &&
        input.selectionEnd !== null
      ) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newQuery = query.slice(0, start) + ev.key + query.slice(end);
        setQuery(newQuery);

        requestAnimationFrame(() => {
          input.setSelectionRange(start + 1, start + 1);
        });
      } else {
        setQuery(query + ev.key);
      }
    },
    [query, setQuery, focusInput, inputRef]
  );

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        handleArrowKeys(ev);
        return;
      }

      if (ev.key === "k" && (ev.ctrlKey || ev.metaKey)) {
        handleCommandK(ev);
        return;
      }

      if (ev.key === "Enter") {
        handleEnter(ev);
        return;
      }

      if (ev.key === "Escape") {
        handleEscape(ev);
        return;
      }

      if (
        ev.key.length === 1 &&
        !ev.ctrlKey &&
        !ev.metaKey &&
        !ev.altKey &&
        !ev.shiftKey
      ) {
        handleCharacterInput(ev);
      }
    },
    [
      handleArrowKeys,
      handleCommandK,
      handleEnter,
      handleEscape,
      handleCharacterInput,
    ]
  );

  return { handleKeyDown };
}
