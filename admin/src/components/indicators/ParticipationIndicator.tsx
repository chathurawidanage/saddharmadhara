import { Tooltip } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import "./ApplicationIndicator.css";
import COMMENT from "./img/comment.png";

import { useStore } from "../../stores/StoreProvider";
import { Yogi } from "../../types/domain";

interface ParticipationIndicatorProps {
  trackedEntity: Yogi;
}

const ParticipationIndicator = observer(({ trackedEntity }: ParticipationIndicatorProps) => {
  const store = useStore();

  if (!store.metadata) return null;

  const participationByYear = Object.keys(trackedEntity.participation)
    .filter((retreatId) => retreatId !== undefined)
    .map((retreatId) => {
      const retreat = store.metadata.retreatsMapWithCodeKey[retreatId];
      if (!retreat) return null;
      return {
        retreat,
        participation: trackedEntity.participation[retreatId],
        year: new Date(retreat.date).getFullYear(),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .reduce((acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item);
      return acc;
    }, {} as Record<number, any[]>);

  return (
    <div className="participation-list">
      {Object.entries(participationByYear)
        .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
        .map(([year, items]) => (
          <div key={year} className="participation-year-group">
            <div className="participation-year-label">{year}</div>
            <div className="yogi-applications">
              {items.map(({ retreat, participation: p }) => {
                const hasSpecialComment =
                  p.specialComment && p.specialComment.trim().length > 0;
                return (
                  <Tooltip
                    content={
                      <>
                        <p>{retreat.name}</p>
                        {hasSpecialComment && <p>{p.specialComment}</p>}
                      </>
                    }
                    key={retreat.code + p.attendance}
                  >
                    <div className="yogi-application">
                      <div className="yogi-application-retreat">
                        {retreat.retreatCode || "UNKW"}
                      </div>
                      <div
                        className={`yogi-application-state participation-state-${p.attendance}`}
                      >
                        {p.attendance || "Pending"}
                      </div>
                      {hasSpecialComment && (
                        <div className="yogi-application-special-comment">
                          <img src={COMMENT} width={15} alt="comment" />
                        </div>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
});

export default ParticipationIndicator;
