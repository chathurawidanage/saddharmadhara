import { Button, InputField, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import React from "react";
import YogiListFilters from "./YogiListFilters";
import { AGE_SORT, SELECTION_PRIORITY_SORT } from "../../utils/yogiUtils";

interface YogiListToolbarProps {
  filters: any;
  setFilters: (filters: any) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdmin?: boolean;
  showBulkMove?: boolean;
  onBulkMoveClick?: () => void;
}

const YogiListToolbar = ({ 
  filters, 
  setFilters, 
  sortBy, 
  onSortChange, 
  searchQuery, 
  onSearchChange,
  isAdmin,
  showBulkMove,
  onBulkMoveClick
}: YogiListToolbarProps) => {
  return (
    <div className="yogi-list-top-bar">
      <YogiListFilters filters={filters} setFilters={setFilters} />

      <SingleSelectField
        placeholder="Sort"
        prefix="Sort"
        onChange={(e: any) => onSortChange(e.selected)}
        selected={sortBy}
        tabIndex="0"
      >
        <SingleSelectOption
          value={SELECTION_PRIORITY_SORT}
          label="Selection Priority"
        />
        <SingleSelectOption value={AGE_SORT} label="Age" />
      </SingleSelectField>
      <InputField
        className="yogi-search-input"
        placeholder="Search by Name, NIC/Passport, Mobile"
        value={searchQuery}
        onChange={({ value }: any) => onSearchChange(value)}
        type="search"
      />
      {isAdmin && showBulkMove && (
        <div style={{ marginLeft: "auto" }}>
          <Button onClick={onBulkMoveClick}>
            Move All to Selected
          </Button>
        </div>
      )}
    </div>
  );
};

export default YogiListToolbar;
