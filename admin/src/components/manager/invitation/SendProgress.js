import { LinearLoader } from "@dhis2/ui";
import React from "react";
import "./SendProgress.css";

const SendProgress = ({ sentCount, totalToSend }) => {
  if (totalToSend === 0) return null;
  return (
    <div className="send-progress-container">
      <LinearLoader amount={(sentCount * 100) / totalToSend} />
    </div>
  );
};

export default SendProgress;
