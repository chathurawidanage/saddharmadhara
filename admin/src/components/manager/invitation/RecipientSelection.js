import { Checkbox } from "@dhis2/ui";
import React from "react";

const RecipientSelection = ({ 
  toSendCount, 
  failedCount, 
  sentCount, 
  checks, 
  onCheckChange 
}) => {
  const classes = {
    checkboxes: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
    },
  };

  return (
    <div style={classes.checkboxes}>
      <Checkbox
        label={`Send to the ${toSendCount} uninvited yogis`}
        checked={checks[0]}
        onChange={() => onCheckChange(0)}
      />
      <Checkbox
        label={`Send to the ${failedCount} yogis with previous invite SMS sending failures`}
        checked={checks[1]}
        onChange={() => onCheckChange(1)}
      />
      <Checkbox
        label={`ReSend to the ${sentCount} yogis already invited`}
        checked={checks[2]}
        onChange={() => onCheckChange(2)}
      />
    </div>
  );
};

export default RecipientSelection;
