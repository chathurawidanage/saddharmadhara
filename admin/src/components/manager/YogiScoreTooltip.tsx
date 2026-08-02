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
  const { status, age, participation, deductions, flexibility } = breakdown;

  const statusScore = status.score;
  const statusLabel = status.label;

  const ageScore = age.score;
  const ageDetails = age.details;

  const partScore = participation.score;
  const partItems = participation.items;

  const dedScore = deductions.score;
  const dedItems = deductions.items;

  const flexMultiplier = flexibility.multiplier;
  const flexIsApplicable = flexibility.isApplicable;
  const flexOpenCount = flexibility.openRequestsCount;
  const flexSeasonCount = flexibility.seasonRetreatCount;

  const subtotal = statusScore + ageScore + partScore + dedScore;

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
      </div>

      {/* Deductions */}
      <div className="yogi-score-section">
        <div className="yogi-score-section-header">
          <span className="yogi-score-section-label">Deductions</span>
          <span
            className={`yogi-score-badge ${
              dedScore < 0 ? "negative" : "neutral"
            }`}
          >
            {dedScore}
          </span>
        </div>
        {dedItems && dedItems.length > 0 ? (
          <div className="yogi-score-items-list">
            {dedItems.map((item, idx) => (
              <div key={idx} className="yogi-score-item-row">
                <span className="yogi-score-item-label">{item.label}</span>
                <span className="yogi-score-item-value minus">
                  {item.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="yogi-score-section-subtext dim">No deductions</div>
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
          {flexIsApplicable ? (
            <>
              <div>
                Limited Options Boost: Yogis with fewer open retreat choices in this season receive higher priority.
              </div>
              <div style={{ marginTop: "3px" }}>
                • {flexOpenCount} open option{flexOpenCount === 1 ? "" : "s"} out of {flexSeasonCount} active season retreat{flexSeasonCount === 1 ? "" : "s"}
              </div>
              <div style={{ marginTop: "3px" }} className="dim">
                • Calculation: 1.0 + 0.10 × ({flexSeasonCount} total retreat{flexSeasonCount === 1 ? "" : "s"} - {flexOpenCount} open choice{flexOpenCount === 1 ? "" : "s"}) = x{flexMultiplier.toFixed(2)}
              </div>
            </>
          ) : (
            "Not applicable (Season not defined)"
          )}
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
