import REVEREND from "./img/reverend.png";
import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import React from "react";

const ReverendIndicator = () => {
  return (
    <Tooltip content="Reverend">
      <div className="reverend-indicator indicator">
        <img src={REVEREND} alt="reverend" />
      </div>
    </Tooltip>
  );
};

export default ReverendIndicator;
