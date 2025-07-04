import { useCallback, useRef, useState } from "react";

export function useClipboardUI() {
  const [selectedIndex, setSelectedIndexRaw] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const setSelectedIndex = useCallback((index: number) => {
    setSelectedIndexRaw(index);
    requestAnimationFrame(() => {
      const selectedItem = itemRefs.current[index];
      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: "nearest",
        });
      }
    });
  }, []);

  const handleArrowKey = useCallback(
    (direction: "down" | "up", listLength: number) => {
      setSelectedIndexRaw((prev) => {
        if (listLength === 0) {
          return 0;
        }
        const newIndex =
          direction === "up"
            ? Math.max(0, prev - 1)
            : Math.min(listLength - 1, prev + 1);

        requestAnimationFrame(() => {
          const selectedItem = itemRefs.current[newIndex];
          if (selectedItem) {
            selectedItem.scrollIntoView({
              block: "nearest",
            });
          }
        });

        return newIndex;
      });
    },
    []
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

  const resetSelection = useCallback(() => {
    setSelectedIndex(0);
  }, [setSelectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    inputRef,
    itemRefs,
    handleArrowKey,
    focusInput,
    blurInput,
    resetSelection,
  };
}
