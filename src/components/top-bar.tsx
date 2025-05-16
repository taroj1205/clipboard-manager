import { Input } from "@yamada-ui/react";
import * as React from "react";
import type { TypeFilter } from "../routes";

interface TopBarProps {
  query: string;
  setQuery: (q: string, types?: string[]) => void;
  typeFilter: string[];
  setTypeFilter: (types: string[]) => void;
  typeOptions: TypeFilter[];
}

export const TopBar = React.memo(
  React.forwardRef<HTMLInputElement, TopBarProps>(({ query, setQuery, typeFilter }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value, typeFilter);
    };

    return (
      <Input
        placeholder="Type to search..."
        value={query}
        onChange={handleInputChange}
        // roundedRight="none"
        // borderRight="none"
        ref={ref}
      />
    );
  }),
);

TopBar.displayName = "TopBar";
