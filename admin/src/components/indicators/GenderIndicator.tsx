import MALE from "./img/male.png";
import FEMALE from "./img/female.png";
import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import React from "react";

interface GenderIndicatorProps {
  gender?: string;
}

const GenderIndicator = ({ gender }: GenderIndicatorProps) => {
  if (!gender) {
    return null;
  }

  return (
    <Tooltip content={gender.toUpperCase()}>
      <div className="gender-indicator indicator">
        <img src={gender.toLowerCase() === "male" ? MALE : FEMALE} alt={gender} />
      </div>
    </Tooltip>
  );
};

export default GenderIndicator;
