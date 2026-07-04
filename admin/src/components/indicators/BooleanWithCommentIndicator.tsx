import "./indicators.css";
import { Tooltip } from "@dhis2/ui";
import KIDS from "./img/kids.png";
import PERMISSION from "./img/key.png";
import CROSS from "./img/cross.png";
import STRESS from "./img/stressv3.png";
import BEER from "./img/beer.png";
import LAW from "./img/law.png";
import CHRONIC_ILLNESS from "./img/chronic_illness.png";
import AMPUTEE from "./img/amputee.png";
import React from "react";

interface BooleanWithCommentIndicatorProps {
  bool: boolean | string | undefined | null;
  showIf: boolean;
  title: string;
  comment: string | undefined | null;
  img: string;
  className: string;
}

const BooleanWithCommentIndicator = ({
  bool,
  showIf,
  title,
  comment,
  img,
  className,
}: BooleanWithCommentIndicatorProps) => {
  if (bool === undefined || bool === null || bool === "") {
    return null;
  }

  const isTrue = String(bool).toLowerCase() === "true" || bool === true || bool === "1" || bool === 1 || String(bool).toLowerCase() === "yes";
  
  if (isTrue !== showIf) {
    return null;
  }

  const tooltipContent = (
    <div style={{ padding: "2px 4px" }}>
      <div style={{ fontWeight: 600, fontSize: "12px", lineHeight: "1.4" }}>{title}</div>
      {comment && (
        <div style={{ marginTop: "4px", fontSize: "11px", fontStyle: "italic", opacity: 0.9, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "4px" }}>
          {comment}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div className={`indicator ${className}`}>
        <img src={img} alt={className} />
      </div>
    </Tooltip>
  );
};

export const HasKidsIndicator = ({ hasKids, comment }: { hasKids?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasKids}
      showIf={true}
      title="Dependent Children Under 12 Years of Age"
      comment={comment}
      img={KIDS}
      className="has-kids-indicator"
    />
  );
};

export const HasPermission = ({ hasPermission, comment }: { hasPermission?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasPermission}
      showIf={false}
      title="Permission to Attend (Spouse/Parents/Guardian/Employer/Monastery)"
      comment={comment}
      img={PERMISSION}
      className="has-permission-indicator"
    />
  );
};

export const HasUnattendedDeformities = ({
  hasUnattendedDeformities,
  comment,
}: { hasUnattendedDeformities?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasUnattendedDeformities}
      showIf={true}
      title="Chronic / Untreated Diseases or Disabilities"
      comment={comment}
      img={CROSS}
      className="has-unattended-deformities-indicator"
    />
  );
};

export const HasStress = ({ hasStress, comment }: { hasStress?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasStress}
      showIf={true}
      title="Stress or Other Mental Health Problems"
      comment={comment}
      img={STRESS}
      className="has-stress-indicator"
    />
  );
};

export const HasAlcoholAndDrugs = ({
  hasAlcoholAndDrugs,
  comment,
}: { hasAlcoholAndDrugs?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasAlcoholAndDrugs}
      showIf={true}
      title="Alcohol, Drugs or Mind-altering Substances (Past 2 Years)"
      comment={comment}
      img={BEER}
      className="has-alcohol-and-drugs-indicator"
    />
  );
};

export const HasLitigations = ({
  hasLitigations,
  comment,
}: { hasLitigations?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasLitigations}
      showIf={true}
      title="Serious Legal Litigations or Unsettled Obligations"
      comment={comment}
      img={LAW}
      className="has-litigations-indicator"
    />
  );
};

export const HasDiseases = ({
  hasDiseases,
  comment,
}: { hasDiseases?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasDiseases}
      showIf={true}
      title="Pre-existing Chronic Illnesses (Asthma, Epilepsy, cysts, boils, etc.)"
      comment={comment}
      img={CHRONIC_ILLNESS}
      className="has-diseases-indicator"
    />
  );
};

export const HasDeformities = ({
  hasDeformities,
  comment,
}: { hasDeformities?: boolean | string | null; comment?: string | null }) => {
  return (
    <BooleanWithCommentIndicator
      bool={hasDeformities}
      showIf={true}
      title="Physical Body Deformities (Amputated limbs, etc.)"
      comment={comment}
      img={AMPUTEE}
      className="has-deformities-indicator"
    />
  );
};
