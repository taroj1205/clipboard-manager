import { CogIcon } from "@yamada-ui/lucide";
import { HStack, IconButton, Input } from "@yamada-ui/react";
import { type ChangeEvent, forwardRef, memo } from "react";
import type { TypeFilter } from "~/routes";
import { Link } from "./ui/link";

interface TopBarProps {
  query: string;
  setQuery: (q: string, types?: string[]) => void;
  setTypeFilter: (types: string[]) => void;
  typeFilter: string[];
  typeOptions: TypeFilter[];
}

export const TopBar = memo(
  forwardRef<HTMLInputElement, TopBarProps>(
    ({ query, setQuery, typeFilter }, ref) => {
      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value, typeFilter);
      };

      return (
        <HStack gap="0">
          <Input
            borderRight="none"
            onChange={handleInputChange}
            placeholder="Type to search..."
            ref={ref}
            roundedRight="none"
            value={query}
          />
          <IconButton
            aria-label="Settings"
            as={Link}
            borderColor="border"
            borderLeftRadius="none"
            to="/settings"
            variant="outline"
          >
            <CogIcon />
          </IconButton>
        </HStack>
      );
    }
  )
);

TopBar.displayName = "TopBar";
