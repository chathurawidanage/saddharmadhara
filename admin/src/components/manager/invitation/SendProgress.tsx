import { LinearLoader } from "@dhis2/ui";
import React from "react";
import "./SendProgress.css";

interface SendProgressProps {
  sentCount: number;
  totalToSend: number;
}

const SendProgress = ({ sentCount, totalToSend }: SendProgressProps) => {
  if (totalToSend === 0) return null;
  return (
    <div className="send-progress-container">
      <LinearLoader amount={(sentCount * 100) / totalToSend} />
    </div>
  );
};

export default SendProgress;
