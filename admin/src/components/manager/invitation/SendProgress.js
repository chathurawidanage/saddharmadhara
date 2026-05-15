import { LinearLoader } from "@dhis2/ui";
import React from "react";

const SendProgress = ({ sentCount, totalToSend }) => {
  if (totalToSend === 0) return null;
  return (
    <div style={{ width: "100%", marginBottom: 10 }}>
      <LinearLoader amount={(sentCount * 100) / totalToSend} />
    </div>
  );
};

export default SendProgress;
