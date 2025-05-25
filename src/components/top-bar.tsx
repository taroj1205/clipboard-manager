import { CogIcon } from "@yamada-ui/lucide";
import { HStack, IconButton, Input } from "@yamada-ui/react";
import * as React from "react";
import type { TypeFilter } from "~/routes";
import { Link } from "./ui/link";

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
      <HStack gap="0">
        <Input
          placeholder="Type to search..."
          value={query}
          onChange={handleInputChange}
          roundedRight="none"
          borderRight="none"
          ref={ref}
        />
        <IconButton
          as={Link}
          to="/settings"
          aria-label="Settings"
          variant="outline"
          borderLeftRadius="none"
          borderColor="border"
        >
          <CogIcon />
        </IconButton>
      </HStack>
    );
  }),
);

TopBar.displayName = "TopBar";
