import * as React from "react";
import { Input, HStack, Select, Option } from "@yamada-ui/react";
import { TypeFilter } from "../routes";

interface TopBarProps {
  query: string;
  setQuery: (q: string) => void;
  typeFilter: TypeFilter["value"];
  setTypeFilter: (type: TypeFilter["value"]) => void;
  typeOptions: TypeFilter[];
  onArrowKey?: (direction: "up" | "down") => void;
}

export const TopBar = React.memo(
  React.forwardRef<HTMLInputElement, TopBarProps>(
    (
      { query, setQuery, typeFilter, setTypeFilter, typeOptions, onArrowKey },
      ref
    ) => {
      return (
        <HStack gap="0">
          <Input
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            roundedRight="none"
            borderRight="none"
            ref={ref}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                onArrowKey?.("up");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                onArrowKey?.("down");
              }
            }}
          />

          <Select
            onChange={(value) => setTypeFilter(value as TypeFilter["value"])}
            defaultValue={typeFilter}
            w="xs"
            roundedLeft="none"
          >
            {typeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </HStack>
      );
    }
  )
);

TopBar.displayName = "TopBar";
