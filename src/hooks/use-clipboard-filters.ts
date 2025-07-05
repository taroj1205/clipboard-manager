import { useCallback, useMemo, useState } from "react";

export interface TypeFilter {
  label: string;
  value: string;
}

// Define regex at top level for performance
const TYPE_PREFIX_REGEX = /^type:([a-zA-Z,]+)\s*(.*)/;

export function useClipboardFilters() {
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  const typeOptions: TypeFilter[] = useMemo(
    () => [
      { label: "Text", value: "text" },
      { label: "Image", value: "image" },
      { label: "Color", value: "color" },
      { label: "HTML", value: "html" },
    ],
    []
  );

  const smartSetTypeFilter = useCallback((values: string[]) => {
    setTypeFilter(values);
  }, []);

  const parseTypePrefix = useCallback(
    (query: string) => {
      const typeMatch = query.match(TYPE_PREFIX_REGEX);
      if (typeMatch) {
        const typesStr = typeMatch[1];
        const cleanQuery = typeMatch[2];
        const types = typesStr.split(",").map((t) => t.trim().toLowerCase());
        // Only include valid types
        const validTypes = types.filter((t) =>
          typeOptions.some((opt) => opt.value === t)
        );
        return { cleanQuery, types: validTypes };
      }
      return { cleanQuery: query, types: [] };
    },
    [typeOptions]
  );

  return {
    typeFilter,
    setTypeFilter: smartSetTypeFilter,
    typeOptions,
    parseTypePrefix,
  };
}
