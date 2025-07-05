import { useCallback, useEffect, useRef } from "react";

export function useScrollManagement() {
  const lastScrollTime = useRef(0);
  const scrollRequestRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current);
      }
    };
  }, []);

  const scrollToElement = useCallback(
    (element: HTMLLIElement, useSmooth = true) => {
      const parent = element.parentElement?.parentElement?.parentElement;
      if (parent?.scrollTop === undefined) {
        element.scrollIntoView({
          behavior: useSmooth ? "smooth" : "auto",
          block: "nearest",
        });
        return;
      }

      const elTop = element.offsetTop;
      const elHeight = element.offsetHeight;
      const elBottom = elTop + elHeight;
      const parentScroll = parent.scrollTop;
      const parentHeight = parent.clientHeight;
      const visibleTop = parentScroll;
      const visibleBottom = parentScroll + parentHeight;
      const offset = 70;

      // if scrolling up
      if (elTop - offset < visibleTop) {
        parent.scrollTo({
          behavior: useSmooth ? "smooth" : "auto",
          top: elTop - offset,
        });
        return;
      }
      // if scrolling down
      if (elBottom > visibleBottom) {
        parent.scrollTo({
          behavior: useSmooth ? "smooth" : "auto",
          top: elBottom - parentHeight,
        });
        return;
      }
    },
    []
  );

  const handleUpdateSelectedIndex = useCallback(
    (itemRefs: React.RefObject<(HTMLLIElement | null)[]>, index: number) => {
      const now = performance.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      lastScrollTime.current = now;

      const useSmooth = timeSinceLastScroll > 100;

      if (scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current);
      }

      scrollRequestRef.current = requestAnimationFrame(() => {
        const el = itemRefs.current[index];
        if (!el) {
          return;
        }

        if (index < 6) {
          const parent = el.parentElement?.parentElement?.parentElement;
          if (parent?.scrollTop !== undefined) {
            parent.scrollTo({
              behavior: useSmooth ? "smooth" : "auto",
              top: 0,
            });
            return;
          }
        }

        scrollToElement(el, useSmooth);
        scrollRequestRef.current = null;
      });
    },
    [scrollToElement]
  );

  return { handleUpdateSelectedIndex };
}
