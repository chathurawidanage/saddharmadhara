import { Button, InputField, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import YogiListFilters from "./YogiListFilters";
import {
  AGE_SORT,
  SELECTION_PRIORITY_SORT,
} from "../../utils/yogiUtils";

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
  disabled?: boolean;
}

const YogiListToolbar = observer(({ 
  filters, 
  setFilters, 
  sortBy, 
  onSortChange, 
  searchQuery, 
  onSearchChange,
  isAdmin,
  showBulkMove,
  onBulkMoveClick,
  disabled
}: YogiListToolbarProps) => {
  return (
    <div className="yogi-list-top-bar" style={disabled ? { opacity: 0.6 } : undefined}>
      <YogiListFilters filters={filters} setFilters={setFilters} disabled={disabled} />

      <SingleSelectField
        placeholder="Sort"
        prefix="Sort"
        onChange={(e: any) => onSortChange(e.selected)}
        selected={sortBy}
        tabIndex="0"
        disabled={disabled}
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
        disabled={disabled}
      />
      {isAdmin && showBulkMove && (
        <div style={{ marginLeft: "auto" }}>
          <Button onClick={onBulkMoveClick} disabled={disabled}>
            Move All to Selected
          </Button>
        </div>
      )}
    </div>
  );
});

export default YogiListToolbar;
