import type { TypeFilter } from "~/routes";
import { CogIcon } from "@yamada-ui/lucide";
import { HStack, IconButton, Input } from "@yamada-ui/react";
import * as React from "react";
import { Link } from "./ui/link";

interface TopBarProps {
  query: string;
  setQuery: (q: string, types?: string[]) => void;
  setTypeFilter: (types: string[]) => void;
  typeFilter: string[];
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
          ref={ref}
          value={query}
          borderRight="none"
          onChange={handleInputChange}
          placeholder="Type to search..."
          roundedRight="none"
        />
        <IconButton
          aria-label="Settings"
          variant="outline"
          as={Link}
          borderColor="border"
          borderLeftRadius="none"
          to="/settings"
        >
          <CogIcon />
        </IconButton>
      </HStack>
    );
  })
);

TopBar.displayName = "TopBar";
