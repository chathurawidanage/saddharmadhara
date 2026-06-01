import { Checkbox, DropdownButton, FlyoutMenu, MenuItem } from "@dhis2/ui";
import React from "react";
import GenderIndicator from "../indicators/GenderIndicator";
import ReverendIndicator from "../indicators/ReverendIndicator";

interface YogiListFiltersProps {
  filters: {
    male: boolean;
    female: boolean;
    reverend: boolean;
  };
  setFilters: (filters: any) => void;
}

const YogiListFilters = ({ filters, setFilters }: YogiListFiltersProps) => {
  return (
    <DropdownButton
      component={
        <FlyoutMenu>
          <MenuItem
            label={
              <Checkbox
                label={<ReverendIndicator />}
                checked={filters.reverend}
              />
            }
            onClick={() => {
              setFilters({ ...filters, reverend: !filters.reverend });
            }}
          />
          <MenuItem
            label={
              <Checkbox
                label={<GenderIndicator gender="male" />}
                checked={filters.male}
              />
            }
            onClick={() => {
              setFilters({ ...filters, male: !filters.male });
            }}
          />
          <MenuItem
            label={
              <Checkbox
                label={<GenderIndicator gender="female" />}
                checked={filters.female}
              />
            }
            onClick={() => {
              setFilters({ ...filters, female: !filters.female });
            }}
          />
        </FlyoutMenu>
      }
    >
      Filters
    </DropdownButton>
  );
};

export default YogiListFilters;
