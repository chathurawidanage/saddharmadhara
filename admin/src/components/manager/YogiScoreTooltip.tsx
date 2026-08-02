import React from "react";
import { YogiSortScoreBreakdown } from "../../utils/yogiUtils";

interface YogiScoreTooltipProps {
  total: number;
  breakdown: YogiSortScoreBreakdown;
}

export const YogiScoreTooltip: React.FC<YogiScoreTooltipProps> = ({
  total,
  breakdown,
}) => {
  const { status, age, participation, penalty, flexibility } = breakdown;

  // Fallbacks if legacy structure is passed without new structured fields
  const statusScore = status ? status.score : breakdown.statusScore || 0;
  const statusLabel = status ? status.label : breakdown.statusReason || "Normal Status";

  const ageScore = age ? age.score : breakdown.ageScore || 0;
  const ageDetails = age ? age.details : breakdown.ageReason || "Date of birth not provided";

  const partScore = participation ? participation.score : breakdown.participationScore || 100;
  const partItems = participation ? participation.items : [];

  const penScore = penalty ? penalty.score : breakdown.penaltyScore || 0;
  const penItems = penalty ? penalty.items : [];

  const flexMultiplier = flexibility ? flexibility.multiplier : breakdown.mFlex || 1;
  const flexIsApplicable = flexibility ? flexibility.isApplicable : !!breakdown.mFlexReason;
  const flexOpenCount = flexibility ? flexibility.openRequestsCount : 0;
  const flexSeasonCount = flexibility ? flexibility.seasonRetreatCount : 0;

  const subtotal = statusScore + ageScore + partScore + penScore;

  return (
    <div className="yogi-score-tooltip-content">
      <div className="yogi-score-tooltip-header">
        <span className="yogi-score-tooltip-title">Score Breakdown</span>
        <span className="yogi-score-tooltip-total-pill">{total} pts</span>
      </div>

      {/* Status Score */}
      <div className="yogi-score-section">
        <div className="yogi-score-section-header">
          <span className="yogi-score-section-label">Status Score</span>
          <span
            className={`yogi-score-badge ${
              statusScore > 0 ? "positive" : "neutral"
            }`}
          >
            {statusScore > 0 ? `+${statusScore}` : statusScore}
          </span>
        </div>
        <div className="yogi-score-section-subtext">{statusLabel}</div>
      </div>

      {/* Age Score */}
      <div className="yogi-score-section">
        <div className="yogi-score-section-header">
          <span className="yogi-score-section-label">Age Score</span>
          <span
            className={`yogi-score-badge ${
              ageScore > 0 ? "positive" : "neutral"
            }`}
          >
            {ageScore > 0 ? `+${ageScore.toFixed(1)}` : ageScore.toFixed(1)}
          </span>
        </div>
        <div className="yogi-score-section-subtext">{ageDetails}</div>
      </div>

      {/* Participation Score */}
      <div className="yogi-score-section">
        <div className="yogi-score-section-header">
          <span className="yogi-score-section-label">Participation (Last 2 Years)</span>
          <span className="yogi-score-badge positive">
            +{partScore}
          </span>
        </div>
        {partItems.length > 0 ? (
          <div className="yogi-score-items-list">
            {partItems.map((item, idx) => (
              <div key={idx} className="yogi-score-item-row">
                <span className="yogi-score-item-label">{item.label}</span>
                <span
                  className={`yogi-score-item-value ${
                    item.points > 0 ? "plus" : item.points < 0 ? "minus" : ""
                  }`}
                >
                  {item.points > 0 ? `+${item.points}` : item.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="yogi-score-section-subtext">{breakdown.participationReason}</div>
        )}
      </div>

      {/* Penalties */}
      <div className="yogi-score-section">
        <div className="yogi-score-section-header">
          <span className="yogi-score-section-label">Penalties</span>
          <span
            className={`yogi-score-badge ${
              penScore < 0 ? "negative" : "neutral"
            }`}
          >
            {penScore}
          </span>
        </div>
        {penItems && penItems.length > 0 ? (
          <div className="yogi-score-items-list">
            {penItems.map((item, idx) => (
              <div key={idx} className="yogi-score-item-row">
                <span className="yogi-score-item-label">{item.label}</span>
                <span className="yogi-score-item-value minus">
                  {item.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="yogi-score-section-subtext dim">No penalties</div>
        )}
      </div>

      {/* Flexibility Multiplier */}
      <div className="yogi-score-section">
        <div className="yogi-score-section-header">
          <span className="yogi-score-section-label">
            Flexibility Multiplier
          </span>
          <span className="yogi-score-badge multiplier">
            x{flexMultiplier.toFixed(2)}
          </span>
        </div>
        <div className="yogi-score-section-subtext">
          {flexIsApplicable
            ? `${flexOpenCount} open request${
                flexOpenCount === 1 ? "" : "s"
              } out of ${flexSeasonCount} active season retreat${
                flexSeasonCount === 1 ? "" : "s"
              } • Formula: 1 + 0.1 × (${flexSeasonCount} - ${flexOpenCount})`
            : "Not applicable (Season not defined)"}
        </div>
      </div>

      {/* Calculation Summary Box */}
      <div className="yogi-score-calculation-box">
        <div className="yogi-score-calc-row">
          <span className="yogi-score-calc-label">Subtotal Points</span>
          <span className="yogi-score-calc-val">{subtotal.toFixed(1)}</span>
        </div>
        <div className="yogi-score-calc-row">
          <span className="yogi-score-calc-label">Flexibility Multiplier</span>
          <span className="yogi-score-calc-val">× {flexMultiplier.toFixed(2)}</span>
        </div>
        <div className="yogi-score-calc-divider" />
        <div className="yogi-score-calc-row total">
          <span className="yogi-score-calc-label">Calculated Score</span>
          <span className="yogi-score-calc-total-val">{total}</span>
        </div>
      </div>
    </div>
  );
};
};
