import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import KIDS from "./img/kids.png";
import PERMISSION from "./img/key.png";
import CROSS from "./img/cross.png";
import STRESS from "./img/stressv3.png";
import React from "react";

interface BooleanWithCommentIndicatorProps {
  bool: boolean | undefined;
  showIf: boolean;
  comment: string | undefined;
  img: string;
  className: string;
}

const BooleanWithCommentIndicator = ({
  bool,
  showIf,
  comment,
  img,
  className,
}: BooleanWithCommentIndicatorProps) => {
  if (bool === undefined || bool !== showIf) {
    return null;
  }

  return (
    <Tooltip content={comment || ""}>
      <div className={`indicator ${className}`}>
        <img src={img} alt={className} />
      </div>
    </Tooltip>
  );
};

export const HasKidsIndicator = ({ hasKids, comment }: { hasKids?: boolean; comment?: string }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasKids}
      showIf={true}
      comment={comment}
      img={KIDS}
      className="has-kids-indicator"
    />
  );
};

export const HasPermission = ({ hasPermission, comment }: { hasPermission?: boolean; comment?: string }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasPermission}
      showIf={false}
      comment={comment}
      img={PERMISSION}
      className="has-permission-indicator"
    />
  );
};

export const HasUnattendedDeformities = ({
  hasUnattendedDeformities,
  comment,
}: { hasUnattendedDeformities?: boolean; comment?: string }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasUnattendedDeformities}
      showIf={true}
      comment={comment}
      img={CROSS}
      className="has-unattended-deformities-indicator"
    />
  );
};

export const HasStress = ({ hasStress, comment }: { hasStress?: boolean; comment?: string }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasStress}
      showIf={true}
      comment={comment}
      img={STRESS}
      className="has-stress-indicator"
    />
  );
};
