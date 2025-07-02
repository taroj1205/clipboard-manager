import { useCallback } from "react";

export function useScrollManagement() {
  const scrollToElement = useCallback((element: HTMLLIElement) => {
    const parent = element.parentElement?.parentElement?.parentElement;
    if (parent?.scrollTop === undefined) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    const elTop = element.offsetTop;
    const elHeight = element.offsetHeight;
    const parentScroll = parent.scrollTop;
    const parentHeight = parent.clientHeight;

    // If the element is above the visible area
    if (elTop - 50 < parentScroll) {
      parent.scrollTo({ behavior: "smooth", top: elTop - 50 });
      return;
    }

    // If the element is below the visible area
    if (elTop + elHeight + 50 > parentScroll + parentHeight) {
      parent.scrollTo({
        behavior: "smooth",
        top: elTop - parentHeight + elHeight + 50,
      });
    }
  }, []);

  const handleUpdateSelectedIndex = useCallback(
    (
      itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>,
      index: number
    ) => {
      const el = itemRefs.current[index];
      if (!el) {
        return;
      }

      if (index < 6) {
        const parent = el.parentElement?.parentElement?.parentElement;
        if (parent?.scrollTop !== undefined) {
          parent.scrollTo({ behavior: "smooth", top: 0 });
          return;
        }
      }

      scrollToElement(el);
    },
    [scrollToElement]
  );

  return { handleUpdateSelectedIndex };
}
