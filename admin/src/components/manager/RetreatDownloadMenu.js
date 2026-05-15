import { DropdownButton, FlyoutMenu, MenuItem } from "@dhis2/ui";
import React from "react";
import {
  YOGI_EXPORT_DEFINITIONS,
  YOGI_EXPORT_FORMATS,
  YOGI_EXPORT_GENDERS,
} from "../../services/exportService";

const RetreatDownloadMenu = ({ onDownload }) => {
  return (
    <DropdownButton
      component={
        <FlyoutMenu>
          {YOGI_EXPORT_DEFINITIONS.map(({ label, selectionState }) => (
            <MenuItem label={label} key={selectionState}>
              {YOGI_EXPORT_GENDERS.map((gender) => (
                <MenuItem label={gender.label} key={gender.value}>
                  {YOGI_EXPORT_FORMATS.map((exportFormat) => (
                    <MenuItem
                      key={`${selectionState}-${gender.value}-${exportFormat.format}`}
                      label={exportFormat.label}
                      onClick={() => {
                        onDownload(
                          gender.value,
                          selectionState,
                          exportFormat.format,
                        );
                      }}
                    />
                  ))}
                </MenuItem>
              ))}
            </MenuItem>
          ))}
        </FlyoutMenu>
      }
    >
      Download
    </DropdownButton>
  );
};

export default RetreatDownloadMenu;
