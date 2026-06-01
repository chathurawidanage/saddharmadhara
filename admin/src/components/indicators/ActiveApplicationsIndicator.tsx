import { Tooltip } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import "./ApplicationIndicator.css";

import { useStore } from "../../stores/StoreProvider";
import { Retreat, Yogi } from "../../types/domain";

interface ActiveApplicationIndicatorProps {
  currentRetreat: Retreat;
  trackedEntity: Yogi;
}

const ActiveApplicationIndicator = observer(
  ({ currentRetreat, trackedEntity }: ActiveApplicationIndicatorProps) => {
    const store = useStore();

    if (!store.metadata) return null;

    const targetRetreatsMap = new Map<string, Retreat>();

    // 1. Add all retreats in the same season (if defined)
    if (currentRetreat.season) {
      store.metadata.retreats
        .filter((r) => r.season === currentRetreat.season)
        .forEach((r) => targetRetreatsMap.set(r.code, r));
    }

    // 2. Add all globally current/upcoming retreats
    store.metadata.currentRetreats.forEach((r) => targetRetreatsMap.set(r.code, r));

    // 3. Convert back to unique array
    const targetRetreats = Array.from(targetRetreatsMap.values());

    const seasonRetreats = targetRetreats.filter(
      (r) =>
        r.code !== currentRetreat.code &&
        currentRetreat.season &&
        r.season === currentRetreat.season &&
        trackedEntity.expressionOfInterests[r.code]
    );

    const otherRetreats = targetRetreats.filter(
      (r) =>
        r.code !== currentRetreat.code &&
        (!currentRetreat.season || r.season !== currentRetreat.season) &&
        trackedEntity.expressionOfInterests[r.code]
    );

    if (seasonRetreats.length === 0 && otherRetreats.length === 0) {
      return null;
    }

    const renderRetreatBadge = (r: Retreat) => (
      <Tooltip content={r.name} key={r.code}>
        <div className="yogi-application">
          <div className="yogi-application-retreat">
            {r.retreatCode || "UNKW"}
          </div>
          <div
            className={`yogi-application-state active-application-state-${trackedEntity.expressionOfInterests[r.code].state}`}
          >
            {trackedEntity.expressionOfInterests[r.code].state}
          </div>
        </div>
      </Tooltip>
    );

    return (
      <div className="yogi-applications-container">
        {seasonRetreats.length > 0 && (
          <div className="yogi-applications-section">
            <div className="yogi-applications-section-title">This Season</div>
            <div className="yogi-applications-section-list">
              {seasonRetreats.map(renderRetreatBadge)}
            </div>
          </div>
        )}
        {otherRetreats.length > 0 && (
          <div className="yogi-applications-section">
            <div className="yogi-applications-section-title">Other</div>
            <div className="yogi-applications-section-list">
              {otherRetreats.map(renderRetreatBadge)}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default ActiveApplicationIndicator;
