import { ArrowDown01Icon, CogIcon } from "@yamada-ui/lucide";
import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Loading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MultiSelect,
} from "@yamada-ui/react";
import { type ChangeEvent, forwardRef, memo } from "react";
import type { TypeFilter } from "~/hooks/use-clipboard-filters";
import { Link } from "./ui/link";

export interface SortOption {
  label: string;
  value: "timestamp" | "relevance" | "type" | "app" | "content";
  icon?: React.ReactElement;
}

interface TopBarProps {
  query: string;
  setQuery: (q: string, types?: string[]) => void;
  setTypeFilter: (types: string[]) => void;
  setSortBy: (sortBy: SortOption["value"]) => void;
  typeFilter: string[];
  typeOptions: TypeFilter[];
  sortBy: SortOption["value"];
  sortOptions: SortOption[];
  isLoading?: boolean;
}

export const TopBar = memo(
  forwardRef<HTMLInputElement, TopBarProps>(
    (
      {
        query,
        setQuery,
        setTypeFilter,
        setSortBy,
        typeFilter,
        typeOptions,
        sortBy,
        sortOptions,
        isLoading = false,
      },
      ref
    ) => {
      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value, typeFilter);
      };

      const handleTypeFilterChange = (values: string[]) => {
        setTypeFilter(values);
      };

      const handleSortChange = (value: SortOption["value"]) => {
        setSortBy(value);
      };

      const selectedSortOption = sortOptions.find(
        (option) => option.value === sortBy
      );

      return (
        <HStack gap="xs" w="full">
          <HStack flex={1} gap="xs">
            <InputGroup flex={1}>
              <Input
                onChange={handleInputChange}
                placeholder="Type to search..."
                ref={ref}
                value={query}
              />
              {isLoading && (
                <InputRightElement>
                  <Loading color="blue.500" size="sm" variant="dots" />
                </InputRightElement>
              )}
            </InputGroup>
            <MultiSelect
              items={typeOptions}
              onChange={handleTypeFilterChange}
              placeholder="Filter types..."
              value={typeFilter}
              w="200px"
            />
            <Menu>
              <MenuButton
                _hover={{
                  borderColor: ["blackAlpha.400", "whiteAlpha.400"],
                }}
                aria-label="Sort options"
                as={IconButton}
                borderColor={["border", "border"]}
                icon={selectedSortOption?.icon || <ArrowDown01Icon />}
                variant="outline"
              />
              <MenuList>
                {sortOptions.map((option) => (
                  <MenuItem
                    icon={option.icon}
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <IconButton
              _hover={{
                borderColor: ["blackAlpha.400", "whiteAlpha.400"],
              }}
              aria-label="Settings"
              as={Link}
              borderColor="border"
              to="/settings"
              variant="outline"
            >
              <CogIcon />
            </IconButton>
          </HStack>
        </HStack>
      );
    }
  )
);

TopBar.displayName = "TopBar";
