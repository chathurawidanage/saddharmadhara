import React from "react";
import RetreatCard from "./RetreatCard";
import { Retreat } from "../../types/domain";

interface RetreatSectionProps {
  title: string;
  retreats: Retreat[];
  emptyMessage: string;
}

const RetreatSection = ({ title, retreats, emptyMessage }: RetreatSectionProps) => {
  return (
    <>
      <h5 className="dashboard-section-title">{title}</h5>
      {retreats.length === 0 && (
        <p className="no-retreats-msg">{emptyMessage}</p>
      )}
      <div className="retreats-grid">
        {retreats.map((retreat) => {
          return <RetreatCard retreat={retreat} key={retreat.id} />;
        })}
      </div>
    </>
  );
};

export default RetreatSection;
